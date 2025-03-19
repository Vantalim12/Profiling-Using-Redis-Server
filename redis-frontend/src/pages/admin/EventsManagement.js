// src/pages/admin/EventsManagement.js
import React, { useState } from "react";
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
} from "react-icons/fa";
import { toast } from "react-toastify";

const EventsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Sample events data (in a real app, this would come from the API)
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
    },
  ]);

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
      };

      setEvents([...events, newEvent]);
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
      toast.success("Event deleted successfully");
    }
  };

  // Open edit modal
  const openEditModal = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
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
                        variant="primary"
                        size="sm"
                        className="me-1"
                        onClick={() => openEditModal(event)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-3">
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
    </Container>
  );
};

export default EventsManagement;
