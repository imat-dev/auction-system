# Auction System - Backend
The Auction System is an intuitive online platform that facilitates the dynamic listing and bidding of items. Users can effortlessly list auction items, set starting prices, and define auction durations. Bidders, in turn, engage in real-time competitive bidding, ensuring they always stay above the last highest bid. This platform exemplifies a seamless integration of user experience and robust functionality. This project was developed as part of my technical assessment for Jitera.

## Tech Stack
The Auction System is built using the following technologies:
-   **Backend Framework**: NestJS
-   **Database**: MySQL
-   **Queueing**: Redis
-   **Error Tracking**: Sentry


# **Prerequisite for Running the Auction System**:

Before setting up and running the Auction System, ensure you meet the following prerequisites:

1.  **Node.js and npm**: Ensure Node.js and npm (Node Package Manager) are installed. If not, you can download and install them from the [official Node.js website](https://nodejs.org/).
    
2.  **Docker Installed**: Docker must be installed on your machine. If not already present, download and install Docker from the [official Docker website](https://www.docker.com/get-started).
    
3.  **Docker Compose**: Ensure you have Docker Compose set up. Typically, Docker Compose is bundled with Docker installations for Windows and Mac.
    
4.  **Auction System Docker File**: You need the Docker file specific to the Auction System. This Docker file contains configurations to set up the necessary environment for the system. Notably, within this Docker environment, the following images are integrated:
    
    -   **Redis**: An in-memory data structure store, used for caching and as a database. 
    -   **MySQL**: A popular relational database system.
    -   **Adminer**: A lightweight database management tool to simplify the administration of databases.


# **Steps for Running the Auction System**:

1.  First, clone the project repository: 
    ```bash 
    git clone [repository_url]
    ```
2.  Navigate to the directory containing the project.
3.  Before spinning up your Docker containers, ensure that you install all the necessary Node.js dependencies by running:  
    ```bash
    $ npm install
    ```

4.  After installing the dependencies, navigate to the directory containing the Docker file `docker-compose.yml`.
5.  Execute the command: 
    ```bash 
    $ docker-compose up 
    ``` 

    This will start the services as defined in the Docker file. Ensure you do not terminate this process or the images and associated services will become unavailable. If running in the foreground, you can use `Ctrl+C` to stop it when necessary, but during initial setup and while using the auction system, **keep it running**.

6. **Setting Up the Database using Adminer**:
    -   Open your browser and go to [http://localhost:8080/](http://localhost:8080/)
    -   Use the following credentials to log in:
        -   **Server**: `mysql`
        -   **Username**: `root`
        -   **Password**: `root`
    -   After logging in, create a new database named `bidding`.

7. **Environment Variables Setup**:
-   Locate `.env.sample` in the project directory.
-   Rename it to `dev.env` using: `mv .env.sample dev.env`.
-   Edit `dev.env` to ensure all variables match your local setup. If the docker successfully run, you just need to edit  `AUTH_SECRET` for your preference.

8. **Start the Application**: To launch the app in development mode, run the following command: 
```bash
 $ npm run start:dev
 ```



## Bidding System Architecture Overview

### 1. **Frontend**:

Built on Next.js, the frontend offers a simple user interface that allows users to view, create, and bid on auction items. It communicates directly with the backend through API calls, and authenticates users ensuring secure access.

**Repository**: The frontend codebase is available at [https://github.com/imat-dev/auction-site](https://github.com/imat-dev/auction-site).

### 2. **Backend**:

The heart of the system is powered by NestJS, a progressive Node.js framework that manages the primary application logic:

-   **Authentication**: Leveraging the power of Passport, a comprehensive authentication middleware for Node.js, users are registered and authenticated. This ensures that only authorized users can bid or create auction items. Passport supports various authentication strategies, offering flexibility and robustness to the authentication process.
-   **Database Interaction**: All data is stored in a MySQL database, which keeps track of users, items, and bids.
-   **Redis**: This in-memory data structure store is employed for two primary reasons:

	-   **Rate Limiting**: Controls the frequency of bidding by storing timestamps of the last bid, ensuring a 5-second gap between successive bids by the same user.
	-   **Scheduling Refund Process**: Instead of relying on traditional polling methods, which can be resource-intensive, Redis is harnessed to schedule and manage the refund process. This ensures that users who didn't win the bid get their money back efficiently without putting undue strain on the server.
-   **Auction Logic**: Manages the bidding process, ensures bids are higher than the current highest, manages the auction time window, and processes user refunds when necessary.

### 3. **Database**:

MySQL is used as the primary data store, housing all essential data:

-   **Users Table**: Stores user information and credentials.
-   **Items Table**: Lists all auction items, their starting price, state (draft/published), and time window.
-   **Bids Table**: Tracks all bids for auction items, the user who made the bid, and the bid amount.

Below is the ERD for reference: 



### 5. **Error Tracking & Monitoring**:

With Sentry integration, any unexpected issues or bugs are promptly reported. This ensures quick diagnostics and solutions to any problems that might arise during production use.

### 6. **Security**:

Security is paramount in any online system:

-   **Helmet**: Enhances security by setting various HTTP headers, mitigating several well-known web vulnerabilities.
-   **Rate Limiting with ThrottlerModule**: Instead of traditional methods, the system utilizes the `ThrottlerModule` to implement rate limiting. This ensures that users cannot overwhelm the system with excessive requests in a brief period, preserving the application's stability and protecting against potential abuse.