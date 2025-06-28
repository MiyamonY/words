import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import React from "react";
import ReactDOM from "react-dom/client";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { ThemeProvider } from "@aws-amplify/ui-react";
import { Router } from "./router";

Amplify.configure(outputs);

// biome-ignore lint/style/noNonNullAssertion: non null
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Authenticator hideSignUp>
        <Router />
      </Authenticator>
    </ThemeProvider>
  </React.StrictMode>,
);
