// src/pages/residents/Events.js
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

const Events = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Initialize events and find user registrations
  useEffect(() => {
    setLoading(true);

    // On first load, store events in persistent state
    if (persistentEvents.length === 0 && events.length > 0) {
      setPersistentEvents(events);
    } else if (persistentEvents.length > 0) {
      setEvents(persistentEvents);
    }

    // Find user registrations
    if (currentUser?.residentId) {
      const userAttendances = [];
      events.forEach((event) => {
        const isRegistered = event.attendees.some(
          (attendee) => attendee.id === currentUser.residentId
        );
        if (isRegistered) {
          userAttendances.push({
            eventId: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            category: event.category,
          });
        }
      });
      setMyRegistrations(userAttendances);
    }

    setLoading(false);
  }, [currentUser, persistentEvents]);

  // Get unique months from events
  const months = [
    ...new Set(
      events.map((event) => {
        const date = new Date(event.date);
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      })
    ),
  ];

  // Filter events based on search term and month
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const eventMonth = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}`;

    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth === "all" || eventMonth === filterMonth;

    return matchesSearch && matchesMonth;
  });

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Group events by month
  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const date = new Date(event.date);
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

      // Simulate API request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if already registered
      const isAlreadyRegistered = selectedEvent.attendees.some(
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

      // Update events state
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

      // Update myRegistrations
      setMyRegistrations([
        ...myRegistrations,
        {
          eventId: selectedEvent.id,
          title: selectedEvent.title,
          date: selectedEvent.date,
          time: selectedEvent.time,
          category: selectedEvent.category,
        },
      ]);

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

        // Simulate API request
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update events state
        const updatedEvents = events.map((event) => {
          if (event.id === eventId) {
            return {
              ...event,
              attendees: event.attendees.filter(
                (attendee) => attendee.id !== currentUser.residentId
              ),
            };
          }
          return event;
        });

        setEvents(updatedEvents);
        setPersistentEvents(updatedEvents);

        // Update myRegistrations
        setMyRegistrations(
          myRegistrations.filter((reg) => reg.eventId !== eventId)
        );

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

      {Object.entries(groupedEvents).length > 0 ? (
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
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
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
                        <span>{event.attendees.length} people registered</span>
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
                    {new Date(selectedEvent.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
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

      {/* Calendar View Section */}
      <Card className="shadow-sm mt-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Calendar View</h5>
        </Card.Header>
        <Card.Body>
          <Table responsive bordered className="text-center">
            <thead className="bg-light">
              <tr>
                <th>Sun</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
                <th>Sat</th>
              </tr>
            </thead>
            <tbody>
              {/* In a real application, you would generate a calendar based on the current month */}
              <tr>
                <td className="text-muted">25</td>
                <td className="text-muted">26</td>
                <td className="text-muted">27</td>
                <td className="text-muted">28</td>
                <td className="text-muted">29</td>
                <td className="text-muted">30</td>
                <td>1</td>
              </tr>
              <tr>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>7</td>
                <td>8</td>
              </tr>
              <tr>
                <td>9</td>
                <td>10</td>
                <td>11</td>
                <td>12</td>
                <td>13</td>
                <td>14</td>
                <td className="bg-primary text-white">15*</td>
              </tr>
              <tr>
                <td>16</td>
                <td>17</td>
                <td>18</td>
                <td>19</td>
                <td>20</td>
                <td>21</td>
                <td className="bg-success text-white">22*</td>
              </tr>
              <tr>
                <td>23</td>
                <td>24</td>
                <td>25</td>
                <td>26</td>
                <td>27</td>
                <td>28</td>
                <td>29</td>
              </tr>
              <tr>
                <td>30</td>
                <td>31</td>
                <td className="text-muted">1</td>
                <td className="text-muted">2</td>
                <td className="text-muted">3</td>
                <td className="text-muted">4</td>
                <td className="bg-info text-white text-muted">5*</td>
              </tr>
            </tbody>
          </Table>
          <div className="d-flex align-items-center mt-2">
            <div className="me-3">
              <span className="badge bg-primary">*</span> Barangay Assembly
              Meeting
            </div>
            <div className="me-3">
              <span className="badge bg-success">*</span> Health and Wellness
              Day
            </div>
            <div>
              <span className="badge bg-info">*</span> Livelihood Training
              Workshop
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Events;
