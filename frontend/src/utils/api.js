const API_BASE = "http://127.0.0.1:8000/api";

export async function sendChat(model, message, documents = []) {
  const res = await fetch(`${API_BASE}/chat/${model}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: message, documents }),
  });
  return res.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload/`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

export async function compareModels(question, documents = []) {
  const res = await fetch(`${API_BASE}/compare/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: question, documents }),
  });
  return res.json();
}

export async function judgeModels(payload) {
  const res = await fetch(`${API_BASE}/judge/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getMemory(model) {
  const res = await fetch(`${API_BASE}/memory/${model}/`);
  return res.json();
}

export async function generateDocument(content, title) {
  const res = await fetch(`${API_BASE}/generate_document/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, title }),
  });
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
