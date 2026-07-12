# 04 Database Design - Vendors Module

This document details the database schema and model design for the **Vendors** module of the AK-Hypermarket Bill Tracking & Workflow Management System.

---

## 1. Relational Database Schema

### Table: `vendors`

The `vendors` table stores vendor registry profiles.

| Column Name | DB Data Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | Primary Key, Auto Increment | Unique internal identifier. |
| `name` | `VARCHAR(150)` | `NOT NULL`, Unique (case-insensitive), Indexed | Trade name of the vendor. |
| `address` | `TEXT` | `NOT NULL` | Physical address. |
| `mobile_number` | `VARCHAR(20)` | `NOT NULL` | Contact number. |
| `gst_number` | `VARCHAR(15)` | `NOT NULL`, Unique, Indexed | Tax identifier. |
| `credit_days` | `INTEGER` | `NOT NULL`, Check `credit_days >= 0` | Authorized payment terms. |
| `is_active` | `BOOLEAN` | `NOT NULL`, Default: `TRUE`, Indexed | Selectable status flag. |
| `created_at` | `TIMESTAMP WITH TZ` | `NOT NULL`, Auto-generated | Row insertion timestamp. |
| `updated_at` | `TIMESTAMP WITH TZ` | `NOT NULL`, Auto-generated | Last modification timestamp. |

#### Database-Level Constraints
*   **Unique Index (Case-Insensitive):** Case-insensitive uniqueness constraint on the `name` column to prevent duplicates such as `Vendor A` and `vendor a`.
*   **GST Uniqueness:** Unique index on the `gst_number` column.
*   **Check Constraint:** A check constraint ensuring `credit_days` is always non-negative (`credit_days >= 0`).

---

## 2. Foreign Key References & Referential Integrity

### Table: `bills` (Existing)
*   **Column:** `vendor_id` (`BIGINT`)
*   **Constraint:** `Foreign Key (vendor_id) REFERENCES vendors(id) ON DELETE PROTECT`
*   **Enforcement:** Relational integrity ensures that any row in the `vendors` table that is referenced by at least one row in the `bills` table cannot be deleted (`ON DELETE PROTECT`). An attempt to delete such a vendor triggers a database `RestrictedError` / `ProtectedError`.

---

## 3. Django Model Mapping

The database schema is mapped to the Django framework in `apps.vendors.models.Vendor` as follows:

```python
class Vendor(models.Model):
    # Core attributes mapping to columns
    name = models.CharField(...)
    address = models.TextField(...)
    mobile_number = models.CharField(...)
    gst_number = models.CharField(...)
    credit_days = models.PositiveIntegerField(...)
    is_active = models.BooleanField(...)
    
    # Meta constraints
    class Meta:
        db_table = "vendors"
        ordering = ["name"]
        constraints = [
            # Enforce case-insensitive uniqueness at database level
            UniqueConstraint(
                Lower("name"), name="unique_vendor_name_case_insensitive"
            )
        ]
```

## 4. Application-Layer vs. Database-Layer Division

In alignment with clean architecture rules:
*   **Database Layer:** Enforces relational integrity (`ON DELETE PROTECT`), unique indexes, and column nullability/types.
*   **Application Layer (Serializers & Services):** Enforces data formatting (regex pattern matching for phone and GST number formats) and does the initial reference checking to provide user-friendly error messages before hitting the database protection block.
*   **Business Logic:** No orchestration workflows, audit logs, or complex validation checks are written inside the model fields or `save()` hooks. They reside in the service layer.

---

# 04 Database Design - Bills Module (Initial Data Entry Workflow)

This section outlines the relational structure and constraint designs for the `bills` table in support of the initial data entry workflow.

## 1. Relational Database Schema

### Table: `bills`

The `bills` table stores information about invoices registered by data entry operators.

| Column Name | DB Data Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | Primary Key, Auto Increment | Unique internal identifier. |
| `bill_number` | `VARCHAR(50)` | `NOT NULL`, Indexed | The invoice number. |
| `bill_date` | `DATE` | `NOT NULL` | The invoice issuance date. |
| `amount` | `NUMERIC(12, 2)` | `NOT NULL`, Check `amount > 0.00` | The total invoice amount. |
| `tracking_id` | `VARCHAR(50)` | `NOT NULL`, Unique, Indexed | Generated unique token for status tracking. |
| `vendor_id` | `BIGINT` | `NOT NULL`, Foreign Key `ON DELETE PROTECT` | Associated vendor reference. |
| `department_id` | `BIGINT` | `NULL`, Foreign Key `ON DELETE PROTECT` | Department code assigned to the bill. |
| `current_status` | `VARCHAR(30)` | `NOT NULL`, Default: `'RECEIVING'` | Current workflow status. |
| `rejection_reason` | `TEXT` | `NULL` | Reason for bill rejection. |
| `created_by_id` | `BIGINT` | `NOT NULL`, Foreign Key `ON DELETE PROTECT` | Reference to the user who created the record. |
| `updated_by_id` | `BIGINT` | `NULL`, Foreign Key `ON DELETE SET_NULL` | Reference to the user who last updated the record. |
| `created_at` | `TIMESTAMP WITH TZ` | `NOT NULL`, Auto-generated | Timestamp of insertion. |
| `updated_at` | `TIMESTAMP WITH TZ` | `NOT NULL`, Auto-generated | Timestamp of last modification. |

### Database-Level Constraints & Indexes
*   **Uniqueness:** 
    *   Unique index on `tracking_id` to guarantee absolute global uniqueness.
    *   Unique composite index on `(vendor_id, bill_number)` to allow identical invoice numbers for different vendors, but block duplicates from the same vendor.
*   **Check Constraint:** A check constraint ensuring `amount` is strictly greater than zero (`amount > 0.00`).
*   **Foreign Key Integrity (`vendor_id` and `department_id`):** Defined with `ON DELETE PROTECT` to prevent accidental deletion of vendors/departments that have bills attached.
*   **Audit FKs (`created_by_id` and `updated_by_id`):** Enforces data audit lineage linking directly to the system users.

---

## 2. Django Model Mapping

The mapping in Django is handled in `apps.bills.models.Bill` as follows:

```python
class Bill(models.Model):
    bill_number = models.CharField(max_length=50, db_index=True)
    bill_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    tracking_id = models.CharField(max_length=50, unique=True, db_index=True)
    vendor = models.ForeignKey("vendors.Vendor", on_delete=models.PROTECT, related_name="bills")
    department = models.ForeignKey("departments.Department", on_delete=models.PROTECT, null=True, blank=True, related_name="bills")
    current_status = models.CharField(max_length=30, choices=BillStatus.choices, default=BillStatus.RECEIVING, db_index=True)
    rejection_reason = models.TextField(null=True, blank=True)
    
    # Audit tracking fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_bills")
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_bills")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bills"
        ordering = ["-created_at"]
        constraints = [
            # Enforce positive invoice amount at database level
            models.CheckConstraint(
                condition=models.Q(amount__gt=0.00),
                name="bill_amount_must_be_positive"
            ),
            # Enforce composite uniqueness of vendor + bill_number
            models.UniqueConstraint(
                fields=["vendor", "bill_number"],
                name="unique_vendor_bill_number"
            )
        ]
```

---

# 04 Database Design - Workflow Module

This section details the relational structure and indexing optimizations for the `workflow_history` table.

## 1. Relational Database Schema

### Table: `workflow_history`

The `workflow_history` table tracks each step and approval action of bills through the system workflows.

| Column Name | DB Data Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `BIGINT` | Primary Key, Auto Increment | Unique internal identifier. |
| `bill_id` | `BIGINT` | `NOT NULL`, Foreign Key `ON DELETE PROTECT` | The associated bill record. |
| `from_status` | `VARCHAR(30)` | `NULL` | The previous status of the bill. |
| `to_status` | `VARCHAR(30)` | `NOT NULL`, Indexed | The target status of the bill. |
| `action` | `VARCHAR(20)` | `NOT NULL`, Indexed | The action taken in this step. |
| `performed_by_id` | `BIGINT` | `NOT NULL`, Foreign Key `ON DELETE PROTECT` | User who performed the action. |
| `assigned_to_id` | `BIGINT` | `NULL`, Foreign Key `ON DELETE SET_NULL` | User assigned for next actions (if applicable). |
| `comments` | `TEXT` | `NULL` | Remarks/reasons for the action. |
| `created_at` | `TIMESTAMP WITH TZ` | `NOT NULL`, Auto-generated, Indexed | Timestamp when the action was logged. |

### Database-Level Constraints & Optimizations
*   **Indexing on Search Columns:** Built-in indexes on `to_status` and `action` to accelerate statistics gathering and workflow reports queries.
*   **Timestamp Indexing:** Indexing on `created_at` to optimize ordering by history sequence when rendering the audit timelines.
*   **Audit Safety (ON DELETE PROTECT):** Since workflow history is an immutable audit trail, deletion of associated bills is blocked if they have any workflow history (`ON DELETE PROTECT`). Similarly, the relationship to users is protected (`ON DELETE PROTECT`) to prevent orphaned trail logs.

---

## 2. Django Model Mapping

The mapping in Django is handled in `apps.workflow.models.WorkflowHistory` as follows:

```python
class WorkflowHistory(models.Model):
    bill = models.ForeignKey("bills.Bill", on_delete=models.PROTECT, related_name="history")
    from_status = models.CharField(max_length=30, choices=BillStatus.choices, blank=True, null=True)
    to_status = models.CharField(max_length=30, choices=BillStatus.choices, db_index=True)
    action = models.CharField(max_length=20, choices=WorkflowAction.choices, db_index=True)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="workflow_actions_performed")
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="workflow_reassignments")
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "workflow_history"
        ordering = ["created_at"]
        verbose_name = "Workflow History"
        verbose_name_plural = "Workflow Histories"
```


