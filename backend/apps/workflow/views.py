from rest_framework import status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.bills.serializers import BillSerializer
from .serializers import WorkflowHistorySerializer, WorkflowApproveSerializer, WorkflowRejectSerializer, WorkflowHoldSerializer, WorkflowResumeSerializer
from .services import WorkflowService
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class WorkflowViewSet(viewsets.ViewSet):
    """
    Thin ViewSet managing approval flow operations.
    Delegates all execution and checks to WorkflowService.
    """

    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="pending")
    def pending(self, request):
        queryset = WorkflowService.list_pending(request.user)

        paginator = StandardResultsSetPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)

        serializer = BillSerializer(paginated_queryset, many=True)

        return Response(
            {
                "success": True,
                "message": "Pending workflow bills retrieved successfully.",
                "data": {
                    "count": paginator.page.paginator.count,
                    "next": paginator.get_next_link(),
                    "previous": paginator.get_previous_link(),
                    "results": serializer.data,
                },
            }
        )

    @action(detail=True, methods=["get"], url_path="history")
    def history(self, request, pk=None):
        history_qs = WorkflowService.get_history(pk)
        serializer = WorkflowHistorySerializer(history_qs, many=True)
        return Response(
            {
                "success": True,
                "message": "Workflow history retrieved successfully.",
                "data": serializer.data,
            }
        )

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        serializer = WorkflowApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        bill = WorkflowService.approve_bill(
            user=request.user,
            bill_id=pk,
            comments=serializer.validated_data.get("comments", ""),
        )

        response_serializer = BillSerializer(bill)
        return Response(
            {
                "success": True,
                "message": "Bill approved successfully.",
                "data": response_serializer.data,
            }
        )

    @action(detail=True, methods=["post"], url_path="reject")
    def reject(self, request, pk=None):
        serializer = WorkflowRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        bill = WorkflowService.reject_bill(
            user=request.user,
            bill_id=pk,
            reason_code=serializer.validated_data["reason_code"],
            reason_note=serializer.validated_data.get("reason_note", ""),
            comments=serializer.validated_data.get("reason_note", "") or serializer.validated_data["reason_code"],
        )

        response_serializer = BillSerializer(bill)
        return Response(
            {
                "success": True,
                "message": "Bill rejected successfully.",
                "data": response_serializer.data,
            }
        )

    @action(detail=True, methods=["post"], url_path="hold")
    def hold(self, request, pk=None):
        serializer = WorkflowHoldSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        bill = WorkflowService.hold_bill(
            user=request.user,
            bill_id=pk,
            reason_code=serializer.validated_data["reason_code"],
            reason_note=serializer.validated_data.get("reason_note", ""),
            comments=serializer.validated_data.get("comments", ""),
        )

        response_serializer = BillSerializer(bill)
        return Response(
            {
                "success": True,
                "message": "Bill placed on hold successfully.",
                "data": response_serializer.data,
            }
        )

    @action(detail=True, methods=["post"], url_path="resume")
    def resume(self, request, pk=None):
        serializer = WorkflowResumeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        bill = WorkflowService.resume_bill(
            user=request.user,
            bill_id=pk,
            comments=serializer.validated_data.get("comments", ""),
        )

        response_serializer = BillSerializer(bill)
        return Response(
            {
                "success": True,
                "message": "Bill workflow resumed successfully.",
                "data": response_serializer.data,
            }
        )
