## Recurring Payments Feature Implementation Guide

### Overview

This document outlines step-by-step instructions for implementing the Recurring Payments feature within the Money Manager application. The goal is to create an intuitive system for users to manage recurring payments easily, get timely reminders, and seamlessly log these transactions.

---

## Step 1: Database Schema Update

Update your Prisma schema as follows:

```prisma
model RecurringPayment {
  id                 String    @id @default(cuid())
  userId             String
  name               String
  defaultAmount      Float
  frequency          String    // e.g., "Monthly", "Weekly", "Custom"
  customIntervalDays Int?      // Days for custom schedules (e.g., 84 days)
  startDate          DateTime
  endDate            DateTime?
  nextDueDate        DateTime
  accountId          String?
  categoryId         String?
  counterparty       String?
  description        String?
  isActive           Boolean   @default(true)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions       Transaction[]

  @@index([userId])
  @@index([nextDueDate])
}
```

Run the migration after updating the schema:

```sh
npx prisma migrate dev
```

---

## Step 2: Create API Routes

**Routes to create:**

- **Create Recurring Payment:**  
  `POST /api/recurring-payments`
- **Update Recurring Payment:**  
  `PUT /api/recurring-payments/[id]`
- **List Recurring Payments:**  
  `GET /api/recurring-payments`
- **Delete Recurring Payment:**  
  `DELETE /api/recurring-payments/[id]`

**API functionality:**

- Create, read, update, delete recurring payment details.
- Validate required fields (frequency, dates, amounts).

---

## Step 3: UI for Recurring Payments Management

Create a dedicated page "Recurring Payments" in the navigation bar:

- List all recurring payments with:

  - Name
  - Amount
  - Frequency (Monthly, Weekly, Custom Interval)
  - Next Due Date
  - Status (Active/Inactive)

- Provide forms/modals for creating and editing:
  - Fields: Name, Default Amount, Frequency (dropdown), Custom Interval (if applicable), Start/End Date, Next Due Date, Account, Category, Counterparty, Description, Active Status.

---

## Step 4: Update Transaction Form for Recurring Payments

When user selects the Recurring toggle:

- Display a searchable dropdown with existing recurring payments.
- Upon selection, auto-fill transaction form fields:

  - Recipient, Amount, Category, Account, Description.

- Provide a quick-create option for new recurring payments if none exist:
  - Small modal/pop-up form with minimal required fields.

---

## Step 5: Logic for Updating Next Due Date

- On transaction save (when linked to recurring payment):
  - Calculate and update `nextDueDate` based on frequency:
    - Monthly: increment by one month
    - Weekly: increment by one week
    - Custom: increment by specified interval (`customIntervalDays`)

Example logic snippet (pseudo-code):

```javascript
const updateNextDueDate = (recurringPayment) => {
  const currentDueDate = new Date(recurringPayment.nextDueDate);
  if (recurringPayment.frequency === "Monthly") {
    recurringPayment.nextDueDate = addMonths(currentDueDate, 1);
  } else if (recurringPayment.frequency === "Weekly") {
    recurringPayment.nextDueDate = addWeeks(currentDueDate, 1);
  } else if (recurringPayment.frequency === "Custom") {
    recurringPayment.nextDueDate = addDays(
      currentDueDate,
      recurringPayment.customIntervalDays
    );
  }
  prisma.recurringPayment.update({
    /* update logic */
  });
};
```
