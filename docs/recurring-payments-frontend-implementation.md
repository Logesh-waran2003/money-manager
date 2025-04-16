# Recurring Payments Frontend Implementation

This document details the frontend implementation of the recurring payments feature in the Money Manager application. It serves as a guide for developers working on the project.

## Components Implemented

### 1. Recurring Payments Page (`/app/recurring-payments/page.tsx`)

A dedicated page for managing recurring payments with the following features:

- **Filtering**: Tabs to filter payments by status (All/Active/Inactive)
- **Upcoming Payments Section**: Shows payments due soon at the top of the page
- **Payment Cards**: Displays all recurring payments in a grid layout
- **Actions**: Edit, delete, and toggle active status for each payment
- **Empty States**: Appropriate UI for when no payments exist

```tsx
// Key features of the implementation
export default function RecurringPaymentsPage() {
  // State management
  const [recurringPayments, setRecurringPayments] = useState([...]);
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  // Handlers for CRUD operations
  const handleToggleActive = (id, isActive) => {...};
  const handleEdit = (payment) => {...};
  const handleDelete = (id) => {...};
  const handleDialogClose = (payment) => {...};

  // Filter payments based on active tab
  const filteredPayments = recurringPayments.filter(payment => {...});

  // Get upcoming payments for the top section
  const upcomingPayments = recurringPayments
    .filter(payment => payment.isActive)
    .sort((a, b) => a.nextDueDate - b.nextDueDate)
    .slice(0, 3);

  return (
    // Page layout with upcoming payments, tabs, and payment cards
  );
}
```

### 2. Recurring Payment Dialog (`/components/recurring-payment-dialog.tsx`)

A modal dialog component for adding and editing recurring payments:

- **Form Fields**: All necessary fields for creating/editing a recurring payment
- **Validation**: Basic form validation for required fields
- **Dynamic Fields**: Shows/hides fields based on selected options (e.g., custom interval)
- **Account & Category Selection**: Integrates with existing selectors

```tsx
// Key implementation details
const RecurringPaymentDialog = ({
  open,
  onOpenChange,
  initialData,
  onSave,
}) => {
  // Form state
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [customIntervalDays, setCustomIntervalDays] = useState("");
  // ... other form fields

  // Initialize form with data when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setAmount(initialData.amount?.toString() || "");
      // ... set other fields
    } else {
      // Reset form for new payment
    }
  }, [initialData, open]);

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form
    // Create payment object
    onSave(paymentData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

### 3. Recurring Payment Selector (`/components/recurring-payment-selector.tsx`)

A dropdown component for selecting existing recurring payments:

- **Searchable Dropdown**: Lists all recurring payments
- **Payment Details**: Shows name, amount, and due date in dropdown items
- **Selection Callback**: Provides selected payment data to parent component
- **Empty State**: Handles case when no recurring payments exist

```tsx
const RecurringPaymentSelector = ({ 
  value, 
  onChange,
  onPaymentSelected
}) => {
  // In a real implementation, this would use a store or API call
  const recurringPayments = [...]; // Mock data for now
  
  const handleChange = (selectedValue) => {
    onChange(selectedValue);
    
    // Call callback with selected payment data
    if (selectedValue && onPaymentSelected) {
      const selectedPayment = recurringPayments.find(p => p.id === selectedValue);
      if (selectedPayment) {
        onPaymentSelected(selectedPayment);
      }
    }
  };
  
  return (
    <Select value={value} onValueChange={handleChange}>
      {/* Dropdown items */}
    </Select>
  );
};
```

### 4. Upcoming Recurring Payments (`/components/upcoming-recurring-payments.tsx`)

A dashboard widget to display upcoming payments:

- **Compact Layout**: Shows essential payment information
- **Sorting**: Displays payments sorted by due date
- **Link to Full Page**: Provides a link to the recurring payments page
- **Empty State**: Handles case when no upcoming payments exist

```tsx
const UpcomingRecurringPayments = ({
  payments,
  isLoading = false,
}) => {
  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <PaymentsList payments={payments} />
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
};
```

### 5. Enhanced Transaction Form Fields (`/components/enhanced-transaction-form-fields.tsx`)

An enhanced version of the transaction form fields component with recurring payment integration:

- **Recurring Payment Selection**: Dropdown to select existing payments
- **Auto-fill**: Populates form fields when a payment is selected
- **Custom Interval Support**: Additional field for custom interval days
- **Toggle Integration**: Works with existing transaction type toggles

```tsx
const EnhancedTransactionFormFields = ({
  // Existing props
  direction,
  counterparty,
  // ... other props
  
  // New props for recurring payments
  recurringFrequency,
  setRecurringFrequency,
  customIntervalDays,
  setCustomIntervalDays,
  selectedRecurringPaymentId,
  setSelectedRecurringPaymentId,
}) => {
  // Existing handlers
  const handleCreditToggle = (checked) => {...};
  const handleRecurringToggle = (checked) => {...};
  const handleTransferToggle = (checked) => {...};

  return (
    <>
      {/* Existing form fields */}
      
      {/* New recurring payment fields */}
      {isRecurring && (
        <>
          <RecurringPaymentSelector
            value={selectedRecurringPaymentId}
            onChange={setSelectedRecurringPaymentId}
            onPaymentSelected={(payment) => {
              // Auto-fill form fields
              setRecurringName(payment.name);
              setAmount(payment.amount.toString());
              // ... set other fields
            }}
          />
          
          {/* Other recurring payment fields */}
          <FrequencySelector
            value={recurringFrequency}
            onChange={setRecurringFrequency}
          />
          
          {recurringFrequency === "custom" && (
            <CustomIntervalInput
              value={customIntervalDays}
              onChange={setCustomIntervalDays}
            />
          )}
        </>
      )}
    </>
  );
};
```

## State Management

### Recurring Payment Store (`/lib/stores/recurring-payment-store.ts`)

A Zustand store for managing recurring payment state:

```tsx
export const useRecurringPaymentStore = create<RecurringPaymentStore>((set, get) => ({
  recurringPayments: [],
  isLoading: false,
  error: null,
  
  fetchRecurringPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      // In real implementation, this would be an API call
      const response = await fetch('/api/recurring-payments');
      const data = await response.json();
      set({ recurringPayments: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  addRecurringPayment: async (payment) => {
    // Implementation
  },
  
  updateRecurringPayment: async (id, data) => {
    // Implementation
  },
  
  deleteRecurringPayment: async (id) => {
    // Implementation
  },
  
  markPaymentComplete: async (id, transactionDate) => {
    // Get payment and calculate next due date
    // Update the payment
  },
  
  togglePaymentActive: async (id, isActive) => {
    // Implementation
  }
}));
```

## Utility Functions

### Recurring Payment Utils (`/lib/utils/recurring-payment-utils.ts`)

Helper functions for recurring payment operations:

```tsx
// Calculate next due date based on frequency
export function calculateNextDueDate(
  frequency: string,
  currentDate: Date,
  customIntervalDays?: number
): Date {
  const nextDate = new Date(currentDate);
  
  switch (frequency.toLowerCase()) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case 'custom':
      if (customIntervalDays) {
        nextDate.setDate(nextDate.getDate() + customIntervalDays);
      }
      break;
  }
  
  return nextDate;
}

// Get upcoming recurring payments within a specified number of days
export function getUpcomingRecurringPayments(payments: any[], days: number = 7): any[] {
  // Implementation
}

// Other utility functions
```

## API Integration Notes

The frontend components are designed to work with the following API endpoints as specified in the backend documentation:

- **GET `/api/recurring-payments`**: Fetch all recurring payments
- **POST `/api/recurring-payments`**: Create a new recurring payment
- **GET `/api/recurring-payments/:id`**: Fetch a specific recurring payment
- **PUT `/api/recurring-payments/:id`**: Update an existing recurring payment
- **DELETE `/api/recurring-payments/:id`**: Delete a recurring payment

### API Considerations

1. **Request/Response Format**: The frontend expects the API to return recurring payment objects with the structure defined in the data model.

2. **Error Handling**: The frontend handles API errors by displaying appropriate error messages.

3. **Authentication**: All API requests should include authentication headers.

4. **Validation**: The backend should validate all incoming data according to the schema.

## Integration with Transaction Form

The recurring payment feature integrates with the existing transaction form:

1. When a user toggles "Recurring" on, they can:
   - Select an existing recurring payment from the dropdown
   - Create a new recurring payment

2. When a recurring payment is selected:
   - Form fields are auto-populated with payment details
   - User can modify fields if needed

3. When the transaction is saved:
   - If it's linked to a recurring payment, the payment's next due date is updated
   - The transaction is linked to the recurring payment for tracking purposes

## Notes for Backend Developers

1. **Schema Alignment**: The frontend implementation assumes the backend uses the Prisma schema as defined in the documentation.

2. **Next Due Date Calculation**: The backend should implement the same logic for calculating next due dates to ensure consistency.

3. **API Response Format**: The frontend expects specific fields in the API responses. Please ensure the backend provides all required fields.

4. **Validation**: Implement proper validation for all API endpoints to match frontend expectations.

5. **Error Handling**: Provide clear error messages that the frontend can display to users.

## Future Enhancements

1. **Notifications**: Add notification system for upcoming and overdue payments.

2. **Payment History**: Implement a view to see payment history for each recurring payment.

3. **Bulk Actions**: Add ability to perform actions on multiple recurring payments at once.

4. **Import/Export**: Allow users to import/export recurring payment data.

5. **Payment Statistics**: Add visualizations and statistics for recurring payments.
