from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.workflow.services import WorkflowService
from apps.workflow.serializers import WorkflowHistorySerializer, WorkflowTransitionSerializer
from .models import Bill
from .serializers import BillSerializer, BillCreateSerializer
from .services import BillService
from core.choices import BillStatus, WorkflowAction


class BillViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Bills and driving workflow transitions.
    """

    queryset = Bill.objects.all().order_by("-created_at")
    serializer_class = BillSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["current_status", "vendor", "department", "created_by", "assigned_to"]
    search_fields = ["bill_number", "tracking_id", "vendor__name", "department__name"]
    ordering_fields = ["created_at", "bill_date", "amount"]

    def get_serializer_class(self):
        if self.action == "create":
            return BillCreateSerializer
        return BillSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        bill = BillService.create_bill(
            user=request.user,
            bill_number=serializer.validated_data["bill_number"],
            bill_date=serializer.validated_data["bill_date"],
            amount=serializer.validated_data["amount"],
            vendor=serializer.validated_data["vendor"],
            department=serializer.validated_data["department"],
        )

        response_serializer = BillSerializer(bill)
        return Response(
            {
                "success": True,
                "message": "Bill registered successfully.",
                "data": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        # Validation: only RECEIVING status bills can be modified by their creator
        if instance.current_status != BillStatus.RECEIVING and not request.user.is_superuser:
            raise PermissionDenied("Only bills in RECEIVING state can be edited.")

        if instance.created_by != request.user and not request.user.is_superuser:
            raise PermissionDenied("You can only edit bills created by yourself.")

        # Re-use create serializer for validating input params
        serializer = BillCreateSerializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        bill = BillService.update_bill(
            user=request.user,
            bill_id=instance.pk,
            bill_number=serializer.validated_data.get("bill_number"),
            bill_date=serializer.validated_data.get("bill_date"),
            amount=serializer.validated_data.get("amount"),
            vendor=serializer.validated_data.get("vendor"),
            department=serializer.validated_data.get("department"),
        )

        response_serializer = BillSerializer(bill)
        return Response(
            {
                "success": True,
                "message": "Bill updated successfully.",
                "data": response_serializer.data,
            }
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Delete authorization: creator (if state is RECEIVING) or super admin
        if not request.user.is_superuser:
            if instance.current_status != BillStatus.RECEIVING:
                raise PermissionDenied("Only draft bills in RECEIVING status can be deleted.")
            if instance.created_by != request.user:
                raise PermissionDenied("You can only delete bills created by yourself.")

        BillService.soft_delete_bill(user=request.user, bill_id=instance.pk)
        return Response({"success": True, "message": "Bill deleted successfully.", "data": None})

    @action(detail=True, methods=["post"], url_path="transition")
    def transition(self, request, pk=None):
        """
        Action endpoint to submit, approve, reject, or reassign a bill.
        """
        instance = self.get_object()
        serializer = WorkflowTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data["action"]
        comments = serializer.validated_data.get("comments", "")
        target_user_id = serializer.validated_data.get("target_user_id")

        bill = None
        if action == WorkflowAction.SUBMIT:
            bill = WorkflowService.submit_bill(user=request.user, bill_id=instance.pk, comments=comments)
        elif action == WorkflowAction.APPROVE:
            bill = WorkflowService.approve_bill(
                user=request.user, bill_id=instance.pk, comments=comments
            )
        elif action == WorkflowAction.REJECT:
            bill = WorkflowService.reject_bill(
                user=request.user, bill_id=instance.pk, comments=comments
            )
        elif action == WorkflowAction.REASSIGN:
            bill = WorkflowService.reassign_bill(
                user=request.user,
                bill_id=instance.pk,
                target_user_id=target_user_id,
                comments=comments,
            )
        else:
            raise ValidationError(f"Action '{action}' is not supported.")

        response_serializer = BillSerializer(bill)
        return Response(
            {
                "success": True,
                "message": f"Bill action {action} completed successfully.",
                "data": response_serializer.data,
            }
        )

    @action(detail=True, methods=["get"], url_path="history")
    def history(self, request, pk=None):
        """
        Retrieves the workflow history timeline for a specific bill.
        """
        instance = self.get_object()
        history = instance.history.all().order_by("created_at")
        serializer = WorkflowHistorySerializer(history, many=True)
        return Response(
            {
                "success": True,
                "message": "Workflow history retrieved successfully.",
                "data": serializer.data,
            }
        )
