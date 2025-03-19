// src/pages/residents/ResidentDetails.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { residentService, familyHeadService } from "../../services/api";
import { toast } from "react-toastify";
import { FaEdit, FaArrowLeft, FaTrash, FaUserFriends } from "react-icons/fa";

const ResidentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState(null);
  const [familyHead, setFamilyHead] = useState(null);
  const [error, setError] = useState("");

  // Fetch resident data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await residentService.getById(id);
        setResident(response.data);

        // If resident belongs to a family, fetch family head data
        if (response.data.familyHeadId) {
          const headResponse = await familyHeadService.getById(
            response.data.familyHeadId
          );
          setFamilyHead(headResponse.data);
        }
      } catch (error) {
        console.error("Error fetching resident:", error);
        setError("Failed to load resident data");
        toast.error("Failed to load resident data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Calculate age from birthdate
  const calculateAge = (birthDate) => {
    const dob = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Handle deletion
  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this resident? This action cannot be undone."
      )
    ) {
      try {
        await residentService.delete(id);
        toast.success("Resident deleted successfully");
        navigate("/dashboard/residents");
      } catch (error) {
        console.error("Error deleting resident:", error);
        toast.error(error.response?.data?.error || "Failed to delete resident");
      }
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard/residents")}
        >
          <FaArrowLeft className="me-2" /> Back to Residents
        </Button>
      </Container>
    );
  }

  if (!resident) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Resident not found</Alert>
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard/residents")}
        >
          <FaArrowLeft className="me-2" /> Back to Residents
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Resident Details</h2>
        <div>
          <Button
            variant="primary"
            className="me-2"
            as={Link}
            to={`/dashboard/residents/edit/${id}`}
          >
            <FaEdit className="me-2" /> Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <FaTrash className="me-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Resident Information */}
      <Card className="shadow-sm mb-4">
        <Card.Header>
          <h5 className="mb-0">Personal Information</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p>
                <strong>ID:</strong> {resident.id}
              </p>
              <p>
                <strong>Name:</strong> {resident.firstName} {resident.lastName}
              </p>
              <p>
                <strong>Gender:</strong> {resident.gender}
              </p>
              <p>
                <strong>Age:</strong> {calculateAge(resident.birthDate)} years
                old
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Birth Date:</strong>{" "}
                {new Date(resident.birthDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Address:</strong> {resident.address}
              </p>
              <p>
                <strong>Contact Number:</strong>{" "}
                {resident.contactNumber || "Not specified"}
              </p>
              <p>
                <strong>Registration Date:</strong>{" "}
                {new Date(resident.registrationDate).toLocaleDateString()}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Family Information */}
      {familyHead && (
        <Card className="shadow-sm mb-4">
          <Card.Header>
            <h5 className="mb-0">Family Information</h5>
          </Card.Header>
          <Card.Body>
            <p>
              <strong>Family Head:</strong> {familyHead.firstName}{" "}
              {familyHead.lastName} ({familyHead.id})
            </p>
            <p>
              <strong>Family Address:</strong> {familyHead.address}
            </p>
            <p>
              <strong>Family Head Contact:</strong> {familyHead.contactNumber}
            </p>
            <div className="mt-3">
              <Button
                variant="outline-primary"
                as={Link}
                to={`/dashboard/family-heads/view/${familyHead.id}`}
              >
                <FaUserFriends className="me-2" /> View Family Details
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => navigate("/dashboard/residents")}
        >
          <FaArrowLeft className="me-2" /> Back to Residents
        </Button>
      </div>
    </Container>
  );
};

export default ResidentDetails;
