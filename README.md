# Daal Wallet Microservice

## Overview

This project is a wallet microservice built using NestJS. It provides functionalities to manage user accounts, handle transactions, and track user balances. This service includes RESTful endpoints to create users, manage wallet balances, and record transactions with full logging for audit purposes. Additionally, daily transaction totals are calculated and logged.

## Why PostgreSQL and TypeORM?

**PostgreSQL** was chosen for its robust support for complex queries, ACID compliance, and powerful data integrity features. Its reliability and performance make it ideal for handling transactional data in a wallet service.

**TypeORM** is used as the Object-Relational Mapping (ORM) tool for its seamless integration with NestJS, its support for complex database schemas, and its ability to handle database migrations easily. It simplifies database interactions and enhances productivity by allowing developers to work with TypeScript entities and repositories.

## Modules

### User Module

The User module handles user-related operations. It includes:

- **User Creation**: Allows for the creation of new user accounts.
- **Balance**: Provides endpoints to retrieve user balances.
- **User Retrieval**: Fetches user details by UserID and allows dynamic selection of fields.
- **User Transactions**: Fetches user transactions by UserID and allows paginations (Sorted by Creation Time).

### Transaction Module

The Transaction module manages financial transactions within the wallet. It includes:

- **Transaction Processing**: Handles the addition or deduction of funds from user wallets.
- **Transaction Logging**: Records each transaction for auditing purposes.

### Daily Total Module

The Daily Total module calculates and logs daily transaction totals. It includes:

- **Daily Totals Calculation**: Aggregates and sums up all transactions for a given day.
- **Cron Job**: A scheduled job runs daily at midnight to automatically calculate and save the daily total amount. This ensures that totals are accurately computed and recorded every day without manual intervention.
- **Logging**: Saves the daily total amounts to the database for reporting and auditing.

## Features

- **User Management**: Create and retrieve user information.
- **Wallet Management**: Add or subtract money from a user's wallet.
- **Transaction Logging**: Record all transactions with details.
- **Daily Totals**: Calculate and log the total amount of transactions processed each day.
- **API Documentation**: Integrated Swagger for API documentation.
- **Containerizaions**: Containerized with Docker.
- **Test Coverage**: 100% percent test coverage.

## Test Coverage

The project includes 100% test coverage to ensure that all features and functionalities are thoroughly tested and reliable.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### Clone the Repository

```bash
git clone <https://github.com/amirhoseinZare/wallet>
cd <wallet>
```

## Project Structure
```
├── Dockerfile
├── README.md
├── docker-compose.yml
├── nest-cli.json
├── package-lock.json
├── package.json
├── src
│ ├── app.controller.ts
│ ├── app.module.ts
│ ├── common
│ │ └── types.ts
│ ├── config
│ │ ├── constants.ts
│ │ └── env.enum.ts
│ ├── daily-total
│ │ ├── daily-total.entity.ts
│ │ ├── daily-total.module.ts
│ │ ├── daily-total.service.spec.ts
│ │ └── daily-total.service.ts
│ ├── database
│ │ └── database.module.ts
│ ├── main.ts
│ ├── transaction
│ │ ├── dto
│ │ │ ├── get-transaction.dto.ts
│ │ │ ├── get-user-transactions-query.dto.ts
│ │ │ ├── transaction-response.dto.ts
│ │ │ └── transaction.dto.ts
│ │ ├── transaction.controller.spec.ts
│ │ ├── transaction.controller.ts
│ │ ├── transaction.entity.ts
│ │ ├── transaction.module.ts
│ │ └── transaction.service.spec.ts
│ └── user
│ ├── dto
│ │ ├── create-user.dto.ts
│ │ └── get-balance.dto.ts
│ ├── user.controller.spec.ts
│ ├── user.controller.ts
│ ├── user.entity.ts
│ ├── user.module.ts
│ ├── user.service.spec.ts
│ └── user.service.ts
├── test
│ ├── app.e2e-spec.ts
│ └── jest-e2e.json
├── tsconfig.build.json
└── tsconfig.json
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

### Docker Setup
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

## JSDoc Comments in This Project

We use JSDoc comments at the beginning of every function in this project to:

1. **Enhance Code Readability:** Provide clear explanations of what each function does, its parameters, return values, and exceptions.
2. **Improve Maintainability:** Make it easier to maintain and update the code by clearly documenting its behavior.
3. **Enable Documentation Generation:** Facilitate the automatic creation of up-to-date API documentation.
4. **Ensure Consistent Standards:** Standardize documentation format across the codebase.
5. **Aid Collaboration:** Help team members understand and work with the code more efficiently.

JSDoc comments are key to maintaining clarity and quality in our code.

## Stay in touch

- Author - [Amir Zare](mailto:zareamirhussein@gmail.com)
