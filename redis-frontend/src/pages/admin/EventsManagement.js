// src/pages/admin/EventsManagement.js - FIXED VERSION
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  InputGroup,
  Modal,
  Spinner,
  ListGroup,
  Tabs,
  Tab,
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaPlus,
  FaFilter,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaUserCheck,
  FaUserPlus,
  FaEnvelope,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { eventService } from "../../services/api";

const EventsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [events, setEvents] = useState([]);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setFetchingData(true);
      const response = await eventService.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setFetchingData(false);
    }
  };

  // Validation schema for event form
  const eventSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    category: Yup.string().required("Category is required"),
    eventDate: Yup.date().required("Date is required"),
    time: Yup.string().required("Time is required"),
    location: Yup.string().required("Location is required"),
  });

  // Get category badge
  const getCategoryBadge = (category) => {
    switch (category) {
      case "health":
        return <Badge bg="success">Health</Badge>;
      case "meeting":
        return <Badge bg="primary">Meeting</Badge>;
      case "training":
        return <Badge bg="info">Training</Badge>;
      case "environment":
        return <Badge bg="success">Environment</Badge>;
      case "social":
        return <Badge bg="warning">Social</Badge>;
      case "sports":
        return <Badge bg="danger">Sports</Badge>;
      default:
        return <Badge bg="secondary">General</Badge>;
    }
  };

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || event.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
  );

  // Handle add event
  const handleAddEvent = async (values, { resetForm }) => {
    try {
      setLoading(true);

      // Initialize with empty attendees
      const eventData = {
        ...values,
        attendees: [],
      };

      // Create event
      await eventService.create(eventData);

      // Refresh events
      fetchEvents();

      // Reset form and close modal
      resetForm();
      setShowAddModal(false);
      toast.success("Event added successfully");
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit event
  const handleEditEvent = async (values) => {
    try {
      setLoading(true);

      // Preserve attendees from selected event
      const eventData = {
        ...values,
        attendees: selectedEvent.attendees || [],
      };

      // Update event
      await eventService.update(selectedEvent.id, eventData);

      // Refresh events
      fetchEvents();

      // Close modal and clear selection
      setShowEditModal(false);
      setSelectedEvent(null);
      toast.success("Event updated successfully");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventService.delete(id);

        // Refresh events
        fetchEvents();
        toast.success("Event deleted successfully");
      } catch (error) {
        console.error("Error deleting event:", error);
        toast.error("Failed to delete event");
      }
    }
  };

  // Open edit modal
  const openEditModal = (event) => {
    // Format date for the date input
    const formattedEvent = {
      ...event,
      eventDate: event.eventDate ? event.eventDate.split("T")[0] : "",
    };
    setSelectedEvent(formattedEvent);
    setShowEditModal(true);
  };

  // Open attendees modal
  const openAttendeesModal = (event) => {
    setSelectedEvent(event);
    setShowAttendeesModal(true);
  };

  // Add attendee manually
  const handleAddAttendee = async (newAttendee) => {
    if (!newAttendee.id || !newAttendee.name) {
      toast.error("Resident ID and Name are required");
      return;
    }

    try {
      // Check if attendee already exists
      const exists = selectedEvent.attendees.some(
        (attendee) => attendee.id === newAttendee.id
      );

      if (exists) {
        toast.warning("This resident is already registered for this event");
        return;
      }

      // Register attendee
      await eventService.registerAttendee(selectedEvent.id, newAttendee);

      // Refresh events to get updated attendees
      await fetchEvents();

      // Update selected event with updated data
      const updatedEvent = await eventService.getById(selectedEvent.id);
      setSelectedEvent(updatedEvent.data);

      toast.success(`${newAttendee.name} added to attendees list`);
    } catch (error) {
      console.error("Error adding attendee:", error);
      toast.error("Failed to add attendee");
    }
  };

  // Remove attendee
  const handleRemoveAttendee = async (attendeeId) => {
    if (window.confirm("Are you sure you want to remove this attendee?")) {
      try {
        // Unregister attendee
        await eventService.unregisterAttendee(selectedEvent.id, attendeeId);

        // Refresh events
        await fetchEvents();

        // Update selected event
        const updatedEvent = await eventService.getById(selectedEvent.id);
        setSelectedEvent(updatedEvent.data);

        toast.success("Attendee removed successfully");
      } catch (error) {
        console.error("Error removing attendee:", error);
        toast.error("Failed to remove attendee");
      }
    }
  };

  // Send notification to attendees
  const handleSendNotification = () => {
    // In a real app, this would send notifications to attendees
    toast.info(
      `Sending notification to ${selectedEvent.attendees.length} attendees about "${selectedEvent.title}"`
    );
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Events Management</h2>

      <Row className="mb-4">
        <Col md={4}>
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

        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <FaFilter />
            </InputGroup.Text>
            <Form.Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="meeting">Meeting</option>
              <option value="health">Health</option>
              <option value="training">Training</option>
              <option value="environment">Environment</option>
              <option value="social">Social</option>
              <option value="sports">Sports</option>
            </Form.Select>
          </InputGroup>
        </Col>

        <Col md={4} className="text-md-end">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add Event
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {fetchingData ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Attendees</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents.length > 0 ? (
                  sortedEvents.map((event) => (
                    <tr key={event.id}>
                      <td>{event.title}</td>
                      <td>{new Date(event.eventDate).toLocaleDateString()}</td>
                      <td>{event.time}</td>
                      <td>{event.location}</td>
                      <td>{getCategoryBadge(event.category)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => openAttendeesModal(event)}
                        >
                          <FaUsers className="me-1" />{" "}
                          {event.attendees ? event.attendees.length : 0}
                        </Button>
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-1"
                          onClick={() => openEditModal(event)}
                          title="Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-3">
                      No events found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Event Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCalendarAlt className="me-2" /> Add New Event
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            title: "",
            description: "",
            category: "",
            eventDate: new Date().toISOString().split("T")[0],
            time: "",
            location: "",
          }}
          validationSchema={eventSchema}
          onSubmit={handleAddEvent}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Event Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.title && !!errors.title}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="category"
                        value={values.category}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.category && !!errors.category}
                      >
                        <option value="">Select Category</option>
                        <option value="meeting">Meeting</option>
                        <option value="health">Health</option>
                        <option value="training">Training</option>
                        <option value="environment">Environment</option>
                        <option value="social">Social</option>
                        <option value="sports">Sports</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.category}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="eventDate"
                        value={values.eventDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.eventDate && !!errors.eventDate}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.eventDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Time</Form.Label>
                      <Form.Control
                        type="text"
                        name="time"
                        value={values.time}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.time && !!errors.time}
                        placeholder="e.g., 9:00 AM - 12:00 PM"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.time}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={values.location}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.location && !!errors.location}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.location}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.description && !!errors.description}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Event"
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Edit Event Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaCalendarAlt className="me-2" /> Edit Event
          </Modal.Title>
        </Modal.Header>
        {selectedEvent && (
          <Formik
            initialValues={{
              title: selectedEvent.title || "",
              description: selectedEvent.description || "",
              category: selectedEvent.category || "",
              eventDate: selectedEvent.eventDate || "",
              time: selectedEvent.time || "",
              location: selectedEvent.location || "",
            }}
            validationSchema={eventSchema}
            onSubmit={handleEditEvent}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
            }) => (
              <Form onSubmit={handleSubmit}>
                <Modal.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Event Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={values.title}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.title && !!errors.title}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.title}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          name="category"
                          value={values.category}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.category && !!errors.category}
                        >
                          <option value="">Select Category</option>
                          <option value="meeting">Meeting</option>
                          <option value="health">Health</option>
                          <option value="training">Training</option>
                          <option value="environment">Environment</option>
                          <option value="social">Social</option>
                          <option value="sports">Sports</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.category}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Date</Form.Label>
                        <Form.Control
                          type="date"
                          name="eventDate"
                          value={values.eventDate}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.eventDate && !!errors.eventDate}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.eventDate}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Time</Form.Label>
                        <Form.Control
                          type="text"
                          name="time"
                          value={values.time}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.time && !!errors.time}
                          placeholder="e.g., 9:00 AM - 12:00 PM"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.time}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={values.location}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.location && !!errors.location}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.location}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="description"
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.description && !!errors.description}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.description}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Updating...
                      </>
                    ) : (
                      "Update Event"
                    )}
                  </Button>
                </Modal.Footer>
              </Form>
            )}
          </Formik>
        )}
      </Modal>

      {/* Attendees Modal */}
      <Modal
        show={showAttendeesModal}
        onHide={() => setShowAttendeesModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUsers className="me-2" /> Event Attendees
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <>
              <div className="mb-3">
                <h5>{selectedEvent.title}</h5>
                <p className="mb-2">
                  <FaCalendarAlt className="me-2 text-primary" />
                  {new Date(
                    selectedEvent.eventDate
                  ).toLocaleDateString()} | {selectedEvent.time}
                </p>
                <p className="mb-0">
                  <FaMapMarkerAlt className="me-2 text-danger" />
                  {selectedEvent.location}
                </p>
              </div>

              <Tabs defaultActiveKey="attendees" className="mb-3">
                <Tab eventKey="attendees" title="Attendees">
                  {selectedEvent.attendees &&
                  selectedEvent.attendees.length > 0 ? (
                    <ListGroup>
                      {selectedEvent.attendees.map((attendee) => (
                        <ListGroup.Item
                          key={attendee.id}
                          className="d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <div>
                              <strong>{attendee.name}</strong> ({attendee.id})
                            </div>
                            <div className="text-muted small">
                              {attendee.contactNumber || "No contact number"}
                            </div>
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveAttendee(attendee.id)}
                          >
                            Remove
                          </Button>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <p className="text-center text-muted">
                      No attendees registered yet
                    </p>
                  )}
                </Tab>

                <Tab eventKey="add" title="Add Attendee">
                  <Formik
                    initialValues={{
                      id: "",
                      name: "",
                      contactNumber: "",
                    }}
                    onSubmit={(values, { resetForm }) => {
                      handleAddAttendee(values);
                      resetForm();
                    }}
                  >
                    {({ values, handleChange, handleBlur, handleSubmit }) => (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Resident ID</Form.Label>
                          <Form.Control
                            type="text"
                            name="id"
                            value={values.id}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g., R-2023001"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Full Name"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Contact Number (Optional)</Form.Label>
                          <Form.Control
                            type="text"
                            name="contactNumber"
                            value={values.contactNumber}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="e.g., 09123456789"
                          />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                          <FaUserPlus className="me-2" /> Add Attendee
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </Tab>

                <Tab eventKey="notify" title="Notify Attendees">
                  <div className="p-3">
                    <p>
                      Send notification to all registered attendees about this
                      event. This will send an SMS or email based on the contact
                      information available.
                    </p>
                    <Button
                      variant="primary"
                      onClick={handleSendNotification}
                      disabled={
                        !selectedEvent.attendees ||
                        selectedEvent.attendees.length === 0
                      }
                    >
                      <FaEnvelope className="me-2" />
                      Send Notification to{" "}
                      {selectedEvent.attendees
                        ? selectedEvent.attendees.length
                        : 0}{" "}
                      Attendee(s)
                    </Button>
                    {(!selectedEvent.attendees ||
                      selectedEvent.attendees.length === 0) && (
                      <div className="text-muted mt-2">
                        No attendees to notify. Add attendees first.
                      </div>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAttendeesModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EventsManagement;
