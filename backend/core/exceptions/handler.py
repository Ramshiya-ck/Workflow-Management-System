import logging
from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler to standardize DRF errors.
    Formats errors to match:
    {
        "success": false,
        "message": "Error Message",
        "errors": {
            "field_name": ["details"]
        }
    }
    """
    # Map Django validation errors to DRF validation errors
    if isinstance(exc, DjangoValidationError):
        if hasattr(exc, "message_dict"):
            exc = DRFValidationError(detail=exc.message_dict)
        elif hasattr(exc, "messages"):
            exc = DRFValidationError(detail=exc.messages)
        else:
            exc = DRFValidationError(detail=str(exc))

    # Map database IntegrityErrors (like unique constraint violation) to DRF validation errors
    if isinstance(exc, IntegrityError):
        logger.error(f"Database IntegrityError: {str(exc)}")
        exc = DRFValidationError(
            detail={"non_field_errors": ["A database constraint or uniqueness violation occurred."]}
        )

    # Call default DRF handler to get standard structure
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            "success": False,
            "message": "An error occurred.",
            "errors": {},
        }

        # Format details based on status code
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            custom_data["message"] = "Validation failed."
            custom_data["errors"] = response.data
        elif response.status_code == status.HTTP_401_UNAUTHORIZED:
            custom_data["message"] = response.data.get(
                "detail", "Authentication credentials were not provided."
            )
            custom_data["errors"] = response.data
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            custom_data["message"] = response.data.get(
                "detail", "You do not have permission to perform this action."
            )
            custom_data["errors"] = response.data
        elif response.status_code == status.HTTP_404_NOT_FOUND:
            custom_data["message"] = response.data.get("detail", "Resource not found.")
            custom_data["errors"] = response.data
        else:
            custom_data["message"] = response.data.get("detail", "An error occurred.")
            custom_data["errors"] = response.data

        response.data = custom_data
        return response

    # For unhandled exceptions (500 server errors)
    logger.exception("Unhandled server exception occurred", exc_info=exc)

    message = "An internal server error occurred."
    errors = {}

    if settings.DEBUG:
        message = str(exc)
        import traceback

        errors["traceback"] = traceback.format_exc().split("\n")

    return Response(
        {"success": False, "message": message, "errors": errors},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
