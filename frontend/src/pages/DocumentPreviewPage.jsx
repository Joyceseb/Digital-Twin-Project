
import React, { useState } from 'react';
import PageBackground from '../components/PageBackground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const DocumentPreviewPage = () => {
    const [file, setFile] = useState(null);
    const [previewContent, setPreviewContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewContent("");
            setError("");
            setLoading(true);

            // Create user-friendly preview
            // For images, we can show directly. 
            // For text/code, we read. 
            // For PDF/Docx, we might need backend help if we want text.
            // NOTE: The user asked for "Preview", implying seeing the document. 
            // Let's use the BACKEND upload logic to get text back if possible, OR just client-side read for basic types.
            // Client-side text read:

            if (selectedFile.type === "text/plain" || selectedFile.name.endsWith(".md") || selectedFile.name.endsWith(".txt") || selectedFile.name.endsWith(".json")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewContent(e.target.result);
                    setLoading(false);
                };
                reader.readAsText(selectedFile);
            } else {
                // Fetch text content from backend
                try {
                    const formData = new FormData();
                    formData.append("file", selectedFile);

                    const res = await fetch("http://127.0.0.1:8000/api/preview/", {
                        method: "POST",
                        body: formData,
                    });

                    const data = await res.json();

                    if (res.ok) {
                        setPreviewContent(data.content || "(No text content extracted)");
                    } else {
                        setError(data.error || "Failed to preview document");
                    }
                } catch (err) {
                    setError("Error reading file: " + err.message);
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 relative">
            <PageBackground variant="analysis" />
            <div className="flex flex-col gap-2 relative z-10">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Document Preview
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Upload a document to view its content before processing.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Select Document
                    </label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pangea-teal/10 file:text-pangea-teal hover:file:bg-pangea-teal/20 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
                    />
                </div>

                {loading && <div className="text-slate-500">Loading preview...</div>}

                {error && <div className="text-red-500">{error}</div>}

                {previewContent && (
                    <div className="mt-6 p-8 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-auto max-h-[800px] text-slate-800 dark:text-slate-200">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-100" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200" {...props} />,
                                h4: ({ node, ...props }) => <h4 className="text-lg font-bold mt-3 mb-2" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic my-4 bg-slate-50 dark:bg-slate-900 py-2 pr-2" {...props} />,
                                code: ({ node, inline, className, children, ...props }) => {
                                    return inline ?
                                        <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-600 dark:text-indigo-400" {...props}>{children}</code> :
                                        <pre className="bg-slate-800 text-slate-200 p-4 rounded-lg overflow-x-auto my-4 text-sm font-mono" {...props}><code>{children}</code></pre>
                                }
                            }}
                        >
                            {previewContent}
                        </ReactMarkdown>
                    </div>
                )}

                {file && file.type === "application/pdf" && (
                    <div className="mt-6 h-[800px] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                        <iframe
                            src={URL.createObjectURL(file)}
                            className="w-full h-full"
                            title="PDF Preview"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentPreviewPage;
