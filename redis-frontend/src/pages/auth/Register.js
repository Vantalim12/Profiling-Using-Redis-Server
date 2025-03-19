// src/pages/auth/Register.js
import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Formik } from "formik";
import * as Yup from "yup";

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [residentVerified, setResidentVerified] = useState(false);
  const [residentData, setResidentData] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Validation schema for resident ID verification
  const verifySchema = Yup.object({
    residentId: Yup.string().required("Resident ID is required"),
  });

  // Validation schema for registration
  const registrationSchema = Yup.object({
    username: Yup.string()
      .required("Username is required")
      .min(4, "Username must be at least 4 characters"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("password")], "Passwords must match"),
    name: Yup.string().required("Name is required"),
  });

  // Verify resident ID
  const handleVerifyResident = async (
    values,
    { setSubmitting, setFieldError }
  ) => {
    try {
      setVerifyLoading(true);
      setError("");

      // Check if resident exists
      const response = await axios.get(`/api/residents/${values.residentId}`);

      if (response.data) {
        // Check if resident already has an account
        const accountCheck = await axios.get(
          `/api/auth/check-resident/${values.residentId}`
        );

        if (accountCheck.data.hasAccount) {
          setFieldError("residentId", "Resident already has an account");
          setResidentVerified(false);
          return;
        }

        setResidentVerified(true);
        setResidentData(response.data);
      }
    } catch (error) {
      console.error("Verification error:", error);
      if (error.response?.status === 404) {
        setFieldError("residentId", "Resident ID not found");
      } else {
        setError("Failed to verify resident. Please try again.");
      }
      setResidentVerified(false);
    } finally {
      setVerifyLoading(false);
      setSubmitting(false);
    }
  };

  // Register user
  const handleRegister = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setError("");

      // Make API call to register
      const response = await axios.post("/api/auth/register", {
        username: values.username,
        password: values.password,
        name: values.name,
        residentId: residentData.id,
      });

      // If registration successful, log the user in with the token
      if (response.data.token) {
        // Store token
        localStorage.setItem("token", response.data.token);

        // Set auth header
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;

        // Navigate to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg =
        error.response?.data?.error || "Registration failed. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      <h4 className="text-center mb-4">Resident Registration</h4>

      {error && <Alert variant="danger">{error}</Alert>}

      {!residentVerified ? (
        // Step 1: Verify Resident ID
        <Formik
          initialValues={{ residentId: "" }}
          validationSchema={verifySchema}
          onSubmit={handleVerifyResident}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Resident ID</Form.Label>
                <Form.Control
                  type="text"
                  name="residentId"
                  value={values.residentId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.residentId && !!errors.residentId}
                  placeholder="Enter your Resident ID (e.g., R-2023001)"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.residentId}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Your Resident ID is provided by the Barangay office when you
                  are registered as a resident.
                </Form.Text>
              </Form.Group>

              <div className="d-grid">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting || verifyLoading}
                  className="py-2"
                >
                  {verifyLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Resident ID"
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        // Step 2: Register Account
        <>
          <Alert variant="success" className="mb-3">
            <strong>Resident Verified:</strong> {residentData.firstName}{" "}
            {residentData.lastName}
          </Alert>

          <Formik
            initialValues={{
              username: "",
              password: "",
              confirmPassword: "",
              name: `${residentData.firstName} ${residentData.lastName}`,
            }}
            validationSchema={registrationSchema}
            onSubmit={handleRegister}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
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
                    placeholder="Choose a username"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.password && !!errors.password}
                    placeholder="Choose a password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={
                      touched.confirmPassword && !!errors.confirmPassword
                    }
                    placeholder="Confirm your password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Display Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && !!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="py-2"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Registering...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => setResidentVerified(false)}
                    className="p-0"
                  >
                    Use a different Resident ID
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </>
      )}

      <div className="text-center mt-4">
        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </>
  );
};

export default Register;
