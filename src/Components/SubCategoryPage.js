// SubCategoryPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const SubCategoryPage = ({ addToCart }) => {
  const { subcategoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [priceRange, setPriceRange] = useState([0, 10000]);

  useEffect(() => {
    if (!subcategoryName) {
      setError("Subcategory not found");
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/product/subcategory/${subcategoryName}`
        );

        if (response.status === 200 && Array.isArray(response.data.products)) {
          setProducts(response.data.products);
          setFilteredProducts(response.data.products);

          const uniqueBrands = [
            ...new Set(response.data.products.map((product) => product.brandName)),
          ];
          setBrands(uniqueBrands);
        } else {
          setError("No products data found");
        }
      } catch (err) {
        setError("Error fetching products.");
        console.error("Error:", err);
      }
    };

    fetchProducts();
  }, [subcategoryName]);

  useEffect(() => {
    let filtered = [...products];

    if (selectedBrand) {
      filtered = filtered.filter((product) => product.brandName === selectedBrand);
    }

    filtered = filtered.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(filtered);
  }, [selectedBrand, priceRange, products]);

  const handleAddToCart = (product) => {
    if (addToCart) {
      addToCart(product);
    } else {
      console.log("Add to Cart functionality not provided.");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Products in {subcategoryName}</h1>

      <div className="row">
        {/* Filters Section */}
        <div className="col-md-3">
          <div className="card p-3">
            {error && <p className="text-danger">{error}</p>}
            <h4>Filters</h4>

            {/* Brand Filter */}
            <div className="mb-3">
              <label className="form-label">Filter by Brand</label>
              <select
                className="form-select"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div className="mb-3">
              <label className="form-label">Price Range</label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="100000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, +e.target.value])}
              />
              <div className="d-flex justify-content-between">
                <span>₹{priceRange[0]}</span>
                <span>₹{priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="col-md-9">
  {filteredProducts.length > 0 ? (
    <div className="row">
      {filteredProducts.map((product) => (
        <div className="col-md-4 mb-4" key={product.productId}>
          <div className="card h-100 d-flex flex-column">
            <img
              src={`http://localhost:5000/${product.productImage}`}
              className="card-img-top object-fit-cover"
              alt={product.productName}
              style={{ height: "200px" }} // Consistent height for all images
            />
            <div className="card-body d-flex flex-column">
              <h5 className="card-title">{product.productName}</h5>
              <p className="card-text text-truncate">{product.description}</p>
              <div className="mt-auto">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold">₹{product.price}</span>
                  <span
                    className={`badge ${
                      product.quantity <= 5
                        ? "bg-danger"
                        : product.quantity <= 15
                        ? "bg-warning text-dark"
                        : "bg-success"
                    }`}
                  >
                    {product.quantity === 0
                      ? "Not Available"
                      : `In stock: ${product.quantity}`}
                  </span>
                </div>
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.quantity === 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p>No products found for the selected filters.</p>
  )}
</div>

      </div>
    </div>
  );
};

export default SubCategoryPage;
