import React from 'react';

const DocumentSelector = ({ documents, selectedIds, onToggle }) => {
    if (!documents || documents.length === 0) {
        return (
            <div className="text-center p-4 border border-dashed border-slate-200 rounded-lg text-slate-500 text-sm">
                No documents uploaded yet. Upload some in the Chat page first.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => {
                const isSelected = selectedIds.includes(doc.id);
                return (
                    <div
                        key={doc.id}
                        onClick={() => onToggle(doc.id)}
                        className={`
              flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
              ${isSelected
                                ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                                : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                            }
            `}
                    >
                        <div className={`
              w-5 h-5 rounded border flex items-center justify-center transition-colors
              ${isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'bg-white border-slate-300'
                            }
            `}>
                            {isSelected && (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                                {doc.name || doc.filename}
                            </p>
                            <p className="text-xs text-slate-500">
                                {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'Document'}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DocumentSelector;
