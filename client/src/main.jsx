// Import react router
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
// Import routes
import routes from './routes/routes.jsx';
// Import context
import { AuthContextProvider } from "./context/AuthContext.jsx";

import './styles/index.css'

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  </React.StrictMode>,
);