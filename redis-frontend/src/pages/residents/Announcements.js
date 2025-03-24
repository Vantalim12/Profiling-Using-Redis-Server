// src/pages/residents/Announcements.js - UPDATED VERSION
// This is already fetching from the API correctly, but let's ensure it works properly

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Badge,
  Button,
  Form,
  InputGroup,
  Modal,
  Spinner,
} from "react-bootstrap";
import {
  FaSearch,
  FaBullhorn,
  FaCalendarAlt,
  FaInfo,
  FaExclamationTriangle,
  FaFilter,
  FaExclamationCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { announcementService } from "../../services/api";

const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getAll();
      setAnnouncements(response.data);
      console.log("Fetched announcements:", response.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  // Get announcement type icon
  const getAnnouncementIcon = (type) => {
    switch (type) {
      case "important":
        return <FaExclamationCircle className="text-danger me-2" size={18} />;
      case "warning":
        return (
          <FaExclamationTriangle className="text-warning me-2" size={18} />
        );
      case "info":
      default:
        return <FaInfo className="text-info me-2" size={18} />;
    }
  };

  // Get category badge
  const getCategoryBadge = (category) => {
    switch (category) {
      case "health":
        return <Badge bg="success">Health</Badge>;
      case "infrastructure":
        return <Badge bg="secondary">Infrastructure</Badge>;
      case "environment":
        return <Badge bg="primary">Environment</Badge>;
      case "events":
        return <Badge bg="info">Events</Badge>;
      default:
        return <Badge bg="dark">General</Badge>;
    }
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || announcement.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort by date (newest first)
  const sortedAnnouncements = [...filteredAnnouncements].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Handle view announcement details
  const handleViewDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetailsModal(true);
  };

  // Get type label for display
  const getTypeLabel = (type) => {
    switch (type) {
      case "important":
        return "Important";
      case "warning":
        return "Warning";
      case "info":
        return "Information";
      default:
        return "General";
    }
  };

  return (
    <Container>
      <h2 className="mb-4">Announcements</h2>

      <Row className="mb-4">
        <Col md={7}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>

        <Col md={5}>
          <InputGroup>
            <InputGroup.Text>
              <FaFilter />
            </InputGroup.Text>
            <Form.Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="health">Health</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="environment">Environment</option>
              <option value="events">Events</option>
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <FaBullhorn className="me-2" /> Barangay Announcements
          </h5>
          <Badge bg="light" text="dark">
            {sortedAnnouncements.length}
          </Badge>
        </Card.Header>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading announcements...</p>
          </div>
        ) : sortedAnnouncements.length > 0 ? (
          <ListGroup variant="flush">
            {sortedAnnouncements.map((announcement) => (
              <ListGroup.Item
                key={announcement.id}
                className="p-4"
                action
                onClick={() => handleViewDetails(announcement)}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0 d-flex align-items-center">
                    {getAnnouncementIcon(announcement.type)}
                    {announcement.title}
                  </h5>
                  <div className="d-flex align-items-center">
                    {getCategoryBadge(announcement.category)}
                    <span className="ms-3 text-muted small">
                      <FaCalendarAlt className="me-1" />
                      {new Date(announcement.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="mb-0 announcement-preview">
                  {announcement.content.substring(0, 200)}
                  {announcement.content.length > 200 ? "..." : ""}
                </p>
                <div className="text-end mt-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(announcement);
                    }}
                  >
                    Read More
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-center py-5">
            <p className="text-muted mb-0">
              No announcements found matching your search.
            </p>
          </div>
        )}
      </Card>

      {/* Announcement Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            {selectedAnnouncement && (
              <>
                {getAnnouncementIcon(selectedAnnouncement.type)}
                <span>
                  {getTypeLabel(selectedAnnouncement.type)} Announcement
                </span>
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAnnouncement && (
            <>
              <h4>{selectedAnnouncement.title}</h4>
              <div className="d-flex align-items-center mb-3">
                <FaCalendarAlt className="text-primary me-2" />
                <span>
                  {new Date(selectedAnnouncement.date).toLocaleDateString()}
                </span>
                <span className="mx-2">|</span>
                {getCategoryBadge(selectedAnnouncement.category)}
              </div>
              <hr />
              <div className="announcement-content">
                {selectedAnnouncement.content
                  .split("\n")
                  .map((paragraph, idx) =>
                    paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                  )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Announcements;
