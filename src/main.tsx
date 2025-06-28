import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { ThemeProvider } from "@aws-amplify/ui-react";
import { BrowserRouter, Route, Routes } from "react-router";
import Word from "./Word";

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Authenticator hideSignUp>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/word/:id" element={<Word />} />
          </Routes>
        </BrowserRouter>
      </Authenticator>
    </ThemeProvider>
  </React.StrictMode>
);
