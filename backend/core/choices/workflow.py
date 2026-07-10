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


class WorkflowAction(models.TextChoices):
    SUBMIT = "SUBMIT", "Submit"
    APPROVE = "APPROVE", "Approve"
    REJECT = "REJECT", "Reject"
    REASSIGN = "REASSIGN", "Reassign"
