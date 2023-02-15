import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  console.log(error);

  const googleLogin = useGoogleLogin({
    onSuccess: async () => {
      try {
        const backendResponse = await fetch(
          "http://localhost:7000/auth/google",
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await backendResponse.json();
        console.log(data);
        navigate("/");
      } catch (error) {
        console.error(error);
        setError("Failed to log in with Google");
      }
    },
    onFailure: (error) => {
      console.error(error);
      setError("Failed to log in with Google");
    },
    clientId:
      "1096363636723-jkjkqb0kudhr2ovvghmto1qk8e2ekeaa.apps.googleusercontent.com",
    scope:
      "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
  });

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const backendResponse = await fetch("http://localhost:7000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      const data = await backendResponse.json();
      console.log(data);
      navigate("/");
    } catch (error) {
      console.error(error);
      setError("Failed to log in with the provided credentials");
    }
  };
  return (
    <div className="d-flex align-items-center justify-content-center m-5">
      <div className="text-center align-self-center m-5">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
          </div>
          <button type="submit" className="btn btn-primary mr-2 mt-3">
            Login
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              googleLogin();
            }}
            className="btn btn-secondary ms-2 mt-3"
          >
            Sign in with Google
          </button>
          <div className="mt-3"></div>
        </form>
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    </div>
  );
};

export default Login;
