import React, { useState } from "react";
import axios from "axios";
import { Button, Alert } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const UserRegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    emailAdress: "",
    contactNumber: "",
    password: "",
    address: "",
    userType: "user", // default type
    profileImage: null,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      const response = await axios.post("http://localhost:5000/user", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage(response.data.message || "User registered successfully!");

      // Reset the form after successful submission
      setFormData({
        fullName: "",
        emailAdress: "",
        contactNumber: "",
        password: "",
        address: "",
        userType: "user",
        profileImage: null,
      });
    } catch (error) {
      setMessage(
        error.response?.data?.message || "An error occurred while registering."
      );
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4" style={{ color: "#3f51b5" }}>User Registration</h2>
      {message && <Alert variant="info" className="text-center">{message}</Alert>}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-4 border rounded shadow-sm bg-light">
        <div className="row mb-3">
          <div className="col-12 col-md-6">
            <label htmlFor="fullName" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              className="form-control"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="emailAdress" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              className="form-control"
              id="emailAdress"
              name="emailAdress"
              value={formData.emailAdress}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-12 col-md-6">
            <label htmlFor="contactNumber" className="form-label">
              Contact Number
            </label>
            <input
              type="tel"
              className="form-control"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="address" className="form-label">
            Address
          </label>
          <textarea
            className="form-control"
            id="address"
            name="address"
            rows="3"
            value={formData.address}
            onChange={handleChange}
            required
          ></textarea>
        </div>
        <div className="mb-3">
          <label htmlFor="profileImage" className="form-label">
            Profile Image
          </label>
          <input
            type="file"
            className="form-control"
            id="profileImage"
            name="profileImage"
            onChange={handleChange}
            accept="image/*"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="userType" className="form-label">
            User Type
          </label>
          <select
            className="form-select"
            id="userType"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            required
          >
            <option value="seller">User</option>
            <option value="customer">Admin</option>
          </select>
        </div>
        <Button
          type="submit"
          className="w-100 btn btn-primary py-2 px-4 shadow-sm"
          style={{
            backgroundColor: "#3f51b5",
            border: "none",
            transition: "all 0.3s ease",
          }}
        >
          Register
        </Button>
      </form>
    </div>
  );
};

export default UserRegisterPage;
