import React, { useState } from 'react';
import ModelTabs from '../components/ModelTabs';
import ChatRoom from '../components/ChatRoom';
import useChat from '../hooks/useChat';
import UploadZone from '../components/UploadZone';
import InlineUploadButton from '../components/InlineUploadButton';
import DocumentList from '../components/DocumentList';

const ChatPage = () => {
  const [model, setModel] = useState('openai');
  const [input, setInput] = useState('');
  const [messageDocs, setMessageDocs] = useState([]);

  const {
    conversations,
    activeConversation,
    getMessages,
    newConversation,
    loadConversation,
    deleteConversation,
    send,
    globalDocuments,
    setGlobalDocuments,
    loading
  } = useChat();

  const handleSend = () => {
    if (!input.trim() && messageDocs.length === 0) return;
    send(model, input, messageDocs);
    setInput('');
    setMessageDocs([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeConv = activeConversation(model);
  const messages = getMessages(model);
  const modelConversations = conversations[model] || [];

  return (
    <div className="flex h-full">
      {/* Conversations Sidebar (Left Panel) */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => newConversation(model)}
            className="w-full py-2 px-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {modelConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => loadConversation(model, conv.id)}
              className={`
                group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                ${activeConv?.id === conv.id ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
              `}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${activeConv?.id === conv.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {conv.title || 'New Conversation'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                  {conv.messages.length} messages
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(model, conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Global Docs Area (Bottom of Sidebar) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Global Context
          </h3>
          <UploadZone
            onUploadComplete={(doc) => setGlobalDocuments(prev => [...prev, { ...doc, id: Date.now() + Math.random().toString(36) }])}
          />
          <div className="mt-3 max-h-32 overflow-y-auto">
            <DocumentList
              documents={globalDocuments}
              onDelete={(doc) => setGlobalDocuments(prev => prev.filter(d => d.id !== doc.id))}
            />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950">
        {/* Model Tabs Header */}
        <div className="px-6 pt-6 pb-2">
          <ModelTabs model={model} setModel={setModel} />
        </div>

        {/* Chat Messages */}
        <ChatRoom messages={messages} loading={loading} />

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="max-w-4xl mx-auto">
            {/* Attached docs for next message */}
            {messageDocs.length > 0 && (
              <div className="mb-3">
                <DocumentList
                  documents={messageDocs}
                  onDelete={(doc) => setMessageDocs(prev => prev.filter(d => d.id !== doc.id))}
                />
              </div>
            )}

            <div className="relative flex items-end gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <div className="flex-shrink-0 mb-1">
                <InlineUploadButton
                  onUploadComplete={(doc) => setMessageDocs(prev => [...prev, { ...doc, id: Date.now() + Math.random().toString(36) }])}
                />
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${model}...`}
                className="flex-1 max-h-32 py-2 px-2 bg-transparent border-none focus:ring-0 resize-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm leading-relaxed"
                rows={1}
                style={{ minHeight: '44px' }}
              />

              <button
                onClick={handleSend}
                disabled={loading || (!input.trim() && messageDocs.length === 0)}
                className={`
                  flex-shrink-0 p-2 rounded-lg mb-1 transition-all
                  ${(input.trim() || messageDocs.length > 0) && !loading
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
