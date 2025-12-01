import { useState } from "react";

export default function ItemCard({ item, file, onDelete }) {
    const [hover, setHover] = useState(false);

    
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
                src={item.image}
                alt={item.name}
                className="w-full h-full overflow-hidden"
            />

            {/* X Button */}
            <button
                onClick={() => onDelete(file)}
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
    );
}
