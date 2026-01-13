import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ItemCard from "./ItemCard.jsx";
import AddPhotoButton from "./AddPhotoButton.jsx";

export default function CategoryGrid() {
  const [items, setItems] = useState({}); // state to hold items in this category
  const { categoryName } = useParams(); // reads the dynamic part of URL

  // Handle adding new item to the category
  const handleAddItem = (newFile) => {
    if (!newFile) return;
    
    setItems((prevItems) => {
      const currentCategoryItems = prevItems[categoryName] || [];
      const newItem = {
        id: Date.now() + Math.random(), // simple unique id
        file: newFile,
        image: URL.createObjectURL(newFile),
        description: "",
        brand: "",
        link: "",
        notes: "",
        hasInfo: false
      }

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
        [categoryName]: currentCategoryItems.filter(item => item.id !== itemDelete.id),
      };
    })
  }

  // Save the form info for an item
  const handleSaveItemInfo = (updatedItem) => {
    setItems((prevItems) => {
      const currentCategoryItems = prevItems[categoryName] || [];
      return {
        ...prevItems,
        [categoryName]: currentCategoryItems.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      };
    })
  }


  return (
    <div >
      {/* Category name */}
      <h1 className="text-center text-black text-5xl font-inherit pt-5">{categoryName.replace(/-/g, " ")}</h1>

      {/* Add Photo Button */}
      <div className="flex justify-center mt-5">
        <AddPhotoButton addItem={handleAddItem} />
      </div>

      {/* Cards container */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 justify-items-center mt-7 mb-7">
        {items[categoryName] && items[categoryName].map((item, index) => (
          <div>
            <ItemCard key={index} item={item} file={item.file} image={{ image: URL.createObjectURL(item.file) }} onDelete={handleDeleteItem} onSave={handleSaveItemInfo}/>
          </div>
        ))  
        }
      </div>

    </div>
  );
}