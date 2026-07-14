import apiClient from "@/services/apiClient";

/**
 * Retrieves paginated list of bills currently waiting in user's role queue levels.
 */
export const getPendingWorkflowQueue = async (params = {}) => {
  const response = await apiClient.get("/workflow/pending/", { params });
  return response.data;
};

/**
 * Retrieves steps details logs trail for specific bill.
 */
export const getWorkflowHistory = async (billId) => {
  const response = await apiClient.get(`/workflow/${billId}/history/`);
  return response.data;
};

/**
 * Approves and transitions invoice check forward.
 */
export const approveWorkflow = async ({ id, comments }) => {
  const response = await apiClient.post(`/workflow/${id}/approve/`, { comments });
  return response.data;
};

/**
 * Rejects and sends invoice back to previous stage.
 */
export const rejectWorkflow = async ({ id, data }) => {
  const response = await apiClient.post(`/workflow/${id}/reject/`, {
    reason_code: data.reason_code,
    reason_note: data.reason_note || "",
  });
  return response.data;
};

/**
 * Places invoice check on HOLDING status.
 */
export const holdWorkflow = async ({ id, data }) => {
  const response = await apiClient.post(`/workflow/${id}/hold/`, {
    reason_code: data.reason_code,
    reason_note: data.reason_note || "",
    comments: data.comments || "",
  });
  return response.data;
};

/**
 * Resumes clearance check and returns bill to previous stage.
 */
export const resumeWorkflow = async ({ id, comments }) => {
  const response = await apiClient.post(`/workflow/${id}/resume/`, { comments });
  return response.data;
};
