// redis-frontend/src/pages/events/EventsDisplay.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  ListGroup,
  Tab,
  Nav,
} from "react-bootstrap";
import { FaCalendarAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { eventService } from "../../services/api";
import { toast } from "react-toastify";

const EventsDisplay = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events");
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get card styles based on category
  const getBadgeVariant = (category) => {
    switch (category.toLowerCase()) {
      case "sports":
        return "success";
      case "education":
        return "info";
      case "community":
        return "primary";
      case "health":
        return "danger";
      case "cultural":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Group events by category
  const groupedEvents = events.reduce((acc, event) => {
    const category = event.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(event);
    return acc;
  }, {});

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if an event is upcoming or past
  const isUpcoming = (dateString) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    return eventDate >= today;
  };

  // Separate upcoming and past events
  const upcomingEvents = events.filter((event) => isUpcoming(event.eventDate));
  const pastEvents = events.filter((event) => !isUpcoming(event.eventDate));

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
      <h2 className="mb-4">Community Events</h2>

      {events.length === 0 ? (
        <Card>
          <Card.Body className="text-center">
            <Card.Text>No events available at this time.</Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <Tab.Container id="events-tabs" defaultActiveKey="upcoming">
          <Nav variant="tabs" className="mb-4">
            <Nav.Item>
              <Nav.Link eventKey="upcoming">
                Upcoming Events ({upcomingEvents.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="past">
                Past Events ({pastEvents.length})
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="categories">View By Category</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="upcoming">
              {upcomingEvents.length === 0 ? (
                <Card>
                  <Card.Body className="text-center">
                    <Card.Text>No upcoming events scheduled.</Card.Text>
                  </Card.Body>
                </Card>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {upcomingEvents.map((event) => (
                    <Col key={event.id}>
                      <Card className="h-100 shadow-sm hover-lift">
                        <Card.Header className="bg-light">
                          <Badge
                            bg={getBadgeVariant(event.category)}
                            className="float-end"
                          >
                            {event.category}
                          </Badge>
                          <h5 className="mb-0">{event.title}</h5>
                        </Card.Header>
                        <Card.Body>
                          <Card.Text>{event.description}</Card.Text>
                          <div className="d-flex align-items-center mb-2">
                            <FaCalendarAlt className="me-2 text-primary" />
                            <span>{formatDate(event.eventDate)}</span>
                          </div>
                          <div className="d-flex align-items-center mb-2">
                            <FaClock className="me-2 text-primary" />
                            <span>{formatTime(event.eventDate)}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <FaMapMarkerAlt className="me-2 text-primary" />
                            <span>{event.location}</span>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Tab.Pane>

            <Tab.Pane eventKey="past">
              {pastEvents.length === 0 ? (
                <Card>
                  <Card.Body className="text-center">
                    <Card.Text>No past events found.</Card.Text>
                  </Card.Body>
                </Card>
              ) : (
                <ListGroup variant="flush">
                  {pastEvents.map((event) => (
                    <ListGroup.Item key={event.id} className="mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5>{event.title}</h5>
                          <div className="text-muted">
                            <small>
                              <FaCalendarAlt className="me-1" />{" "}
                              {formatDate(event.eventDate)} &nbsp;
                              <FaMapMarkerAlt className="me-1" />{" "}
                              {event.location}
                            </small>
                          </div>
                        </div>
                        <Badge bg={getBadgeVariant(event.category)}>
                          {event.category}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Tab.Pane>

            <Tab.Pane eventKey="categories">
              {Object.keys(groupedEvents).length === 0 ? (
                <Card>
                  <Card.Body className="text-center">
                    <Card.Text>No events available.</Card.Text>
                  </Card.Body>
                </Card>
              ) : (
                <Tab.Container
                  id="categories-tabs"
                  defaultActiveKey={Object.keys(groupedEvents)[0]}
                >
                  <Row>
                    <Col md={3}>
                      <Nav variant="pills" className="flex-column">
                        {Object.keys(groupedEvents).map((category) => (
                          <Nav.Item key={category}>
                            <Nav.Link eventKey={category}>
                              {category}{" "}
                              <Badge bg={getBadgeVariant(category)} pill>
                                {groupedEvents[category].length}
                              </Badge>
                            </Nav.Link>
                          </Nav.Item>
                        ))}
                      </Nav>
                    </Col>
                    <Col md={9}>
                      <Tab.Content>
                        {Object.entries(groupedEvents).map(
                          ([category, categoryEvents]) => (
                            <Tab.Pane key={category} eventKey={category}>
                              <h4 className="mb-3">{category} Events</h4>
                              <ListGroup variant="flush">
                                {categoryEvents.map((event) => (
                                  <ListGroup.Item
                                    key={event.id}
                                    className="mb-2"
                                  >
                                    <h5>{event.title}</h5>
                                    <p>{event.description}</p>
                                    <div className="d-flex justify-content-between">
                                      <div>
                                        <FaCalendarAlt className="me-1 text-primary" />
                                        {formatDate(event.eventDate)} at{" "}
                                        {formatTime(event.eventDate)}
                                      </div>
                                      <div>
                                        <FaMapMarkerAlt className="me-1 text-primary" />
                                        {event.location}
                                      </div>
                                    </div>
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            </Tab.Pane>
                          )
                        )}
                      </Tab.Content>
                    </Col>
                  </Row>
                </Tab.Container>
              )}
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      )}
    </Container>
  );
};

export default EventsDisplay;
