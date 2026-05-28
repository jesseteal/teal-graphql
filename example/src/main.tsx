import React from "react";
import { createRoot } from "react-dom/client";
import { GraphqlProvider } from "@jesseteal/teal-graphql";
import { App } from "./App.js";
import { graphqlConfig } from "./shared.js";
import "./styles.css";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <GraphqlProvider config={graphqlConfig}>
      <App />
    </GraphqlProvider>
  </React.StrictMode>,
);
