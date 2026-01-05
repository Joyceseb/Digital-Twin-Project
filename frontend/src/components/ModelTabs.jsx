import React from 'react';

const ModelTabs = ({ model, setModel }) => {
  const tabs = [
    { id: 'openai', label: 'OpenAI' },
    { id: 'mistral', label: 'Mistral' },
    { id: 'deepseek', label: 'DeepSeek' },
  ];

  return (
    <div className="flex p-1 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setModel(tab.id)}
          className={`
            flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
            ${model === tab.id
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-0 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ModelTabs;
