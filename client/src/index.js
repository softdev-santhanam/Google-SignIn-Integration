import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));
// 1096363636723-jkjkqb0kudhr2ovvghmto1qk8e2ekeaa.apps.googleusercontent.com
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="1096363636723-jkjkqb0kudhr2ovvghmto1qk8e2ekeaa.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
