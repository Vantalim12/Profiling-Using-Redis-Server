// src/pages/residents/ResidentProfile.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { residentService } from "../../services/api";
import { toast } from "react-toastify";
import { FaEdit, FaFilePdf, FaFileAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const ResidentProfile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resident, setResident] = useState(null);

  useEffect(() => {
    // If user is a resident, fetch their resident profile
    if (currentUser?.role === "resident" && currentUser?.residentId) {
      const fetchResidentData = async () => {
        try {
          setLoading(true);
          const response = await residentService.getById(
            currentUser.residentId
          );
          setResident(response.data);
        } catch (error) {
          console.error("Error fetching resident data:", error);
          setError("Failed to load your resident information");
          toast.error("Failed to load resident information");
        } finally {
          setLoading(false);
        }
      };

      fetchResidentData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  // Calculate age from birthdate
  const calculateAge = (birthDate) => {
    if (!birthDate) return "N/A";

    const dob = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!resident) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          No resident information found. Please contact your Barangay
          Administrator.
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">My Resident Profile</h2>

      <Row>
        <Col lg={8}>
          {/* Resident Information Card */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Personal Information</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p>
                    <strong>ID:</strong> {resident.id}
                  </p>
                  <p>
                    <strong>Name:</strong> {resident.firstName}{" "}
                    {resident.lastName}
                  </p>
                  <p>
                    <strong>Gender:</strong> {resident.gender}
                  </p>
                  <p>
                    <strong>Age:</strong> {calculateAge(resident.birthDate)}{" "}
                    years old
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Birth Date:</strong>{" "}
                    {new Date(resident.birthDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Address:</strong> {resident.address}
                  </p>
                  <p>
                    <strong>Contact Number:</strong>{" "}
                    {resident.contactNumber || "Not specified"}
                  </p>
                  <p>
                    <strong>Registration Date:</strong>{" "}
                    {new Date(resident.registrationDate).toLocaleDateString()}
                  </p>
                </Col>
              </Row>

              <div className="mt-3">
                <Button
                  as={Link}
                  to={`/dashboard/residents/edit/${resident.id}`}
                  variant="outline-primary"
                  className="me-2"
                >
                  <FaEdit className="me-2" /> Request Information Update
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Family Information Card (if applicable) */}
          {resident.familyHeadId && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Family Information</h5>
              </Card.Header>
              <Card.Body>
                <p>
                  <strong>Family Head ID:</strong> {resident.familyHeadId}
                </p>
                <p>
                  <strong>Family Information:</strong> Your address information
                  and contact details are managed by your family head.
                </p>
                <p>
                  <strong>Note:</strong> Updates to your personal information
                  can be requested through the system, but will need to be
                  approved by a barangay administrator.
                </p>
              </Card.Body>
            </Card>
          )}

          {/* Available Services Card */}
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Available Services</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <Card className="h-100 border">
                    <Card.Body className="d-flex flex-column align-items-center">
                      <FaFilePdf
                        className="text-danger mb-3"
                        style={{ fontSize: "2rem" }}
                      />
                      <h5>Request Certificate</h5>
                      <p className="text-center">
                        Request barangay certificates and clearances online
                      </p>
                      <Button variant="outline-primary" className="mt-auto">
                        Request Certificate
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100 border">
                    <Card.Body className="d-flex flex-column align-items-center">
                      <FaFileAlt
                        className="text-primary mb-3"
                        style={{ fontSize: "2rem" }}
                      />
                      <h5>Submit Complaint</h5>
                      <p className="text-center">
                        Submit complaints or concerns to the barangay office
                      </p>
                      <Button variant="outline-primary" className="mt-auto">
                        Submit Form
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <p className="text-muted mt-3">
                <small>
                  Note: Some services may require in-person verification at the
                  barangay office.
                </small>
              </p>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Notifications Card */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Notifications</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <small>
                  Welcome to the Barangay Management System! You can now access
                  your resident information online.
                </small>
              </Alert>
              <Alert variant="warning">
                <small>
                  Please verify your contact information is up-to-date for
                  emergency notifications.
                </small>
              </Alert>
            </Card.Body>
          </Card>

          {/* Upcoming Events Card */}
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Upcoming Events</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3 pb-3 border-bottom">
                <h6>Community Clean-up</h6>
                <p className="mb-1 text-muted">
                  <small>Date: July 10, 2023</small>
                </p>
                <p className="mb-0">
                  <small>
                    Join us for our monthly community clean-up drive at the
                    barangay plaza.
                  </small>
                </p>
              </div>
              <div>
                <h6>Health Check-up</h6>
                <p className="mb-1 text-muted">
                  <small>Date: July 15, 2023</small>
                </p>
                <p className="mb-0">
                  <small>
                    Free health check-up for all barangay residents at the
                    community center.
                  </small>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResidentProfile;
