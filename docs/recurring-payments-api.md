# Recurring Payments API Documentation

This document outlines the API endpoints available for managing recurring payments in the Money Manager application.

## Base URL

All API endpoints are relative to the base URL of the application.

## Authentication

All endpoints require authentication. The user must be logged in to access these endpoints.

## Endpoints

### List Recurring Payments

```
GET /api/recurring-payments
```

Retrieves all recurring payments for the authenticated user.

#### Query Parameters

| Parameter | Type    | Description                                      |
|-----------|---------|--------------------------------------------------|
| active    | boolean | Filter by active status (true/false)             |
| upcoming  | number  | Filter for payments due within X days            |

#### Response

```json
[
  {
    "id": "cuid123",
    "userId": "user123",
    "name": "Netflix Subscription",
    "defaultAmount": 15.99,
    "frequency": "monthly",
    "customIntervalDays": null,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": null,
    "nextDueDate": "2025-05-01T00:00:00.000Z",
    "accountId": "account123",
    "categoryId": "category123",
    "counterparty": "Netflix",
    "description": "Monthly streaming subscription",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-04-01T00:00:00.000Z",
    "account": {
      "id": "account123",
      "name": "Chase Credit Card",
      // other account fields...
    },
    "category": {
      "id": "category123",
      "name": "Entertainment",
      // other category fields...
    }
  }
  // more recurring payments...
]
```

### Create Recurring Payment

```
POST /api/recurring-payments
```

Creates a new recurring payment.

#### Request Body

| Field             | Type    | Required | Description                                           |
|-------------------|---------|----------|-------------------------------------------------------|
| name              | string  | Yes      | Name of the recurring payment                         |
| defaultAmount     | number  | Yes      | Default amount for the payment                        |
| frequency         | string  | Yes      | Frequency (daily, weekly, monthly, quarterly, yearly, custom) |
| customIntervalDays| number  | For custom| Number of days for custom frequency                  |
| startDate         | string  | Yes      | Start date (ISO format)                               |
| nextDueDate       | string  | Yes      | Next due date (ISO format)                            |
| endDate           | string  | No       | End date (ISO format)                                 |
| accountId         | string  | No       | ID of the associated account                          |
| categoryId        | string  | No       | ID of the associated category                         |
| counterparty      | string  | No       | Name of the counterparty                              |
| description       | string  | No       | Description of the payment                            |
| isActive          | boolean | No       | Whether the payment is active (default: true)         |

#### Response

```json
{
  "id": "cuid123",
  "userId": "user123",
  "name": "Netflix Subscription",
  "defaultAmount": 15.99,
  "frequency": "monthly",
  "customIntervalDays": null,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": null,
  "nextDueDate": "2025-05-01T00:00:00.000Z",
  "accountId": "account123",
  "categoryId": "category123",
  "counterparty": "Netflix",
  "description": "Monthly streaming subscription",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-04-01T00:00:00.000Z",
  "account": {
    "id": "account123",
    "name": "Chase Credit Card",
    // other account fields...
  },
  "category": {
    "id": "category123",
    "name": "Entertainment",
    // other category fields...
  }
}
```

### Get Recurring Payment

```
GET /api/recurring-payments/{id}
```

Retrieves a specific recurring payment by ID.

#### Response

```json
{
  "id": "cuid123",
  "userId": "user123",
  "name": "Netflix Subscription",
  "defaultAmount": 15.99,
  "frequency": "monthly",
  "customIntervalDays": null,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": null,
  "nextDueDate": "2025-05-01T00:00:00.000Z",
  "accountId": "account123",
  "categoryId": "category123",
  "counterparty": "Netflix",
  "description": "Monthly streaming subscription",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-04-01T00:00:00.000Z",
  "account": {
    "id": "account123",
    "name": "Chase Credit Card",
    // other account fields...
  },
  "category": {
    "id": "category123",
    "name": "Entertainment",
    // other category fields...
  }
}
```

### Update Recurring Payment

```
PUT /api/recurring-payments/{id}
```

Updates a specific recurring payment.

#### Request Body

Any of the fields from the Create endpoint can be included for updating.

#### Response

```json
{
  "id": "cuid123",
  "userId": "user123",
  "name": "Netflix Subscription",
  "defaultAmount": 15.99,
  "frequency": "monthly",
  "customIntervalDays": null,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": null,
  "nextDueDate": "2025-05-01T00:00:00.000Z",
  "accountId": "account123",
  "categoryId": "category123",
  "counterparty": "Netflix",
  "description": "Monthly streaming subscription",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-04-01T00:00:00.000Z",
  "account": {
    "id": "account123",
    "name": "Chase Credit Card",
    // other account fields...
  },
  "category": {
    "id": "category123",
    "name": "Entertainment",
    // other category fields...
  }
}
```

### Delete Recurring Payment

```
DELETE /api/recurring-payments/{id}
```

Deletes a specific recurring payment.

#### Response

```json
{
  "success": true,
  "message": "Recurring payment deleted successfully"
}
```

### Update Next Due Date

```
POST /api/recurring-payments/{id}/update-due-date
```

Updates the next due date for a recurring payment based on its frequency. This endpoint is typically called after a transaction is created for a recurring payment.

#### Response

```json
{
  "id": "cuid123",
  "userId": "user123",
  "name": "Netflix Subscription",
  "defaultAmount": 15.99,
  "frequency": "monthly",
  "customIntervalDays": null,
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": null,
  "nextDueDate": "2025-06-01T00:00:00.000Z", // Updated due date
  "accountId": "account123",
  "categoryId": "category123",
  "counterparty": "Netflix",
  "description": "Monthly streaming subscription",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-04-01T00:00:00.000Z",
  "account": {
    "id": "account123",
    "name": "Chase Credit Card",
    // other account fields...
  },
  "category": {
    "id": "category123",
    "name": "Entertainment",
    // other category fields...
  }
}
```

### Get Upcoming Payments

```
GET /api/recurring-payments/upcoming
```

Retrieves upcoming recurring payments for the authenticated user.

#### Query Parameters

| Parameter | Type   | Default | Description                                |
|-----------|--------|---------|--------------------------------------------|
| days      | number | 7       | Number of days to look ahead               |
| limit     | number | 10      | Maximum number of payments to return       |

#### Response

```json
[
  {
    "id": "cuid123",
    "userId": "user123",
    "name": "Netflix Subscription",
    "defaultAmount": 15.99,
    "frequency": "monthly",
    "customIntervalDays": null,
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": null,
    "nextDueDate": "2025-05-01T00:00:00.000Z",
    "accountId": "account123",
    "categoryId": "category123",
    "counterparty": "Netflix",
    "description": "Monthly streaming subscription",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-04-01T00:00:00.000Z",
    "account": {
      "id": "account123",
      "name": "Chase Credit Card",
      // other account fields...
    },
    "category": {
      "id": "category123",
      "name": "Entertainment",
      // other category fields...
    }
  }
  // more upcoming payments...
]
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden

```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found

```json
{
  "error": "Recurring payment not found"
}
```

### 400 Bad Request

```json
{
  "error": "Missing required fields",
  "requiredFields": ["name", "defaultAmount", "frequency", "startDate", "nextDueDate"]
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to fetch recurring payments"
}
```
