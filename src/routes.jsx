import App from "./App.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import About from "./pages/About.jsx";
import MyCloset from "./pages/MyCloset.jsx";
import CategoryPage from "./components/CategoryPage.jsx";

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/my-closet",
        element: <MyCloset />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
      path: "/my-closet/:categoryName", // dynamic route for each category
      element: <CategoryPage />
      },
    ],
  },
];

export default routes;

