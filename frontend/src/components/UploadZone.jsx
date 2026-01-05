import React, { useCallback, useState } from 'react';
import useChat from '../hooks/useChat';

const UploadZone = ({ onUploadComplete }) => {
    const { uploadFile, isUploading } = useChat();
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        try {
            for (const file of files) {
                try {
                    const res = await uploadFile(file);
                    if (onUploadComplete) onUploadComplete(res);
                } catch (err) {
                    alert(`Failed to upload ${file.name}.`);
                }
            }
        } catch (error) {
            // global handler in context
        }
    }, [onUploadComplete, uploadFile]);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        try {
            for (const file of files) {
                try {
                    const res = await uploadFile(file);
                    if (onUploadComplete) onUploadComplete(res);
                } catch (err) {
                    alert(`Failed to upload ${file.name}.`);
                }
            }
        } catch (error) {
            // global handler in context
        }
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
        ${isDragging
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                }
      `}
        >
            <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="flex flex-col items-center gap-2 pointer-events-none">
                <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${isUploading ? 'bg-indigo-100 animate-pulse' : 'bg-slate-100'}
        `}>
                    {isUploading ? (
                        <svg className="w-5 h-5 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    )}
                </div>
                <div className="text-sm font-medium text-slate-700">
                    {isUploading ? 'Uploading in background...' : 'Drop files here or click to upload'}
                </div>
                <div className="text-xs text-slate-500">
                    PDF, DOCX, PPTX, TXT, XLSX, CSV supported
                </div>
            </div>
        </div>
    );
};

export default UploadZone;
