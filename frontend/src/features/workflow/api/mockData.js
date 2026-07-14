export const MOCK_QUEUED_BILLS = [
  {
    id: 1,
    trackingId: "BILL-00000001",
    billNumber: "INV-2026-X01",
    vendorName: "Dell India",
    departmentName: "IT Department",
    currentStatus: "SUPERVISOR",
    currentOwner: "Supervisor User",
    priority: "High",
    createdDate: "12 Jul 2026",
    amount: 50000.00,
    history: [
      {
        fromStatus: "RECEIVING",
        toStatus: "DATA_ENTRY",
        action: "SUBMIT",
        performedBy: "receiving@aak.com",
        dateTime: "12 Jul 2026, 10:00 AM",
        reason: "",
        comment: "Registered invoice items check."
      },
      {
        fromStatus: "DATA_ENTRY",
        toStatus: "SUPERVISOR",
        action: "APPROVE",
        performedBy: "entry@aak.com",
        dateTime: "12 Jul 2026, 11:30 AM",
        reason: "",
        comment: "Department mapped successfully."
      }
    ],
    holdingInfo: null
  },
  {
    id: 2,
    trackingId: "BILL-00000002",
    billNumber: "INV-2026-B99",
    vendorName: "HP Enterprise",
    departmentName: "Hardware Division",
    currentStatus: "HOLDING",
    currentOwner: "Manager User",
    priority: "Medium",
    createdDate: "11 Jul 2026",
    amount: 120000.00,
    history: [
      {
        fromStatus: "RECEIVING",
        toStatus: "DATA_ENTRY",
        action: "SUBMIT",
        performedBy: "receiving@aak.com",
        dateTime: "11 Jul 2026, 09:00 AM",
        reason: "",
        comment: "Hardware delivery invoice receipt."
      },
      {
        fromStatus: "DATA_ENTRY",
        toStatus: "SUPERVISOR",
        action: "APPROVE",
        performedBy: "entry@aak.com",
        dateTime: "11 Jul 2026, 10:45 AM",
        reason: "",
        comment: "Passed to supervisor queue."
      },
      {
        fromStatus: "SUPERVISOR",
        toStatus: "DEPARTMENT_MANAGER",
        action: "APPROVE",
        performedBy: "supervisor@aak.com",
        dateTime: "11 Jul 2026, 02:00 PM",
        reason: "",
        comment: "Verified quantities, looks good."
      },
      {
        fromStatus: "DEPARTMENT_MANAGER",
        toStatus: "HOLDING",
        action: "HOLD",
        performedBy: "manager@aak.com",
        dateTime: "11 Jul 2026, 04:30 PM",
        reason: "Price Verification Pending",
        comment: "Discrepancy in itemized pricing list. Awaiting vendor feedback."
      }
    ],
    holdingInfo: {
      heldBy: "manager@aak.com",
      holdReason: "Price Verification Pending",
      holdDate: "11 Jul 2026, 04:30 PM",
      customNote: "Waiting for HP sales rep to confirm correct pricing contract rates."
    }
  },
  {
    id: 3,
    trackingId: "BILL-00000003",
    billNumber: "INV-2026-F12",
    vendorName: "Nestle Foods",
    departmentName: "FMCG Retail",
    currentStatus: "DEPARTMENT_MANAGER",
    currentOwner: "Manager User",
    priority: "Low",
    createdDate: "10 Jul 2026",
    amount: 18500.00,
    history: [
      {
        fromStatus: "RECEIVING",
        toStatus: "DATA_ENTRY",
        action: "SUBMIT",
        performedBy: "receiving@aak.com",
        dateTime: "10 Jul 2026, 08:30 AM",
        reason: "",
        comment: "Monthly stock invoice registered."
      },
      {
        fromStatus: "DATA_ENTRY",
        toStatus: "SUPERVISOR",
        action: "APPROVE",
        performedBy: "entry@aak.com",
        dateTime: "10 Jul 2026, 10:00 AM",
        reason: "",
        comment: "Ready for supervisor verification."
      },
      {
        fromStatus: "SUPERVISOR",
        toStatus: "DEPARTMENT_MANAGER",
        action: "APPROVE",
        performedBy: "supervisor@aak.com",
        dateTime: "10 Jul 2026, 12:15 PM",
        reason: "",
        comment: "Supervisor checks clean."
      }
    ],
    holdingInfo: null
  },
  {
    id: 4,
    trackingId: "BILL-00000004",
    billNumber: "INV-2026-A45",
    vendorName: "Amul Milk Dairy",
    departmentName: "Fresh Produce Store",
    currentStatus: "ACCOUNTS",
    currentOwner: "Accounts Officer",
    priority: "High",
    createdDate: "13 Jul 2026",
    amount: 45000.00,
    history: [
      {
        fromStatus: "RECEIVING",
        toStatus: "DATA_ENTRY",
        action: "SUBMIT",
        performedBy: "receiving@aak.com",
        dateTime: "13 Jul 2026, 06:30 AM",
        reason: "",
        comment: "Fresh items invoice logged."
      },
      {
        fromStatus: "DATA_ENTRY",
        toStatus: "SUPERVISOR",
        action: "APPROVE",
        performedBy: "entry@aak.com",
        dateTime: "13 Jul 2026, 08:00 AM",
        reason: "",
        comment: "Approved details."
      },
      {
        fromStatus: "SUPERVISOR",
        toStatus: "DEPARTMENT_MANAGER",
        action: "APPROVE",
        performedBy: "supervisor@aak.com",
        dateTime: "13 Jul 2026, 09:15 AM",
        reason: "",
        comment: "Passed."
      },
      {
        fromStatus: "DEPARTMENT_MANAGER",
        toStatus: "ACCOUNTS",
        action: "APPROVE",
        performedBy: "manager@aak.com",
        dateTime: "13 Jul 2026, 11:00 AM",
        reason: "",
        comment: "Manager approved payouts checks."
      }
    ],
    holdingInfo: null
  }
];
