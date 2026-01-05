import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatRoom = ({ messages, loading }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleDownloadPdf = async (content) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/generate_document/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title: 'Assistant Response' })
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'response.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF');
    }
  };

  const BotIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74.4 1.39 1 1.73V7h1a7 7 0 0 1 7 7v1a5 5 0 0 1-5 5v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-3a5 5 0 0 1-5-5v-1a7 7 0 0 1 7-7h1V5.73c.6-.34 1-.99 1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5" />
    </svg>
  );

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
          <BotIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
        </div>
        <p className="text-lg font-medium text-slate-600 dark:text-slate-400">Start a conversation</p>
        <p className="text-sm">Select a model and type a message to begin.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-950">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`
            flex max-w-[85%] md:max-w-[75%] gap-3
            ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}
          `}>
            {/* Avatar */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
              ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}
            `}>
              {msg.sender === 'user' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              ) : (
                <BotIcon className="w-5 h-5" />
              )}
            </div>

            {/* Message Content */}
            <div className={`
              flex flex-col gap-2 relative
              ${msg.sender === 'user' ? 'items-end' : 'items-start'}
            `}>
              {/* Text Bubble */}
              <div className={`
                px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed
                ${msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                }
              `}>
                <div className="prose dark:prose-invert max-w-none break-words">
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap m-0">{msg.text}</p>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>

                {msg.sender !== 'user' && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <button
                      onClick={() => handleDownloadPdf(msg.text)}
                      className="text-xs flex items-center gap-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="Download as PDF"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </button>
                  </div>
                )}
              </div>

              {/* Attachments / Files */}
              {msg.documents && msg.documents.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-end">
                  {msg.documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-700/50 text-white rounded-lg text-xs">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {doc.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Generated File */}
              {msg.type === 'file' && (
                <div className="mt-1 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm flex items-center gap-3 max-w-xs">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{msg.filename || "Generated File"}</p>
                    <a
                      href={msg.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
                    >
                      Download
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {loading && (
        <div className="flex w-full justify-start">
          <div className="flex max-w-[75%] gap-3 flex-row">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
              <BotIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatRoom;
