import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Check } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useNotifications } from "../hooks/useNotifications";
import { useMarkNotificationRead } from "../hooks/useMarkNotificationRead";
import { useMarkAllNotificationsRead } from "../hooks/useMarkAllNotificationsRead";
import NotificationList from "../components/NotificationList";
import NotificationSkeleton from "../components/NotificationSkeleton";
import NotificationFilter from "../components/NotificationFilter";
import NotificationSearch from "../components/NotificationSearch";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Build API Query Parameters
  const queryParams = useMemo(() => {
    const params = {
      page,
      search: debouncedSearch.trim() || undefined,
    };
    if (filter === "unread") {
      params.is_read = "false";
    } else if (filter === "read") {
      params.is_read = "true";
    }
    return params;
  }, [page, debouncedSearch, filter]);

  // React Query Hooks
  const { data: listResponse, isLoading, error } = useNotifications(queryParams);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications = listResponse?.data?.results || [];
  const count = listResponse?.data?.count || 0;
  const totalPages = Math.ceil(count / 10);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await markReadMutation.mutateAsync(notif.id);
    }
    if (notif.bill?.id) {
      if (notif.bill.current_status === "ACCOUNTS_CLEARED") {
        navigate(`/bills/${notif.bill.id}`);
      } else {
        navigate(`/workflow/${notif.bill.id}`);
      }
    } else {
      navigate("/workflow");
    }
  };

  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync();
  };

  const breadcrumbs = [
    { name: "AAK Console", path: "/" },
    { name: "Notifications" },
  ];

  return (
    <div className="space-y-6 select-none font-sans max-w-4xl">
      {/* Page Header */}
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with automatic workflow alerts and billing lifecycle clearances."
        breadcrumbs={breadcrumbs}
        primaryAction={
          notifications.some((n) => !n.is_read) && (
            <Button
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              className="cursor-pointer gap-2 shadow-sm font-bold uppercase tracking-wider text-xs"
            >
              <Check className="size-4" />
              <span>Mark All Read</span>
            </Button>
          )
        }
      />

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        <NotificationFilter filter={filter} onChange={setFilter} />
        <NotificationSearch value={search} onChange={setSearch} />
      </div>

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-zinc-200 rounded-xl text-center max-w-sm mx-auto my-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-500 mb-4">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">Sync Connection Failed</h3>
          <p className="text-xs text-zinc-550 mt-1 leading-relaxed">
            {error?.friendlyMessage || "Unable to sync notification alerts with corporate registry. Please try again."}
          </p>
        </div>
      )}

      {/* List Content */}
      {!error && (
        isLoading ? (
          <NotificationSkeleton count={4} />
        ) : (
          <div className="space-y-4">
            <NotificationList
              notifications={notifications}
              onClick={handleNotificationClick}
              onMarkRead={markReadMutation.mutate}
              isCompact={false}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border border-zinc-200 bg-white px-4 py-3 sm:px-6 rounded-xl mt-4 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    variant="outline"
                    className="text-xs border-zinc-200"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    variant="outline"
                    className="text-xs border-zinc-200"
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-zinc-550 font-semibold">
                      Showing Page <span className="font-bold text-zinc-900">{page}</span> of{" "}
                      <span className="font-bold text-zinc-900">{totalPages}</span> (
                      <span className="font-bold text-zinc-900">{count}</span> total alerts)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                      variant="outline"
                      className="text-xs h-8 cursor-pointer border border-zinc-200"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={page === totalPages}
                      variant="outline"
                      className="text-xs h-8 cursor-pointer border border-zinc-200"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default React.memo(NotificationsPage);
