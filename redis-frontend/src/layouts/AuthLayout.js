import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Container fluid className="h-100">
      <Row
        className="justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Col md={8} lg={6} xl={4}>
          <Card className="shadow-lg border-0 rounded-lg">
            <Card.Header className="text-center bg-primary text-white py-4">
              <h3 className="font-weight-light my-2">
                Barangay Management System
              </h3>
            </Card.Header>
            <Card.Body>
              <Outlet />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthLayout;
