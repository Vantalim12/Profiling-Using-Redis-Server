// src/pages/dashboard/AdminDashboard.js
// This is basically your current Dashboard.js file, renamed to AdminDashboard
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
} from "react-bootstrap";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { FaUsers, FaUserFriends } from "react-icons/fa";
import { dashboardService } from "../../services/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalFamilyHeads: 0,
    genderData: [],
    ageData: [],
    monthlyRegistrations: [],
    recentRegistrations: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    toast.info("Dashboard data refreshed");
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
  ];

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Administrator Dashboard</h2>
        <div>
          <span className="text-muted me-3">
            Last updated: {new Date().toLocaleString()}
          </span>
          <Button variant="primary" size="sm" onClick={handleRefresh}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="dashboard-card h-100">
            <Card.Body className="stat-card">
              <div className="stat-icon text-primary">
                <FaUsers />
              </div>
              <h3 className="display-4 fw-bold text-primary">
                {stats.totalResidents}
              </h3>
              <p className="text-muted mb-0">Total Residents</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="dashboard-card h-100">
            <Card.Body className="stat-card">
              <div className="stat-icon text-success">
                <FaUserFriends />
              </div>
              <h3 className="display-4 fw-bold text-success">
                {stats.totalFamilyHeads}
              </h3>
              <p className="text-muted mb-0">Family Heads</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="g-4 mb-4">
        <Col md={6}>
          <Card className="dashboard-card h-100">
            <Card.Header>
              <h5 className="mb-0">Gender Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.genderData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Count"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="dashboard-card h-100">
            <Card.Header>
              <h5 className="mb-0">Age Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Residents" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Monthly Registration Trends */}
      <Row className="g-4 mb-4">
        <Col md={12}>
          <Card className="dashboard-card">
            <Card.Header>
              <h5 className="mb-0">Monthly Registration Trends</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyRegistrations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="newResidents"
                      stroke="#8884d8"
                      name="New Residents"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Registrations */}
      <Row className="g-4">
        <Col md={12}>
          <Card className="dashboard-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Registrations</h5>
              <Link
                to="/dashboard/residents"
                className="btn btn-sm btn-outline-primary"
              >
                View All
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-container">
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Date Registered</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentRegistrations.length > 0 ? (
                      stats.recentRegistrations.map((item, index) => (
                        <tr key={index}>
                          <td>{item.id}</td>
                          <td>{item.name}</td>
                          <td>{new Date(item.date).toLocaleDateString()}</td>
                          <td>
                            <span
                              className={`badge ${
                                item.type === "Family Head"
                                  ? "bg-success"
                                  : "bg-primary"
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-3">
                          No recent registrations found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
