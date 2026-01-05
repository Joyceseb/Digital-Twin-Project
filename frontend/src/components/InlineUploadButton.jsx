import React, { useState } from 'react';
import { uploadDocument } from '../utils/api';

const InlineUploadButton = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            for (const file of files) {
                const res = await uploadDocument(file);
                if (onUploadComplete) onUploadComplete(res);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed");
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                title="Upload document"
            />
            <button
                type="button"
                className={`
          p-2 rounded-lg transition-colors
          ${uploading
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                    }
        `}
            >
                {uploading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default InlineUploadButton;
