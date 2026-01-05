import React from 'react';

const DocumentList = ({ documents, onDelete }) => {
    if (!documents || documents.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Attached Documents
            </h3>
            <div className="space-y-2">
                {documents.map((doc, index) => (
                    <div
                        key={doc.id || index}
                        className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm group"
                    >
                        <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">
                                {doc.name || doc.filename || "Untitled Document"}
                            </p>
                            <p className="text-xs text-slate-500">
                                {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'Document'}
                            </p>
                        </div>

                        {onDelete && (
                            <button
                                onClick={() => onDelete(doc)}
                                className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentList;
