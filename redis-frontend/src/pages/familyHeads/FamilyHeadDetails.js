// src/pages/familyHeads/FamilyHeadDetails.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import { familyHeadService } from "../../services/api";
import { toast } from "react-toastify";
import { FaEdit, FaArrowLeft, FaTrash, FaPlus } from "react-icons/fa";

const FamilyHeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [familyHead, setFamilyHead] = useState(null);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");

  // Fetch family head and members data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [headResponse, membersResponse] = await Promise.all([
          familyHeadService.getById(id),
          familyHeadService.getMembers(id),
        ]);
        setFamilyHead(headResponse.data);
        setMembers(membersResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load family head data");
        toast.error("Failed to load family head data");
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

  // Handle deletion of family head
  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this family head? This action cannot be undone."
      )
    ) {
      try {
        await familyHeadService.delete(id);
        toast.success("Family head deleted successfully");
        navigate("/dashboard/family-heads");
      } catch (error) {
        console.error("Error deleting family head:", error);
        toast.error(
          error.response?.data?.error || "Failed to delete family head"
        );
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
          onClick={() => navigate("/dashboard/family-heads")}
        >
          <FaArrowLeft className="me-2" /> Back to Family Heads
        </Button>
      </Container>
    );
  }

  if (!familyHead) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Family head not found</Alert>
        <Button
          variant="primary"
          onClick={() => navigate("/dashboard/family-heads")}
        >
          <FaArrowLeft className="me-2" /> Back to Family Heads
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Family Head Details</h2>
        <div>
          <Button
            variant="primary"
            className="me-2"
            as={Link}
            to={`/dashboard/family-heads/edit/${id}`}
          >
            <FaEdit className="me-2" /> Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <FaTrash className="me-2" /> Delete
          </Button>
        </div>
      </div>

      {/* Family Head Information */}
      <Card className="shadow-sm mb-4">
        <Card.Header>
          <h5 className="mb-0">Personal Information</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p>
                <strong>ID:</strong> {familyHead.id}
              </p>
              <p>
                <strong>Name:</strong> {familyHead.firstName}{" "}
                {familyHead.lastName}
              </p>
              <p>
                <strong>Gender:</strong> {familyHead.gender}
              </p>
              <p>
                <strong>Age:</strong> {calculateAge(familyHead.birthDate)} years
                old
              </p>
            </Col>
            <Col md={6}>
              <p>
                <strong>Birth Date:</strong>{" "}
                {new Date(familyHead.birthDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Address:</strong> {familyHead.address}
              </p>
              <p>
                <strong>Contact Number:</strong> {familyHead.contactNumber}
              </p>
              <p>
                <strong>Registration Date:</strong>{" "}
                {new Date(familyHead.registrationDate).toLocaleDateString()}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Family Members */}
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Family Members</h5>
          <Button
            variant="success"
            size="sm"
            as={Link}
            to="/dashboard/residents/add"
            state={{ familyHeadId: id }}
          >
            <FaPlus className="me-2" /> Add Member
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Birth Date</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length > 0 ? (
                members.map((member) => (
                  <tr key={member.id}>
                    <td>{member.id}</td>
                    <td>
                      {member.firstName} {member.lastName}
                    </td>
                    <td>{member.gender}</td>
                    <td>{calculateAge(member.birthDate)}</td>
                    <td>{new Date(member.birthDate).toLocaleDateString()}</td>
                    <td>
                      {new Date(member.registrationDate).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        as={Link}
                        to={`/dashboard/residents/view/${member.id}`}
                        variant="info"
                        size="sm"
                        className="me-1"
                      >
                        View
                      </Button>
                      <Button
                        as={Link}
                        to={`/dashboard/residents/edit/${member.id}`}
                        variant="primary"
                        size="sm"
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-3">
                    No family members found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => navigate("/dashboard/family-heads")}
        >
          <FaArrowLeft className="me-2" /> Back to Family Heads
        </Button>
      </div>
    </Container>
  );
};

export default FamilyHeadDetails;
