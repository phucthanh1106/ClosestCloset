import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import radix
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
// Import react router
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
// Import routes
import routes from './routes/routes.jsx';

import './styles/index.css'

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);