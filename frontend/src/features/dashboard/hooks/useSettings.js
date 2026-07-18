import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSystemSettings, updateSystemSettings } from "../api/settings.api";

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ["systemSettings"],
    queryFn: getSystemSettings,
    staleTime: 5 * 60 * 1000, // Cache settings for 5 minutes
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSystemSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(["systemSettings"], data);
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
    },
  });
};
