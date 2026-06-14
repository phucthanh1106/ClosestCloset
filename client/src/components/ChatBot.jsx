import { useState, useRef, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const INITIAL_MESSAGES = [
    { id: 1, from: 'bot', text: 'Welcome — this is a placeholder reply.' },
    { id: 2, from: 'card', text: 'Example article card: When can I amend my 2025 tax return?', actionText: 'View article' },
    { id: 3, from: 'bot', text: 'Was this helpful?' }
];

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesRef = useRef(null);
    const { user } = useAuthContext();
    
    if (!user) return null;

    useEffect(() => {
        if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, [messages, open]);

    const sendMessage = async (e) => {
        e && e.preventDefault();

        // Read the text content that the user just typed
        const text = input.trim();
        if (!text) return;

        // Add it to message history array
        const userMsg = { id: Date.now(), from: 'user', text };
        setMessages([...messages, userMsg]);
        //  Clear out the input field
        setInput('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/chatbot/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Required for the server to "see" your data
                    "Authorization": `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    file: newFile,
                    category: categoryId, // This comes from your fetchCategory useEffect
                    description: "",      // Initial empty values
                    userId: user.id,
                    brand: "",
                    url: "",
                    notes: "",
                    hasInfo: false
                }),
            });
        } catch (error) {
            return;
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
                                                <div style={{ color: '#111827', fontWeight: 600, fontSize: 15, marginBottom: 14, lineHeight: 1.4 }}>{m.text}</div>
                                                {/* #article card action button */}
                                                <button style={{ width: '100%', background: '#00BFA5', color: '#FFF', border: 'none', padding: '12px', borderRadius: 24, fontWeight: 600, fontSize: 14 }}>{m.actionText}</button>
                                            </div>
                                        ) : (
                                            // #standard message bubble
                                            <div style={{ background: isUser ? '#00BFA5' : '#F1F3F4', padding: '12px 16px', borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px', color: isUser ? '#FFF' : '#111827', fontSize: 14, lineHeight: 1.5 }}>{m.text}</div>
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