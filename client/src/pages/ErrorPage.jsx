import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  const message = error?.statusText || error?.message || "Unknown error";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-black/70 shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        
        <h1 className="text-4xl font-bold text-red-500 mb-4">
          Oops!
        </h1>

        <p className="text-2xl text-gray-200 mb-2">
          Sorry, an unexpected error has occurred!
        </p>

        <p className="text-gray-300 italic mb-6">
          {message}
        </p>

        <button
          onClick={() => window.location.href = "/"}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Go Home
        </button>

      </div>
    </div>
  );
}