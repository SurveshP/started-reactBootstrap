import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Form, Alert, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaPlus } from 'react-icons/fa';  // Importing Font Awesome Plus icon

const AddProductPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingProduct = location.state?.product || {};
  const editingIndex = location.state?.index ?? null;

  const [category, setCategory] = useState(editingProduct?.category || '');
  const [subCategory, setSubCategory] = useState(editingProduct?.subCategory || '');
  const [brand, setBrand] = useState(editingProduct?.brand || '');
  const [productName, setProductName] = useState(editingProduct.productName || '');
  const [price, setPrice] = useState(editingProduct.price || '');
  const [quantity, setQuantity] = useState(editingProduct.quantity || '');
  const [description, setDescription] = useState(editingProduct.description || '');
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(editingProduct.image || null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    categoryName: '',
    subCategoryName: '',
    brandName: '',
    productName: '',
    price: '',
    quantity: '',
    description: '',
    productImage: null,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, subCategoriesResponse, brandsResponse] = await Promise.all([
          axios.get('http://localhost:5000/category'),
          axios.get('http://localhost:5000/subCategory'),
          axios.get('http://localhost:5000/brand'),
        ]);
        setCategories(categoriesResponse.data.categories || []);
        setSubCategories(subCategoriesResponse.data.subCategories || []);
        setBrands(brandsResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage('Failed to fetch data. Please try again later.');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));

    if (name === 'productImage' && files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedCategory = categories.find((cat) => cat.categoryId === category)?.categoryName || '';
    const selectedSubCategory = subCategories.find((subCat) => subCat.subCategoryId === subCategory)?.subCategoryName || '';
    const selectedBrand = brands.find((b) => b.brandId === brand)?.brandName || '';

    const dataToSend = {
      categoryName: selectedCategory,
      subCategoryName: selectedSubCategory,
      brandName: selectedBrand,
      productName,
      price,
      quantity,
      description,
      userId: sessionStorage.getItem('userId')
    };

    const formDataToSend = new FormData();
    Object.keys(dataToSend).forEach((key) => {
      formDataToSend.append(key, dataToSend[key]);
    });

    if (image) {
      formDataToSend.append('productImage', image);
    }

    try {
      if (editingIndex !== null) {
        // Edit product
        const response = await axios.put(`http://localhost:5000/product/${editingProduct.productId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert(response.data.message || 'Product updated successfully!');
      } else {
        // Add new product
        const response = await axios.post('http://localhost:5000/product', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert(response.data.message || 'Product added successfully!');
      }
      
      // Clear the form fields after successful operation
      setCategory('');
      setSubCategory('');
      setBrand('');
      setProductName('');
      setPrice('');
      setQuantity('');
      setDescription('');
      setImage(null);
      setPreviewImage(null);
      
      window.location.reload(); // Ensure the page refreshes
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      alert('Error processing the request. Please try again.');
    }
  };


  return (
    <Container className="mt-5 p-4" style={{ backgroundColor: '#f9f9f9', borderRadius: '15px' }}>
      <h2 className="text-center mb-4" style={{ color: '#3f51b5' }}>
        {editingIndex !== null ? 'Edit Product' : 'Add New Product'}
      </h2>
      {message && <Alert variant="info">{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="categoryName">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label style={{ color: '#3f51b5' }}>Category</Form.Label>
                <button
                  type="button"
                  onClick={() => navigate('/add-category')} // Replace with your desired path for 'Add Category'
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3f51b5',
                    fontSize: '20px',
                    cursor: 'pointer',
                  }}
                >
                  <FaPlus />
                </button>
              </div>
              <Form.Control
                as="select"
                name="categoryName"
                value={formData.categoryName}
                onChange={handleChange}
                required
                style={{ borderColor: '#3f51b5', borderRadius: '8px' }}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

          </Col>
          <Col md={6}>
            <Form.Group controlId="subCategoryName">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label style={{ color: '#3f51b5' }}>Sub-Category</Form.Label>
                <button
                  type="button"
                  onClick={() => navigate('/add-sub-category')} // Replace with your desired path for 'Add Sub-Category'
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3f51b5',
                    fontSize: '20px',
                    cursor: 'pointer',
                  }}
                >
                  <FaPlus />
                </button>
              </div>
              <Form.Control
                as="select"
                name="subCategoryName"
                value={formData.subCategoryName}
                onChange={handleChange}
                required
                disabled={!formData.categoryName}
                style={{ borderColor: '#3f51b5', borderRadius: '8px' }}
              >
                <option value="">Select sub-category</option>
                {subCategories
                  .filter((subCat) => subCat.categoryId === formData.categoryName)
                  .map((subCat) => (
                    <option key={subCat.subCategoryId} value={subCat.subCategoryId}>
                      {subCat.subCategoryName}
                    </option>
                  ))}
              </Form.Control>
            </Form.Group>

          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="brandName">
              <div className="d-flex justify-content-between align-items-center">
                <Form.Label style={{ color: '#3f51b5' }}>Brand</Form.Label>
                <button
                  type="button"
                  onClick={() => navigate('/add-brand')} // Replace with your desired path for 'Add Brand'
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3f51b5',
                    fontSize: '20px',
                    cursor: 'pointer',
                  }}
                >
                  <FaPlus />
                </button>
              </div>
              <Form.Control
                as="select"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                required
                style={{ borderColor: '#3f51b5', borderRadius: '8px' }}
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.brandId} value={b.brandId}>
                    {b.brandName}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

          </Col>
          <Col md={6}>
            <Form.Group controlId="productName">
              <Form.Label style={{ color: '#3f51b5' }}>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                required
                style={{ borderColor: '#3f51b5', borderRadius: '8px' }}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="price">
              <Form.Label style={{ color: '#3f51b5' }}>Price</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                style={{ borderColor: '#3f51b5', borderRadius: '8px' }}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="quantity">
              <Form.Label style={{ color: '#3f51b5' }}>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                style={{ borderColor: '#3f51b5', borderRadius: '8px' }}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="description">
              <Form.Label style={{ color: '#3f51b5' }}>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                style={{ borderColor: '#3f51b5', borderRadius: '8px' }}
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <Form.Group controlId="productImage">
              <Form.Label style={{ color: '#3f51b5' }}>Product Image</Form.Label>
              <Form.Control
                type="file"
                name="productImage"
                onChange={handleChange}
                required
                style={{ borderColor: '#3f51b5', borderRadius: '8px' }}
              />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="mt-3"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
              )}
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-between">
          <Button type="submit" variant="primary" className="w-100" style={{ backgroundColor: '#3f51b5', borderRadius: '8px' }}>
            {editingIndex !== null ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </Form>

      <div className="d-flex justify-content-between mt-3">
        <Link to="/productList" className="btn btn-secondary" style={{ borderRadius: '8px' }}>Show Products</Link>
      </div>
    </Container>
  );
};

export default AddProductPage;
