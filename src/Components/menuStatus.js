import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useNavigate } from "react-router-dom";

const MenuStatus = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryResponse = await axios.get('http://localhost:5000/category');
        const subCategoryResponse = await axios.get('http://localhost:5000/subcategory');

        if (categoryResponse.status === 200 && subCategoryResponse.status === 200) {
          const formattedCategories = categoryResponse.data.categories.map((category) => ({
            categoryId: category.categoryId,
            name: category.categoryName,
            categoryImage: `${category.categoryImage}`,
          }));

          const subCategoryMap = subCategoryResponse.data.subCategories.reduce((acc, sub) => {
            acc[sub.categoryId] = acc[sub.categoryId] || [];
            acc[sub.categoryId].push(sub);
            return acc;
          }, {});

          setCategories(formattedCategories);
          setSubCategories(subCategoryMap);
        } else {
          setError('Error fetching categories or subcategories.');
        }
      } catch (err) {
        setError('Error fetching data.');
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search term:', searchTerm);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light" style={{ background: 'linear-gradient(to right, #f8f9fa, #e9ecef)' }}>
      <div className="container-fluid">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-center" id="navbarNavDropdown">
          <ul className="navbar-nav">
            {/* Dynamically Render Categories with Subcategories */}
            {categories.map((category) => (
              <li
                key={category.categoryId}
                className="nav-item dropdown"
                style={{
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  const dropdownMenu = e.currentTarget.querySelector('.dropdown-menu');
                  if (dropdownMenu) dropdownMenu.style.display = 'block';
                }}
                onMouseLeave={(e) => {
                  const dropdownMenu = e.currentTarget.querySelector('.dropdown-menu');
                  if (dropdownMenu) dropdownMenu.style.display = 'none';
                }}
              >
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  id={`navbarDropdown${category.categoryId}`}
                  role="button"
                  aria-expanded="false"
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={category.categoryImage || '/path/to/default-image.jpg'}
                    alt={category.name}
                    className="rounded-circle me-2"
                    style={{ width: '30px', height: '30px' }}
                  />
                  {category.name}
                </a>
                <ul
                  className="dropdown-menu"
                  aria-labelledby={`navbarDropdown${category.categoryId}`}
                  style={{
                    display: 'none',
                    position: 'absolute',
                    left: 0,
                    top: '100%',
                    marginTop: '0',
                    backgroundColor: '#fff',
                    borderRadius: '5px',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {subCategories[category.categoryId]?.map((subCategory) => (
                    <li key={subCategory.subCategoryId}>
                      <a
                        className="dropdown-item"
                        onClick={() => navigate(`/subcategory/${subCategory.subCategoryName}`)}
                        style={{
                          whiteSpace: 'nowrap',
                          transition: 'background-color 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#343a40'; // Dark background
                          e.currentTarget.style.color = '#fff'; // White text
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff'; // Default background
                          e.currentTarget.style.color = '#000'; // Black text
                        }}
                      >
                        {subCategory.subCategoryName}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default MenuStatus;
