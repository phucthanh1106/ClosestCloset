import { useParams } from "react-router-dom";

export default function CategoryPage() {
  const { categoryName } = useParams(); // reads the dynamic part of URL

  return (
    <div>
      <h1 class="text-center text-4xl font-bold pt-5">{categoryName.replace(/-/g, " ")}</h1>
      {/* Render items for this category here */}
    </div>
  );
}