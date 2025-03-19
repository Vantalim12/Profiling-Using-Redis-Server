// src/pages/residents/AddResident.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { residentService, familyHeadService } from "../../services/api";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";

const AddResident = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [familyHeads, setFamilyHeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if familyHeadId is passed from another component
  const defaultFamilyHeadId = location.state?.familyHeadId || "";

  useEffect(() => {
    // Fetch family heads for dropdown
    const fetchFamilyHeads = async () => {
      try {
        setLoading(true);
        const response = await familyHeadService.getAll();
        setFamilyHeads(response.data);
      } catch (error) {
        console.error("Error fetching family heads:", error);
        toast.error("Failed to load family heads data");
      } finally {
        setLoading(false);
      }
    };

    fetchFamilyHeads();
  }, []);

  // Validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    gender: Yup.string().required("Gender is required"),
    birthDate: Yup.date().required("Birth date is required"),
    address: Yup.string().required("Address is required"),
    contactNumber: Yup.string().optional(),
    familyHeadId: Yup.string().optional(),
  });

  // Initial form values
  const initialValues = {
    firstName: "",
    lastName: "",
    gender: "",
    birthDate: "",
    address: "",
    contactNumber: "",
    familyHeadId: defaultFamilyHeadId,
  };

  // Submit handler
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError("");

      // If a family head is selected, use their address
      if (values.familyHeadId) {
        const selectedFamilyHead = familyHeads.find(
          (head) => head.id === values.familyHeadId
        );
        if (selectedFamilyHead) {
          values.address = selectedFamilyHead.address;
        }
      }

      await residentService.create(values);
      toast.success("Resident added successfully");

      // If resident was added from family head details page, return there
      if (defaultFamilyHeadId) {
        navigate(`/dashboard/family-heads/view/${defaultFamilyHeadId}`);
      } else {
        navigate("/dashboard/residents");
      }
    } catch (error) {
      console.error("Error adding resident:", error);
      setError(error.response?.data?.error || "Failed to add resident");
      toast.error(error.response?.data?.error || "Failed to add resident");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>Add Resident</h2>
          <p className="text-muted">Create a new resident record</p>
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
              setFieldValue,
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

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Family Head</Form.Label>
                      <Form.Select
                        name="familyHeadId"
                        value={values.familyHeadId}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          setFieldValue("familyHeadId", selectedId);

                          // Auto-fill address when family head is selected
                          if (selectedId) {
                            const selectedHead = familyHeads.find(
                              (head) => head.id === selectedId
                            );
                            if (selectedHead) {
                              setFieldValue("address", selectedHead.address);
                            }
                          }
                        }}
                        onBlur={handleBlur}
                      >
                        <option value="">None (Individual Resident)</option>
                        {familyHeads.map((head) => (
                          <option key={head.id} value={head.id}>
                            {head.firstName} {head.lastName} ({head.id})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="contactNumber"
                        value={values.contactNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={
                          touched.contactNumber && !!errors.contactNumber
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.contactNumber}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.address && !!errors.address}
                    disabled={!!values.familyHeadId}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.address}
                  </Form.Control.Feedback>
                  {values.familyHeadId && (
                    <Form.Text className="text-muted">
                      Address is automatically set to match the family head's
                      address.
                    </Form.Text>
                  )}
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (defaultFamilyHeadId) {
                        navigate(
                          `/dashboard/family-heads/view/${defaultFamilyHeadId}`
                        );
                      } else {
                        navigate("/dashboard/residents");
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Resident"}
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

export default AddResident;
