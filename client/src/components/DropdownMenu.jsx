import { useEffect } from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function DropdownMenu({ label, items, addBool, basePath }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [categories, setCategories] = useState(items);

    // Use location to detect where the user is
    const location = useLocation();

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");

                if (!res.ok) {
                    throw new Error("Failed to fetch categories");
                }
                
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error("Error fetching cateogories")
            }
        };

        fetchCategories();
    }, []);

    // Function to add a new category to the dropdown menu
    const addCategory = async () => {
        let newCategory = prompt("Enter a new category name with less than 20 characters: ");

        while (newCategory.length > 20) {
            alert("Category name must be at most 20 characters");
            newCategory = prompt("Enter a new category name with less than 20 characters: ");
        }

        // Check for existed duplicates
        const exists = categories.some(
            (category) => category.name.toLowerCase() === newCategory.toLowerCase()
        );

        if (exists) {
            alert("This category already exists");
            return;
        } 

        // Sending new category to db
        try {
            const response = await fetch('/api/categories', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategory }),
            });

            const createdCategory = await response.json();

            // Check conditions of the response
            if (response.ok) {
                setCategories([...categories, createdCategory]);
            } else {
                throw new Error("Failed to save category");
            }
        } catch (err) {
            console.error("Error adding category", err);
        }
    };

    // Function to handle delete a category
    const deleteCategory = async (itemId, e) => {
        const endpoint = `/api/categories/${itemId}`; // IMPORTANT!!!!: Use `` as "" and '' are just plain strings
        // Check for user's confirmation first
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        
        try {
            const response = await fetch(endpoint, {
                method: "DELETE",
            });

            // Check conditions of the response
            if (response.ok) {
                setCategories(((prev) => prev.filter((cat) => cat._id !== itemId)))
            } else {
                const errorMessage = await response.json();
                console.error(errorMessage);
                alert("Could not delete category");
            }
        } catch (err) {
            console.error("Delete request failed: ", err);
            alert("Couldn't delete the category, check your connection!");
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    console.log(categories);


    return (
        <div>
            {/* Handle the button toggling instead of going to my closet every time */}
            {location.pathname === "/" 
            ? <Link to="/my-closet"><button className="dropdown-button" onClick={toggleDropdown}>{label}</button></Link>
            : <button className="dropdown-button" onClick={toggleDropdown}>{label}</button>
            }

            {showDropdown && (
                <ul className="dropdown-menu">
                    {categories.map((item) => (
                        <li key={item._id} className="group relative flex items-center justify-between w-full">
                            <Link 
                                className="dropdown-item pr-12 font-nerko" 
                                to={`${basePath}/${item.name.replace(/\s+/g, "-")}`}
                            >
                                {item.name}
                            </Link>

                            {/* The "X" Button */}
                            <button 
                                onClick={(e) => deleteCategory(item._id, e)}
                                className="absolute right-0 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-black hover:font-bold px-2 transition-opacity duration-200"
                            >
                                ✕ 
                            </button>
                        </li>
                    ))}

                    {addBool && <button className="dropdown-add-btn" onClick={addCategory}>➕</button>}
                </ul>
            )}
        </div>
    );
}