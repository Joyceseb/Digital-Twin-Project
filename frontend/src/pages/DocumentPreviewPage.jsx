
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



                // ... inside component ...

                {/* Visual Preview Section (Top Priority) */}
                {file && (
                    <div className="mt-6 h-[800px] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                        {file.type === "application/pdf" ? (
                            <iframe
                                src={URL.createObjectURL(file)}
                                className="w-full h-full"
                                title="PDF Preview"
                            />
                        ) : file.type.startsWith("image/") ? (
                            <img
                                src={URL.createObjectURL(file)}
                                alt="Document Preview"
                                className="max-w-full max-h-full object-contain p-4"
                            />
                        ) : (
                            // Fallback: Show Extracted Text if available, else standard message
                            <div className="w-full h-full overflow-auto bg-white dark:bg-slate-950 p-8">
                                {previewContent ? (
                                    <div className="prose dark:prose-invert max-w-none">
                                        <h3 className="text-lg font-semibold text-slate-400 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
                                            {file.name} (Text Preview)
                                        </h3>
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code: ({ node, inline, className, children, ...props }) => (
                                                    inline ?
                                                        <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400" {...props}>{children}</code> :
                                                        <pre className="bg-slate-800 text-slate-200 p-4 rounded-lg overflow-x-auto" {...props}><code>{children}</code></pre>
                                                )
                                            }}
                                        >
                                            {previewContent}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Generating Text Preview...</h3>
                                        <p className="text-slate-500 mb-4">Extracting text content for display.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Extracted Text Section (Collapsible/Secondary) */}

            </div>
        </div>
    );
};

export default DocumentPreviewPage;
