import React, { createContext, useState, useEffect } from 'react';
import { sendChat } from "../utils/api.js";

export const ChatContext = createContext();

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const ChatProvider = ({ children }) => {
    // State for conversations per model
    const [conversations, setConversations] = useState(() => {
        const saved = localStorage.getItem("conversations");
        return saved ? JSON.parse(saved) : {
            openai: [{ id: "default", title: "New Chat", messages: [] }],
            mistral: [{ id: "default", title: "New Chat", messages: [] }],
            deepseek: [{ id: "default", title: "New Chat", messages: [] }],
        };
    });

    // Active conversation ID per model
    const [activeIds, setActiveIds] = useState(() => {
        const saved = localStorage.getItem("activeIds");
        return saved ? JSON.parse(saved) : {
            openai: "default",
            mistral: "default",
            deepseek: "default",
        };
    });

    const [globalDocuments, setGlobalDocuments] = useState(() => {
        const saved = localStorage.getItem("globalDocuments");
        return saved ? JSON.parse(saved) : [];
    });

    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Compare Page Persistence
    const [compareState, setCompareState] = useState({
        question: "",
        selectedDocIds: [],
        results: null
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem("conversations", JSON.stringify(conversations));
        localStorage.setItem("activeIds", JSON.stringify(activeIds));
        localStorage.setItem("globalDocuments", JSON.stringify(globalDocuments));
    }, [conversations, activeIds, globalDocuments]);

    const getMessages = (model) => {
        const activeId = activeIds[model];
        const conversation = conversations[model].find(c => c.id === activeId);
        return conversation ? conversation.messages : [];
    };

    const activeConversation = (model) => {
        const activeId = activeIds[model];
        return conversations[model].find(c => c.id === activeId);
    };

    const newConversation = (model) => {
        const newId = generateId();
        setConversations(prev => ({
            ...prev,
            [model]: [...prev[model], { id: newId, title: "New Chat", messages: [] }]
        }));
        setActiveIds(prev => ({ ...prev, [model]: newId }));
    };

    const loadConversation = (model, id) => {
        setActiveIds(prev => ({ ...prev, [model]: id }));
    };

    const deleteConversation = (model, id) => {
        setConversations(prev => {
            const updated = prev[model].filter(c => c.id !== id);
            if (updated.length === 0) {
                return { ...prev, [model]: [{ id: "default", title: "New Chat", messages: [] }] };
            }
            return { ...prev, [model]: updated };
        });

        if (activeIds[model] === id) {
            const updatedList = conversations[model].filter(c => c.id !== id);
            const nextId = updatedList.length > 0 ? updatedList[0].id : "default";
            setActiveIds(prev => ({ ...prev, [model]: nextId }));
        }
    };

    const send = async (model, text, documents = []) => {
        const activeId = activeIds[model];

        // Optimistic update
        setConversations(prev => {
            const modelConvs = prev[model].map(c => {
                if (c.id === activeId) {
                    const newMessages = [...c.messages, { sender: "user", text, documents }];
                    const title = c.messages.length === 0 ? text.slice(0, 30) : c.title;
                    return { ...c, messages: newMessages, title };
                }
                return c;
            });
            return { ...prev, [model]: modelConvs };
        });

        setLoading(true);
        try {
            const allDocs = [...globalDocuments, ...documents];
            const data = await sendChat(model, text, allDocs);

            if (data.error) {
                throw new Error(data.error);
            }

            const responseContent = data.response || data.content;

            if (responseContent || data.type === 'file') {
                setConversations(prev => {
                    const modelConvs = prev[model].map(c => {
                        if (c.id === activeId) {
                            const botMsg = {
                                sender: "ai",
                                text: responseContent,
                                type: data.type,
                                ...data
                            };
                            return { ...c, messages: [...c.messages, botMsg] };
                        }
                        return c;
                    });
                    return { ...prev, [model]: modelConvs };
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setConversations(prev => {
                const modelConvs = prev[model].map(c => {
                    if (c.id === activeId) {
                        return {
                            ...c,
                            messages: [...c.messages, { sender: "ai", text: `Error: ${error.message || "Something went wrong"}` }]
                        };
                    }
                    return c;
                });
                return { ...prev, [model]: modelConvs };
            });
        } finally {
            setLoading(false);
        }
    };

    const uploadFile = async (file) => {
        setIsUploading(true);
        try {
            const { uploadDocument } = await import("../utils/api.js");
            const res = await uploadDocument(file);
            if (res.error) throw new Error(res.error);
            return res;
        } catch (error) {
            console.error("Upload error:", error);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const value = {
        conversations,
        activeConversation,
        getMessages,
        newConversation,
        loadConversation,
        deleteConversation,
        send,
        globalDocuments,
        setGlobalDocuments,
        loading,
        isUploading,
        uploadFile,
        // Compare State
        compareState,
        setCompareState
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
