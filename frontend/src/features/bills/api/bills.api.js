import apiClient from "@/services/apiClient";

/**
 * Retrieves lists of billing invoices matching filters.
 */
export const getBills = async (params = {}) => {
  const response = await apiClient.get("/bills/", { params });
  return response.data;
};

/**
 * Retrieves details for specific billing invoice.
 */
export const getBill = async (id) => {
  const response = await apiClient.get(`/bills/${id}/`);
  return response.data;
};

/**
 * Registers new invoice parameters and starts workflow checks.
 */
export const createBill = async (data) => {
  const response = await apiClient.post("/bills/", {
    bill_number: data.billNumber,
    bill_date: data.billDate,
    amount: parseFloat(data.amount),
    vendor_id: data.vendor,
    department_id: data.department || null,
  });
  return response.data;
};

/**
 * Modifies parameters of registered active invoice.
 */
export const updateBill = async ({ id, data }) => {
  const payload = {};
  if (data.billNumber) payload.bill_number = data.billNumber;
  if (data.billDate) payload.bill_date = data.billDate;
  if (data.amount) payload.amount = parseFloat(data.amount);
  if (data.vendor) payload.vendor_id = data.vendor;
  if (data.department !== undefined) payload.department_id = data.department || null;

  const response = await apiClient.patch(`/bills/${id}/`, payload);
  return response.data;
};

/**
 * Executes invoice deletion.
 */
export const deleteBill = async (id) => {
  const response = await apiClient.delete(`/bills/${id}/`);
  return response.data;
};

/**
 * Dynamic selector options for vendors dropdown.
 */
export const getVendorOptions = async () => {
  const response = await apiClient.get("/vendors/?is_active=true");
  return response.data?.data?.results || [];
};

/**
 * Dynamic selector options for departments dropdown.
 */
export const getDepartmentOptions = async () => {
  const response = await apiClient.get("/departments/?is_active=true");
  return response.data?.data?.results || [];
};
