import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown'; // Optional: npm install react-markdown

const AiMessageItem = ({ content, thinking, steps, isStreaming }) => {
    const [expanded, setExpanded] = useState(isStreaming);

    useEffect(() => {
        setExpanded(isStreaming);
    }, [isStreaming]);

    const hasThinkingContent = thinking || (steps && steps.length > 0);
    const showThinkingCard = isStreaming || hasThinkingContent;

    return (
        <div className="d-flex mb-3 justify-content-start">
            <div className="p-3 rounded-3 bg-white border" style={{ maxWidth: '75%', whiteSpace: 'pre-wrap', width: '100%' }}>
                <strong>AI:</strong><br />
                {showThinkingCard && (
                    <div className="card mb-2 mt-2 shadow-sm border-0 bg-light">
                        <div
                            className="card-header bg-transparent border-0 p-2 d-flex justify-content-between align-items-center"
                            onClick={() => setExpanded(!expanded)}
                            style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            <div className="d-flex align-items-center gap-2">
                                {isStreaming ? (
                                    <>
                                        <div className="spinner-grow spinner-grow-sm text-primary" role="status" style={{ width: '0.8rem', height: '0.8rem' }}>
                                            <span className="visually-hidden">Thinking...</span>
                                        </div>
                                        <span className="text-secondary fw-semibold">Gemini is thinking...</span>
                                    </>
                                ) : (
                                    <span className="text-secondary fw-semibold text-decoration-underline">
                                        View reasoning
                                    </span>
                                )}
                            </div>
                            <span className="text-secondary">{expanded ? '▲' : '▼'}</span>
                        </div>
                        {expanded && (
                            <div className="card-body p-2 border-top" style={{ maxHeight: '120px', overflowY: 'auto', backgroundColor: '#fcfcfc', fontSize: '0.85rem' }}>
                                {steps && steps.length > 0 && (
                                    <div className="mb-2">
                                        {steps.map((step, idx) => (
                                            <div key={idx} className="d-flex align-items-center mb-1">
                                                {step.status === 'running' ? (
                                                    <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: '0.8rem', height: '0.8rem' }}></div>
                                                ) : (
                                                    <span>✅</span>
                                                )}
                                                <span className="ms-2 fw-semibold text-dark">{step.tool}</span>
                                                {step.message && <span className="ms-1 text-muted">- {step.message}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {thinking && <div>{thinking}</div>}
                            </div>
                        )}
                    </div>
                )}
                {!isStreaming && content && <ReactMarkdown>{content}</ReactMarkdown>}
            </div>
        </div>
    );
};

function AiChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [thinkingText, setThinkingText] = useState('');
    const [steps, setSteps] = useState([]);
    const messagesEndRef = useRef(null);
    const readerRef = useRef(null);

    const API_BASE = 'http://localhost:8080';

    const getChatId = () => {
        const username = localStorage.getItem('username') || 'anonymous';
        return `web-session-${username}`;
    };

    const getEndpoint = () => {
        const role = localStorage.getItem('role');
        return role === 'ADMIN' ? `${API_BASE}/ai/admin/orchestrate/stream` : `${API_BASE}/ai/orchestrate/stream`;
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

        const currentInput = input;
        setInput('');
        setLoading(true);
        setThinkingText('');
        setSteps([]);

        try {
            const url = `${getEndpoint()}?message=${encodeURIComponent(currentInput)}&chatId=${encodeURIComponent(getChatId())}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/event-stream'
                }
            });

            if (!response.ok) throw new Error("Stream connection failed");

            const reader = response.body.getReader();
            readerRef.current = reader;
            const decoder = new TextDecoder('utf-8');
            let currentThinking = '';
            let finalAnswer = '';
            let buffer = '';
            let currentSteps = [];

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (trimmedLine.startsWith('data:')) {
                            const dataStr = trimmedLine.replace('data:', '').trim();
                            if (!dataStr) continue;
                            try {
                                const data = JSON.parse(dataStr);
                                if (data.type === 'tool_start') {
                                    currentSteps = [...currentSteps, { tool: data.tool, message: data.message, status: 'running' }];
                                    setSteps(currentSteps);
                                } else if (data.type === 'tool_done') {
                                    currentSteps = currentSteps.map(s => 
                                        s.tool === data.tool && s.status === 'running' 
                                            ? { ...s, status: 'done' } 
                                            : s
                                    );
                                    setSteps(currentSteps);
                                } else if (data.token) {
                                    currentThinking += data.token;
                                    setThinkingText(currentThinking);
                                }
                                if (data.answer) finalAnswer = data.answer;
                            } catch (e) {
                                console.error("Error parsing JSON:", e);
                            }
                        }
                    }
                }
            } catch (streamErr) {
                // Connection closed abruptly — only error if we never got an answer
                if (!finalAnswer) throw streamErr;
            }

            // Always add message if we have an answer, even if connection dropped
            if (finalAnswer) {
                setMessages(prev => [...prev, { role: 'ai', content: finalAnswer, thinking: currentThinking, steps: currentSteps }]);
            } else {
                throw new Error("No answer received");
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to get response");
            setMessages(prev => [...prev, { role: 'error', content: "Error: Could not connect to AI stream." }]);
        } finally {
            setLoading(false);
            setThinkingText('');
            setSteps([]);
            readerRef.current = null;
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

                    {messages.map((msg, index) => {
                        if (msg.role === 'user') {
                            return (
                                <div key={index} className="d-flex mb-3 justify-content-end">
                                    <div className="p-3 rounded-3 bg-primary text-white" style={{ maxWidth: '75%', whiteSpace: 'pre-wrap' }}>
                                        <strong>You:</strong><br />
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        } else if (msg.role === 'error') {
                            return (
                                <div key={index} className="d-flex mb-3 justify-content-start">
                                    <div className="p-3 rounded-3 bg-danger text-white" style={{ maxWidth: '75%', whiteSpace: 'pre-wrap' }}>
                                        <strong>AI:</strong><br />
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        } else {
                            return <AiMessageItem key={index} content={msg.content} thinking={msg.thinking} steps={msg.steps} isStreaming={false} />;
                        }
                    })}

                    {loading && (
                        <AiMessageItem content="" thinking={thinkingText} steps={steps} isStreaming={true} />
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