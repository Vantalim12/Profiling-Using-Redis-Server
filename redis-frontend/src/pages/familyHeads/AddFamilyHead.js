// src/pages/familyHeads/AddFamilyHead.js
import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { familyHeadService } from "../../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AddFamilyHead = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // Validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    gender: Yup.string().required("Gender is required"),
    birthDate: Yup.date().required("Birth date is required"),
    address: Yup.string().required("Address is required"),
    contactNumber: Yup.string().required("Contact number is required"),
  });

  // Initial form values
  const initialValues = {
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    address: "",
    contactNumber: "",
  };

  // Submit handler
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError("");
      await familyHeadService.create(values);
      toast.success("Family head added successfully");
      navigate("/dashboard/family-heads");
    } catch (error) {
      console.error("Error adding family head:", error);
      setError(error.response?.data?.error || "Failed to add family head");
      toast.error(error.response?.data?.error || "Failed to add family head");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Add Family Head</h2>
          <p className="text-muted">Create a new family head record</p>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Formik
            initialValues={initialValues}
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
              isSubmitting,
            }) => (
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.firstName && !!errors.firstName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.lastName && !!errors.lastName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={values.gender}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.gender && !!errors.gender}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.gender}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Birth Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="birthDate"
                        value={values.birthDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.birthDate && !!errors.birthDate}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.birthDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.address && !!errors.address}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="contactNumber"
                    value={values.contactNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.contactNumber && !!errors.contactNumber}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.contactNumber}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/dashboard/family-heads")}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Family Head"}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddFamilyHead;
