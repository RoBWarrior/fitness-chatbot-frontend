import React, { useState, useEffect } from 'react';
import AuthView from './components/AuthView';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import UploadModal from './components/UploadModal';
import { chatAPI, configAPI } from './services/api';
import { FileUp, Menu } from 'lucide-react';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mcp_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [persona, setPersona] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    configAPI.getPersona().then(res => {
      setPersona(res.data);
      if (res.data.theme_color) {
        document.documentElement.style.setProperty('--accent-primary', res.data.theme_color);
      }
    }).catch(err => console.error("Failed to load persona", err));
  }, []);

  // Load sessions when user logs in
  useEffect(() => {
    if (user) {
      localStorage.setItem('mcp_user', JSON.stringify(user));
      loadSessions();
    } else {
      localStorage.removeItem('mcp_user');
      setSessions([]);
      setCurrentSessionId(null);
      setMessages([]);
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      const res = await chatAPI.getUserQueries(user.user_id);
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    }
  };

  const handleNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
  };

  const handleSelectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setMessages([]);
    setIsTyping(true);
    // Let's fetch history if we can. (Requires a backend route which we will add next)
    try {
      const res = await chatAPI.getHistory(sessionId);
      if (res.data && res.data.history) {
        setMessages(res.data.history.map(msg => ({
          role: msg.sender_type === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        })));
      }
    } catch (e) {
      console.error("Failed to fetch history");
    } finally {
      setIsTyping(false);
      setIsSidebarOpen(false); // Close sidebar on mobile after selecting
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await chatAPI.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.query_id !== sessionId));
      if (currentSessionId === sessionId) {
        handleNewSession();
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  };

  const handleSendMessage = async (text, useKb, useWeb, attachedPdf) => {
    // Optimistic UI update
    const displayMsg = text.trim() ? text : (attachedPdf ? `Analying attached document: ${attachedPdf.name}` : '');
    if (!displayMsg) return; // Should not happen due to UI validation
    
    const newMsg = { role: 'user', content: displayMsg };
    setMessages((prev) => [...prev, newMsg]);
    setIsTyping(true);

    try {
      let finalUseKb = useKb;
      
      if (attachedPdf) {
        // Upload the PDF to the knowledge base first
        await documentAPI.upload(user.user_id, attachedPdf);
        finalUseKb = true; // Force using KB since we just attached something
      }

      const backendQuery = text.trim() ? text : "I have attached a document. Please analyze it and summarize.";

      let res;
      if (!currentSessionId) {
        // Start a new query session
        res = await chatAPI.startQuery(user.user_id, backendQuery, finalUseKb, useWeb);
        const newSessionId = res.data.query_id;
        setCurrentSessionId(newSessionId);

        // Append just the answer.
        setMessages((prev) => [...prev, { role: 'assistant', content: res.data.answer }]);
        loadSessions(); // refresh sidebar
      } else {
        // Continue existing session
        res = await chatAPI.continueChat(user.user_id, currentSessionId, backendQuery, finalUseKb, useWeb);
        setMessages((prev) => [...prev, { role: 'assistant', content: res.data.answer }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error processing your request.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!user) {
    return (
      <div className="app-container">
        <AuthView onLogin={(userData) => setUser(userData)} />
      </div>
    );
  }

  return (
    <div className="app-container" style={{ background: 'var(--bg-color)', color: 'var(--text-main)' }}>
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />
      
      <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
        <Menu size={20} />
      </button>

      <Sidebar
        isOpen={isSidebarOpen}
        user={user}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewSession={() => { handleNewSession(); setIsSidebarOpen(false); }}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onLogout={() => setUser(null)}
        persona={persona}
      />

      <main className="main-content">
        {/* Top bar with upload button */}
        <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', zIndex: 10 }}>
          <button className="btn-secondary" onClick={() => setIsUploadOpen(true)} style={{ background: 'rgba(25, 28, 36, 0.6)', backdropFilter: 'blur(8px)' }}>
            <FileUp size={18} />
            <span style={{ display: 'none' }} className="sm-show">Upload Document</span>
          </button>
        </div>

        <ChatInterface
          messages={messages}
          isTyping={isTyping}
          onSendMessage={handleSendMessage}
          isNewChat={!currentSessionId}
          persona={persona}
        />
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        userId={user.user_id}
      />
    </div>
  );
}

export default App;
