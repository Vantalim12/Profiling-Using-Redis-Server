import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NotFound = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Row>
        <Col className="text-center">
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-5">
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </p>
          <Button
            as={Link}
            to={isAuthenticated ? "/dashboard" : "/login"}
            variant="primary"
            size="lg"
          >
            {isAuthenticated ? "Back to Dashboard" : "Back to Login"}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
