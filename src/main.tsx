import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Admin from "./Admin.tsx";
import App from "./App.tsx";
import Gift from "./gift.tsx";
import "./index.css";
import Reset from "./reset.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/gift" element={<Gift />} />
      <Route path="/reset" element={<Reset />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  </BrowserRouter>
);
