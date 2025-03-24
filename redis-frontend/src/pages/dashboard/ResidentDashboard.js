// src/pages/dashboard/ResidentDashboard.js - Update announcements section to use real data
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  residentService,
  dashboardService,
  announcementService,
  eventService,
} from "../../services/api";
import {
  FaUserAlt,
  FaFileAlt,
  FaBullhorn,
  FaCalendarAlt,
  FaUsers,
  FaUserFriends,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaInfo,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const ResidentDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState(null);
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalFamilyHeads: 0,
    genderData: [],
    ageData: [],
    recentRegistrations: [],
  });
  const [error, setError] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch demographic stats for all residents
        const statsResponse = await dashboardService.getStats();
        setStats(statsResponse.data);

        // Only fetch resident data if the user is a resident
        if (currentUser?.role === "resident" && currentUser?.residentId) {
          const residentResponse = await residentService.getById(
            currentUser.residentId
          );
          setResident(residentResponse.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard information");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchAnnouncements();
    fetchEvents();
  }, [currentUser]);

  // Fetch real announcements from the API
  const fetchAnnouncements = async () => {
    try {
      setLoadingAnnouncements(true);
      const response = await announcementService.getAll();
      // Sort by date (newest first) and take only 3 recent announcements
      const sortedAnnouncements = response.data
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
      setAnnouncements(sortedAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // Fetch upcoming events
  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const response = await eventService.getAll();
      // Filter upcoming events and sort by date
      const now = new Date();
      const upcomingEvents = response.data
        .filter((event) => new Date(event.eventDate) >= now)
        .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
        .slice(0, 3);
      setEvents(upcomingEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

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

  // Helper function to get announcement type variant
  const getAnnouncementVariant = (type) => {
    switch (type) {
      case "important":
        return "danger";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "secondary";
    }
  };

  // Helper function to get announcement icon
  const getAnnouncementIcon = (type) => {
    switch (type) {
      case "important":
        return <FaExclamationCircle className="text-danger me-2" />;
      case "warning":
        return <FaExclamationTriangle className="text-warning me-2" />;
      case "info":
      default:
        return <FaInfo className="text-info me-2" />;
    }
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
      <Container className="py-3">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Colors for charts
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

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
              <Button
                as={Link}
                to="/dashboard/certificates"
                variant="outline-success"
                className="mt-auto"
              >
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
              <Button
                as={Link}
                to="/dashboard/announcements"
                variant="outline-danger"
                className="mt-auto"
              >
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
              <Button
                as={Link}
                to="/dashboard/events"
                variant="outline-warning"
                className="mt-auto"
              >
                View Calendar
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Barangay Statistics Overview */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Barangay Statistics Overview</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-4">
                  <div className="stat-box text-center border p-3 rounded">
                    <FaUsers className="text-primary mb-2" size={36} />
                    <h3 className="display-5 fw-bold">
                      {stats.totalResidents}
                    </h3>
                    <p className="mb-0">Total Residents</p>
                  </div>
                </Col>
                <Col md={6} className="mb-4">
                  <div className="stat-box text-center border p-3 rounded">
                    <FaUserFriends className="text-success mb-2" size={36} />
                    <h3 className="display-5 fw-bold">
                      {stats.totalFamilyHeads}
                    </h3>
                    <p className="mb-0">Family Heads</p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Demographics */}
      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Gender Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.genderData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Age Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ageData}>
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Residents" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notifications and Announcements */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Announcements</h5>
              <Button
                as={Link}
                to="/dashboard/announcements"
                variant="light"
                size="sm"
              >
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {loadingAnnouncements ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <Alert
                    key={announcement.id}
                    variant={getAnnouncementVariant(announcement.type)}
                    className="mb-3"
                  >
                    <div className="d-flex align-items-center mb-1">
                      {getAnnouncementIcon(announcement.type)}
                      <strong>{announcement.title}</strong>
                    </div>
                    <p className="mb-0 small">
                      {announcement.content.length > 120
                        ? `${announcement.content.substring(0, 120)}...`
                        : announcement.content}
                    </p>
                  </Alert>
                ))
              ) : (
                <p className="text-center text-muted">
                  No announcements available at this time.
                </p>
              )}
              <div className="text-end mt-2">
                <Button
                  as={Link}
                  to="/dashboard/announcements"
                  variant="link"
                  size="sm"
                >
                  View All Announcements
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Upcoming Events</h5>
              <Button
                as={Link}
                to="/dashboard/events"
                variant="light"
                size="sm"
              >
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {loadingEvents ? (
                <div className="text-center py-3">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : events.length > 0 ? (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="d-flex mb-3 pb-3 border-bottom"
                  >
                    <div className="text-center me-3">
                      <div className="bg-light p-2 rounded">
                        <div className="fw-bold">
                          {new Date(event.eventDate)
                            .toLocaleString("default", { month: "short" })
                            .toUpperCase()}
                        </div>
                        <div className="h4 mb-0">
                          {new Date(event.eventDate).getDate()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h6 className="mb-1">{event.title}</h6>
                      <p className="text-muted mb-0 small">
                        {event.time} at {event.location}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted">
                  No upcoming events at this time.
                </p>
              )}
              <div className="text-end mt-3">
                <Button
                  as={Link}
                  to="/dashboard/events"
                  variant="link"
                  size="sm"
                >
                  View All Events
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Resident Information Summary */}
      {resident && (
        <Row className="mb-4">
          <Col lg={12}>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Your Information</h5>
              </Card.Header>
              <Card.Body>
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
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ResidentDashboard;
