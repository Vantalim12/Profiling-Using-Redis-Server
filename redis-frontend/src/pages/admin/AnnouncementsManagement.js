// src/pages/admin/AnnouncementsManagement.js - FIXED VERSION
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
} from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaBullhorn,
  FaPlus,
  FaFilter,
  FaCalendarAlt,
  FaEye,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { announcementService } from "../../services/api";

const AnnouncementsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setFetchingData(true);
      const response = await announcementService.getAll();
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setFetchingData(false);
    }
  };

  // Validation schema for announcement form
  const announcementSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    content: Yup.string().required("Content is required"),
    category: Yup.string().required("Category is required"),
    type: Yup.string().required("Type is required"),
  });

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

  // Get type badge
  const getTypeBadge = (type) => {
    switch (type) {
      case "important":
        return <Badge bg="danger">Important</Badge>;
      case "warning":
        return <Badge bg="warning">Warning</Badge>;
      case "info":
        return <Badge bg="info">Information</Badge>;
      default:
        return <Badge bg="secondary">General</Badge>;
    }
  };

  // Filter announcements
  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || announcement.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort by date (newest first)
  const sortedAnnouncements = [...filteredAnnouncements].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Handle add announcement
  const handleAddAnnouncement = async (values, { resetForm }) => {
    try {
      setLoading(true);

      // Add current date to values
      const announcementData = {
        ...values,
        date: new Date().toISOString(),
      };

      // Create announcement
      await announcementService.create(announcementData);

      // Refresh announcements
      fetchAnnouncements();

      // Reset form and close modal
      resetForm();
      setShowAddModal(false);
      toast.success("Announcement added successfully");
    } catch (error) {
      console.error("Error adding announcement:", error);
      toast.error("Failed to add announcement");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit announcement
  const handleEditAnnouncement = async (values) => {
    try {
      setLoading(true);

      // Update announcement
      await announcementService.update(selectedAnnouncement.id, values);

      // Refresh announcements
      fetchAnnouncements();

      // Close modal
      setShowEditModal(false);
      setSelectedAnnouncement(null);
      toast.success("Announcement updated successfully");
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast.error("Failed to update announcement");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete announcement
  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await announcementService.delete(id);

        // Refresh announcements
        fetchAnnouncements();
        toast.success("Announcement deleted successfully");
      } catch (error) {
        console.error("Error deleting announcement:", error);
        toast.error("Failed to delete announcement");
      }
    }
  };

  // Open edit modal
  const openEditModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowEditModal(true);
  };

  // Open view modal
  const openViewModal = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Announcements Management</h2>

      <Row className="mb-4">
        <Col md={4}>
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
              <option value="health">Health</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="environment">Environment</option>
              <option value="events">Events</option>
            </Form.Select>
          </InputGroup>
        </Col>

        <Col md={4} className="text-md-end">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Add Announcement
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
                  <th>Category</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAnnouncements.length > 0 ? (
                  sortedAnnouncements.map((announcement) => (
                    <tr key={announcement.id}>
                      <td>{announcement.title}</td>
                      <td>{getCategoryBadge(announcement.category)}</td>
                      <td>{getTypeBadge(announcement.type)}</td>
                      <td>
                        {new Date(announcement.date).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-1"
                          onClick={() => openViewModal(announcement)}
                          title="View"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-1"
                          onClick={() => openEditModal(announcement)}
                          title="Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleDeleteAnnouncement(announcement.id)
                          }
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
                      No announcements found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Announcement Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBullhorn className="me-2" /> Add New Announcement
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            title: "",
            content: "",
            category: "",
            type: "",
          }}
          validationSchema={announcementSchema}
          onSubmit={handleAddAnnouncement}
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
                  <Form.Label>Title</Form.Label>
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
                  <Col md={6}>
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
                        <option value="health">Health</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="environment">Environment</option>
                        <option value="events">Events</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.category}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Type</Form.Label>
                      <Form.Select
                        name="type"
                        value={values.type}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.type && !!errors.type}
                      >
                        <option value="">Select Type</option>
                        <option value="important">Important</option>
                        <option value="warning">Warning</option>
                        <option value="info">Information</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.type}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="content"
                    value={values.content}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.content && !!errors.content}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.content}
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
                    "Save Announcement"
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Edit Announcement Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBullhorn className="me-2" /> Edit Announcement
          </Modal.Title>
        </Modal.Header>
        {selectedAnnouncement && (
          <Formik
            initialValues={{
              title: selectedAnnouncement.title,
              content: selectedAnnouncement.content,
              category: selectedAnnouncement.category,
              type: selectedAnnouncement.type,
            }}
            validationSchema={announcementSchema}
            onSubmit={handleEditAnnouncement}
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
                    <Form.Label>Title</Form.Label>
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
                    <Col md={6}>
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
                          <option value="health">Health</option>
                          <option value="infrastructure">Infrastructure</option>
                          <option value="environment">Environment</option>
                          <option value="events">Events</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.category}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Form.Select
                          name="type"
                          value={values.type}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.type && !!errors.type}
                        >
                          <option value="">Select Type</option>
                          <option value="important">Important</option>
                          <option value="warning">Warning</option>
                          <option value="info">Information</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.type}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Content</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="content"
                      value={values.content}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.content && !!errors.content}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.content}
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
                      "Update Announcement"
                    )}
                  </Button>
                </Modal.Footer>
              </Form>
            )}
          </Formik>
        )}
      </Modal>

      {/* View Announcement Modal */}
      <Modal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaBullhorn className="me-2" /> View Announcement
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAnnouncement && (
            <>
              <h4>{selectedAnnouncement.title}</h4>
              <div className="d-flex align-items-center mb-3">
                <FaCalendarAlt className="text-primary me-2" />
                <span>
                  {new Date(selectedAnnouncement.date).toLocaleDateString()}
                </span>
                <span className="mx-2">|</span>
                {getCategoryBadge(selectedAnnouncement.category)}
                <span className="mx-2">|</span>
                {getTypeBadge(selectedAnnouncement.type)}
              </div>
              <hr />
              <div className="announcement-content">
                {selectedAnnouncement.content
                  .split("\n")
                  .map((paragraph, idx) =>
                    paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                  )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
          {selectedAnnouncement && (
            <Button
              variant="primary"
              onClick={() => {
                setShowViewModal(false);
                openEditModal(selectedAnnouncement);
              }}
            >
              <FaEdit className="me-2" /> Edit
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AnnouncementsManagement;
