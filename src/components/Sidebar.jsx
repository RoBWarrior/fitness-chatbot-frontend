import React from 'react';
import { MessageSquare, Plus, LogOut, ChevronRight, Trash2 } from 'lucide-react';

export default function Sidebar({ isOpen, user, sessions, currentSessionId, onNewSession, onSelectSession, onLogout, onDeleteSession, persona }) {
    return (
        <div className={`sidebar glass-panel ${isOpen ? 'open' : ''}`} style={{
            width: '300px',
            height: '100%',
            borderRight: '1px solid var(--panel-border)',
            borderTop: 'none',
            borderBottom: 'none',
            borderLeft: 'none',
            borderRadius: '0',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            flexShrink: 0
        }}>

            {/* Header Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: 'white'
                }}>
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {persona ? persona.name : user.username}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{persona ? persona.role : "Workspace"}</p>
                </div>
                <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                    <LogOut size={18} />
                </button>
            </div>

            {/* New Chat Button */}
            <button
                className="btn-primary"
                onClick={onNewSession}
                style={{ width: '100%', marginBottom: '1.5rem', justifyContent: 'flex-start', paddingLeft: '1rem' }}
            >
                <Plus size={18} />
                New Request
            </button>

            {/* Sessions List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Recent Queries
                </h4>

                {sessions.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '1rem' }}>
                        No recent sessions
                    </p>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.query_id}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                            <button
                                onClick={() => onSelectSession(session.query_id)}
                                style={{
                                    flex: 1,
                                    background: currentSessionId === session.query_id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                    border: '1px solid',
                                    borderColor: currentSessionId === session.query_id ? 'var(--accent-primary)' : 'transparent',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    color: currentSessionId === session.query_id ? 'white' : 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)',
                                    textAlign: 'left'
                                }}
                                className="session-btn"
                            >
                                <MessageSquare size={16} />
                                <span style={{ flex: 1, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    Query #{session.query_id}
                                </span>
                                {currentSessionId === session.query_id && <ChevronRight size={14} />}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteSession(session.query_id); }}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                                    padding: '0.5rem', borderRadius: '4px'
                                }}
                                title="Delete Chat"
                                onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
}
