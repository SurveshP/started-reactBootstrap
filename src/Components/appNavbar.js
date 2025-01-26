import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Form, FormControl, Button, NavDropdown, } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const AppNavbar = ({ onSearch }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userType, setUserType] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [fullName, setFullName] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    // Check sessionStorage for login state and user details
    const userId = sessionStorage.getItem("userId");
    const storedUserType = sessionStorage.getItem("userType");
    const storedProfileImage = sessionStorage.getItem("profileImage"); // Assuming you store the image URL
    const storedFullName = sessionStorage.getItem("fullName");

    if (userId && storedUserType) {
      setLoggedIn(true);
      setUserType(storedUserType);
      setProfileImage(storedProfileImage || "default-profile.png"); // Fallback to default image
      setFullName(storedFullName || "User");
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchInput); // Pass the input to the parent component
  };

  const handleLogout = () => {
    sessionStorage.clear(); // Clear session storage
    setLoggedIn(false);
    setUserType("");
    setProfileImage("");
    setFullName("");
  };

  return (
    <Navbar
      style={{ background: "linear-gradient(to right, #f8f9fa, #e9ecef)" }}
      variant="light"
      expand="lg"
      className="shadow-sm"
    >
      <Container>
        <Navbar.Brand href="/">MyStore</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarNav" />
        <Navbar.Collapse id="navbarNav" className="d-flex align-items-center">
          {/* Search Bar */}
          <Form className="d-flex flex-grow-1 me-3" onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Search"
              className="me-2"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search"
            />
            <Button variant="outline-dark" type="submit">
              Search
            </Button>
          </Form>

          <Nav>
            {!loggedIn ? (
              <>
                <Nav.Link href="/registerUserPage">Sign Up</Nav.Link>
                <Nav.Link href="/loginUserPage">Login</Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link href="/cart">Cart</Nav.Link>

                {/* My Profile Dropdown */}
                <NavDropdown title="My Profile" id="basic-nav-dropdown">
                  {/* Profile Header */}
                  <div className="text-center p-3">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="rounded-circle mb-2"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <h6 className="mb-0">Welcome {fullName}</h6>
                  </div>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="/edit-profile">Edit Profile</NavDropdown.Item>
                  {userType === "seller" ? (
                    <NavDropdown.Item href="/addProduct">Add Product</NavDropdown.Item>
                  ) : (
                    <NavDropdown.Item href="/orders">Orders</NavDropdown.Item>
                  )}
                  <NavDropdown.Item href="/notifications">Notifications</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
