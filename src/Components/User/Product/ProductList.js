import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      console.error('UserId not found in sessionStorage');
      setIsAuthenticated(false); // Set authentication status
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/product/products/${userId}`);
      if (response.data && response.data.products) {
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      } else {
        console.error('No products found');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // Empty dependency array ensures it runs only on mount

  const handleSearch = async () => {
    const userId = sessionStorage.getItem('userId'); // Extract userId here
    if (!userId) {
      console.error('UserId not found in sessionStorage');
      setIsAuthenticated(false);
      return;
    }

    try {
        if (!searchTerm.trim()) {
            setFilteredProducts(products); // Reset to all products if search term is empty
            return;
        }
        const response = await axios.get(`http://localhost:5000/product/products/search/user/${userId}?query=${searchTerm}`);
        if (response.data && response.data.products) {
            setFilteredProducts(response.data.products);
        } else {
            console.error('No products matched your search.');
            alert('No products matched your search.');
        }
    } catch (error) {
        console.error('Error searching products:', error);
        alert('Error searching products. Please try again.');
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/product/${productId}`);
        alert('Product deleted successfully!');
        fetchProducts(); // Re-fetch products after deletion
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleEdit = (product, index) => {
    navigate('/addProduct', {
      state: { product, index },
    });
  };

  if (!isAuthenticated) {
    return <div>User not authenticated</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Product List</h2>

      {/* Search Bar */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Name, Brand, or Product ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Products Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>SNo</th>
            <th>Product ID</th>
            <th>Name</th>
            <th>Image</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product, index) => {
            const rowClass =
              product.quantity <= 5
                ? 'table-danger'
                : product.quantity <= 15
                ? 'table-warning'
                : '';

            return (
              <tr key={product._id || index} className={rowClass}>
                <td>{index + 1}</td>
                <td>{product.productId}</td>
                <td>{product.productName}</td>
                <td>
                  <img
                    src={product.productImage}
                    alt={product.productName}
                    className="img-thumbnail"
                    style={{ width: '80px', height: '80px' }}
                  />
                </td>
                <td>{product.brandName}</td>
                <td>₹{product.price}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => handleEdit(product, index)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(product.productId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        className="btn btn-secondary mt-3"
        onClick={() => navigate('/addProduct')}
      >
        Back
      </button>
    </div>
  );
};

export default ProductList;
