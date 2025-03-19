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
} from "react-bootstrap";
import { FaPlus, FaEdit, FaEye, FaTrash, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { familyHeadService } from "../../services/api";
import { toast } from "react-toastify";

const FamilyHeadsList = () => {
  const [familyHeads, setFamilyHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFamilyHeads();
  }, []);

  const fetchFamilyHeads = async () => {
    try {
      setLoading(true);
      const response = await familyHeadService.getAll();
      setFamilyHeads(response.data);
    } catch (error) {
      console.error("Error fetching family heads:", error);
      toast.error("Failed to load family heads");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this family head?")) {
      try {
        await familyHeadService.delete(id);
        toast.success("Family head deleted successfully");
        fetchFamilyHeads();
      } catch (error) {
        console.error("Error deleting family head:", error);
        toast.error(
          error.response?.data?.error || "Failed to delete family head"
        );
      }
    }
  };

  const filteredFamilyHeads = familyHeads.filter((head) => {
    const fullName = `${head.firstName} ${head.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      head.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      head.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Family Heads</h2>
          <p className="text-muted">Manage family head records</p>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by name, ID, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="text-md-end">
          <Button as={Link} to="/dashboard/family-heads/add" variant="primary">
            <FaPlus className="me-2" /> Add New Family Head
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
                  <th>ID</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Address</th>
                  <th>Contact Number</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFamilyHeads.length > 0 ? (
                  filteredFamilyHeads.map((head) => (
                    <tr key={head.id}>
                      <td>{head.id}</td>
                      <td>{`${head.firstName} ${head.lastName}`}</td>
                      <td>{head.gender}</td>
                      <td>{head.address}</td>
                      <td>{head.contactNumber}</td>
                      <td>
                        {new Date(head.registrationDate).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          as={Link}
                          to={`/dashboard/family-heads/view/${head.id}`}
                          variant="info"
                          size="sm"
                          className="me-1"
                          title="View Details"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          as={Link}
                          to={`/dashboard/family-heads/edit/${head.id}`}
                          variant="primary"
                          size="sm"
                          className="me-1"
                          title="Edit"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          title="Delete"
                          onClick={() => handleDelete(head.id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-3">
                      {searchTerm
                        ? "No family heads found matching your search"
                        : "No family heads found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FamilyHeadsList;
