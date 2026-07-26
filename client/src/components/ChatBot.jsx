import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from "../hooks/useAuthContext.js";
import { MessageCircle } from 'lucide-react';
import { CHATBOT_API_BASE_URL } from '../config.js';

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            from: 'bot',
            message: "Hello! How can I help you?"
        }

    ]);
    const [input, setInput] = useState('');

    // useRef is a hook that acts as a private, persistent storage box inside your component.
    const messagesRef = useRef(null);
    const sessionIdRef = useRef(null);

    // Finding the current user 
    const { user } = useAuthContext();
    if (!user) return null;

    // If an user is logged in, generate a chat session id for that user
    if (!sessionIdRef.current) {
        let sessionId = sessionStorage.getItem("chatSessionId");

        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem("chatSessionId", sessionId);
        }

        sessionIdRef.current = sessionId;
    }

    useEffect(() => {
        if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, [messages, open]);

    const sendMessage = async (e) => {
        e && e.preventDefault();

        // Read the text content that the user just typed
        const message = input.trim();
        if (!message) return;

        // Add it to message history array
        const userMsg = { id: Date.now(), from: 'user', message };
        setMessages((prevMessages) => [...prevMessages, userMsg]);

        //  Clear out the input field
        setInput('');

        try {
            const response = await fetch(`${CHATBOT_API_BASE_URL}/chatbot-api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Required for the server to "see" your data
                },
                credentials: 'include',
                body: JSON.stringify({
                    message: message,
                    sessionId: sessionIdRef.current
                }),
            });

            const chatbotRep = await response.json();

            if (response.ok) {
                const botMsg = {
                    id: Date.now() + 1, // Ensure distinct mapping keys
                    from: 'bot',
                    message: chatbotRep.reply // Extracts the key sent by FastAPI
                };
                
                // Append the chatbot reply into the feed history
                setMessages((prevMessages) => [...prevMessages, botMsg]);
            } else {
                setMessages((prevMessages) => [
                    ...prevMessages, 
                    { id: Date.now() + 1, from: 'bot', message: "Sorry, I'm having trouble reaching the server right now. Please try again!" }
                ]);
            }


        } catch (error) {
            console.error("Network connection error encountered:", error);
            setMessages((prevMessages) => [
                ...prevMessages, 
                { id: Date.now() + 1, from: 'bot', message: "Network connection lost. Please check your local servers." }
            ]);
        }
    };

    return (
        // #floating container
        <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 60, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            {/* #floating launcher button */}
            <button
                aria-label="Open chat"
                onClick={() => setOpen((o) => !o)}
                style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#005A9C',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.15s'
                }}
            >
                <MessageCircle size={26} color="#fff" strokeWidth={2} />
            </button>

            {open && (
                // #chat panel window
                <div style={{
                    width: 360,
                    height: 500,
                    position: 'absolute',
                    bottom: 70,
                    right: 0,
                    borderRadius: 16,
                    overflow: 'hidden',
                    background: '#0b1220',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(255,255,255,0.04)'
                }}>

                    {/* #header banner */}
                    <div style={{ background: '#005A9C', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* #header logo */}
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 18 }}>❖</div>
                            {/* #header title */}
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Chatbot</div>
                        </div>
                        <div>
                            {/* #header close button */}
                            <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
                        </div>
                    </div>

                    {/* #messages feed viewport */}
                    <div ref={messagesRef} style={{ padding: 15, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, background: '#FFFFFF' }}>
                        {messages.map((m) => {
                            const isUser = m.from === 'user';
                            const isCard = m.from === 'card';
                            return (
                                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', width: '100%' }}>
                                    
                                    {/* #sender identity label */}
                                    {!isUser && <div style={{ color: '#6B7280', fontSize: 12, marginBottom: 2, marginLeft: 50 }}>Chatbot</div>}

                                    <div style={{ display: 'flex', gap: 8, maxWidth: '85%', alignItems: 'flex-end' }}>
                                        
                                        {/* #robot icon */}
                                        {!isUser && <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🤖</div>}

                                        {isCard ? (
                                            // #article card container
                                            <div style={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 20, padding: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', width: '100%' }}>
                                                {/* #article card text */}
                                                <div style={{ color: '#111827', fontWeight: 600, fontSize: 15, marginBottom: 14, lineHeight: 1.4 }}>{m.message}</div>
                                                {/* #article card action button */}
                                                <button style={{ width: '100%', background: '#00BFA5', color: '#FFF', border: 'none', padding: '12px', borderRadius: 24, fontWeight: 600, fontSize: 14 }}>{m.actionText}</button>
                                            </div>
                                        ) : (
                                            // #standard message bubble
                                            <div style={{ background: isUser ? '#00BFA5' : '#F1F3F4', padding: '12px 16px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px', color: isUser ? '#FFF' : '#111827', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{m.message}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* #input form dock */}
                    <form onSubmit={sendMessage} style={{ padding: '16px 20px', background: '#FFFFFF', borderTop: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* #input text field */}
                        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message" style={{ flex: 1, padding: '8px 16px', borderRadius: 24, border: '1px solid #D1D5DB', background: '#FFFFFF', color: '#111827', outline: 'none', fontSize: 14 }} />
                    </form>
                </div>
            )}
        </div>
    );
}