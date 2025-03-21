// src/pages/admin/AnnouncementsManagement.js
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

const AnnouncementsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [persistentAnnouncements, setPersistentAnnouncements] = useState([]);

  // Sample announcements data (in a real app, this would come from the API)
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "COVID-19 Vaccination Schedule",
      date: "2023-07-01",
      category: "health",
      type: "important",
      content:
        "The barangay will be conducting COVID-19 vaccination on July 15, 2023, from 8:00 AM to 5:00 PM at the Barangay Health Center. Booster shots are now available. Please bring your vaccination card and a valid ID.",
    },
    {
      id: 2,
      title: "Road Maintenance Advisory",
      date: "2023-07-05",
      category: "infrastructure",
      type: "warning",
      content:
        "Main Road will be closed for repairs from July 15 to July 20, 2023. Please use alternate routes during this period. The repair works will be conducted from 8:00 AM to 5:00 PM daily.",
    },
    {
      id: 3,
      title: "Community Clean-up Drive",
      date: "2023-07-08",
      category: "environment",
      type: "info",
      content:
        "Join us for our monthly community clean-up drive at the barangay plaza on July 10, 2023, from 7:00 AM to 10:00 AM. Please bring your own gloves and cleaning materials. Refreshments will be provided.",
    },
    {
      id: 4,
      title: "Free Medical Check-up",
      date: "2023-07-10",
      category: "health",
      type: "info",
      content:
        "Free health check-up for all barangay residents at the community center on July 15, 2023, from 9:00 AM to 3:00 PM. Services include blood pressure monitoring, blood sugar screening, and basic medical consultation.",
    },
    {
      id: 5,
      title: "Summer Sports Festival",
      date: "2023-07-12",
      category: "events",
      type: "info",
      content:
        "The Barangay Summer Sports Festival will be held from July 25 to August 5, 2023, at the Barangay Sports Complex. Registration is now open until July 20. Contact the Barangay Office for details.",
    },
  ]);

  // Store announcements in persistent state to prevent loss on refresh
  useEffect(() => {
    if (persistentAnnouncements.length === 0 && announcements.length > 0) {
      setPersistentAnnouncements(announcements);
    } else if (persistentAnnouncements.length > 0) {
      setAnnouncements(persistentAnnouncements);
    }
  }, [persistentAnnouncements]);

  // Validation schema for announcement form
  const announcementSchema = Yup.object({
    title: Yup.string().required("Title is required"),
    content: Yup.string().required("Content is required"),
    category: Yup.string().required("Category is required"),
    type: Yup.string().required("Type is required"),
    date: Yup.date().required("Date is required"),
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
  const handleAddAnnouncement = (values, { resetForm }) => {
    setLoading(true);

    // In a real app, this would be an API call
    setTimeout(() => {
      const newAnnouncement = {
        id: announcements.length + 1,
        ...values,
      };

      const updatedAnnouncements = [newAnnouncement, ...announcements];
      setAnnouncements(updatedAnnouncements);
      setPersistentAnnouncements(updatedAnnouncements);
      setLoading(false);
      setShowAddModal(false);
      resetForm();
      toast.success("Announcement added successfully");
    }, 1000);
  };

  // Handle edit announcement
  const handleEditAnnouncement = (values) => {
    setLoading(true);

    // In a real app, this would be an API call
    setTimeout(() => {
      const updatedAnnouncements = announcements.map((announcement) => {
        if (announcement.id === selectedAnnouncement.id) {
          return {
            ...announcement,
            ...values,
          };
        }
        return announcement;
      });

      setAnnouncements(updatedAnnouncements);
      setPersistentAnnouncements(updatedAnnouncements);
      setLoading(false);
      setShowEditModal(false);
      setSelectedAnnouncement(null);
      toast.success("Announcement updated successfully");
    }, 1000);
  };

  // Handle delete announcement
  const handleDeleteAnnouncement = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      // In a real app, this would be an API call
      const updatedAnnouncements = announcements.filter(
        (announcement) => announcement.id !== id
      );
      setAnnouncements(updatedAnnouncements);
      setPersistentAnnouncements(updatedAnnouncements);
      toast.success("Announcement deleted successfully");
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
                    <td>{new Date(announcement.date).toLocaleDateString()}</td>
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
            date: new Date().toISOString().split("T")[0],
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
            isSubmitting,
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

                  <Col md={4}>
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
              date: selectedAnnouncement.date,
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
              isSubmitting,
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

                    <Col md={4}>
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
