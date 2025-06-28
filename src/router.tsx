import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App";
import Layout from "./Layout";
import Word from "./Word";

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="/word/:id" element={<Word />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
