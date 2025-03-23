// redis-frontend/src/pages/events/EventsList.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Form,
  InputGroup,
  Modal,
  Badge,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { eventService } from "../../services/api";
import { toast } from "react-toastify";

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State for the modal
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    id: "",
    title: "",
    description: "",
    eventDate: "",
    location: "",
    category: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch events on component mount
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
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Handle modal open/close
  const handleClose = () => {
    setShowModal(false);
    setCurrentEvent({
      id: "",
      title: "",
      description: "",
      eventDate: "",
      location: "",
      category: "",
    });
    setIsEditing(false);
  };

  const handleShow = (event = null) => {
    if (event) {
      // Format date for datetime-local input
      const formattedDate = event.eventDate
        ? event.eventDate.split("Z")[0]
        : "";

      setCurrentEvent({
        ...event,
        eventDate: formattedDate,
      });
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
    setShowModal(true);
  };

  // Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create or update event
  const handleSubmit = async () => {
    try {
      const eventData = {
        ...currentEvent,
        eventDate: new Date(currentEvent.eventDate).toISOString(),
      };

      if (isEditing) {
        await eventService.update(currentEvent.id, eventData);
        toast.success("Event updated successfully");
      } else {
        await eventService.create(eventData);
        toast.success("Event added successfully");
      }
      handleClose();
      fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event");
    }
  };

  // Delete event
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventService.delete(id);
        toast.success("Event deleted successfully");
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("Failed to delete event");
      }
    }
  };

  // Filter events based on search term
  const filteredEvents = events.filter((event) => {
    return (
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Helper function to get badge color based on category
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
      default:
        return "secondary";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Events Management</h2>
          <p className="text-muted">
            Create and manage events for the community
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-md-end">
          <Button variant="primary" onClick={() => handleShow()}>
            <FaPlus className="me-2" /> Add Event
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <tr key={event.id}>
                      <td>{event.title}</td>
                      <td>
                        <Badge bg={getBadgeVariant(event.category)} pill>
                          {event.category}
                        </Badge>
                      </td>
                      <td>{formatDate(event.eventDate)}</td>
                      <td>{event.location}</td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-1"
                          onClick={() => handleShow(event)}
                          title="View/Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-3">
                      {searchTerm
                        ? "No events found matching your search"
                        : "No events found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Event Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Event" : "Add New Event"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={currentEvent.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={currentEvent.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Sports">Sports</option>
                    <option value="Education">Education</option>
                    <option value="Community">Community</option>
                    <option value="Health">Health</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date & Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="eventDate"
                    value={currentEvent.eventDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaMapMarkerAlt />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  name="location"
                  value={currentEvent.location}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="description"
                value={currentEvent.description}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? "Update" : "Save"} Event
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventsList;
