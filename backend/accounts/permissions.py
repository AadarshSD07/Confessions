from rest_framework.permissions import BasePermission

class HasRole(BasePermission):
    required_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        user_roles = request.user.userrole_set.values_list(
            "role__name", flat=True
        )
        return any(role in user_roles for role in self.required_roles)
