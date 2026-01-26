import { useState } from "react";
import { PenLine } from "lucide-react"; // or any pen icon library
import ItemCardForm from "./ItemCardForm.jsx";

export default function ItemCard({ image, item, file, onDelete, onSave }) {
    const [hover, setHover] = useState(false);
    const [showForm, setShowForm] = useState(false);

    
    return (
        <div 
        className="relative w-[150px] sm:w-[200px] md:w-[240px] lg:w-[260px] aspect-[3/4] group rounded-xl overflow-hidden m-7 mb-10"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        >
            {/* Glass overlay */}
            <div
                className="
                    absolute inset-0
                    bg-black/40      /* semi-transparent black */
                    backdrop-blur-sm /* glass effect */
                    opacity-0
                    group-hover:opacity-100
                    transition-opacity duration-300
                "
            ></div>                    


            {/* Item card */}
            <img
                src={image.image}
                alt={image.name}
                className="w-full h-full overflow-hidden"
            />


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
                onClick={() => onDelete(item)}
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


            {/* Item Form */}
            {showForm && (
                <ItemCardForm item={item} onClose={() => setShowForm(false)} onSave={onSave} />
            )}



        </div>
    );
}
