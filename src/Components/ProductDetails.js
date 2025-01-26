// ProductDetails.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const ProductDetails = ({ searchQuery }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const endpoint = searchQuery
          ? `http://localhost:5000/product/products/search/product?query=${searchQuery}`
          : "http://localhost:5000/product";

        const response = await axios.get(endpoint);
        setProducts(response.data.products || []);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mt-5">
      <div className="row">
        {products.length ? (
          products.map((prod) => (
            <div className="col-md-3 mb-4" key={prod.productId}>
              <div className="card h-100 shadow-lg rounded-3 border-0" style={{ background: "#f8f9fa" }}>
                <img
                  src={prod.productImage} // Use actual image URL
                  className="card-img-top object-cover h-48 w-full rounded-top"
                  alt={prod.productName}
                />
                <div className="card-body d-flex flex-column h-full">
                  <h5 className="card-title text-dark">{prod.productName}</h5>
                  <p className="card-text">{prod.description}</p>
                  <p className="card-text text-success">${prod.price}</p>
                  <div className="mt-auto">
                    <button className="btn btn-outline-primary w-100 mb-2">Add to Cart</button>
                    <button className="btn btn-outline-warning w-100">Buy Now</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div>No products found.</div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
