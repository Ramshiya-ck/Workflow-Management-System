from rest_framework.renderers import JSONRenderer


class StandardJSONRenderer(JSONRenderer):
    """
    Standardizes all API responses into a unified JSON format:
    {
        "success": true/false,
        "message": "Human readable message",
        "data": ...
    }
    """

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get("response") if renderer_context else None

        # If data is already in standardized format or has error keys, return as is
        if isinstance(data, dict) and ("success" in data or "errors" in data):
            return super().render(data, accepted_media_type, renderer_context)

        success = True
        message = "Operation completed successfully."

        if response:
            if response.status_code >= 400:
                success = False
                message = "An error occurred during this request."
                # If error response and we have detail key, set message to detail
                if isinstance(data, dict) and "detail" in data:
                    message = data["detail"]
                    data = None

        formatted_data = {
            "success": success,
            "message": message,
            "data": data,
        }

        return super().render(formatted_data, accepted_media_type, renderer_context)
