# 02 Requirements - Vendors Module

This document outlines the requirements and business rules for the **Vendors** module of the AK-Hypermarket Bill Tracking & Workflow Management System.

---

## 1. Dependency Analysis & Review

The Vendors module depends on the following existing modules:

*   **Users & Roles (`apps.users`):** Utilizes role-based access control (RBAC), specifically checking user roles for authorization (e.g., verifying if a user is `SUPER_ADMIN` to modify vendors).
*   **Authentication (`SimpleJWT`):** Restricts data viewing to authenticated users and ensures every mutation is associated with a logged-in user for audit logging.
*   **Audit Logging (`apps.audit`):** Interacts with the `AuditService` to write records of `CREATE`, `UPDATE`, `ACTIVATE`, `DEACTIVATE`, and `DELETE` actions.
*   **Departments (`apps.departments`):** Shared API standards, response envelopes, and pagination mechanisms (`StandardResultsSetPagination`).

---

## 2. Client Requirements (Data Schema)

Each Vendor entity must contain only the following attributes:

| Field Name | Type | Validation Rules | Description |
| :--- | :--- | :--- | :--- |
| **Vendor Name** | String | Required, Unique (case-insensitive), Max 150 chars. | The official trade name of the vendor. |
| **Address** | Text | Required. | The physical/billing address of the vendor. |
| **Mobile Number** | CharField | Required, Validated in the application layer using phone regex (`^\+?1?\d{9,15}$`). Stored as a CharField (Max 20 chars). | Primary contact number. |
| **GST Number** | String | Required, Unique, Format validation (15-character alphanumeric GSTIN format). Verified in the application layer. | Tax registration identifier. |
| **Credit Days** | Integer | Required, Non-negative integer ($\ge 0$). | Permitted credit payment window in days. |
| **Active Status** | Boolean | Required, Defaults to `True`. | Active/inactive state flag. |

---

## 3. Functional Requirements

*   **Create Vendor:** Allow creation of new vendors with uniqueness and format validations applied.
*   **Update Vendor:** Allow updates to any attributes (including Name and GST Number, provided their uniqueness is maintained).
*   **View Vendor:** Retrieve detailed information of a specific vendor by ID.
*   **List Vendors:** List all vendors with standard pagination, filtering (by active status), and search capabilities (searching by Vendor Name, GST, and Mobile).
*   **Activate / Deactivate Vendor:** Toggle the active status flag of the vendor.
*   **Delete Vendor:** Hard delete is allowed *only* if the vendor has never been referenced by any Bill. If referenced, deletion is blocked.

---

## 4. Business Rules

1.  **Case-Insensitive Uniqueness (Vendor Name):** Duplicate names are forbidden, regardless of case (e.g., "Vendor A" and "vendor a" are duplicates).
2.  **GST Number Uniqueness & Validation:** The GST Number must be globally unique across all vendors. Uniqueness and format validation must be explicitly checked in the application layer (serializer and service levels).
3.  **Mobile Number Validation:** Validated in the application layer using a standard regex pattern (between 9 and 15 digits, optionally prefixed with `+`). Must be stored as a `CharField` in the database.
4.  **Credit Days Constraint:** The field must accept only non-negative integers (greater than or equal to zero). This supports Cash Vendors (0 days) and Credit Vendors (>0 days).
5.  **Referential Integrity (Delete):** A vendor referenced by any record in the `Bills` module cannot be deleted. This must be protected at the database level (via `on_delete=models.PROTECT` on the Foreign Key relationship in the `Bill` model) and explicitly validated in the service layer before executing the delete.
6.  **Bill Entry Constraint (Active status):** Only active vendors are selectable when creating or updating bills. Deactivating a vendor does not affect historical bills but blocks new selections.

---

## 5. Security & Auditing Requirements

*   **Role-Based Access Control (RBAC):**
    *   `SUPER_ADMIN` (and django superusers): Full CRUD permissions (Create, Update, Activate, Deactivate, Delete).
    *   `Authenticated Users` (e.g., `DATA_ENTRY`, `SUPERVISOR`, `DEPARTMENT_MANAGER`, `ACCOUNTS`): Read-only permission (View, List).
*   **Audit Logging:**
    *   Every creation, modification, activation, deactivation, and deletion must be recorded using the `AuditService.log_activity` method.
    *   Logged records must capture the performing user, action type (`CREATE`, `UPDATE`, `DELETE`), target object reference, and detail of changes (old value vs. new value where applicable).

---

## 6. Integration Requirements

*   **Bills Module Integration:**
    *   The `Bill` model defines a `ForeignKey` pointing to `Vendor` using `on_delete=models.PROTECT`.
    *   The Bill registration and modification endpoints must filter input parameters so that only vendors with `is_active=True` are selectable (as implemented in `BillCreateSerializer`).

---

# 02 Requirements - Bills Module (Initial Data Entry Workflow)

This section details the requirements and validation checks for the initial **Bill Data Entry** workflow.

## 1. Domain Model Entities (Bills Schema)

| Attribute Name | Data Type | Validation Rules / Constraints | Description |
| :--- | :--- | :--- | :--- |
| **Vendor** | ForeignKey | Required, `on_delete=models.PROTECT`. Links to `Vendor`. | The supplier associated with the bill. |
| **Bill Number** | String | Required, Unique per Vendor, max 50 chars. | Invoice identifier. |
| **Bill Date** | Date | Required. | Date of invoice. |
| **Amount** | Decimal | Required, max 12 digits, 2 decimal places. Must be $> 0.00$. | Invoice amount. |
| **Tracking ID** | String | Required, globally Unique, max 50 chars. Generated by the Service Layer. | Internal lookup tracking ID. |
| **Department** | ForeignKey | Nullable initially, `on_delete=models.PROTECT`. Links to `Department`. | Store department (assigned later during data entry workflow). |
| **Current Status** | String | Required, default: `RECEIVING`. Choices from `BillStatus`. | Workflow state of the bill. |
| **Rejection Reason** | Text | Nullable, blank=True. | Reason for bill rejection (reserved for workflow module). |
| **Created By** | ForeignKey | Required, `on_delete=models.PROTECT` on user model. | User registering the bill. |
| **Updated By** | ForeignKey | Nullable, `on_delete=models.SET_NULL` on user model. | User last updating the bill. |

## 2. Functional Requirements & Scope
*   **Initial Scope:** Covers only the Bill registration (Data Entry) phase.
*   **Department Assignment:** The department field must accept null values initially, since it is assigned during the downstream data entry stages rather than the initial registration.
*   **Media Restrictions:** Do **NOT** support PDF uploads, image uploads, or any other binary file attachments at this stage.

## 3. Business & Integration Rules
1.  **Bill Number Uniqueness:** Unique composite constraint on `(Vendor, Bill Number)` to prevent duplicate bill numbers from the same vendor, while allowing different vendors to have identical invoice numbers.
2.  **Tracking ID Generation:** Automatically generated by the `BillService` layer (not generated inside model `save()` hooks or default kwargs).
3.  **Active Dependencies:** The linked vendor must be active (`is_active=True`) at the time of bill entry.

---

# 02 Requirements - Workflow Module

This section details the requirements and transitions for the **Bill Workflow Approval** process.

## 1. Domain Model Entities (Workflow History)

| Attribute Name | Data Type | Validation Rules / Constraints | Description |
| :--- | :--- | :--- | :--- |
| **Bill** | ForeignKey | Required, `on_delete=models.PROTECT`. Links to `Bill`. | The bill associated with this step. |
| **From Status** | String | Nullable, choices from `BillStatus`. | The previous state of the bill. |
| **To Status** | String | Required, choices from `BillStatus`. | The target state of the bill. |
| **Action** | String | Required, choices from `WorkflowAction` (SUBMIT, APPROVE, REJECT, REASSIGN). | The action taken in this step. |
| **Performed By** | ForeignKey | Required, `on_delete=models.PROTECT`. Links to `User`. | The user executing this action. |
| **Assigned To** | ForeignKey | Nullable, `on_delete=models.SET_NULL`. Links to `User`. | Target user for assignment/reassignment. |
| **Comments / Remarks** | Text | Nullable, optional. | Remarks/reason provided during the transition. |
| **Created At** | DateTime | Required, Auto-generated timestamp, indexed. | Time of workflow step execution. |

## 2. Status Transitions & Role-Based Workflow
The bill progresses through the following sequential states:

```
[RECEIVING] -> (SUBMIT by DATA_ENTRY) -> [DATA_ENTRY] -> (SUBMIT by DATA_ENTRY) -> [SUPERVISOR] -> (APPROVE by SUPERVISOR) -> [DEPARTMENT_MANAGER] -> (APPROVE by DEPARTMENT_MANAGER) -> [ACCOUNTS] -> (APPROVE by ACCOUNTS) -> [ACCOUNTS_CLEARED]
```

### Transition Matrix & Roles:
1.  **Submit Bill (Re-submit):**
    *   **Role:** `DATA_ENTRY` / `SUPER_ADMIN`
    *   **Transitions:** `RECEIVING` / `SUPERVISOR` (re-submit after rejection) -> `DATA_ENTRY` (or target supervisor state).
2.  **Supervisor Approval:**
    *   **Role:** `SUPERVISOR` / `SUPER_ADMIN`
    *   **Transitions:** `DATA_ENTRY` -> `SUPERVISOR` or `DEPARTMENT_MANAGER`.
3.  **Department Manager Approval:**
    *   **Role:** `DEPARTMENT_MANAGER` / `SUPER_ADMIN`
    *   **Transitions:** `SUPERVISOR` / `DATA_ENTRY` -> `DEPARTMENT_MANAGER` or `ACCOUNTS`.
4.  **Accounts Clearance:**
    *   **Role:** `ACCOUNTS` / `SUPER_ADMIN`
    *   **Transitions:** `DEPARTMENT_MANAGER` -> `ACCOUNTS` -> `ACCOUNTS_CLEARED` (terminal state).
5.  **Reject Bill:**
    *   **Roles:** `SUPERVISOR`, `DEPARTMENT_MANAGER`, `ACCOUNTS` / `SUPER_ADMIN`
    *   **Transitions:** Can reject the bill back to previous status levels (e.g. back to `RECEIVING` or `DATA_ENTRY` for correction). Sets the `rejection_reason` on the `Bill`.
6.  **Reassign Bill:**
    *   **Roles:** Authorized workflows / `SUPER_ADMIN`
    *   **Transitions:** Shifts assignment tracking to a new user without changing workflow status.

## 3. Auditing & Logging
*   Comments/Remarks must be logged for every transition (especially mandatory for rejection actions).

---

# 02 Requirements - Dashboard Module

This section details the requirements, metrics, and role-based data layouts for the **Dashboard** module.

## 1. Requirement Analysis
The Dashboard provides high-level key performance indicators (KPIs), metrics, and workflow workload status summaries to users based on their systemic role.

### Dashboard Cards mapping:
1.  **Super Admin:**
    *   `Total Bills`: Total count of active invoices.
    *   `Pending Bills`: Count of bills not in `ACCOUNTS_CLEARED` status.
    *   `Cleared Bills`: Count of bills in `ACCOUNTS_CLEARED` status.
    *   `Rejected Bills`: Count of bills possessing a non-null `rejection_reason`.
    *   `Vendor Count`: Count of active vendors.
    *   `Department Count`: Count of active departments.
    *   `Workflow Summary`: Breakdown of count and total amount of bills per status.
2.  **Receiving:**
    *   `Pending Bills`: Count of bills in draft (`RECEIVING`) status.
    *   `Bills Received Today`: Count of bills created today.
    *   `Bills Returned`: Count of bills rejected back to receiving state.
3.  **Data Entry:**
    *   `Pending Entry`: Count of bills in `DATA_ENTRY` status.
    *   `Completed Today`: Count of bills approved/submitted today by this user.
    *   `Returned Bills`: Count of bills rejected back to data entry state.
4.  **Department Supervisor:**
    *   `Pending Approval`: Count of bills pending supervisor approval (`SUPERVISOR` status).
    *   `Approved Today`: Count of bills approved today by the supervisor.
    *   `Rejected Bills`: Count of bills rejected today by the supervisor.
5.  **Department Manager:**
    *   `Pending Approval`: Count of bills pending manager approval (`DEPARTMENT_MANAGER` status).
    *   `Approved Today`: Count of bills approved today by the manager.
    *   `Rejected Bills`: Count of bills rejected today by the manager.
6.  **Accounts:**
    *   `Pending Verification`: Count of bills pending accounts review (`ACCOUNTS` status).
    *   `Cleared Bills`: Count of bills cleared today by the accounts user.
    *   `Rejected Bills`: Count of bills rejected today by the accounts user.

## 2. API Architecture & Pagination
*   **API Endpoint:** `GET /api/v1/dashboard/`
*   **Response Format:** Standard REST response layout, delivering role-specific card stats lists.
*   **Pagination:** Read-only aggregate counts and lists of pending/recent items are returned. Detailed queue lists follow standard pagination rules (`StandardResultsSetPagination` matching 10 items per page).

## 3. Query Optimization Strategy
To achieve low latency and avoid N+1 query execution problems, database aggregation is structured as follows:
*   **Aggregation & Annotation:** Use Django's `Count()` and `Sum()` aggregates to compute totals in a single database pass, avoiding looping over record queries.
*   **Optimal Prefetching:** Relations (like `vendor` and `department` fields) must be retrieved using `select_related()` if detailed distributions are fetched.
*   **No Database Writes:** The dashboard is purely read-only; no write operations, database tables, or migrations are allowed.



