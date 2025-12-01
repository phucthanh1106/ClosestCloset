import App from "./components/App.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import About from "./pages/About.jsx";
import MyCloset from "./pages/MyCloset.jsx";
import CategoryGrid from "./components/CategoryGrid.jsx";


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
      element: <CategoryGrid />
      },
    ],
  },
];

export default routes;

