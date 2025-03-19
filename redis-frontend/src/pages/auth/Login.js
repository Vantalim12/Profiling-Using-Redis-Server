// src/pages/auth/Login.js
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Formik } from "formik";
import * as Yup from "yup";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation schema
  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values) => {
    try {
      setError("");
      setLoading(true);

      const success = await login(values.username, values.password);

      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      setError("Failed to login. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h4 className="text-center mb-4">Sign In</h4>

      {error && <Alert variant="danger">{error}</Alert>}

      <Formik
        initialValues={{ username: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={values.username}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.username && !!errors.username}
                placeholder="Enter username"
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                isInvalid={touched.password && !!errors.password}
                placeholder="Enter password"
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="py-2"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </div>

            <div className="text-center mt-3">
              <p>
                Don't have an account?{" "}
                <Link to="/register">Register as Resident</Link>
              </p>
              <p className="text-muted small">
                <strong>Admin account:</strong> admin / admin123
                <br />
                <strong>Sample resident account:</strong> resident1 /
                resident123
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default Login;
