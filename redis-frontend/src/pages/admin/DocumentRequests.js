// src/pages/admin/DocumentRequests.js
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
import {
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaDownload,
  FaPrint,
  FaFilter,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";

// We would typically import a service for the API calls
// import { certificateService } from "../../services/api";

const DocumentRequests = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Sample document requests data (in a real app, this would come from the API)
  const [documentRequests, setDocumentRequests] = useState([
    {
      id: 1,
      requestId: "REQ-2023001",
      residentId: "R-2023001",
      residentName: "John Doe",
      certificateType: "barangay-clearance",
      purpose: "Employment requirement",
      requestDate: "2023-07-15T10:30:00",
      status: "pending",
      deliveryOption: "pickup",
    },
    {
      id: 2,
      requestId: "REQ-2023002",
      residentId: "R-2023002",
      residentName: "Jane Smith",
      certificateType: "residency",
      purpose: "School enrollment",
      requestDate: "2023-07-16T14:45:00",
      status: "approved",
      deliveryOption: "email",
      approvedDate: "2023-07-17T09:20:00",
      approvedBy: "Admin",
    },
    {
      id: 3,
      requestId: "REQ-2023003",
      residentId: "R-2023003",
      residentName: "Robert Johnson",
      certificateType: "indigency",
      purpose: "Medical assistance",
      requestDate: "2023-07-17T08:15:00",
      status: "completed",
      deliveryOption: "pickup",
      approvedDate: "2023-07-17T10:30:00",
      completedDate: "2023-07-18T14:00:00",
      approvedBy: "Admin",
    },
    {
      id: 4,
      requestId: "REQ-2023004",
      residentId: "R-2023004",
      residentName: "Sarah Williams",
      certificateType: "good-conduct",
      purpose: "Overseas employment",
      requestDate: "2023-07-18T11:20:00",
      status: "rejected",
      rejectionReason: "Incomplete information provided",
      rejectedDate: "2023-07-19T09:45:00",
      rejectedBy: "Admin",
    },
  ]);

  // In a real application, we would fetch the document requests on component mount
  // useEffect(() => {
  //   const fetchDocumentRequests = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await certificateService.getAllRequests();
  //       setDocumentRequests(response.data);
  //     } catch (error) {
  //       console.error("Error fetching document requests:", error);
  //       toast.error("Failed to load document requests");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchDocumentRequests();
  // }, []);

  // Get certificate type display name
  const getCertificateTypeName = (type) => {
    switch (type) {
      case "barangay-clearance":
        return "Barangay Clearance";
      case "residency":
        return "Certificate of Residency";
      case "indigency":
        return "Certificate of Indigency";
      case "good-conduct":
        return "Certificate of Good Moral Character";
      case "business-permit":
        return "Barangay Business Permit";
      default:
        return type;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge bg="warning">Pending</Badge>;
      case "approved":
        return <Badge bg="info">Approved</Badge>;
      case "completed":
        return <Badge bg="success">Completed</Badge>;
      case "rejected":
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  // Filter document requests
  const filteredRequests = documentRequests.filter((request) => {
    const matchesSearch =
      request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCertificateTypeName(request.certificateType)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || request.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Prepare data for CSV export
  const exportData = filteredRequests.map((request) => ({
    "Request ID": request.requestId,
    "Resident ID": request.residentId,
    "Resident Name": request.residentName,
    "Certificate Type": getCertificateTypeName(request.certificateType),
    "Request Date": new Date(request.requestDate).toLocaleString(),
    Status: request.status,
    "Delivery Method": request.deliveryOption,
    Purpose: request.purpose,
    ...(request.approvedDate
      ? { "Approved Date": new Date(request.approvedDate).toLocaleString() }
      : {}),
    ...(request.completedDate
      ? { "Completed Date": new Date(request.completedDate).toLocaleString() }
      : {}),
    ...(request.rejectedDate
      ? { "Rejected Date": new Date(request.rejectedDate).toLocaleString() }
      : {}),
    ...(request.rejectionReason
      ? { "Rejection Reason": request.rejectionReason }
      : {}),
  }));

  // CSV headers
  const csvHeaders = [
    { label: "Request ID", key: "Request ID" },
    { label: "Resident ID", key: "Resident ID" },
    { label: "Resident Name", key: "Resident Name" },
    { label: "Certificate Type", key: "Certificate Type" },
    { label: "Request Date", key: "Request Date" },
    { label: "Status", key: "Status" },
    { label: "Delivery Method", key: "Delivery Method" },
    { label: "Purpose", key: "Purpose" },
    { label: "Approved Date", key: "Approved Date" },
    { label: "Completed Date", key: "Completed Date" },
    { label: "Rejected Date", key: "Rejected Date" },
    { label: "Rejection Reason", key: "Rejection Reason" },
  ];

  // Show request details
  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Close request details modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  };

  // Approve request
  const handleApproveRequest = (requestId) => {
    // In a real app, this would be an API call
    setLoading(true);
    setTimeout(() => {
      const updatedRequests = documentRequests.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: "approved",
            approvedDate: new Date().toISOString(),
            approvedBy: "Admin",
          };
        }
        return req;
      });

      setDocumentRequests(updatedRequests);
      setLoading(false);
      handleCloseModal();
      toast.success("Request approved successfully");
    }, 1000);
  };

  // Complete request
  const handleCompleteRequest = (requestId) => {
    // In a real app, this would be an API call
    setLoading(true);
    setTimeout(() => {
      const updatedRequests = documentRequests.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: "completed",
            completedDate: new Date().toISOString(),
          };
        }
        return req;
      });

      setDocumentRequests(updatedRequests);
      setLoading(false);
      handleCloseModal();
      toast.success("Request marked as completed");
    }, 1000);
  };

  // Show rejection modal
  const handleShowRejectModal = () => {
    setShowRejectModal(true);
  };

  // Close rejection modal
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason("");
  };

  // Reject request
  const handleRejectRequest = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    // In a real app, this would be an API call
    setLoading(true);
    setTimeout(() => {
      const updatedRequests = documentRequests.map((req) => {
        if (req.id === selectedRequest.id) {
          return {
            ...req,
            status: "rejected",
            rejectionReason,
            rejectedDate: new Date().toISOString(),
            rejectedBy: "Admin",
          };
        }
        return req;
      });

      setDocumentRequests(updatedRequests);
      setLoading(false);
      handleCloseRejectModal();
      handleCloseModal();
      toast.info("Request rejected");
    }, 1000);
  };

  // Print certificate function
  const handlePrintCertificate = (requestId) => {
    // In a real app, this would open a print dialog with the certificate template
    toast.info("Printing certificate...");
    // Here you would render the certificate template and use window.print()
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Document Requests</h2>

      <Row className="mb-4">
        <Col md={5}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by ID, resident name, or document type..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </Form.Select>
          </InputGroup>
        </Col>

        <Col md={3} className="text-md-end">
          <CSVLink
            data={exportData}
            headers={csvHeaders}
            filename={"document-requests.csv"}
            className="btn btn-primary"
          >
            <FaDownload className="me-2" /> Export to CSV
          </CSVLink>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Request ID</th>
                <th>Resident</th>
                <th>Document Type</th>
                <th>Request Date</th>
                <th>Status</th>
                <th>Delivery Method</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.requestId}</td>
                    <td>{request.residentName}</td>
                    <td>{getCertificateTypeName(request.certificateType)}</td>
                    <td>{new Date(request.requestDate).toLocaleString()}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td className="text-capitalize">
                      {request.deliveryOption}
                    </td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-1"
                        onClick={() => handleViewDetails(request)}
                      >
                        <FaEye />
                      </Button>

                      {request.status === "approved" && (
                        <Button
                          variant="success"
                          size="sm"
                          className="me-1"
                          onClick={() => handleCompleteRequest(request.id)}
                        >
                          <FaCheck />
                        </Button>
                      )}

                      {request.status === "completed" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handlePrintCertificate(request.id)}
                        >
                          <FaPrint />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-3">
                    No document requests found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Request Details Modal */}
      <Modal show={showDetailsModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Request Details - {selectedRequest?.requestId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <p>
                    <strong>Resident:</strong> {selectedRequest.residentName}
                  </p>
                  <p>
                    <strong>Resident ID:</strong> {selectedRequest.residentId}
                  </p>
                  <p>
                    <strong>Document Type:</strong>{" "}
                    {getCertificateTypeName(selectedRequest.certificateType)}
                  </p>
                  <p>
                    <strong>Purpose:</strong> {selectedRequest.purpose}
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Request Date:</strong>{" "}
                    {new Date(selectedRequest.requestDate).toLocaleString()}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {getStatusBadge(selectedRequest.status)}
                  </p>
                  <p>
                    <strong>Delivery Method:</strong>{" "}
                    <span className="text-capitalize">
                      {selectedRequest.deliveryOption}
                    </span>
                  </p>

                  {selectedRequest.status === "approved" && (
                    <p>
                      <strong>Approved Date:</strong>{" "}
                      {new Date(selectedRequest.approvedDate).toLocaleString()}
                    </p>
                  )}

                  {selectedRequest.status === "completed" && (
                    <>
                      <p>
                        <strong>Approved Date:</strong>{" "}
                        {new Date(
                          selectedRequest.approvedDate
                        ).toLocaleString()}
                      </p>
                      <p>
                        <strong>Completed Date:</strong>{" "}
                        {new Date(
                          selectedRequest.completedDate
                        ).toLocaleString()}
                      </p>
                    </>
                  )}

                  {selectedRequest.status === "rejected" && (
                    <>
                      <p>
                        <strong>Rejected Date:</strong>{" "}
                        {new Date(
                          selectedRequest.rejectedDate
                        ).toLocaleString()}
                      </p>
                      <p>
                        <strong>Rejection Reason:</strong>{" "}
                        {selectedRequest.rejectionReason}
                      </p>
                    </>
                  )}
                </Col>
              </Row>

              {selectedRequest.status === "pending" && (
                <>
                  <hr />
                  <h5>Process Request</h5>
                  <Row>
                    <Col md={6}>
                      <Button
                        variant="success"
                        className="me-2"
                        onClick={() => handleApproveRequest(selectedRequest.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaCheck className="me-2" /> Approve Request
                          </>
                        )}
                      </Button>
                    </Col>
                    <Col md={6}>
                      <Button
                        variant="danger"
                        onClick={handleShowRejectModal}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaTimes className="me-2" /> Reject Request
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </>
              )}

              {selectedRequest.status === "approved" && (
                <>
                  <hr />
                  <Button
                    variant="success"
                    onClick={() => handleCompleteRequest(selectedRequest.id)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheck className="me-2" /> Mark as Completed
                      </>
                    )}
                  </Button>
                </>
              )}

              {selectedRequest.status === "completed" && (
                <>
                  <hr />
                  <Button
                    variant="primary"
                    onClick={() => handlePrintCertificate(selectedRequest.id)}
                  >
                    <FaPrint className="me-2" /> Print Certificate
                  </Button>
                </>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal show={showRejectModal} onHide={handleCloseRejectModal}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Reason for Rejection</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejecting this request"
            />
          </Form.Group>
          <div className="text-muted small">
            This reason will be visible to the resident who submitted the
            request.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRejectModal}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleRejectRequest}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              "Reject Request"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default DocumentRequests;
