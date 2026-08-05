import { useEffect, useState } from "react";

export default function ShowProgress({ status }) {
    const [isVisible, setIsVisible] = useState(false);
    const isFinished = status === "Done!";

    useEffect(() => {
        if (!status) {
            setIsVisible(false);
            return;
        }

        setIsVisible(true);

        if (isFinished) {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [status, isFinished]);

    if (!isVisible) return null;

    return (
        <div
            role="status"
            className="fixed top-4 left-1/2 z-100 flex min-w-52 -translate-x-1/2 flex-col items-center rounded-lg bg-gray-800 px-4 py-2.5 shadow-md text-sm"        >
            {/* Status appears above the animation */}
            <p className={`font-large font-bold ${isFinished ? "text-green-600" : "text-white"}`}>
                {status}
            </p>

            {isFinished ? (
                <div className="mt-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xl text-white">
                    ✓
                </div>
            ) : (
                <div className="mt-3 flex gap-2">
                    <span
                        className="h-3 w-3 animate-bounce rounded-full bg-gray-500"
                        style={{ animationDelay: "-0.3s" }}
                    />

                    <span
                        className="h-3 w-3 animate-bounce rounded-full bg-gray-500"
                        style={{ animationDelay: "-0.15s" }}
                    />

                    <span className="h-3 w-3 animate-bounce rounded-full bg-gray-500" />
                </div>
            )}
        </div>
    );
}