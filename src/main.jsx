import React from "react";
import { createRoot } from "react-dom/client";
import { installStorageShim } from "./storage.js";
import Dartboard from "./Dartboard.jsx";
import "./index.css";

installStorageShim();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Dartboard />
  </React.StrictMode>
);
