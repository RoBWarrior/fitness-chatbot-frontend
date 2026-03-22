import React, { useState, useRef, useEffect } from 'react';
import { documentAPI } from '../services/api';
import { UploadCloud, X, File, CheckCircle2, AlertCircle, Trash2, Loader2 } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, userId }) {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [message, setMessage] = useState('');
    const [documents, setDocuments] = useState([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && userId) {
            fetchDocuments();
        }
    }, [isOpen, userId]);

    const fetchDocuments = async () => {
        setIsLoadingDocs(true);
        try {
            const res = await documentAPI.list(userId);
            setDocuments(res.data.documents || []);
        } catch (err) {
            console.error("Failed to fetch documents", err);
        } finally {
            setIsLoadingDocs(false);
        }
    };

    const handleDeleteDoc = async (docId) => {
        try {
            await documentAPI.delete(docId);
            setDocuments(docs => docs.filter(d => d.doc_id !== docId));
        } catch (err) {
            console.error("Failed to delete document", err);
            setStatus('error');
            setMessage('Failed to delete document. Please try again.');
        }
    };

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (selected.type === 'application/pdf') {
                setFile(selected);
                setStatus('idle');
            } else {
                setStatus('error');
                setMessage('Please upload a valid PDF file.');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setStatus('uploading');
        setMessage('Extracting text and generating embeddings...');

        try {
            await documentAPI.upload(userId, file);
            setStatus('success');
            setMessage('Document added to your knowledge base successfully!');
            setTimeout(() => {
                onClose();
                setFile(null);
                setStatus('idle');
            }, 2000);
        } catch (err) {
            setStatus('error');
            setMessage('Upload failed. ' + (err.response?.data?.detail || ''));
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }} className="animate-fade-in">
            <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', overflow: 'hidden', position: 'relative' }}>

                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '500' }}>Upload Document</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '2rem' }}>

                    {/* Drag & Drop Area */}
                    {!file && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: '2px dashed var(--panel-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: 'rgba(255,255,255,0.02)',
                                transition: 'var(--transition)'
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    const dropped = e.dataTransfer.files[0];
                                    if (dropped.type === 'application/pdf') {
                                        setFile(dropped);
                                        setStatus('idle');
                                    } else {
                                        setStatus('error');
                                        setMessage('Only PDF files are supported.');
                                    }
                                }
                            }}
                        >
                            <UploadCloud size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                            <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Click or drag PDF to upload</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Max file size 10MB</p>
                        </div>
                    )}

                    {/* Selected File State */}
                    {file && status === 'idle' && (
                        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)' }}>
                            <File size={24} color="var(--accent-secondary)" />
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <p style={{ fontWeight: '500', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{file.name}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button onClick={() => setFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                    )}

                    {/* Uploading Status */}
                    {status === 'uploading' && (
                        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                            <div className="spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', margin: '0 auto 1rem auto' }} />
                            <p style={{ fontWeight: '500' }}>Uploading...</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{message}</p>
                        </div>
                    )}

                    {/* Success Status */}
                    {status === 'success' && (
                        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem 1rem', color: '#10b981' }}>
                            <CheckCircle2 size={48} style={{ margin: '0 auto 1rem auto' }} />
                            <p style={{ fontWeight: '500', color: 'white' }}>Success!</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{message}</p>
                        </div>
                    )}

                    {/* Error Banner */}
                    {status === 'error' && (
                        <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1rem', color: '#ef4444' }}>
                            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontSize: '0.875rem' }}>{message}</p>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="application/pdf"
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Document List */}
                <div style={{ padding: '0 2rem 2rem 2rem', borderTop: '1px solid var(--panel-border)' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '1rem', paddingTop: '1.5rem' }}>Your Uploaded Documents</h4>
                    {isLoadingDocs ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                            <Loader2 size={24} className="spin" color="var(--accent-primary)" />
                        </div>
                    ) : documents.length === 0 ? (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                            No documents uploaded yet.
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                            {documents.map((doc) => (
                                <div key={doc.doc_id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)', border: '1px solid var(--panel-border)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                                        <File size={16} color="var(--accent-secondary)" flexShrink={0} />
                                        <span style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {doc.filename}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteDoc(doc.doc_id)}
                                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}
                                        title="Delete Document"
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {file && status === 'idle' && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                        <button className="btn-secondary" onClick={() => setFile(null)}>Cancel</button>
                        <button className="btn-primary" onClick={handleUpload}>Upload and Embed</button>
                    </div>
                )}
            </div>
        </div>
    );
}
