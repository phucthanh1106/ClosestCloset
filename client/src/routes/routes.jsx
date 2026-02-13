import App from "../App.jsx";
import ErrorPage from "../pages/ErrorPage.jsx";
import About from "../pages/About.jsx";
import MyCloset from "../pages/MyCloset.jsx";
import Login from "../pages/Login.jsx"
import Signup from "../pages/Signup.jsx"
import CategoryGrid from "../components/CategoryGrid.jsx";

const routes = [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/my-closet",
        element: <MyCloset />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
      path: "/my-closet/:categoryId", // dynamic route for each category
      element: <CategoryGrid />
      },
    ],
  },
];

export default routes;

