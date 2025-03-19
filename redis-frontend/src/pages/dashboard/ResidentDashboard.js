// src/pages/dashboard/ResidentDashboard.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { residentService } from "../../services/api";
import {
  FaUserAlt,
  FaFileAlt,
  FaBullhorn,
  FaCalendarAlt,
} from "react-icons/fa";

const ResidentDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only fetch resident data if the user is a resident
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
        } finally {
          setLoading(false);
        }
      };

      fetchResidentData();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-3">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mb-4">
        <h2>Welcome, {currentUser?.name || "Resident"}!</h2>
        <p className="text-muted">Your Barangay Management System Dashboard</p>
      </div>

      {/* Quick Links */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="dashboard-card text-center h-100">
            <Card.Body>
              <div className="mb-3">
                <FaUserAlt className="text-primary" size={36} />
              </div>
              <h5>My Profile</h5>
              <p className="text-muted small">
                View and manage your resident information
              </p>
              <Button
                as={Link}
                to={`/dashboard/residents/view/${currentUser?.residentId}`}
                variant="outline-primary"
                className="mt-auto"
              >
                View Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="dashboard-card text-center h-100">
            <Card.Body>
              <div className="mb-3">
                <FaFileAlt className="text-success" size={36} />
              </div>
              <h5>Certificate Requests</h5>
              <p className="text-muted small">
                Request barangay documents and certificates
              </p>
              <Button variant="outline-success" className="mt-auto">
                Request Document
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="dashboard-card text-center h-100">
            <Card.Body>
              <div className="mb-3">
                <FaBullhorn className="text-danger" size={36} />
              </div>
              <h5>Announcements</h5>
              <p className="text-muted small">
                View important notices from the barangay
              </p>
              <Button variant="outline-danger" className="mt-auto">
                View Announcements
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="dashboard-card text-center h-100">
            <Card.Body>
              <div className="mb-3">
                <FaCalendarAlt className="text-warning" size={36} />
              </div>
              <h5>Events</h5>
              <p className="text-muted small">
                Check upcoming events in the barangay
              </p>
              <Button variant="outline-warning" className="mt-auto">
                View Calendar
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resident Information Summary */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Your Information</h5>
            </Card.Header>
            <Card.Body>
              {resident ? (
                <Row>
                  <Col md={4}>
                    <p className="mb-1">
                      <strong>ID:</strong> {resident.id}
                    </p>
                    <p className="mb-1">
                      <strong>Name:</strong> {resident.firstName}{" "}
                      {resident.lastName}
                    </p>
                    <p className="mb-1">
                      <strong>Gender:</strong> {resident.gender}
                    </p>
                  </Col>
                  <Col md={5}>
                    <p className="mb-1">
                      <strong>Address:</strong> {resident.address}
                    </p>
                    <p className="mb-1">
                      <strong>Contact:</strong>{" "}
                      {resident.contactNumber || "Not specified"}
                    </p>
                    <p className="mb-1">
                      <strong>Registered:</strong>{" "}
                      {new Date(resident.registrationDate).toLocaleDateString()}
                    </p>
                  </Col>
                  <Col md={3} className="text-md-end">
                    <Button
                      as={Link}
                      to={`/dashboard/residents/edit/${resident.id}`}
                      variant="primary"
                      size="sm"
                    >
                      Update Information
                    </Button>
                  </Col>
                </Row>
              ) : (
                <p className="text-muted">
                  Please contact the barangay office to update your resident
                  information.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notifications and Announcements */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Recent Announcements</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <strong>COVID-19 Vaccination</strong>
                <p className="mb-0 small">
                  Booster shots are now available at the health center every
                  Wednesday.
                </p>
              </Alert>
              <Alert variant="warning">
                <strong>Road Maintenance</strong>
                <p className="mb-0 small">
                  Main Road will be closed for repairs from July 15-20, 2023.
                </p>
              </Alert>
              <Alert variant="success">
                <strong>Community Garden</strong>
                <p className="mb-0 small">
                  Join us in planting vegetables at the community garden this
                  weekend.
                </p>
              </Alert>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Upcoming Events</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex mb-3 pb-3 border-bottom">
                <div className="text-center me-3">
                  <div className="bg-light p-2 rounded">
                    <div className="fw-bold">JUL</div>
                    <div className="h4 mb-0">15</div>
                  </div>
                </div>
                <div>
                  <h6 className="mb-1">Barangay Assembly Meeting</h6>
                  <p className="text-muted mb-0 small">
                    9:00 AM at the Barangay Hall
                  </p>
                </div>
              </div>

              <div className="d-flex mb-3 pb-3 border-bottom">
                <div className="text-center me-3">
                  <div className="bg-light p-2 rounded">
                    <div className="fw-bold">JUL</div>
                    <div className="h4 mb-0">22</div>
                  </div>
                </div>
                <div>
                  <h6 className="mb-1">Health and Wellness Day</h6>
                  <p className="text-muted mb-0 small">
                    Free medical check-ups and consultations
                  </p>
                </div>
              </div>

              <div className="d-flex">
                <div className="text-center me-3">
                  <div className="bg-light p-2 rounded">
                    <div className="fw-bold">AUG</div>
                    <div className="h4 mb-0">05</div>
                  </div>
                </div>
                <div>
                  <h6 className="mb-1">Livelihood Training</h6>
                  <p className="text-muted mb-0 small">
                    Basic entrepreneurship skills training
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResidentDashboard;
