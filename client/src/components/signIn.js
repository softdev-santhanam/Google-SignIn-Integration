import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // console.log(error);

  const googleLogins = async (e) => {
    try {
      const backendResponse = await fetch(
        "http://localhost:7000/google-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sendToken: e }),
        }
      );
      if (backendResponse.ok) {
        console.log("Successful login with Google");
        navigate("/home");
      } else {
        const error = await backendResponse.json();
        setError(error.message);
      }
    } catch (error) {
      setError("Internal server error");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetch("http://localhost:7000/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (response.ok) {
          // Login successful
          console.log(response.message);
          // do something with the successful login response
          navigate("/home");
        } else {
          // Login failed
          response.json().then((data) => {
            setError(data.error);
          });
        }
      })
      .catch((error) => {
        setError("Internal server error");
      });
  };

  return (
    <div className="d-flex align-items-center justify-content-center m-5">
      <div className="text-center align-self-center m-5">
        <h2>Login</h2>
        <form>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary mr-2 mt-3"
            onClick={handleLogin}
          >
            Login
          </button>
          <div className="mt-3">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                /* console.log(credentialResponse.credential); */
                googleLogins(credentialResponse.credential);
              }}
              onError={() => {
                console.log("Login Failed");
              }}
            />
          </div>
        </form>
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    </div>
  );
};

export default Login;
