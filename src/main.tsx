import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import React from "react";
import ReactDOM from "react-dom/client";
import outputs from "../amplify_outputs.json";
import App from "./App";
import "@aws-amplify/ui-react/styles.css";
import { ThemeProvider } from "@aws-amplify/ui-react";
import { BrowserRouter, Route, Routes } from "react-router";
import Word from "./Word";

Amplify.configure(outputs);

// biome-ignore lint/style/noNonNullAssertion: non null
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
  </React.StrictMode>,
);
