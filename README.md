# Arters Automated Digital Certificate System

This repository contains the backend implementation for the Arters Automated Digital Certificate System, as specified in the functional requirements.

The system is built with Node.js, Express, and PostgreSQL. It provides a set of APIs to handle course completions, student confirmations, and certificate batching.

## Running the Project

The project is containerized using Docker and can be run with a single command.

### Prerequisites

*   Docker
*   Docker Compose

### Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Build and run the containers:**
    ```bash
    docker-compose up --build
    ```

This will start the application server on port 3000 and a PostgreSQL database on port 5432. The application will automatically connect to the database.

To initialize the database schema, you can run the `db/schema.sql` file against the running database container.

## API Endpoints

The following API endpoints are available:

### Webhooks

*   `POST /api/webhook/course-completion`: Receives course completion data from the main Arters website.

### Student Confirmation

*   `POST /api/student/confirm/:token`: Allows students to confirm, correct, or decline their certificate.

### Admin

*   `GET /api/admin/courses`: Get a list of all courses.
*   `POST /api/admin/courses`: Create a new course.
*   `GET /api/admin/students`: Get a list of all students.
*   `POST /api/admin/students`: Create a new student.
*   `GET /api/admin/batches/ready`: Get a list of all certificate confirmations that are ready to be batched.
*   `POST /api/admin/batches`: Create a new batch of certificates.