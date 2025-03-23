// src/pages/residents/CertificateRequest.js - Updated implementation
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
  Table,
  Badge,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaFilePdf,
  FaFileAlt,
  FaIdCard,
  FaDownload,
  FaEye,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { documentRequestService } from "../../services/api";

const CertificateRequest = () => {
  const { currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestHistory, setRequestHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Fetch request history from the backend
  useEffect(() => {
    const fetchRequestHistory = async () => {
      try {
        setLoadingHistory(true);

        if (currentUser?.residentId) {
          // Get requests for this resident
          const response = await documentRequestService.getByResident(
            currentUser.residentId
          );
          setRequestHistory(response.data);
        }
      } catch (error) {
        console.error("Error fetching request history:", error);
        toast.error("Failed to load request history");
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchRequestHistory();
  }, [currentUser]);

  // Validation schema
  const validationSchema = Yup.object({
    certificateType: Yup.string().required("Certificate type is required"),
    purpose: Yup.string().required("Purpose is required"),
    deliveryOption: Yup.string().required("Delivery option is required"),
  });

  // Handle form submission
  const handleSubmit = async (values, { resetForm }) => {
    if (!currentUser?.residentId) {
      toast.error(
        "You must be logged in as a resident to request certificates"
      );
      return;
    }

    try {
      setSubmitting(true);

      // Format data for API
      const requestData = {
        residentId: currentUser.residentId,
        documentType: values.certificateType,
        purpose: values.purpose,
        deliveryOption: values.deliveryOption,
        additionalDetails: values.additionalNotes || "",
      };

      // Send request to API
      const response = await documentRequestService.create(requestData);

      // Add to history
      setRequestHistory([response.data, ...requestHistory]);

      // Show success message
      setSuccess(true);
      resetForm();
      toast.success("Certificate request submitted successfully");

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to submit request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Get certificate type display name
  const getCertificateTypeName = (type) => {
    switch (type) {
      case "barangay-clearance":
        return "Barangay Clearance";
      case "residency":
        return "Certificate of Residency";
      case "indigency":
        return "Certificate of Indigency";
      case "good-conduct":
        return "Certificate of Good Moral Character";
      case "business-permit":
        return "Barangay Business Permit";
      default:
        return type;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "approved":
        return <Badge bg="info">Approved</Badge>;
      case "completed":
        return <Badge bg="success">Completed</Badge>;
      case "rejected":
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // View request details
  const handleViewRequest = (request) => {
    // In a real app, this could open a modal with request details
    toast.info(`Viewing details for request: ${request.requestId}`);
  };

  // Download certificate
  const handleDownloadCertificate = (request) => {
    // In a real app, this would download the certificate
    if (request.status === "completed") {
      toast.info(`Downloading certificate for request: ${request.requestId}`);
    } else {
      toast.warning("Certificate is not yet available for download");
    }
  };

  return (
    <Container>
      <h2 className="mb-4">Request Certificates</h2>

      {success && (
        <Alert variant="success" className="mb-4">
          <Alert.Heading>Request Submitted!</Alert.Heading>
          <p>
            Your certificate request has been submitted successfully. The
            barangay staff will process your request. You will receive a
            notification when your certificate is ready for pickup or delivery.
          </p>
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Certificate Request Form</h5>
            </Card.Header>
            <Card.Body>
              <Formik
                initialValues={{
                  certificateType: "",
                  purpose: "",
                  deliveryOption: "",
                  additionalNotes: "",
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
                    <Form.Group className="mb-3">
                      <Form.Label>Certificate Type</Form.Label>
                      <Form.Select
                        name="certificateType"
                        value={values.certificateType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={
                          touched.certificateType && !!errors.certificateType
                        }
                      >
                        <option value="">Select Certificate Type</option>
                        <option value="barangay-clearance">
                          Barangay Clearance
                        </option>
                        <option value="residency">
                          Certificate of Residency
                        </option>
                        <option value="indigency">
                          Certificate of Indigency
                        </option>
                        <option value="good-conduct">
                          Certificate of Good Moral Character
                        </option>
                        <option value="business-permit">
                          Barangay Business Permit
                        </option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.certificateType}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Purpose</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="purpose"
                        value={values.purpose}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.purpose && !!errors.purpose}
                        placeholder="Please specify why you need this certificate"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.purpose}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Delivery Option</Form.Label>
                      <Form.Select
                        name="deliveryOption"
                        value={values.deliveryOption}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={
                          touched.deliveryOption && !!errors.deliveryOption
                        }
                      >
                        <option value="">Select Delivery Option</option>
                        <option value="pickup">Pickup at Barangay Hall</option>
                        <option value="email">Email (PDF)</option>
                        <option value="delivery">Home Delivery</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.deliveryOption}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Additional Notes (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="additionalNotes"
                        value={values.additionalNotes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Any additional information or special requests"
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Submitting...
                        </>
                      ) : (
                        "Submit Request"
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Available Certificates</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3 pb-3 border-bottom">
                <div className="d-flex align-items-center mb-2">
                  <FaIdCard className="text-primary me-2" />
                  <h6 className="mb-0">Barangay Clearance</h6>
                </div>
                <p className="small text-muted mb-0">
                  For employment, scholarships, and government transactions.
                </p>
              </div>

              <div className="mb-3 pb-3 border-bottom">
                <div className="d-flex align-items-center mb-2">
                  <FaFileAlt className="text-success me-2" />
                  <h6 className="mb-0">Certificate of Residency</h6>
                </div>
                <p className="small text-muted mb-0">
                  Proof that you are a resident of the barangay.
                </p>
              </div>

              <div className="mb-3 pb-3 border-bottom">
                <div className="d-flex align-items-center mb-2">
                  <FaFilePdf className="text-danger me-2" />
                  <h6 className="mb-0">Certificate of Indigency</h6>
                </div>
                <p className="small text-muted mb-0">
                  For medical assistance, scholarships, and social services.
                </p>
              </div>

              <div>
                <p className="mb-0 small text-muted">
                  <strong>Note:</strong> Processing time is typically 1-3
                  business days. Some certificates may require additional
                  documentation.
                </p>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Request History</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loadingHistory ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" size="sm" />
                </div>
              ) : requestHistory.length > 0 ? (
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestHistory.map((request) => (
                      <tr key={request.id}>
                        <td>{request.requestId}</td>
                        <td>
                          {
                            getCertificateTypeName(request.documentType).split(
                              " "
                            )[0]
                          }
                        </td>
                        <td>{getStatusBadge(request.status)}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            className="me-1"
                            title="View Details"
                            onClick={() => handleViewRequest(request)}
                          >
                            <FaEye />
                          </Button>
                          {request.status === "completed" && (
                            <Button
                              variant="primary"
                              size="sm"
                              title="Download Certificate"
                              onClick={() => handleDownloadCertificate(request)}
                            >
                              <FaDownload />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted small mb-0">
                    You haven't made any certificate requests yet. Your request
                    history will appear here once you submit your first request.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CertificateRequest;
