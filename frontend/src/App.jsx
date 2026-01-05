import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import ComparePage from './pages/ComparePage';
import JudgeResultsPage from './pages/JudgeResultsPage';

import HistoryPage from './pages/HistoryPage';
import DocumentPreviewPage from './pages/DocumentPreviewPage';
import VoiceChatPage from './pages/VoiceChatPage';

const App = () => {
  return (
    <ThemeProvider>
      <ChatProvider> {/* Wrapped Routes with ChatProvider */}
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="judge-results" element={<JudgeResultsPage />} />
            <Route path="judge-results" element={<JudgeResultsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="preview" element={<DocumentPreviewPage />} />
            <Route path="voice-mode" element={<VoiceChatPage />} />
          </Route>
        </Routes>
      </ChatProvider>
    </ThemeProvider>
  );
};

export default App;
