import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Alert } from "react-bootstrap";
import useSession from './Hooks/useSession.js'

const UserLoginPage = () => {
  const [emailAdress, setEmailAdress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { saveSession } = useSession();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/user/login", {
        emailAdress,
        password,
      });
  
      if (response.data.user) {
        // Save user details in sessionStorage
        saveSession(response.data.user);
        sessionStorage.setItem("userId", response.data.user.userId);
        sessionStorage.setItem("userType", response.data.user.userType);
        sessionStorage.setItem("fullName", response.data.user.fullName);
  
        // Navigate based on user type
        if (response.data.user.userType === "seller") {
          navigate("/addProduct");
        } else {
          navigate("/");
        }
        window.location.reload(); // Refresh the page
      } else {
        setErrorMessage("Invalid email or password");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: "85vh" }}>
  <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%", borderRadius: "12px" }}>
    <h2 className="text-center text-primary mb-4" style={{ color: "#3f51b5" }}>Welcome Back</h2>
    <p className="text-center text-secondary" style={{ fontSize: "1rem" }}>Log in to access your account</p>

    {errorMessage && (
      <Alert variant="danger" className="text-center">{errorMessage}</Alert>
    )}

    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label htmlFor="emailAdress" className="form-label" style={{ color: "#3f51b5" }}>
          Email Address
        </label>
        <input
          type="email"
          id="emailAdress"
          className="form-control"
          placeholder="Enter your email"
          value={emailAdress}
          onChange={(e) => setEmailAdress(e.target.value)}
          required
          style={{ borderRadius: "8px" }}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label" style={{ color: "#3f51b5" }}>
          Password
        </label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ borderRadius: "8px" }}
          />
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              borderTopRightRadius: "8px",
              borderBottomRightRadius: "8px",
              backgroundColor: "#3f51b5",
              color: "#fff"
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-100 py-2" style={{ backgroundColor: "#3f51b5", border: "none", borderRadius: "8px", transition: "all 0.3s ease" }}>
        Log In
      </Button>
    </form>

    <p className="text-center mt-3" style={{ fontSize: "1rem" }}>
      Don’t have an account?{" "}
      <a href="/registerUserPage" className="text-primary" style={{ fontWeight: "bold" }}>
        Register here
      </a>
    </p>
  </div>
</div>

  );
};

export default UserLoginPage;
