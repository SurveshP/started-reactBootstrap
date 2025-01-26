// App.js
import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import UserRegisterPage from "./Components/User/userRegisterPage.js";
import UserLoginPage from "./Components/User/userLoginPage.js";
import MenuStatus from "./Components/menuStatus.js";
import AppNavbar from "./Components/appNavbar.js";
import ProductDetails from "./Components/ProductDetails.js";
import SubCategoryPage from "./Components/SubCategoryPage.js";
import AddProductPage from "./Components/User/Product/AddProductPage.js";
import ProductList from "./Components/User/Product/ProductList.js";
import AddCategoryPage from "./Components/User/Product/Category/AddCategoryPage.js";
import AddSubCategoryPage from "./Components/User/Product/Category/AddSubCategoryPage.js";
import AddBrandPage from "./Components/User/Product/Brand/AddBrandPage.js";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div>
      <AppNavbar onSearch={handleSearch} />
      <MenuStatus />
      <Routes>
      <Route path="/" element={<ProductDetails />} searchQuery={searchQuery} />
        <Route path="/registerUserPage" element={<UserRegisterPage />} />
        <Route path="/loginUserPage" element={<UserLoginPage />} />
        <Route path="/subcategory/:subcategoryName" element={<SubCategoryPage />} />
        <Route path="/addProduct" element={<AddProductPage />} />
        <Route path="/productList" element={<ProductList />} />
        <Route path="/add-category" element={<AddCategoryPage />} />
        <Route path="/add-sub-category" element={<AddSubCategoryPage />} />
        <Route path="/add-brand" element={<AddBrandPage />} /> 
      </Routes>
    </div>
  );
}

export default App;
