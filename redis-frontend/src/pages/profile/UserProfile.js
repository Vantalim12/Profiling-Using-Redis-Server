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
import { useAuth } from "../../contexts/AuthContext";
import { Formik } from "formik";
import * as Yup from "yup";
import { FaUser, FaLock } from "react-icons/fa";

const UserProfile = () => {
  const { currentUser, changePassword } = useAuth();
  const [passwordChanged, setPasswordChanged] = useState(false);

  // Validation schema for password change
  const validationSchema = Yup.object({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .required("New password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("newPassword")], "Passwords must match"),
  });

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setFieldError }
  ) => {
    try {
      setPasswordChanged(false);

      const success = await changePassword(
        values.currentPassword,
        values.newPassword
      );

      if (success) {
        setPasswordChanged(true);
        resetForm();
      }
    } catch (error) {
      console.error("Change password error:", error);
      setFieldError("general", "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h2>User Profile</h2>
          <p className="text-muted">Manage your account settings</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaUser className="me-2" /> Profile Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentUser?.username || ""}
                    readOnly
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentUser?.name || ""}
                    readOnly
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentUser?.role || ""}
                    readOnly
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaLock className="me-2" /> Change Password
              </h5>
            </Card.Header>
            <Card.Body>
              {passwordChanged && (
                <Alert
                  variant="success"
                  dismissible
                  onClose={() => setPasswordChanged(false)}
                >
                  Password changed successfully!
                </Alert>
              )}

              <Formik
                initialValues={{
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                }}
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
                    {errors.general && (
                      <Alert variant="danger">{errors.general}</Alert>
                    )}

                    <Form.Group className="mb-3">
                      <Form.Label>Current Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={values.currentPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={
                          touched.currentPassword && !!errors.currentPassword
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.currentPassword}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={values.newPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.newPassword && !!errors.newPassword}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.newPassword}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Confirm New Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={
                          touched.confirmPassword && !!errors.confirmPassword
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Changing Password..."
                        : "Change Password"}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserProfile;
