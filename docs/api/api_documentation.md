# MedPredict AI - REST API Documentation

## Authentication & Authorization
Base URL: `/api`
Security Scheme: Bearer JWT (`Authorization: Bearer <token>`)

### Supported Roles
1. `HOSPITAL_ADMIN` - Full administrative privileges, user management, and hospital settings.
2. `PHARMACY_MANAGER` - Inventory reordering, purchase orders, supplier management, and ML reports.
3. `PHARMACIST` - Outpatient dispensary, point-of-sale logging, FEFO batch dispensing, and stock queries.

---

## Key Endpoints

### Auth
- `POST /api/auth/login` - Authenticate staff user, returns JWT access token.
- `GET /api/auth/me` - Get profile and permissions for currently authenticated user.

### Users (Admin Only)
- `GET /api/users` - List all staff users across hospitals.
- `POST /api/users` - Create a new user with hashed password and role.

### Medicines & Formulary
- `GET /api/medicines` - Search master medicine formulary and ATC classifications.
- `POST /api/medicines` - Register a new master medicine.

### Inventory & Batches
- `GET /api/inventory` - Get current stock levels, safety thresholds, and batch expiry.
- `POST /api/inventory/batch` - Register a newly received medicine batch.

### Transactions & FEFO
- `GET /api/transactions` - Audit trail of purchases, dispensations, transfers, and adjustments.
- `POST /api/transactions/dispense` - FEFO-optimized medicine dispensing endpoint.

### Predictive AI & Explainability
- `POST /api/predictions/shortage` - Evaluate shortage probability, risk level, and runout horizon.
- `POST /api/predictions/expiry` - Evaluate batch expiry risk and financial vulnerability.
- `POST /api/predictions/recommendation` - Rule-based decision recommendation engine.

### Suppliers & Purchases
- `GET /api/suppliers` - List supplier directory with fulfillment lead times and reliability.
- `GET /api/reports` - Audit and compliance summaries.
