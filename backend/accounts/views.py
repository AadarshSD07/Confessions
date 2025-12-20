from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .permissions import HasRole
# Create your views here.

class AdminOnlyView(APIView):
    permission_classes = [HasRole]
    required_roles = ["ADMIN"]

    def get(self, request):
        return Response({"message": "Admin access granted"})
