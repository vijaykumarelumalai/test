# API Contract Specification - VK Traders REST API
**Version:** 1.0.0  
**Base URL:** `/api/v1`  
**Current State:** DATABASE_APPROVED  
**Date:** 2026-09-04  

---

## 1. Authentication & Session Endpoints

### `POST /api/v1/auth/admin-login`
* **Description:** Authenticates Super Admin via credentials or verified Google OAuth token.
* **Request Body:**
  ```json
  { "email": "admin@vktraders.com", "password": "...", "googleToken": null }
  ```
* **Response (200 OK):**
  ```json
  {
    "token": "jwt_token_here",
    "user": { "role": "SUPER_ADMIN", "name": "Super Admin", "email": "admin@vktraders.com" }
  }
  ```

### `POST /api/v1/auth/worker-login`
* **Description:** Authenticates worker via 10-digit mobile phone and 4-digit PIN.
* **Request Body:**
  ```json
  { "phone": "9876543210", "pin": "3210" }
  ```
* **Response (200 OK):**
  ```json
  {
    "token": "jwt_token_here",
    "worker": { "id": 1, "labourId": "VK-001", "name": "Ramesh Kumar", "workerType": "PERMANENT" }
  }
  ```

---

## 2. Dashboard Endpoints (Super Admin)

### `GET /api/v1/dashboard/metrics`
* **Auth:** Super Admin
* **Response (200 OK):**
  ```json
  {
    "totalLabour": 128,
    "permanentLabour": 78,
    "temporaryLabour": 50,
    "monthlyPaid": 475000,
    "totalAdvances": 120000,
    "totalActiveLoans": 85000,
    "todayAttendanceSummary": {
      "total": 128,
      "present": 102,
      "absent": 18,
      "halfDay": 8,
      "unmarked": 0
    }
  }
  ```

### `GET /api/v1/dashboard/recent-activity`
* **Auth:** Super Admin
* **Response (200 OK):**
  ```json
  {
    "recentLabour": [
      { "id": 5, "name": "Manoj K", "type": "TEMPORARY", "date": "2026-09-04" }
    ],
    "recentPayments": [
      { "id": 1, "name": "Ramesh Kumar", "amount": 12000, "date": "2026-09-03" }
    ],
    "pendingAdvances": [
      { "id": 1, "name": "Mani K", "amount": 5000, "date": "2026-09-02" }
    ]
  }
  ```

---

## 3. Worker Management Endpoints

### `GET /api/v1/workers`
* **Query Params:** `?type=PERMANENT|TEMPORARY&search=...&active=true`
* **Response (200 OK):** List of workers with pagination.

### `POST /api/v1/workers`
* **Description:** Onboards new worker, auto-generates next `VK-XXX` ID, assigns PIN (last 4 digits of phone), logs Tamil/English welcome message, and provides WhatsApp deep link.
* **Request Body:**
  ```json
  {
    "name": "Suresh M",
    "phone": "9840123456",
    "workerType": "PERMANENT",
    "department": "Construction Site A",
    "dailyWage": 750,
    "joiningDate": "2026-09-04",
    "emergencyContact": "9840999999"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "worker": {
      "id": 2,
      "labourId": "VK-002",
      "name": "Suresh M",
      "phone": "9840123456",
      "workerType": "PERMANENT",
      "dailyWage": 750,
      "defaultPin": "3456"
    },
    "welcomeMessage": {
      "english": "You are onboarded as a permanent worker at VK Traders. Welcome to the VK Traders family! Have a good day. Your ID: VK-002, PIN: 3456.",
      "tamil": "நீங்கள் வி.கே ட்ரேடர்ஸில் நிரந்தரப் பணியாளராக சேர்க்கப்பட்டுள்ளீர்கள். வி.கே ட்ரேடர்ஸ் குடும்பத்திற்கு உங்களை அன்புடன் வரவேற்கிறோம்! இனிய நாளாக அமையட்டும். உங்கள் பணியாளர் எண்: VK-002, பின்: 3456.",
      "whatsAppUrl": "https://wa.me/919840123456?text=..."
    }
  }
  ```

---

## 4. Attendance Endpoints

### `GET /api/v1/attendance/by-date?date=YYYY-MM-DD`
* Returns roster of all active workers with their marked status for that date (`PRESENT`, `ABSENT`, `HALF_DAY`, or `UNMARKED`), along with default and effective daily wage.

### `POST /api/v1/attendance/save-daily`
* **Description:** Saves batch attendance from the dashboard or attendance screen.
* **Request Body:**
  ```json
  {
    "date": "2026-09-04",
    "records": [
      { "workerId": 1, "status": "PRESENT", "effectiveWage": 800, "remarks": "" },
      { "workerId": 2, "status": "HALF_DAY", "effectiveWage": 750, "remarks": "Left at 1pm" },
      { "workerId": 3, "status": "ABSENT", "effectiveWage": 700, "remarks": "" }
    ]
  }
  ```
* **Response (200 OK):** Summary count of saved/updated records.

---

## 5. Advances & Loan Endpoints

### `POST /api/v1/advances` & `GET /api/v1/advances`
* Log cash advance, query advance records with filters.

### `POST /api/v1/loans` & `GET /api/v1/loans`
* Create worker loan (`LN-XXX`), track amortization, record repayments.

---

## 6. Reports & Worker Portal Endpoints

### `GET /api/v1/reports/monthly-ledger?month=YYYY-MM`
* Generates detailed table of days worked, gross wages, advance deductions, loan deductions, and net payable. Exportable as JSON, Excel, and printable PDF.

### `GET /api/v1/labour/my-summary`
* **Auth:** Labour JWT
* **Response (200 OK):**
  ```json
  {
    "worker": { "labourId": "VK-001", "name": "Ramesh Kumar", "workerType": "PERMANENT" },
    "currentMonth": {
      "month": "2026-09",
      "daysPresent": 22,
      "daysHalf": 2,
      "daysAbsent": 1,
      "grossWage": 18400,
      "totalAdvances": 3000,
      "loanDeduction": 1000,
      "netPayable": 14400
    },
    "attendanceHistory": [...]
  }
  ```
