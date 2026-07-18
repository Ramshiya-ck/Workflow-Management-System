from django.db import models


class UserRole(models.TextChoices):
    SUPER_ADMIN = "SUPER_ADMIN", "Super Admin"
    RECEIVING = "RECEIVING", "Receiving"
    DATA_ENTRY = "DATA_ENTRY", "Data Entry"
    SUPERVISOR = "SUPERVISOR", "Supervisor"
    MANAGER = "MANAGER", "Manager"
    ACCOUNTS = "ACCOUNTS", "Accounts"
    AUDIT_MANAGER = "AUDIT_MANAGER", "Audit Manager"


class BillStatus(models.TextChoices):
    RECEIVING = "RECEIVING", "Receiving"
    DATA_ENTRY = "DATA_ENTRY", "Data Entry"
    SUPERVISOR = "SUPERVISOR", "Supervisor"
    DEPARTMENT_MANAGER = "DEPARTMENT_MANAGER", "Department Manager"
    ACCOUNTS = "ACCOUNTS", "Accounts"
    ACCOUNTS_CLEARED = "ACCOUNTS_CLEARED", "Accounts Cleared"
    HOLDING = "HOLDING", "Holding"


class WorkflowAction(models.TextChoices):
    SUBMIT = "SUBMIT", "Submit"
    APPROVE = "APPROVE", "Approve"
    REJECT = "REJECT", "Reject"
    REASSIGN = "REASSIGN", "Reassign"
    HOLD = "HOLD", "Hold"
    RESUME = "RESUME", "Resume"


class WorkflowRejectReason(models.TextChoices):
    CREDIT_NOTE_PENDING = "Credit Note Pending", "Credit Note Pending"
    PRICE_DIFFERENCE = "Price Difference", "Price Difference"
    DISCOUNT_PENDING = "Discount Pending", "Discount Pending"
    OTHER = "Other", "Other"


class WorkflowHoldReason(models.TextChoices):
    PRICE_DISCREPANCY = "Price Discrepancy", "Price Discrepancy"
    QUANTITY_DISCREPANCY = "Quantity Discrepancy", "Quantity Discrepancy"
    TAX_DISCREPANCY = "Tax Discrepancy", "Tax Discrepancy"
    VENDOR_CLARIFICATION_PENDING = "Vendor Clarification Pending", "Vendor Clarification Pending"
    CREDIT_NOTE_PENDING = "Credit Note Pending", "Credit Note Pending"
    PRICE_VERIFICATION_PENDING = "Price Verification Pending", "Price Verification Pending"
    GST_VERIFICATION_PENDING = "GST Verification Pending", "GST Verification Pending"
    AWAITING_MANAGEMENT_DECISION = "Awaiting Management Decision", "Awaiting Management Decision"
    OTHER = "Other", "Other"

