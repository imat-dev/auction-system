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
    npm install
    ```

4.  After installing the dependencies, navigate to the directory containing the Docker file `docker-compose.yml`.
5.  Execute the command: 
    ```bash 
        docker-compose up 
    ```. 

This will start the services as defined in the Docker file. Ensure you do not terminate this process or the images and associated services will become unavailable. If running in the foreground, you can use `Ctrl+C` to stop it when necessary, but during initial setup and while using the auction system, **keep it running**.

7. **Setting Up the Database using Adminer**:
    -   Open your browser and go to [http://localhost:8080/](http://localhost:8080/)
    -   Use the following credentials to log in:
        -   **Server**: `mysql`
        -   **Username**: `root`
        -   **Password**: `root`
    -   After logging in, create a new database named `bidding`.
8. **Environment Variables Setup**:
-   Locate `.env.sample` in the project directory.
-   Rename it to `dev.env` using: `mv .env.sample dev.env`.
-   Edit `dev.env` to ensure all variables match your local setup. If the docker successfully run, you just need to edit  `AUTH_SECRET` for your preference.

9. **Start the Application**: To launch the app in development mode, run the following command: 
```bash
 npm run start:dev
 ```