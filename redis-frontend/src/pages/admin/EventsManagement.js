// src/pages/admin/EventsManagement.js
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

const EventsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [persistentEvents, setPersistentEvents] = useState([]);

  // Sample events data
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Barangay Assembly Meeting",
      date: "2023-07-15",
      time: "09:00 AM - 12:00 PM",
      location: "Barangay Hall",
      category: "meeting",
      description:
        "Quarterly barangay assembly meeting to discuss community issues and upcoming projects.",
      attendees: [
        { id: "R-2023001", name: "John Doe", contactNumber: "09123456789" },
        { id: "R-2023002", name: "Jane Smith", contactNumber: "09234567890" },
      ],
    },
    {
      id: 2,
      title: "Health and Wellness Day",
      date: "2023-07-22",
      time: "08:00 AM - 04:00 PM",
      location: "Barangay Health Center",
      category: "health",
      description:
        "Free medical check-ups and consultations. Services include blood pressure monitoring, blood sugar screening, dental check-up, and eye examination.",
      attendees: [
        { id: "R-2023001", name: "John Doe", contactNumber: "09123456789" },
        {
          id: "R-2023003",
          name: "Robert Johnson",
          contactNumber: "09345678901",
        },
        {
          id: "R-2023004",
          name: "Sarah Williams",
          contactNumber: "09456789012",
        },
      ],
    },
    {
      id: 3,
      title: "Livelihood Training Workshop",
      date: "2023-08-05",
      time: "01:00 PM - 05:00 PM",
      location: "Barangay Multi-purpose Hall",
      category: "training",
      description:
        "Basic entrepreneurship skills training and product development workshop. Registration required.",
      attendees: [],
    },
    {
      id: 4,
      title: "Community Clean-up Drive",
      date: "2023-08-12",
      time: "07:00 AM - 10:00 AM",
      location: "Barangay Plaza",
      category: "environment",
      description:
        "Monthly community clean-up drive. Please bring your own gloves and cleaning materials.",
      attendees: [
        { id: "R-2023002", name: "Jane Smith", contactNumber: "09234567890" },
      ],
    },
    {
      id: 5,
      title: "Senior Citizens' Day",
      date: "2023-08-20",
      time: "02:00 PM - 05:00 PM",
      location: "Barangay Senior Citizens Center",
      category: "social",
      description:
        "Special program for senior citizens including health talks, games, and distribution of benefits.",
      attendees: [],
    },
    {
      id: 6,
      title: "Youth Sports Tournament",
      date: "2023-09-02",
      time: "08:00 AM - 05:00 PM",
      location: "Barangay Sports Complex",
      category: "sports",
      description:
        "Basketball and volleyball tournament for barangay youth. Registration is open until August 25.",
      attendees: [],
    },
  ]);

  // Store events in state to persist them
  useEffect(() => {
    if (persistentEvents.length === 0 && events.length > 0) {
      setPersistentEvents(events);
    } else {
      setEvents(persistentEvents);
    }
  }, [persistentEvents]);

  // Validation schema for event form
  const eventSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
    category: Yup.string().required("Category is required"),
    date: Yup.date().required("Date is required"),
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
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || event.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Handle add event
  const handleAddEvent = (values, { resetForm }) => {
    setLoading(true);

    // In a real app, this would be an API call
    setTimeout(() => {
      const newEvent = {
        id: events.length + 1,
        ...values,
        attendees: [], // Initialize with empty attendees list
      };

      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      setPersistentEvents(updatedEvents);
      setLoading(false);
      setShowAddModal(false);
      resetForm();
      toast.success("Event added successfully");
    }, 1000);
  };

  // Handle edit event
  const handleEditEvent = (values) => {
    setLoading(true);

    // In a real app, this would be an API call
    setTimeout(() => {
      const updatedEvents = events.map((event) => {
        if (event.id === selectedEvent.id) {
          return {
            ...event,
            ...values,
          };
        }
        return event;
      });

      setEvents(updatedEvents);
      setPersistentEvents(updatedEvents);
      setLoading(false);
      setShowEditModal(false);
      setSelectedEvent(null);
      toast.success("Event updated successfully");
    }, 1000);
  };

  // Handle delete event
  const handleDeleteEvent = (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      // In a real app, this would be an API call
      const updatedEvents = events.filter((event) => event.id !== id);
      setEvents(updatedEvents);
      setPersistentEvents(updatedEvents);
      toast.success("Event deleted successfully");
    }
  };

  // Open edit modal
  const openEditModal = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  // Open attendees modal
  const openAttendeesModal = (event) => {
    setSelectedEvent(event);
    setShowAttendeesModal(true);
  };

  // Add attendee manually
  const handleAddAttendee = (newAttendee) => {
    if (!newAttendee.id || !newAttendee.name) {
      toast.error("Resident ID and Name are required");
      return;
    }

    // Check if attendee already exists
    const exists = selectedEvent.attendees.some(
      (attendee) => attendee.id === newAttendee.id
    );
    if (exists) {
      toast.warning("This resident is already registered for this event");
      return;
    }

    // In a real app, this would validate the resident exists
    const updatedEvents = events.map((event) => {
      if (event.id === selectedEvent.id) {
        return {
          ...event,
          attendees: [...event.attendees, newAttendee],
        };
      }
      return event;
    });

    setEvents(updatedEvents);
    setPersistentEvents(updatedEvents);
    setSelectedEvent({
      ...selectedEvent,
      attendees: [...selectedEvent.attendees, newAttendee],
    });
    toast.success(`${newAttendee.name} added to attendees list`);
  };

  // Remove attendee
  const handleRemoveAttendee = (attendeeId) => {
    if (window.confirm("Are you sure you want to remove this attendee?")) {
      const updatedEvents = events.map((event) => {
        if (event.id === selectedEvent.id) {
          return {
            ...event,
            attendees: event.attendees.filter(
              (attendee) => attendee.id !== attendeeId
            ),
          };
        }
        return event;
      });

      setEvents(updatedEvents);
      setPersistentEvents(updatedEvents);
      setSelectedEvent({
        ...selectedEvent,
        attendees: selectedEvent.attendees.filter(
          (attendee) => attendee.id !== attendeeId
        ),
      });
      toast.success("Attendee removed successfully");
    }
  };

  // Send notification to attendees
  const handleSendNotification = () => {
    toast.info(
      `Sending notification to ${selectedEvent.attendees.length} attendees about "${selectedEvent.title}"`
    );
    // In a real app, this would send notifications to attendees
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
                    <td>{new Date(event.date).toLocaleDateString()}</td>
                    <td>{event.time}</td>
                    <td>{event.location}</td>
                    <td>{getCategoryBadge(event.category)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openAttendeesModal(event)}
                      >
                        <FaUsers className="me-1" /> {event.attendees.length}
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
            date: new Date().toISOString().split("T")[0],
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
            isSubmitting,
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
                        name="date"
                        value={values.date}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.date && !!errors.date}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.date}
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
              title: selectedEvent.title,
              description: selectedEvent.description,
              category: selectedEvent.category,
              date: selectedEvent.date,
              time: selectedEvent.time,
              location: selectedEvent.location,
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
              isSubmitting,
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
                          name="date"
                          value={values.date}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.date && !!errors.date}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.date}
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
                  {new Date(selectedEvent.date).toLocaleDateString()} |{" "}
                  {selectedEvent.time}
                </p>
                <p className="mb-0">
                  <FaMapMarkerAlt className="me-2 text-danger" />
                  {selectedEvent.location}
                </p>
              </div>

              <Tabs defaultActiveKey="attendees" className="mb-3">
                <Tab eventKey="attendees" title="Attendees">
                  {selectedEvent.attendees.length > 0 ? (
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
                    {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                      handleSubmit,
                    }) => (
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
                      disabled={selectedEvent.attendees.length === 0}
                    >
                      <FaEnvelope className="me-2" />
                      Send Notification to {selectedEvent.attendees.length}{" "}
                      Attendee(s)
                    </Button>
                    {selectedEvent.attendees.length === 0 && (
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
