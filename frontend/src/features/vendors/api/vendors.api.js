import apiClient from "@/services/apiClient";

/**
 * Retrieves lists of suppliers matching parameters.
 */
export const getVendors = async (params = {}) => {
  const response = await apiClient.get("/vendors/", { params });
  return response.data;
};

/**
 * Retrieves details for specific supplier profile.
 */
export const getVendor = async (id) => {
  const response = await apiClient.get(`/vendors/${id}/`);
  return response.data;
};

/**
 * Registers new vendor definition profiles.
 */
export const createVendor = async (data) => {
  const response = await apiClient.post("/vendors/", {
    name: data.name,
    address: data.address,
    mobile_number: data.mobileNumber,
    gst_number: data.gstNumber,
    credit_days: Number(data.creditDays),
    is_active: data.isActive,
  });
  return response.data;
};

/**
 * Modifies parameters of an existing vendor profile.
 */
export const updateVendor = async ({ id, data }) => {
  const payload = {};
  if (data.name) payload.name = data.name;
  if (data.address) payload.address = data.address;
  if (data.mobileNumber) payload.mobile_number = data.mobileNumber;
  if (data.gstNumber) payload.gst_number = data.gstNumber;
  if (data.creditDays !== undefined) payload.credit_days = Number(data.creditDays);
  if (data.isActive !== undefined) payload.is_active = data.isActive;

  const response = await apiClient.patch(`/vendors/${id}/`, payload);
  return response.data;
};

/**
 * Permanently removes supplier reference records.
 */
export const deleteVendor = async (id) => {
  const response = await apiClient.delete(`/vendors/${id}/`);
  return response.data;
};
