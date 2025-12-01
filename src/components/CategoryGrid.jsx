import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ItemCard from "./ItemCard.jsx";
import AddPhotoButton from "./AddPhotoButton.jsx";

export default function CategoryGrid() {
  const [items, setItems] = useState({}); // state to hold items in this category
  const { categoryName } = useParams(); // reads the dynamic part of URL

  // !! IMPORTANT !!
  // In a real app, you would fetch items from a backend based on categoryName
  // Here, we'll simulate with local state for demonstration purposes
  // Items here are file objects from file input


  // Handle adding new item to the category
  const handleAddItem = (newItem) => {
    if (!newItem) return;
    
    setItems((prevItems) => {
      const currentCategoryItems = prevItems[categoryName] || [];
      return {
        ...prevItems,
        [categoryName]: [...currentCategoryItems, newItem],
      };
    });
  }

  // Removing an item
  const handleDeleteItem = (itemDelete) => {
    setItems((prevItems) => {
      const currentCategoryItems = prevItems[categoryName] || [];
      return {
        ...prevItems,
        [categoryName]: currentCategoryItems.filter(item => item !== itemDelete),
      };
    })
  }


  return (
    <div >
      {/* Category name */}
      <h1 className="text-center text-5xl font-bold pt-5">{categoryName.replace(/-/g, " ")}</h1>

      {/* Add Photo Button */}
      <div className="flex justify-center mt-5">
        <AddPhotoButton addItem={handleAddItem} />
      </div>

      {/* Cards container */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 justify-items-center mt-7 mb-7">
        {items[categoryName] && items[categoryName].map((item, index) => (
          <div>
            <ItemCard key={index} file ={item} item={{ image: URL.createObjectURL(item) }} onDelete={handleDeleteItem}/>
          </div>
        ))  
        }
      </div>

    </div>
  );
}