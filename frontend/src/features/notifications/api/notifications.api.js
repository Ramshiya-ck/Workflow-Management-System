import apiClient from "@/services/apiClient";

/**
 * Retrieves paginated lists of notifications.
 */
export const getNotifications = async (params = {}) => {
  const response = await apiClient.get("/notifications/", { params });
  return response.data;
};

/**
 * Retrieves unread notifications count.
 */
export const getUnreadNotificationCount = async () => {
  const response = await apiClient.get("/notifications/unread-count/");
  return response.data;
};

/**
 * Marks a specific notification as read.
 */
export const markNotificationRead = async (id) => {
  const response = await apiClient.post(`/notifications/${id}/read/`);
  return response.data;
};

/**
 * Marks all notifications as read.
 */
export const markAllNotificationsRead = async () => {
  const response = await apiClient.post("/notifications/read-all/");
  return response.data;
};
