
  
  

# Auction System - Backend

  

The Auction System is an intuitive online platform that facilitates the dynamic listing and bidding of items. Users can effortlessly list auction items, set starting prices, and define auction durations. Bidders, in turn, engage in real-time competitive bidding, ensuring they always stay above the last highest bid. This platform exemplifies a seamless integration of user experience and robust functionality.

  

---

  

# Table of Contents

  

  

- [Tech Stack](#tech-stack)

  

- [Prerequisite for Running the Auction System](#prerequisite-for-running-the-auction-system)

  

- [Steps for Running the Auction System](#steps-for-running-the-auction-system)

  

- [Bidding System Architecture Overview](#bidding-system-architecture-overview)

  

- [Testing Process](#testing-process)

- [Deployment Information](#-deployment-information)
- [Documentation (Swagger)](#-api-documentation)

  

  

---

  

  

# **Tech Stack**:

  

The Auction System is built using the following technologies:

  

-  **Backend Framework**: NestJS

  

-  **Database**: MySQL

  

-  **Scheduling & Rate Limiting**: Redis

  

-  **Error Tracking**: Sentry

-  **Documentation**: Swagger

  

  

---

  

  

# **Prerequisite for Running the Auction System**:

  

  

Before setting up and running the Auction System, ensure you meet the following prerequisites:

  

  

1.  **Node.js and npm**: Ensure Node.js and npm (Node Package Manager) are installed. If not, you can download and install them from the [official Node.js website](https://nodejs.org/).

2.  **NestJS CLI**: The NestJS Command Line Interface (CLI) is a handy tool that helps you to initialize, develop, and maintain your NestJS applications. Install it globally with:

```bash

$ npm install -g @nestjs/cli

```

  

5.  **Docker Installed**: Docker must be installed on your machine. If not already present, download and install Docker from the [official Docker website](https://www.docker.com/get-started).

  

6.  **Docker Compose**: Ensure you have Docker Compose set up. Typically, Docker Compose is bundled with Docker installations for Windows and Mac.

  

7.  **Auction System Docker File**: You need the Docker file specific to the Auction System. This Docker file contains configurations to set up the necessary environment for the system. Notably, within this Docker environment, the following images are integrated:

  

-  **Redis**: An in-memory data structure store, used for caching and as a database.

  

-  **MySQL**: A popular relational database system.

  

-  **Adminer**: A lightweight database management tool to simplify the administration of databases.

  

  

---

  

  

# **Steps for Running the Auction System**:

  

  

1. First, clone the project repository:

  

```bash

  

$  git  clone [repository_url]

  

```

  

2. Navigate to the directory containing the project.

  

3. Before spinning up your Docker containers, ensure that you install all the necessary Node.js dependencies by running:

  

```bash

  

$  npm  install

  

```

  

  

4. After installing the dependencies, navigate to the directory containing the Docker file `docker-compose.yml`.

  

5. Execute the command:

  

```bash

  

$  docker-compose  up

  

```

  

  

This will start the services as defined in the Docker file. Ensure you do not terminate this process or the images and associated services will become unavailable. If running in the foreground, you can use `Ctrl+C` to stop it when necessary, but during initial setup and while using the auction system, **keep it running**.

  

  

6.  **Setting Up the Database using Adminer**:

  

- Open your browser and go to [http://localhost:8080/](http://localhost:8080/)

  

- Use the following credentials to log in:

  

-  **Server**: `mysql`

  

-  **Username**: `root`

  

-  **Password**: `root`

  

- After logging in, create a new database named `bidding`.

  

  

7.  **Environment Variables Setup**:

  

- Locate `.env.sample` in the project directory.

  

- Rename it to `dev.env` using: `mv .env.sample dev.env`.

  

- Edit `dev.env` to ensure all variables match your local setup. If the docker successfully run, you just need to edit `AUTH_SECRET` for your preference.

  

  

8.  **Start the Application**: To launch the app in development mode, run the following command:

  

```bash

  

$  npm  run  start:dev

  

```

  

  

---

  

  

## Bidding System Architecture Overview

  

  

### 1. **Frontend**:

  

  

Built on Next.js, the frontend offers a simple user interface that allows users to view, create, and bid on auction items. It communicates directly with the backend through API calls, and authenticates users ensuring secure access.

  

  

**Repository**: The frontend codebase is available at [https://github.com/imat-dev/auction-site](https://github.com/imat-dev/auction-site).

  

  

### 2. **Backend**:

  

  

The heart of the system is powered by NestJS, a progressive Node.js framework that manages the primary application logic:

  

  

-  **Authentication**: Leveraging the power of Passport, a comprehensive authentication middleware for Node.js, users are registered and authenticated. This ensures that only authorized users can bid or create auction items. Passport supports various authentication strategies, offering flexibility and robustness to the authentication process.

  

-  **Database Interaction**: All data is stored in a MySQL database, which keeps track of users, items, and bids.

  

-  **Redis**: This in-memory data structure store is employed for two primary reasons:

  

  

-  **Rate Limiting**: Controls the frequency of bidding by storing timestamps of the last bid, ensuring a 5-second gap between successive bids by the same user.

  

-  **Scheduling Refund Process**: Instead of relying on traditional polling methods, which can be resource-intensive, Redis is harnessed to schedule and manage the refund process. This ensures that users who didn't win the bid get their money back efficiently without putting undue strain on the server.

  

-  **Auction Logic**: Manages the bidding process, ensures bids are higher than the current highest, manages the auction time window, and processes user refunds when necessary.

  

  

### 3. **Database**:

  

  

MySQL is used as the primary data store, housing all essential data:

  

  

-  **Users Table**: Stores user information and credentials.

  

-  **Items Table**: Lists all auction items, their starting price, state (draft/published), and time window.

  

-  **Bids Table**: Tracks all bids for auction items, the user who made the bid, and the bid amount.

  

  

### 5. **Error Tracking & Monitoring**:

  

  

With Sentry integration, any unexpected issues or bugs are promptly reported. This ensures quick diagnostics and solutions to any problems that might arise during production use.

  

  

### 6. **Security**:

  

  

Security is paramount in any online system:

  

  

-  **Helmet**: Enhances security by setting various HTTP headers, mitigating several well-known web vulnerabilities.

  

-  **Rate Limiting with ThrottlerModule**: Instead of traditional methods, the system utilizes the `ThrottlerModule` to implement rate limiting. This ensures that users cannot overwhelm the system with excessive requests in a brief period, preserving the application's stability and protecting against potential abuse.

  

  

---

  

  

## Testing Process

  

  

Testing is an integral part of the development lifecycle in this project. The testing process ensures that the system works as expected and helps identify any potential issues or bugs before they reach a production environment.

  

  

### Unit Tests

  

  

-  **Purpose**: Unit tests target small, isolated parts of the application, ensuring each unit functions as intended.

  

-  **Tools & Libraries**: I use [Jest](https://jestjs.io/) as primary testing framework due to its simplicity and compatibility with NestJS.

  

  

### Integration Tests

  

  

-  **Purpose**: Integration tests focus on the interactions between units, ensuring that integrated components and services work together as expected.

  

-  **Setup**: These tests often require setting up mock versions of external services or databases.

  

  

### End-to-End (E2E) Tests - To follow if required by Jitera :)

  

  

### Running Tests Locally

  

  

To run tests locally, you can use the following command:

  

```bash

  

$  npm  run  test

  

```

  

---

## 🚀 Deployment Information

  

### Automatic Deployment on `main` Branch Push

  

Your application is set up with a Continuous Deployment (CD) system. This means:

  

1.  **Git Push**: Whenever you push changes to the `main` branch...

2.  **Trigger**: ...this triggers the deployment process on the hosting platform (Heroku).

3.  **Build & Deploy**: The platform then builds and deploys your application with the latest changes.

4.  **Relaunch**: Once deployed, the application is automatically relaunched, making your changes live instantly.

  

### What You Need to Do:

  

- Commit your changes: `git commit -m "Your meaningful commit message here"`

- Push to the `main` branch: `git push origin main`

  

🎉 That's it! Your updates will be live shortly after the push. Check the platform's dashboard or logs if you want to monitor the deployment process.

  

----------

### 📚 API Documentation

Our API is documented using Swagger, which provides an interactive interface for users and developers to try out the API calls, parameters, and see the responses. It also offers insight into the types of responses to expect, error messages, and much more.

#### Accessing the Swagger UI

You can access the Swagger UI and explore the API documentation at the following URL:

[https://localhost:3000/api](https://localhost:3000/api)