import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Link2, Search, File, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

export default function ChatInterface({ messages, isTyping, onSendMessage, isNewChat, persona }) {
    const [input, setInput] = useState('');
    const [useKb, setUseKb] = useState(true);
    const [useWeb, setUseWeb] = useState(false);
    const [attachedPdf, setAttachedPdf] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handlePaste = (e) => {
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
            const pastedFile = e.clipboardData.files[0];
            if (pastedFile.type === 'application/pdf') {
                e.preventDefault();
                setAttachedPdf(pastedFile);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((input.trim() || attachedPdf) && !isTyping) {
            onSendMessage(input, useKb, useWeb, attachedPdf);
            setInput('');
            setAttachedPdf(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>

            {/* Header */}
            <div className="chat-header" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'padding 0.3s ease' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                    {isNewChat ? (persona ? `Chat with ${persona.name}` : 'New Request') : 'Session Thread'}
                </h2>

                {/* Toggles */}
                <div className="chat-toggles sm-hide" style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: useKb ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        <input type="checkbox" checked={useKb} onChange={(e) => setUseKb(e.target.checked)} style={{ display: 'none' }} />
                        <div style={{ width: '32px', height: '18px', background: useKb ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', borderRadius: '1rem', position: 'relative', transition: 'var(--transition)' }}>
                            <div style={{ position: 'absolute', width: '14px', height: '14px', background: 'white', borderRadius: '50%', top: '2px', left: useKb ? '16px' : '2px', transition: 'var(--transition)' }} />
                        </div>
                        <Link2 size={16} /> Knowledge Base
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: useWeb ? 'var(--accent-secondary)' : 'var(--text-muted)' }}>
                        <input type="checkbox" checked={useWeb} onChange={(e) => setUseWeb(e.target.checked)} style={{ display: 'none' }} />
                        <div style={{ width: '32px', height: '18px', background: useWeb ? 'var(--accent-secondary)' : 'rgba(255,255,255,0.1)', borderRadius: '1rem', position: 'relative', transition: 'var(--transition)' }}>
                            <div style={{ position: 'absolute', width: '14px', height: '14px', background: 'white', borderRadius: '50%', top: '2px', left: useWeb ? '16px' : '2px', transition: 'var(--transition)' }} />
                        </div>
                        <Search size={16} /> Web Search
                    </label>
                </div>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {messages.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1rem' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Bot size={32} color="var(--accent-primary)" />
                        </div>
                        <h3>{persona ? persona.greeting : "How can I help you today?"}</h3>
                        <p style={{ maxWidth: '400px', textAlign: 'center', fontSize: '0.875rem' }}>
                            {persona ? "Chat natively with your specialized assistant." : "Ask a question to start a new thread. Turn on Knowledge Base to answer from your documents, or Web Search for live info."}
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} className="animate-fade-in" style={{ display: 'flex', gap: '1rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                                background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--msg-ai-bg)',
                                border: `1px solid ${msg.role === 'user' ? 'transparent' : 'var(--panel-border)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {msg.role === 'user' ? <User size={20} color="white" /> : <Bot size={20} color="var(--accent-secondary)" />}
                            </div>

                            <div style={{
                                maxWidth: '75%',
                                padding: '1rem 1.25rem',
                                borderRadius: 'var(--radius-md)',
                                background: msg.role === 'user' ? 'var(--msg-user-bg)' : 'var(--msg-ai-bg)',
                                border: `1px solid ${msg.role === 'user' ? 'var(--msg-user-border)' : 'var(--msg-ai-border)'}`,
                                borderTopRightRadius: msg.role === 'user' ? '4px' : 'var(--radius-md)',
                                borderTopLeftRadius: msg.role === 'assistant' ? '4px' : 'var(--radius-md)',
                                color: 'var(--text-main)',
                                fontSize: '0.95rem',
                                lineHeight: '1.6',
                                overflowX: 'auto'
                            }}>
                                {msg.role === 'assistant' ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkMath, remarkGfm]}
                                        rehypePlugins={[rehypeKatex]}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                ) : (
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {isTyping && (
                    <div className="animate-fade-in" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                            background: 'var(--msg-ai-bg)', border: '1px solid var(--panel-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Bot size={20} color="var(--accent-secondary)" />
                        </div>
                        <div style={{
                            padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
                            background: 'var(--msg-ai-bg)', border: '1px solid var(--msg-ai-border)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <Loader2 size={16} className="spin" color="var(--text-muted)" />
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '1.5rem', background: 'rgba(13, 15, 20, 0.8)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--panel-border)' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    
                    {/* Attached File Preview */}
                    {attachedPdf && (
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.5rem', 
                            background: 'rgba(255,255,255,0.1)', padding: '0.5rem 0.75rem', 
                            borderRadius: 'var(--radius-md)', width: 'fit-content', border: '1px solid var(--panel-border)' 
                        }} className="animate-fade-in">
                            <File size={16} color="var(--accent-secondary)" />
                            <span style={{ fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {attachedPdf.name}
                            </span>
                            <button 
                                type="button" 
                                onClick={() => setAttachedPdf(null)} 
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex', width: '100%' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder={isNewChat ? "Ask a starting question... (paste a PDF to attach it)" : "Ask a follow up... (paste a PDF to attach it)"}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onPaste={handlePaste}
                            disabled={isTyping}
                            style={{
                                paddingRight: '64px',
                                paddingTop: '1rem',
                                paddingBottom: '1rem',
                                borderRadius: '24px',
                                background: 'rgba(255,255,255,0.05)',
                                fontSize: '1rem',
                                width: '100%'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={(!input.trim() && !attachedPdf) || isTyping}
                            style={{
                                position: 'absolute', right: '8px', top: '8px', bottom: '8px',
                                width: '40px', borderRadius: '50%',
                                background: (input.trim() || attachedPdf) && !isTyping ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                                color: 'white', border: 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: (input.trim() || attachedPdf) && !isTyping ? 'pointer' : 'not-allowed',
                                transition: 'var(--transition)'
                            }}
                        >
                            <Send size={18} style={{ marginLeft: '2px' }} />
                        </button>
                    </form>
                </div>
                <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    AI models can make mistakes. Verify important information.
                </div>
            </div>

            {/* Spin animation for loader */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
      `}} />
        </div>
    );
}
