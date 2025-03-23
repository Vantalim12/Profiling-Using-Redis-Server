// redis-frontend/src/pages/announcements/AnnouncementsList.js
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
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from "react-icons/fa";
import { announcementService } from "../../services/api";
import { toast } from "react-toastify";

const AnnouncementsList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State for the modal
  const [showModal, setShowModal] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState({
    id: "",
    title: "",
    category: "",
    type: "",
    content: "",
    date: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch announcements on component mount
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
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  // Handle modal open/close
  const handleClose = () => {
    setShowModal(false);
    setCurrentAnnouncement({
      id: "",
      title: "",
      category: "",
      type: "",
      content: "",
      date: "",
    });
    setIsEditing(false);
  };

  const handleShow = (announcement = null) => {
    if (announcement) {
      setCurrentAnnouncement(announcement);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
    setShowModal(true);
  };

  // Form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentAnnouncement((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create or update announcement
  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await announcementService.update(
          currentAnnouncement.id,
          currentAnnouncement
        );
        toast.success("Announcement updated successfully");
      } else {
        await announcementService.create(currentAnnouncement);
        toast.success("Announcement added successfully");
      }
      handleClose();
      fetchAnnouncements();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error("Failed to save announcement");
    }
  };

  // Delete announcement
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await announcementService.delete(id);
        toast.success("Announcement deleted successfully");
        fetchAnnouncements();
      } catch (error) {
        console.error("Error deleting announcement:", error);
        toast.error("Failed to delete announcement");
      }
    }
  };

  // Filter announcements based on search term
  const filteredAnnouncements = announcements.filter((announcement) => {
    return (
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Helper function to get badge color based on type
  const getBadgeVariant = (type) => {
    switch (type.toLowerCase()) {
      case "important":
        return "danger";
      case "warning":
        return "warning";
      case "information":
        return "info";
      default:
        return "secondary";
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Announcements Management</h2>
          <p className="text-muted">
            Create and manage announcements for residents
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
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-md-end">
          <Button variant="primary" onClick={() => handleShow()}>
            <FaPlus className="me-2" /> Add Announcement
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
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnouncements.length > 0 ? (
                  filteredAnnouncements.map((announcement) => (
                    <tr key={announcement.id}>
                      <td>{announcement.title}</td>
                      <td>
                        <Badge bg="secondary" pill>
                          {announcement.category}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getBadgeVariant(announcement.type)} pill>
                          {announcement.type}
                        </Badge>
                      </td>
                      <td>
                        {new Date(announcement.date).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-1"
                          onClick={() => handleShow(announcement)}
                          title="View/Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(announcement.id)}
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
                        ? "No announcements found matching your search"
                        : "No announcements found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Announcement Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Edit Announcement" : "Add New Announcement"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={currentAnnouncement.title}
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
                    value={currentAnnouncement.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Health">Health</option>
                    <option value="Events">Events</option>
                    <option value="Environment">Environment</option>
                    <option value="General">General</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={currentAnnouncement.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Important">Important</option>
                    <option value="Warning">Warning</option>
                    <option value="Information">Information</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="content"
                value={currentAnnouncement.content}
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
            {isEditing ? "Update" : "Save"} Announcement
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AnnouncementsList;
