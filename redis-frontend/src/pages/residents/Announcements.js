// src/pages/residents/Announcements.js
import React, { useState } from "react";
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
} from "react-bootstrap";
import {
  FaSearch,
  FaBullhorn,
  FaCalendarAlt,
  FaInfo,
  FaExclamationTriangle,
} from "react-icons/fa";

const Announcements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Sample announcements data
  const announcements = [
    {
      id: 1,
      title: "COVID-19 Vaccination Schedule",
      date: "2023-07-01",
      category: "health",
      type: "important",
      content:
        "The barangay will be conducting COVID-19 vaccination on July 15, 2023, from 8:00 AM to 5:00 PM at the Barangay Health Center. Booster shots are now available. Please bring your vaccination card and a valid ID.",
    },
    {
      id: 2,
      title: "Road Maintenance Advisory",
      date: "2023-07-05",
      category: "infrastructure",
      type: "warning",
      content:
        "Main Road will be closed for repairs from July 15 to July 20, 2023. Please use alternate routes during this period. The repair works will be conducted from 8:00 AM to 5:00 PM daily.",
    },
    {
      id: 3,
      title: "Community Clean-up Drive",
      date: "2023-07-08",
      category: "environment",
      type: "info",
      content:
        "Join us for our monthly community clean-up drive at the barangay plaza on July 10, 2023, from 7:00 AM to 10:00 AM. Please bring your own gloves and cleaning materials. Refreshments will be provided.",
    },
    {
      id: 4,
      title: "Free Medical Check-up",
      date: "2023-07-10",
      category: "health",
      type: "info",
      content:
        "Free health check-up for all barangay residents at the community center on July 15, 2023, from 9:00 AM to 3:00 PM. Services include blood pressure monitoring, blood sugar screening, and basic medical consultation.",
    },
    {
      id: 5,
      title: "Summer Sports Festival",
      date: "2023-07-12",
      category: "events",
      type: "info",
      content:
        "The Barangay Summer Sports Festival will be held from July 25 to August 5, 2023, at the Barangay Sports Complex. Registration is now open until July 20. Contact the Barangay Office for details.",
    },
  ];

  // Filter announcements based on search term and category
  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || announcement.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Get announcement type icon
  const getAnnouncementIcon = (type) => {
    switch (type) {
      case "important":
        return <FaBullhorn className="text-primary me-2" />;
      case "warning":
        return <FaExclamationTriangle className="text-warning me-2" />;
      case "info":
      default:
        return <FaInfo className="text-info me-2" />;
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

  return (
    <Container>
      <h2 className="mb-4">Announcements</h2>

      <Row className="mb-4">
        <Col md={6}>
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

        <Col md={6}>
          <Form.Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-100"
          >
            <option value="all">All Categories</option>
            <option value="health">Health</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="environment">Environment</option>
            <option value="events">Events</option>
          </Form.Select>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Barangay Announcements</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {filteredAnnouncements.length > 0 ? (
                filteredAnnouncements.map((announcement) => (
                  <ListGroup.Item key={announcement.id} className="p-4">
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
                    <p className="mb-0">{announcement.content}</p>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center py-4">
                  <p className="text-muted mb-0">
                    No announcements found matching your search.
                  </p>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Announcements;
