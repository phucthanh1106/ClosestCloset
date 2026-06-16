import { useState } from "react";
import { PenLine, ExternalLink } from "lucide-react"; // or any pen icon library
import ItemCardForm from "./ItemCardForm.jsx";

export default function ItemCard({ image, item, itemId, onDelete, onSave }) {
    const [hover, setHover] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Helper to open link
    const handleLinkClick = (e) => {
        e.stopPropagation(); // Prevents triggering the form open if you decide to add that to the whole card later
        window.open(item.url, "_blank", "noopener,noreferrer");
    };
    
    return (
        <div className="relative group w-full">
            <div
                className="relative overflow-hidden rounded-xl shadow-sm bg-white/10 backdrop-blur-sm"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {/* Glass overlay */}
                <div
                    className="
                        absolute inset-0
                        bg-black/40
                        backdrop-blur-sm
                        opacity-0
                        group-hover:opacity-100
                        transition-opacity duration-300
                    "
                />

                {/* Item image */}
                <img
                    src={image}
                    alt="Item"
                    className="block w-full h-auto"
                />

                {/* URL button */}
                {item.url && (
                    <button
                        onClick={handleLinkClick}
                        className="absolute bottom-3 left-3 z-30 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition duration-300"
                        title="Visit product link"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </button>
                )}

                {/* Pen button */}
                {!item.hasInfo && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="absolute inset-0 m-auto w-12 h-12 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                        <PenLine className="w-6 h-6 text-white" />
                    </button>
                )}

                {/* Show description when item has info*/}
                {item.hasInfo && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="
                        absolute inset-0 z-20
                        flex items-center justify-center
                        px-3 text-center
                        text-white font-semibold
                        opacity-0 group-hover:opacity-100
                        transition-opacity duration-300
                        pointer-events-auto
                        "
                    >
                        <span className="line-clamp-4 text-[30px]">
                        {item.description}
                        </span>
                    </button>
                )}

                {/* X Button */}
                <button
                    onClick={() => onDelete(itemId)}
                    className="
                        absolute top-3 right-3
                        rounded-full text-white 
                        w-7 h-7 flex items-center justify-center text-sm
                        opacity-0 group-hover:opacity-100
                        transition
                        z-20
                    "
                >
                ✖
                </button>
            </div>

            {/* Item Form stays untouched and centered via its own modal */}
            {showForm && (
                <ItemCardForm item={item} onClose={() => setShowForm(false)} onSave={onSave} />
            )}
        </div>
    );
}
