from django.db import models


class UserRole(models.TextChoices):
    SUPER_ADMIN = "SUPER_ADMIN", "Super Admin"
    DATA_ENTRY = "DATA_ENTRY", "Data Entry"
    SUPERVISOR = "SUPERVISOR", "Supervisor"
    DEPARTMENT_MANAGER = "DEPARTMENT_MANAGER", "Department Manager"
    ACCOUNTS = "ACCOUNTS", "Accounts"


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
    OTHER = "Other", "Other"

