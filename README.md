# Daal Wallet Microservice

## Overview

This project is a wallet microservice built using NestJS. It provides functionalities to manage user accounts, handle transactions, and track user balances. This service includes RESTful endpoints to create users, manage wallet balances, and record transactions with full logging for audit purposes. Additionally, daily transaction totals are calculated and logged.

## Features

- **User Management**: Create and retrieve user information.
- **Wallet Management**: Add or subtract money from a user's wallet.
- **Transaction Logging**: Record all transactions with details.
- **Daily Totals**: Calculate and log the total amount of transactions processed each day.
- **API Documentation**: Integrated Swagger for API documentation.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

## Environment Variables

Create a .env file in the root directory with the following content:

```.env
APP_PORT=3333
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=wallet
```

Docker Setup
Make sure Docker and Docker Compose are installed and running on your machine.

Build and Run the Project

```bash
docker-compose up --build
```

This command will build the Docker images for the application and the PostgreSQL database, and start the containers.

Accessing the Application
Once the containers are up and running, you can access the application and the API documentation at:

API Documentation: http://localhost:3333/api-docs

```bash
# Ensure you are in the container
docker exec -it nest-docker-postgres /bin/sh

# Inside the container
npm run test
```
## Endpoints

### User Endpoints

- **Create User**
  - **Method**: `POST`
  - **URL**: `/users`
  - **Input**: 
    ```json
    { "username": "string", "email": "string" }
    ```
  - **Output**: 
    ```json
    { "id": "number", "username": "string", "email": "string" }
    ```
  - **Description**: Creates a new user with the provided username and email. Throws a `ConflictException` if the email or username is already in use.

- **Get User Balance**
  - **Method**: `GET`
  - **URL**: `/users/balance/:userId`
  - **Output**: 
    ```json
    { "balance": "number" }
    ```
  - **Description**: Retrieves the balance of a user by their ID. Throws a `NotFoundException` if no user with the specified ID is found.

- **Get User Details**
  - **Method**: `GET`
  - **URL**: `/users/details/:userId`
  - **Query Params**: `fields` (optional, comma-separated list of fields to include in the response)
  - **Output**: 
    ```json
    { "id": "number", "username": "string", "email": "string", ... }
    ```
  - **Description**: Retrieves a user by their ID with selectable fields.

- **Get User Transactions**
  - **Method**: `GET`
  - **URL**: `/users/transactions/:userId`
  - **Query Params**: 
    - `page` (default: 1)
    - `limit` (default: 10)
  - **Output**: 
    ```json
    { 
      "transactions": [
        { "id": "number", "amount": "number", "createdAt": "date" }
      ], 
      "total": "number" 
    }
    ```
  - **Description**: Gets a list of transactions for a specified user with pagination.

### Transaction Endpoints

- **Process Transaction**
  - **Method**: `POST`
  - **URL**: `/transactions/money`
  - **Input**: 
    ```json
    { "userId": "number", "amount": "number" }
    ```
  - **Output**: 
    ```json
    { "referenceId": "number" }
    ```
  - **Description**: Processes a transaction to add or subtract money from a user's wallet. Throws a `NotFoundException` if the user with the specified ID is not found.
