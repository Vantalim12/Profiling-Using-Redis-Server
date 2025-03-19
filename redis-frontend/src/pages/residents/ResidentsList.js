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
import { residentService } from "../../services/api";
import { toast } from "react-toastify";

const ResidentsList = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const response = await residentService.getAll();
      setResidents(response.data);
    } catch (error) {
      console.error("Error fetching residents:", error);
      toast.error("Failed to load residents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this resident?")) {
      try {
        await residentService.delete(id);
        toast.success("Resident deleted successfully");
        fetchResidents();
      } catch (error) {
        console.error("Error deleting resident:", error);
        toast.error(error.response?.data?.error || "Failed to delete resident");
      }
    }
  };

  const filteredResidents = residents.filter((resident) => {
    const fullName = `${resident.firstName} ${resident.lastName}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      resident.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Residents</h2>
          <p className="text-muted">Manage resident records</p>
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
          <Button as={Link} to="/dashboard/residents/add" variant="primary">
            <FaPlus className="me-2" /> Add New Resident
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
                  <th>Family Head</th>
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.length > 0 ? (
                  filteredResidents.map((resident) => (
                    <tr key={resident.id}>
                      <td>{resident.id}</td>
                      <td>{`${resident.firstName} ${resident.lastName}`}</td>
                      <td>{resident.gender}</td>
                      <td>{resident.address}</td>
                      <td>{resident.familyHeadId || "N/A"}</td>
                      <td>
                        {new Date(
                          resident.registrationDate
                        ).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          as={Link}
                          to={`/dashboard/residents/view/${resident.id}`}
                          variant="info"
                          size="sm"
                          className="me-1"
                          title="View Details"
                        >
                          <FaEye />
                        </Button>
                        <Button
                          as={Link}
                          to={`/dashboard/residents/edit/${resident.id}`}
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
                          onClick={() => handleDelete(resident.id)}
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
                        ? "No residents found matching your search"
                        : "No residents found"}
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

export default ResidentsList;
