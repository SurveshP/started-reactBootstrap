import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, Alert, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

const AddCategoryPage = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isEdit, setIsEdit] = useState(false); // Track if editing
  const [categoryId, setCategoryId] = useState(null); // Store current categoryId for editing
  const [searchQuery, setSearchQuery] = useState(''); // Search input
  const [filteredCategories, setFilteredCategories] = useState([]); // Filtered categories
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryImage(file); // Store file for upload
        setPreviewImage(reader.result); // Store image URL for preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName || !categoryImage) {
      alert('Please fill out all fields!');
      return;
    }

    const formData = new FormData();
    formData.append('categoryName', categoryName);
    formData.append('categoryImage', categoryImage); // Append image file

    try {
      const url = isEdit ? `http://localhost:5000/category/${categoryId}` : 'http://localhost:5000/category';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await axios({
        method,
        url,
        data: formData, // Send the FormData object
      });

      alert(isEdit ? 'Category updated successfully!' : 'Category added successfully!');
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert('Operation failed. Please try again.');
    }
  };

  const resetForm = () => {
    setCategoryName('');
    setCategoryImage(null);
    setPreviewImage(null);
    setIsEdit(false);
    setCategoryId(null);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/category');
      setCategories(response.data.categories);
      setFilteredCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEdit = async (categoryId) => {
    try {
      const response = await axios.get(`http://localhost:5000/category/${categoryId}`);
      setCategoryName(response.data.category.categoryName);
      setPreviewImage(response.data.category.categoryImage);
      setCategoryId(categoryId);
      setIsEdit(true);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const handleDelete = async (categoryId) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this category?');

    if (!isConfirmed) {
      return; // Do nothing if the user cancels
    }

    try {
      await axios.delete(`http://localhost:5000/category/${categoryId}`);
      alert('Category deleted successfully!');
      fetchCategories(); // Refresh category list after deletion
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category.');
    }
  };

  const handleSearch = () => {
    const filtered = categories.filter((category) =>
      category.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">{isEdit ? 'Edit Category' : 'Add New Category'}</h2>
      <Form onSubmit={handleSubmit} encType="multipart/form-data" className="p-4 border rounded shadow-sm bg-light">
        <Form.Group className="mb-3">
          <Form.Label>Category Name</Form.Label>
          <Form.Control
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {previewImage && (
            <div className="mt-3">
              <img src={previewImage} alt="Category Preview" className="w-32 h-32 object-cover rounded-md border" />
            </div>
          )}
        </Form.Group>

        <div className="d-flex justify-content-between">
          <Button type="submit" className="btn btn-primary w-100">
            {isEdit ? 'Update Category' : 'Add Category'}
          </Button>
          <Button type="button" onClick={() => navigate('/addProduct')} className="btn btn-secondary w-100 ms-2">
            Back
          </Button>
        </div>
      </Form>

      <div className="mt-5">
        <h3 className="mb-3">Category List</h3>
        <div className="d-flex mb-3">
          <Form.Control
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category..."
            className="me-2"
          />
          <Button onClick={handleSearch} variant="secondary">Search</Button>
        </div>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Category ID</th>
              <th>Category Name</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories
              .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
              .map((category, index) => (
                <tr key={category.categoryId}>
                  <td>{index + 1}</td>
                  <td>{category.categoryId}</td>
                  <td>{category.categoryName}</td>
                  <td>
                    <img src={category.categoryImage} alt={category.categoryName} className="w-16 h-16 object-cover rounded-md" />
                  </td>
                  <td>
                    <Button onClick={() => handleEdit(category.categoryId)} variant="info" className="me-2">Edit</Button>
                    <Button onClick={() => handleDelete(category.categoryId)} variant="danger">Delete</Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default AddCategoryPage;
