import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown'; // Optional: npm install react-markdown

function AiChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const API_BASE = 'http://localhost:8080';

    const getChatId = () => {
        const username = localStorage.getItem('username') || 'anonymous';
        return `web-session-${username}`;
    };

    const getEndpoint = () => {
        const role = localStorage.getItem('role');
        return role === 'ADMIN' ? `${API_BASE}/ai/admin/orchestrate` : `${API_BASE}/ai/orchestrate`;
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load History on Mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const chatId = getChatId();
                if (!token) return;

                const res = await axios.get(`${API_BASE}/ai/history?chatId=${chatId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Convert Spring AI messages to UI format
                const history = res.data.map(msg => ({
                    role: msg.messageType === 'USER' ? 'user' : 'ai',
                    content: msg.content || msg.text || '' // Handle 1.1.2 structure
                }));

                if (history.length > 0) {
                    setMessages(history);
                }
            } catch (err) {
                console.error("Failed to load history", err);
            }
        };
        loadHistory();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please login first");
            return;
        }

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(getEndpoint(), 
                { 
                    message: userMsg.content,
                    chatId: getChatId() 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const aiMsg = { role: 'ai', content: res.data };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            toast.error("Failed to get response");
            setMessages(prev => [...prev, { role: 'error', content: "Error: Could not connect to AI." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">🤖 AI Assistant</h2>
            
            <div className="card shadow-sm" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
                <div className="card-body" style={{ overflowY: 'auto', flex: 1, background: '#f8f9fa' }}>
                    {messages.length === 0 && (
                        <div className="text-center text-muted mt-5">
                            <h4>How can I help you?</h4>
                            <p>Try asking: "Find user Madan" or "What is the refund policy?"</p>
                        </div>
                    )}
                    
                    {messages.map((msg, index) => (
                        <div key={index} className={`d-flex mb-3 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div className={`p-3 rounded-3 ${
                                msg.role === 'user' ? 'bg-primary text-white' : 
                                msg.role === 'error' ? 'bg-danger text-white' : 'bg-white border'
                            }`} style={{ maxWidth: '75%', whiteSpace: 'pre-wrap' }}>
                                <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong><br/>
                                {/* Use Markdown or plain text */}
                                {msg.role === 'ai' ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="d-flex justify-content-start mb-3">
                            <div className="bg-white border p-3 rounded-3">
                                <span className="spinner-border spinner-border-sm text-primary me-2"></span>
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="card-footer bg-white">
                    <form onSubmit={handleSend} className="d-flex gap-2">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Type a message..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            Send ➤
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AiChat;