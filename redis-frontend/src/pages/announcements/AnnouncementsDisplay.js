// redis-frontend/src/pages/announcements/AnnouncementsDisplay.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  ListGroup,
  Accordion,
} from "react-bootstrap";
import { announcementService } from "../../services/api";
import { toast } from "react-toastify";

const AnnouncementsDisplay = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getAll();
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setError("Failed to load announcements");
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get card styles based on type
  const getCardVariant = (type) => {
    switch (type.toLowerCase()) {
      case "important":
        return "danger";
      case "warning":
        return "warning";
      case "information":
        return "info";
      default:
        return "light";
    }
  };

  // Group announcements by category
  const groupedAnnouncements = announcements.reduce((acc, announcement) => {
    const category = announcement.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(announcement);
    return acc;
  }, {});

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Card className="text-center">
          <Card.Body>
            <Card.Title className="text-danger">Error</Card.Title>
            <Card.Text>{error}</Card.Text>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Barangay Announcements</h2>

      {Object.keys(groupedAnnouncements).length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <Card.Text>No announcements available at this time.</Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <Accordion defaultActiveKey="0">
          {Object.entries(groupedAnnouncements).map(
            ([category, items], index) => (
              <Accordion.Item key={category} eventKey={index.toString()}>
                <Accordion.Header>
                  <span className="fw-bold">{category}</span>
                  <Badge bg="secondary" className="ms-2">
                    {items.length}
                  </Badge>
                </Accordion.Header>
                <Accordion.Body>
                  <ListGroup>
                    {items.map((announcement) => (
                      <ListGroup.Item key={announcement.id} className="mb-3">
                        <Card
                          border={getCardVariant(announcement.type)}
                          className="h-100"
                        >
                          <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">{announcement.title}</h5>
                            <Badge bg={getCardVariant(announcement.type)}>
                              {announcement.type}
                            </Badge>
                          </Card.Header>
                          <Card.Body>
                            <Card.Text>
                              {announcement.content
                                .split("\n")
                                .map((paragraph, i) => (
                                  <p key={i}>{paragraph}</p>
                                ))}
                            </Card.Text>
                          </Card.Body>
                          <Card.Footer className="text-muted">
                            {new Date(announcement.date).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(announcement.date).toLocaleTimeString()}
                          </Card.Footer>
                        </Card>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Accordion.Body>
              </Accordion.Item>
            )
          )}
        </Accordion>
      )}
    </Container>
  );
};

export default AnnouncementsDisplay;
