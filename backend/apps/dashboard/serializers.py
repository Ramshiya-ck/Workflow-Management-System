from rest_framework import serializers


class DashboardCardSerializer(serializers.Serializer):
    """
    Serializer representing a single KPI metric card on the dashboard.
    """

    title = serializers.CharField(
        help_text="Display title label of the metric card.",
    )
    value = serializers.CharField(
        help_text="Formatted text value or count of the KPI.",
    )
    description = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Optional subtitle or trend description.",
    )


class DashboardTrendSerializer(serializers.Serializer):
    """
    Serializer representing monthly bill volume trends.
    """

    month = serializers.CharField(help_text="Truncated month label (e.g. 'Jan 2026').")
    count = serializers.IntegerField(help_text="Count of bills created in this month.")
    amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, help_text="Total value of bills in this month."
    )


class DashboardDistributionSerializer(serializers.Serializer):
    """
    Serializer representing entity-wise distribution metrics (departments or vendors).
    """

    name = serializers.CharField(help_text="Name of the entity.")
    count = serializers.IntegerField(help_text="Count of bills associated.")
    amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, help_text="Total cumulative amount."
    )


class DashboardActivitySerializer(serializers.Serializer):
    billNumber = serializers.CharField(source="bill_number")
    userName = serializers.CharField(source="user_name")
    fromStatus = serializers.CharField(source="from_status")
    toStatus = serializers.CharField(source="to_status")
    action = serializers.CharField()
    timestamp = serializers.CharField()
    note = serializers.CharField(required=False, allow_blank=True)


class DashboardMetricsSerializer(serializers.Serializer):
    """
    Detailed container representing aggregated dashboard metrics mapped to user role.
    """

    role = serializers.CharField(help_text="The security role of the requesting user.")
    cards = DashboardCardSerializer(
        many=True,
        help_text="List of KPI metrics cards tailored for the user's role.",
    )
    monthly_trends = DashboardTrendSerializer(
        many=True,
        required=False,
        help_text="Monthly tracking volume trends (visible to super admins).",
    )
    department_wise = DashboardDistributionSerializer(
        many=True,
        required=False,
        help_text="Department-wise distribution metrics.",
    )
    vendor_wise = DashboardDistributionSerializer(
        many=True,
        required=False,
        help_text="Vendor-wise distribution metrics.",
    )
    recent_activities = DashboardActivitySerializer(
        many=True,
        required=False,
        help_text="Recent transition activities logged in the system.",
    )
