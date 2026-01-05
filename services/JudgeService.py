import json
from model.ModelFactory import ModelFactory
from prompts import load_prompt

class JudgeService:

    def __init__(self):
        models = ModelFactory.create_models()
        self.claude = models.get("claude")
        self.gemini = models.get("gemini")

    # -----------------------------------------------------------
    # Internal Helpers
    # -----------------------------------------------------------
    def _measure_performance(self, func, *args, **kwargs):
        import timeit
        start_time = timeit.default_timer()
        response = func(*args, **kwargs)
        end_time = timeit.default_timer()
        duration = end_time - start_time
        
        # Estimate tokens (rough approximation: 4 chars / token)
        # For Judge, response is a dict, so dump to string first
        text_len = len(json.dumps(response)) if response else 0
        token_count = text_len // 4
        
        return {
            "result": response,
            "metrics": {
                "time": round(duration, 2),
                "tokens": token_count
            }
        }

    # -----------------------------------------------------------
    # Make one judge evaluate one pair of models
    # -----------------------------------------------------------
    def _judge_pair(self, judge_model, question, ansA, ansB, judge_prompt):
        data = {
            "question": question,
            "model_A_answer": ansA,
            "model_B_answer": ansB
        }

        # Send as JSON payload
        if not judge_model:
            return {"error": "Judge model not available"}

        raw = judge_model.chat_completion(
            system_prompt=judge_prompt,
            user_message=json.dumps(data)
        )

        try:
            return json.loads(raw)
        except Exception:
            return {
                "error": "Invalid JSON",
                "raw": raw
            }

    # -----------------------------------------------------------
    # Main evaluation over all 3 models
    # -----------------------------------------------------------
    # -----------------------------------------------------------
    # Main evaluation over 2 models (OpenAI vs Mistral)
    # -----------------------------------------------------------
    def evaluate_two_models(self, question, ans_openai, ans_mistral):
        
        judge_prompt = load_prompt("judge_prompt.md")

        # Generic Clean JSON function
        def clean_json(text):
            if "```json" in text:
                text = text.split("```json")[1]
            if "```" in text:
                text = text.split("```")[0]
            return text.strip()

        # Helper to safely call judge
        def safe_judge(model, q, a, b, prompt):
            if not model:
                return {} # Skip if model missing (e.g. Claude)
            
            # Use original _judge_pair logic but with better parsing
            data = {
                "question": q,
                "model_A_answer": a,
                "model_B_answer": b
            }
            try:
                raw = model.chat_completion(
                    system_prompt=prompt,
                    user_message=json.dumps(data)
                )
                cleaned = clean_json(raw)
                return json.loads(cleaned)
            except Exception as e:
                print(f"Judge Error: {e}")
                return {"error": str(e), "raw": raw}

        # Pairwise comparisons (Only one pair: OpenAI vs Mistral)
        # We need to adapt this to the new JSON structure which returns "metrics" per model
        
        judgments = {}
        for name, model in [("claude", self.claude), ("gemini", self.gemini)]:
            def run_judge():
                return safe_judge(model, question, ans_openai, ans_mistral, judge_prompt)
            
            # Wrap in performance measurement
            perf = self._measure_performance(run_judge)
            # perf = { "result": {...}, "metrics": {...} }
            
            # Merge metrics into the result for frontend to access easily if needed, 
            # or store separately. Let's store in the result dict under a special key if possible,
            # but safe_judge returns the specific JSON structure. 
            # Let's wrap the whole judgment in the perf object structure for the 'match' dict.
            judgments[name] = perf
        
        results = {"openai_vs_mistral": judgments} # Keep structure for now
        
        # Aggregation
        # metrics_acc = { "openai": {"accuracy": [], ...}, "mistral": ... }
        metrics_acc = {
            "openai": {"accuracy": [], "reasoning": [], "clarity": [], "safety": [], "factuality": []},
            "mistral": {"accuracy": [], "reasoning": [], "clarity": [], "safety": [], "factuality": []}
        }
        
        final_analysis = []
        
        for judge_name, perf_entry in judgments.items():
            res = perf_entry["result"] # Extract actual judge JSON
            
            if "metrics" in res:
                # Map model_A -> openai, model_B -> mistral
                # "metrics" -> "model_A": {...}
                
                mA = res["metrics"].get("model_A", {})
                mB = res["metrics"].get("model_B", {})
                
                for k in metrics_acc["openai"]:
                    if k in mA: metrics_acc["openai"][k].append(mA[k])
                    if k in mB: metrics_acc["mistral"][k].append(mB[k])
                    
            if "analysis" in res:
                 final_analysis.append(f"**Judge {judge_name.title()}** ({perf_entry['metrics']['time']}s, ~{perf_entry['metrics']['tokens']} tokens):\n" + res["analysis"].get("comparison", ""))

        # Calculate Averages and Final Scores
        final_scores = {}
        dimensions = {}
        
        for model in ["openai", "mistral"]:
            dim_avgs = {}
            total_sum = 0
            count = 0
            
            for dim, vals in metrics_acc[model].items():
                avg = sum(vals) / len(vals) if vals else 0
                dim_avgs[dim] = round(avg, 1)
                total_sum += avg
                count += 1
            
            dimensions[model] = dim_avgs
            final_scores[model] = round(total_sum / count, 1) if count > 0 else 0

        # Ranking
        ranking_tuples = sorted(final_scores.items(), key=lambda x: x[1], reverse=True)
        ranking = [{"model": k, "score": v} for k, v in ranking_tuples]

        final_result = {
            "matches": results,
            "final_scores": final_scores,
            "ranking": ranking,
            "winner": ranking[0]["model"],
            "dimensions": dimensions,
            "input_question": question,
            "detailed_analysis": "\n\n".join(final_analysis)
        }
        
        # Save to history
        self._save_battle_log(final_result)
        
        return final_result

    # -----------------------------------------------------------
    # Persistence & Stats
    # -----------------------------------------------------------
    def _get_storage_path(self):
        import os
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        STORAGE_DIR = os.path.join(BASE_DIR, "..", "storage")
        os.makedirs(STORAGE_DIR, exist_ok=True)
        return os.path.join(STORAGE_DIR, "battles.json")

    def _save_battle_log(self, result):
        import time
        path = self._get_storage_path()
        
        # lightweight record
        record = {
            "timestamp": time.time(),
            "date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "question": result.get("input_question", ""),
            "winner": result["winner"],
            "scores": result["final_scores"],
            "dimensions": result.get("dimensions", {}),
            "detailed_analysis": result.get("detailed_analysis", "No detailed analysis available.")
        }
        
        history = []
        try:
            with open(path, "r", encoding="utf-8") as f:
                history = json.load(f)
        except:
            pass
            
        history.append(record)
        
        # Keep only last 50 battles to avoid huge file
        if len(history) > 50:
            history = history[-50:]
            
        with open(path, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)

    def get_arena_stats(self):
        path = self._get_storage_path()
        history = []
        try:
            with open(path, "r", encoding="utf-8") as f:
                history = json.load(f)
        except:
            return {"total_battles": 0, "win_rates": [], "history": []}

        total = len(history)
        if total == 0:
            return {"total_battles": 0, "win_rates": [], "history": []}

        wins = {}
        for h in history:
            w = h.get("winner")
            wins[w] = wins.get(w, 0) + 1
            
        win_rates = []
        for model, count in wins.items():
            win_rates.append({
                "name": model,
                "wins": count,
                "percentage": round((count / total) * 100, 1)
            })
            
        return {
            "total_battles": total,
            "win_rates": win_rates,
            "history": list(reversed(history)) # Newest first
        }

    def delete_battle(self, timestamp):
        path = self._get_storage_path()
        history = []
        try:
            with open(path, "r", encoding="utf-8") as f:
                history = json.load(f)
        except:
            return False

        # Filter out by timestamp (convert to float for comparison safety)
        initial_len = len(history)
        history = [h for h in history if abs(float(h.get("timestamp", 0)) - float(timestamp)) > 0.001]
        
        if len(history) < initial_len:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(history, f, indent=2)
            return True
            
        return False
