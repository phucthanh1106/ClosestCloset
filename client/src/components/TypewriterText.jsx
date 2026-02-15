import { useState, useEffect, useRef } from 'react';


// useRef gives you a persistent mutable value:
// does NOT reset on re-render
// does NOT cause re-renders
// always has the correct current value

const TypewriterText = ({ text, speed = 50, onComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const indexRef = useRef(0);

    useEffect(() => {
        indexRef.current = 0;
        setDisplayedText("");

        const timer = setInterval(() => {
            const i = indexRef.current;

            setDisplayedText(prev => prev + text.charAt(i));

            indexRef.current += 1;

            if (indexRef.current >= text.length) {
                clearInterval(timer);

                if (onComplete) {
                    onComplete();
                }
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed]);

    console.log(displayedText);

    return <span>{displayedText}</span>;
};

export default TypewriterText;