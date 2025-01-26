import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Form, Alert, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from "react-router-dom";

const AddBrandPage = () => {
    const [brandName, setBrandName] = useState("");
    const [brands, setBrands] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [brandId, setBrandId] = useState(null);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!brandName) {
            alert("Please fill out the brand name!");
            return;
        }

        try {
            const newBrand = { brandName };
            if (isEdit) {
                await axios.put(`http://localhost:5000/brand/${brandId}`, newBrand);
                setMessage("Brand updated successfully!");
            } else {
                await axios.post("http://localhost:5000/brand", newBrand);
                setMessage("Brand added successfully!");
            }

            resetForm();
            fetchBrands();
        } catch (error) {
            console.error("Error:", error.response?.data || error.message);
            setMessage("Operation failed. Please try again.");
        }
    };

    const resetForm = () => {
        setBrandName("");
        setIsEdit(false);
        setBrandId(null);
    };

    const fetchBrands = async () => {
        try {
            const response = await axios.get("http://localhost:5000/brand");
            setBrands(response.data);
            setFilteredBrands(response.data);
        } catch (error) {
            console.error("Error fetching brands:", error);
        }
    };

    const handleEdit = async (brandId) => {
        try {
            const response = await axios.get(`http://localhost:5000/brand/${brandId}`);
            setBrandName(response.data.brandName);
            setBrandId(brandId);
            setIsEdit(true);
        } catch (error) {
            console.error("Error fetching brand:", error);
        }
    };

    const handleDelete = async (brandId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this brand?");
        if (!isConfirmed) return;

        try {
            await axios.delete(`http://localhost:5000/brand/${brandId}`);
            setMessage("Brand deleted successfully!");
            fetchBrands();
        } catch (error) {
            console.error("Error deleting brand:", error);
            setMessage("Failed to delete brand.");
        }
    };

    const handleSearch = () => {
        const filtered = brands.filter((brand) =>
            brand.brandName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredBrands(filtered);
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4" style={{ color: "#3f51b5" }}>
                {isEdit ? "Edit Brand" : "Add New Brand"}
            </h2>
            {message && <Alert variant="info" className="text-center">{message}</Alert>}
            <form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
                <div className="mb-3">
                    <label htmlFor="brandName" className="form-label">Brand Name</label>
                    <input
                        type="text"
                        id="brandName"
                        name="brandName"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="form-control"
                        placeholder="Enter brand name"
                        required
                    />
                </div>
                <div className="d-flex justify-content-between">
                    <Button type="submit" className="btn btn-primary w-100">
                        {isEdit ? 'Update Brand' : 'Add Brand'}
                    </Button>
                    <Button type="button" onClick={() => navigate('/addProduct')} className="btn btn-secondary w-100 ms-2">
                        Back
                    </Button>
                </div>
            </form>

            <div className="mt-4">
                <div className="d-flex mb-3">
                    <Form.Control
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search category..."
                        className="me-2"
                    />
                    <Button onClick={handleSearch} variant="secondary">Search</Button>
                </div>

                <h3 className="text-center mb-4">Brand List</h3>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Brand Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBrands.sort((a, b) => a.brandName.localeCompare(b.brandName)).map((brand, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{brand.brandName}</td>
                                <td>
                                    <Button onClick={() => handleEdit(brand.brandId)} className="btn btn-info me-2">Edit</Button>
                                    <Button onClick={() => handleDelete(brand.brandId)} className="btn btn-danger">Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AddBrandPage;
