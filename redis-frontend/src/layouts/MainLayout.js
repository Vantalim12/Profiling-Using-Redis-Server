// src/layouts/MainLayout.js - Updated with admin management links
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Navbar,
  Nav,
  Button,
  Offcanvas,
} from "react-bootstrap";
import {
  FaChartBar,
  FaUsers,
  FaHome,
  FaUserFriends,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaIdCard,
  FaFileAlt,
  FaBullhorn,
  FaCalendarAlt,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeSidebar = () => setShowSidebar(false);

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Render different navigation items based on user role
  const renderNavItems = () => {
    // Admin navigation
    if (currentUser?.role === "admin") {
      return (
        <>
          <Nav.Link
            as={Link}
            to="/dashboard"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard") && !isActive("/dashboard/")
                ? "bg-primary"
                : ""
            }`}
            onClick={closeSidebar}
          >
            <FaChartBar className="me-3" /> Dashboard
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/dashboard/family-heads"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard/family-heads") ? "bg-primary" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaUserFriends className="me-3" /> Family Heads
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/dashboard/residents"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard/residents") ? "bg-primary" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaUsers className="me-3" /> Residents
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/dashboard/documents"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard/documents") ? "bg-primary" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaFileAlt className="me-3" /> Document Requests
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/dashboard/announcements"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard/announcements") ? "bg-primary" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaBullhorn className="me-3" /> Announcements
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/dashboard/events-management"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard/events-management") ? "bg-primary" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaCalendarAlt className="me-3" /> Events
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/dashboard/certificates"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard/certificates") ? "bg-primary" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaFileAlt className="me-3" /> Certificates
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/dashboard/profile"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard/profile") ? "bg-primary" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaUser className="me-3" /> Account Settings
          </Nav.Link>
        </>
      );
    }
    // Resident navigation
    else if (currentUser?.role === "resident") {
      return (
        <>
          <Nav.Link
            as={Link}
            to="/dashboard"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard") && !isActive("/dashboard/")
                ? "bg-primary"
                : ""
            }`}
            onClick={closeSidebar}
          >
            <FaHome className="me-3" /> Dashboard
          </Nav.Link>
          <Nav.Link
            as={Link}
            to={`/dashboard/residents/view/${currentUser.residentId}`}
            className={`d-flex align-items-center py-3 px-3 ${
              isActive(`/dashboard/residents/view/${currentUser.residentId}`)
                ? "bg-primary"
                : ""
            }`}
            onClick={closeSidebar}
          >
            <FaIdCard className="me-3" /> My Profile
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/dashboard/certificates"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard/certificates") ? "bg-primary" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaFileAlt className="me-3" /> Certificates
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/dashboard/announcements"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard/announcements") ? "bg-primary" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaBullhorn className="me-3" /> Announcements
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/dashboard/events"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard/events") ? "bg-primary" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaCalendarAlt className="me-3" /> Events
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/dashboard/profile"
            className={`d-flex align-items-center py-3 px-3 ${
              isActive("/dashboard/profile") ? "bg-primary" : ""
            }`}
            onClick={closeSidebar}
          >
            <FaUser className="me-3" /> Account Settings
          </Nav.Link>
        </>
      );
    }

    // Default navigation for any other roles
    return (
      <>
        <Nav.Link
          as={Link}
          to="/dashboard"
          className={`d-flex align-items-center py-3 px-3 ${
            isActive("/dashboard") ? "bg-primary" : ""
          }`}
          onClick={closeSidebar}
        >
          <FaHome className="me-3" /> Dashboard
        </Nav.Link>
        <Nav.Link
          as={Link}
          to="/dashboard/profile"
          className={`d-flex align-items-center py-3 px-3 ${
            isActive("/dashboard/profile") ? "bg-primary" : ""
          }`}
          onClick={closeSidebar}
        >
          <FaUser className="me-3" /> Profile
        </Nav.Link>
      </>
    );
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Top Navbar */}
      <Navbar bg="primary" variant="dark" expand="lg" className="px-3">
        <Button
          variant="primary"
          className="d-lg-none me-2"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          <FaBars />
        </Button>
        <Navbar.Brand as={Link} to="/dashboard">
          Barangay Management System
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Item className="d-flex align-items-center text-white me-3">
              <FaUser className="me-2" /> {currentUser?.name || "User"}
              {currentUser?.role && (
                <span className="ms-2 badge bg-light text-dark">
                  {currentUser.role}
                </span>
              )}
            </Nav.Item>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>
              <FaSignOutAlt className="me-2" /> Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container fluid className="flex-grow-1 px-0">
        <Row className="g-0 h-100">
          {/* Sidebar - Desktop */}
          <Col lg={3} xl={2} className="bg-dark text-white d-none d-lg-block">
            <Nav className="flex-column py-3">{renderNavItems()}</Nav>
          </Col>

          {/* Sidebar - Mobile */}
          <Offcanvas
            show={showSidebar}
            onHide={closeSidebar}
            responsive="lg"
            className="bg-dark text-white"
            style={{ width: "250px" }}
          >
            <Offcanvas.Header closeButton closeVariant="white">
              <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="p-0">
              <Nav className="flex-column">{renderNavItems()}</Nav>
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Content */}
          <Col lg={9} xl={10} className="px-4 py-4">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainLayout;
