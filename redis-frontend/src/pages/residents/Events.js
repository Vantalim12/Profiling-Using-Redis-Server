// src/pages/residents/Events.js - FIXED VERSION
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  InputGroup,
  Table,
  Modal,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaSearch,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUserFriends,
  FaFilter,
  FaCheck,
  FaUserPlus,
  FaRegCalendarCheck,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { eventService } from "../../services/api";

const Events = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  // Fetch events and user registrations on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Find user registrations whenever events change or user changes
  useEffect(() => {
    if (currentUser?.residentId && events.length > 0) {
      findUserRegistrations();
    }
  }, [events, currentUser]);

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

  // Find and set user registrations
  const findUserRegistrations = () => {
    const userAttendances = [];
    events.forEach((event) => {
      if (event.attendees) {
        const isRegistered = event.attendees.some(
          (attendee) => attendee.id === currentUser.residentId
        );
        if (isRegistered) {
          userAttendances.push({
            eventId: event.id,
            title: event.title,
            date: event.eventDate,
            time: event.time,
            category: event.category,
          });
        }
      }
    });
    setMyRegistrations(userAttendances);
  };

  // Get unique months from events
  const months = [
    ...new Set(
      events.map((event) => {
        const date = new Date(event.eventDate);
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      })
    ),
  ];

  // Filter events based on search term and month
  const filteredEvents = events.filter((event) => {
    if (!event.eventDate) return false;

    const eventDate = new Date(event.eventDate);
    const eventMonth = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}`;

    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth === "all" || eventMonth === filterMonth;

    return matchesSearch && matchesMonth;
  });

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
  );

  // Group events by month
  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const date = new Date(event.eventDate);
    const monthYear = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }

    groups[monthYear].push(event);
    return groups;
  }, {});

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

  // Open registration modal
  const openRegistrationModal = (event) => {
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  // Check if user is registered for an event
  const isRegisteredForEvent = (eventId) => {
    return myRegistrations.some((reg) => reg.eventId === eventId);
  };

  // Handle event registration
  const handleRegisterForEvent = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to register for events");
      return;
    }

    try {
      setRegistering(true);

      // Check if already registered
      const isAlreadyRegistered =
        selectedEvent.attendees &&
        selectedEvent.attendees.some(
          (attendee) => attendee.id === currentUser.residentId
        );

      if (isAlreadyRegistered) {
        toast.warning("You are already registered for this event");
        setRegistering(false);
        return;
      }

      // Add user to attendees
      const newAttendee = {
        id: currentUser.residentId,
        name: currentUser.name,
        contactNumber: "", // We could store this in the user profile
      };

      // Register attendee
      await eventService.registerAttendee(selectedEvent.id, newAttendee);

      // Refresh events
      await fetchEvents();

      toast.success("You have successfully registered for this event");
      setShowRegistrationModal(false);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Failed to register for the event. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  // Cancel registration
  const handleCancelRegistration = async (eventId) => {
    if (
      window.confirm(
        "Are you sure you want to cancel your registration for this event?"
      )
    ) {
      try {
        setLoading(true);

        // Unregister attendee
        await eventService.unregisterAttendee(eventId, currentUser.residentId);

        // Refresh events
        await fetchEvents();

        toast.success("Your registration has been canceled");
      } catch (error) {
        console.error("Cancellation error:", error);
        toast.error("Failed to cancel registration. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container>
      <h2 className="mb-4">Events Calendar</h2>

      {/* My Registrations */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">My Event Registrations</h5>
          <Badge bg="light" text="dark">
            {myRegistrations.length}
          </Badge>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" size="sm" />
            </div>
          ) : myRegistrations.length > 0 ? (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myRegistrations.map((registration) => {
                  const event = events.find(
                    (e) => e.id === registration.eventId
                  );
                  return (
                    <tr key={registration.eventId}>
                      <td>{registration.title}</td>
                      <td>
                        {new Date(registration.date).toLocaleDateString()}
                      </td>
                      <td>{registration.time}</td>
                      <td>{getCategoryBadge(registration.category)}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleCancelRegistration(registration.eventId)
                          }
                          disabled={loading}
                        >
                          Cancel Registration
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="p-4 text-center">
              <p className="mb-0 text-muted">
                You haven't registered for any events yet.
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

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

        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaFilter />
            </InputGroup.Text>
            <Form.Select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="all">All Months</option>
              {months.map((month) => {
                const date = new Date(`${month}-01`);
                return (
                  <option key={month} value={month}>
                    {date.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </option>
                );
              })}
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading events...</p>
        </div>
      ) : Object.entries(groupedEvents).length > 0 ? (
        Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
          <div key={monthYear} className="mb-4">
            <h4 className="border-bottom pb-2 mb-3">
              <FaCalendarAlt className="me-2" /> {monthYear}
            </h4>

            <Row>
              {monthEvents.map((event) => (
                <Col lg={6} key={event.id} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">{event.title}</h5>
                      {getCategoryBadge(event.category)}
                    </Card.Header>
                    <Card.Body>
                      <p>{event.description}</p>

                      <div className="d-flex align-items-center mb-2">
                        <FaCalendarAlt className="text-primary me-2" />
                        <span>
                          {new Date(event.eventDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      <div className="d-flex align-items-center mb-2">
                        <FaClock className="text-success me-2" />
                        <span>{event.time}</span>
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <FaMapMarkerAlt className="text-danger me-2" />
                        <span>{event.location}</span>
                      </div>

                      <div className="d-flex align-items-center text-muted mb-3">
                        <FaUserFriends className="me-2" />
                        <span>
                          {event.attendees ? event.attendees.length : 0} people
                          registered
                        </span>
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      {isRegisteredForEvent(event.id) ? (
                        <Button variant="success" className="w-100" disabled>
                          <FaCheck className="me-2" /> Registered
                        </Button>
                      ) : (
                        <Button
                          variant="outline-primary"
                          className="w-100"
                          onClick={() => openRegistrationModal(event)}
                        >
                          <FaUserPlus className="me-2" /> Register to Attend
                        </Button>
                      )}
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ))
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <h5 className="text-muted mb-3">No events found</h5>
            <p className="text-muted mb-0">
              There are no upcoming events matching your search criteria.
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Event Registration Modal */}
      <Modal
        show={showRegistrationModal}
        onHide={() => setShowRegistrationModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaRegCalendarCheck className="me-2" /> Event Registration
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEvent && (
            <>
              <h5>{selectedEvent.title}</h5>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaCalendarAlt className="text-primary me-2" />
                  <span>
                    {new Date(selectedEvent.eventDate).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <FaClock className="text-success me-2" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <FaMapMarkerAlt className="text-danger me-2" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>

              <Alert variant="info">
                <p className="mb-0">
                  <strong>Your registration information:</strong>
                </p>
                <p className="mb-0">Name: {currentUser?.name}</p>
                <p className="mb-0">Resident ID: {currentUser?.residentId}</p>
              </Alert>

              <p className="mb-0">
                By registering, you confirm your attendance to this event. The
                barangay may contact you with updates or reminders about this
                event.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRegistrationModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRegisterForEvent}
            disabled={registering}
          >
            {registering ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Registering...
              </>
            ) : (
              "Confirm Registration"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Events;
