# Barangay Kabacsanan Management System

A comprehensive web-based management system for barangay administration, resident registration, and community services built with React, Node.js, Express, and Redis.

![Redis]([https://via.placeholder.com/800x400/0d6efd/ffffff?text=Barangay+Management+System](https://community.appinventor.mit.edu/uploads/default/original/2X/4/4ff24d52cc39e851235549aaeace849a617988ff.png))
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)


## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Default Accounts](#default-accounts)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [User Roles & Permissions](#user-roles--permissions)
- [Screenshots](#screenshots)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Barangay Kabacsanan Management System is a digital solution designed to modernize and streamline barangay operations. It provides tools for resident registration, family head management, document processing, announcements, events, and comprehensive reporting.

This system serves two main user types:
- **Administrators**: Barangay officials who manage residents, process documents, and oversee operations
- **Residents**: Community members who can view their profiles, request certificates, and stay updated with announcements

## Features

### 🏛️ Administrative Features
- **Dashboard Analytics**: Comprehensive statistics and visualizations
- **Resident Management**: Full CRUD operations for resident records
- **Family Head Management**: Manage family structures and relationships
- **Document Processing**: Handle certificate requests and approvals
- **Announcements**: Create and manage community announcements
- **Events Management**: Organize and track community events
- **User Account Management**: Create and manage user accounts
- **Data Export**: Export data to CSV format
- **Real-time Statistics**: Live charts and demographic data

### 👥 Resident Features
- **Profile Management**: View and update personal information
- **Certificate Requests**: Request barangay certificates online
- **Announcements**: Stay updated with community news
- **Events Calendar**: View and register for community events
- **Family Information**: View family head and member details
- **Request History**: Track document request status

### 📊 System Features
- **Role-based Access Control**: Secure authentication and authorization
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Live data synchronization
- **Data Visualization**: Interactive charts and graphs
- **Search & Filter**: Advanced search capabilities
- **Form Validation**: Comprehensive input validation
- **Error Handling**: Robust error management and user feedback

## Technology Stack

### Frontend
- **React 18.2.0** - Modern UI library
- **React Router DOM 6.4.0** - Client-side routing
- **Bootstrap 5.3** - CSS framework
- **React Bootstrap** - Bootstrap components for React
- **Recharts** - Data visualization library
- **Formik & Yup** - Form handling and validation
- **Axios** - HTTP client
- **React Toastify** - Toast notifications
- **React Icons** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express 4.18.2** - Web framework
- **Redis 4.6.7** - In-memory database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique identifier generation

### Development Tools
- **Nodemon** - Development server auto-restart
- **Create React App** - React project setup
- **ESLint** - Code linting
- **Prettier** - Code formatting

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express API    │    │   Redis DB      │
│                 │    │                 │    │                 │
│  - Components   │◄──►│  - Routes       │◄──►│  - Hash Maps    │
│  - Services     │    │  - Middleware   │    │  - Sets         │
│  - Context      │    │  - Validation   │    │  - Strings      │
│  - Hooks        │    │  - Auth         │    │  - Lists        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Port 3000   │    │     Port 5000   │    │     Port 6379   │
│   Frontend Dev  │    │   Backend API   │    │   Redis Server  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

Before installing the application, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **Redis Server** (v6.0.0 or higher)
- **Git** (for cloning the repository)

### Installing Redis

#### Windows
1. Download Redis from [GitHub releases](https://github.com/microsoftarchive/redis/releases)
2. Extract and run `redis-server.exe`

#### macOS (using Homebrew)
```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/barangay-management-system.git
   cd barangay-management-system
   ```

2. **Install dependencies using the provided script**
   ```bash
   node install-dependencies.js
   ```

   Or manually install for each part:

   **Backend dependencies:**
   ```bash
   cd redis-backend
   npm install
   ```

   **Frontend dependencies:**
   ```bash
   cd redis-frontend
   npm install
   ```

## Configuration

### Backend Configuration

1. **Environment Variables**
   
   Create or modify `redis-backend/.env`:
   ```env
   PORT=5000
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret_key_change_in_production
   JWT_EXPIRATION=24h
   ```

2. **Redis Configuration**
   
   Ensure Redis is running on `localhost:6379` or update the `REDIS_URL` in the `.env` file.

### Frontend Configuration

The frontend is configured to proxy API requests to `http://localhost:5000` (see `redis-frontend/package.json`).

## Running the Application

### Method 1: Using the Installation Script
```bash
# This will install dependencies and provide run instructions
node install-dependencies.js
```

### Method 2: Manual Setup

1. **Start Redis Server**
   ```bash
   redis-server
   ```

2. **Start the Backend Server**
   ```bash
   cd redis-backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

3. **Start the Frontend Development Server**
   ```bash
   cd redis-frontend
   npm start
   ```
   The frontend will run on `http://localhost:3000`

4. **Access the Application**
   
   Open your browser and navigate to `http://localhost:3000`

## Default Accounts

The system comes with pre-configured accounts for testing:

### Administrator Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Administrator
- **Access:** Full system access

### Sample Resident Account
- **Username:** `resident1`
- **Password:** `resident123`
- **Role:** Resident
- **Access:** Limited to resident features

> **Note:** Change these default passwords in production!

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Resident registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Resident Management
- `GET /api/residents` - Get all residents
- `GET /api/residents/:id` - Get resident by ID
- `POST /api/residents` - Create new resident
- `PUT /api/residents/:id` - Update resident
- `DELETE /api/residents/:id` - Delete resident

### Family Head Management
- `GET /api/familyHeads` - Get all family heads
- `GET /api/familyHeads/:id` - Get family head by ID
- `GET /api/familyHeads/:id/members` - Get family members
- `POST /api/familyHeads` - Create new family head
- `PUT /api/familyHeads/:id` - Update family head
- `DELETE /api/familyHeads/:id` - Delete family head

### Document Requests
- `GET /api/documents` - Get all document requests
- `GET /api/documents/:id` - Get document request by ID
- `POST /api/documents` - Create new document request
- `PUT /api/documents/:id/status` - Update request status
- `DELETE /api/documents/:id` - Delete document request

### Announcements
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `POST /api/events/:id/register` - Register for event
- `DELETE /api/events/:id/register/:attendeeId` - Unregister from event

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-registrations` - Get recent registrations
- `GET /api/dashboard/gender-distribution` - Get gender distribution
- `GET /api/dashboard/age-distribution` - Get age distribution

## Database Schema

### Redis Data Structure

The application uses Redis with the following key patterns:

#### Users
```
user:{username} -> Hash
{
  username: string,
  password: string (hashed),
  name: string,
  role: "admin" | "resident",
  residentId?: string
}
```

#### Residents
```
resident:{id} -> Hash
{
  id: string,
  firstName: string,
  lastName: string,
  gender: "Male" | "Female",
  birthDate: string,
  address: string,
  contactNumber: string,
  familyHeadId?: string,
  registrationDate: string,
  type: "Resident"
}
```

#### Family Heads
```
familyHead:{id} -> Hash
{
  id: string,
  firstName: string,
  lastName: string,
  gender: "Male" | "Female",
  birthDate: string,
  address: string,
  contactNumber: string,
  registrationDate: string,
  type: "Family Head"
}

familyMembers:{familyHeadId} -> Set
[residentId1, residentId2, ...]
```

#### Announcements
```
announcement:{id} -> Hash
{
  id: string,
  title: string,
  content: string,
  category: string,
  type: "important" | "warning" | "info",
  date: string
}
```

#### Events
```
event:{id} -> Hash
{
  id: string,
  title: string,
  description: string,
  eventDate: string,
  location: string,
  category: string,
  time: string,
  createdDate: string,
  attendees: string (JSON array)
}
```

#### Document Requests
```
documentRequest:{id} -> Hash
{
  id: string,
  requestId: string,
  residentId: string,
  residentName: string,
  documentType: string,
  purpose: string,
  status: "pending" | "approved" | "completed" | "rejected",
  requestDate: string,
  deliveryOption: string,
  processingDate?: string,
  processingNotes?: string
}
```

#### Counters
```
residents:count -> String (number)
familyHeads:count -> String (number)
```

## User Roles & Permissions

### Administrator Role
- **Dashboard Access**: Full analytics and statistics
- **Resident Management**: Create, read, update, delete residents
- **Family Head Management**: Manage family structures
- **Document Processing**: Approve/reject certificate requests
- **Content Management**: Create announcements and events
- **User Management**: Create resident accounts
- **System Settings**: Access to all system configurations

### Resident Role
- **Profile Access**: View and request updates to personal information
- **Document Requests**: Request barangay certificates
- **Information Access**: View announcements and events
- **Event Registration**: Register for community events
- **Family Information**: View family head and member details
- **Request Tracking**: Monitor document request status

## Screenshots

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x500/0d6efd/ffffff?text=Admin+Dashboard+with+Analytics)

### Resident Management
![Resident Management](https://via.placeholder.com/800x500/28a745/ffffff?text=Resident+Management+Interface)

### Document Requests
![Document Requests](https://via.placeholder.com/800x500/dc3545/ffffff?text=Document+Request+Processing)

### Announcements
![Announcements](https://via.placeholder.com/800x500/ffc107/000000?text=Community+Announcements)

## Troubleshooting

### Common Issues

#### Redis Connection Issues
```bash
# Check if Redis is running
redis-cli ping
# Should return "PONG"

# Start Redis if not running
redis-server
```

#### Port Already in Use
```bash
# Kill process using port 3000 or 5000
npx kill-port 3000
npx kill-port 5000
```

#### Database Fixes
If you encounter Redis data issues, use the provided fix scripts:

```bash
cd redis-backend

# Fix admin user
node fix-admin.js

# Fix resident data
node fix-data.js

# Debug Redis data
node debug-redis.js
```

#### Authentication Issues
- Ensure JWT_SECRET is set in the `.env` file
- Check that the token is being sent in the Authorization header
- Verify user accounts exist in Redis

#### Frontend Build Issues
```bash
cd redis-frontend
rm -rf node_modules package-lock.json
npm install
```

#### Backend Issues
```bash
cd redis-backend
rm -rf node_modules package-lock.json
npm install
```

### Performance Optimization

1. **Redis Configuration**
   - Enable persistence with `save` directive
   - Configure appropriate memory limits
   - Use Redis clustering for high availability

2. **Frontend Optimization**
   - Implement code splitting
   - Use React.memo for expensive components
   - Optimize bundle size with webpack-bundle-analyzer

3. **Backend Optimization**
   - Implement request rate limiting
   - Add response caching
   - Use Redis pipelining for batch operations

## Contributing

We welcome contributions to the Barangay Management System! Please follow these guidelines:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (if available)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Coding Standards
- Follow ESLint configuration
- Use meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Ensure responsive design compatibility

### Reporting Issues
When reporting issues, please include:
- Operating system and version
- Node.js and npm versions
- Redis version
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots (if applicable)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For support and questions:

- 📧 Email: jaspergumoraa@gmail.com
- 📱 Phone: 09914769174
- 🌐 Website: [https://barangaymanagement.com](https://barangaymanagement.com)

---

**Built with ❤️ for Barangay Kabacsanan**

---

### Version History

- **v1.0.0** (Current) - Initial release with core functionality
  - Resident and family head management
  - Document request processing
  - Announcements and events
  - User authentication and authorization
  - Dashboard analytics and reporting
