from configuration import Config
from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import HasRole

# Create your views here.

class AdminOnlyView(APIView):
    permission_classes = [HasRole]
    required_roles = ["ADMIN"]

    def get(self, request):
        return Response({"message": "Admin access granted"})

class UserAccount(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_details = {
            "username": request.user.username,
            "firstName": request.user.first_name,
            "lastName": request.user.last_name
        }
        try:
            imageUrl = request.user.userprofile_set.get().image.url
        except Exception as e:
            imageUrl = "/media/user_profile_images/default-user-image.png"

        user_details["imageUrl"] = imageUrl
        return Response(user_details, status=Config.success)

    def post(self, request):
        post_data = request.data
        import pdb; pdb.set_trace()
        user_password = User.check_password(post_data["password"])
        if user_password:
            User.set_password(post_data["npassword"])
            response_status = Config.accepted
        else:
            response_status = Config.forbidden

        return Response(status=response_status)