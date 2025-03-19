// src/pages/residents/Events.js
import React, { useState } from "react";
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
} from "react-bootstrap";
import {
  FaSearch,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUserFriends,
  FaFilter,
} from "react-icons/fa";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");

  // Sample events data
  const events = [
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
  ];

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

  return (
    <Container>
      <h2 className="mb-4">Events Calendar</h2>

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

                      <div className="d-flex align-items-center">
                        <FaMapMarkerAlt className="text-danger me-2" />
                        <span>{event.location}</span>
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <Button variant="outline-primary" size="sm">
                        <FaUserFriends className="me-2" /> Register to Attend
                      </Button>
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
          <p className="small text-muted mb-0">
            * Calendar dates with events are highlighted
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Events;
