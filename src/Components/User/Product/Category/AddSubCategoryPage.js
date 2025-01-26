import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Alert, Form, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from 'react-router-dom';

const AddSubCategoryPage = () => {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [subCategoryName, setSubCategoryName] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [subCategoryId, setSubCategoryId] = useState(null);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Fetch data
    const fetchData = async (url, setter) => {
        try {
            const response = await axios.get(url);
            setter(response.data);
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    useEffect(() => {
        fetchData("http://localhost:5000/category", (data) => setCategories(data.categories));
        fetchData("http://localhost:5000/subCategory", (data) => setSubCategories(data.subCategories));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subCategoryName || !selectedCategoryId) {
            setMessage("Please fill out all fields!");
            return;
        }

        const subCategoryData = { subCategoryName, categoryId: selectedCategoryId };

        try {
            if (isEdit) {
                await axios.put(`http://localhost:5000/subCategory/${subCategoryId}`, subCategoryData);
                setMessage("Sub-Category updated successfully!");
            } else {
                await axios.post("http://localhost:5000/subCategory", subCategoryData);
                setMessage("Sub-Category added successfully!");
            }
            resetForm();
            fetchData("http://localhost:5000/subCategory", (data) => setSubCategories(data.subCategories));
        } catch (error) {
            setMessage("Error saving sub-category");
            console.error("Error saving sub-category:", error);
        }
    };

    const handleEdit = (subCategory) => {
        setSubCategoryName(subCategory.subCategoryName);
        setSelectedCategoryId(subCategory.categoryId);
        setSubCategoryId(subCategory.subCategoryId);
        setIsEdit(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this Sub-Category?")) {
            return;
        }

        try {
            await axios.delete(`http://localhost:5000/subCategory/${id}`);
            setMessage("Sub-Category deleted successfully!");
            fetchData("http://localhost:5000/subCategory", (data) => setSubCategories(data.subCategories));
        } catch (error) {
            setMessage("Failed to delete sub-category.");
            console.error("Error deleting sub-category:", error);
        }
    };

    const resetForm = () => {
        setSubCategoryName("");
        setSelectedCategoryId("");
        setIsEdit(false);
        setSubCategoryId(null);
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4" style={{ color: "#3f51b5" }}>
                {isEdit ? "Edit Sub-Category" : "Add Sub-Category"}
            </h2>

            {message && <Alert variant="info" className="text-center">{message}</Alert>}

            <Form onSubmit={handleSubmit} className="p-4 border rounded shadow-sm bg-light">
                <Form.Group controlId="category" className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                        as="select"
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category.categoryId} value={category.categoryId}>
                                {category.categoryName}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>

                <Form.Group controlId="subCategoryName" className="mb-3">
                    <Form.Label>Sub-Category Name</Form.Label>
                    <Form.Control
                        type="text"
                        value={subCategoryName}
                        onChange={(e) => setSubCategoryName(e.target.value)}
                        placeholder="Enter sub-category name"
                        required
                    />
                </Form.Group>

                <div className="d-flex justify-content-between">
                    <Button type="submit" className="btn btn-primary w-100">
                        {isEdit ? 'Update Sub Category' : 'Add Sub Category'}
                    </Button>
                    <Button type="button" onClick={() => navigate('/addProduct')} className="btn btn-secondary w-100 ms-2">
                        Back
                    </Button>
                </div>
            </Form>

            <h3 className="mt-5 text-center" style={{ color: "#3f51b5" }}>
                Sub-Category List
            </h3>
            <table className="table table-bordered mt-3">
                <thead>
                    <tr>
                        <th>SNo.</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {subCategories.map((subCategory, index) => (
                        <tr key={subCategory.subCategoryId}>
                            <td>{index + 1}</td>
                            <td>{subCategory.subCategoryName}</td>
                            <td>{categories.find(cat => cat.categoryId === subCategory.categoryId)?.categoryName}</td>
                            <td>
                                <Button
                                    variant="info"
                                    className=" me-2"
                                    onClick={() => handleEdit(subCategory)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleDelete(subCategory.subCategoryId)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AddSubCategoryPage;
