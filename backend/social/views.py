from accounts.models import UserProfile
from configuration import Config
from django.db.models.functions import Cast
from django.db.models import CharField
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from social.models import UserPost

import json

class FetchSocialPosts(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserPost.objects.all()

    def get(self, request, format=None):
        total_posts = list(
            self.queryset.annotate(
                updated_at_str=Cast('updated_at', CharField())
            ).values(
                "id", "imageurl", "user__username", "user__userprofile__image", "user__first_name", "user__last_name", "post_desc", "updated_at_str"
            ))
        is_user_admin = request.user.get_user_role() == "admin"
        posts = json.dumps(total_posts)
        response = {"socialPosts": posts, "isUserAdmin":is_user_admin}
        return Response(response, status=Config.success)
    
    def delete(self, request):
        deleteId = request.data["postId"]
        if request.user.get_user_role() == "admin":
            post = self.queryset.filter(id = deleteId)
            if post.exists():
                post.delete()
                return Response("Success", status=Config.success)
            else:
                return Response(status=Config.no_content)
        else:
            return Response("Failure", status=Config.unauthorized)


class FetchUserPosts(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserPost.objects.all()

    def get(self, request, format=None):
        total_posts = list(
            self.queryset.filter(user = request.user)
            .annotate(
                updated_at_str=Cast('updated_at', CharField())
            ).values(
                "id", "imageurl", "user__username", "user__userprofile__image", "user__first_name", "user__last_name", "post_desc", "updated_at_str"
            ))
        posts = json.dumps(total_posts)
        response = {"socialPosts": posts}
        return Response(response, status=Config.success)
    
    def post(self, request):
        post_data = request.data
        UserPost.objects.create(post_desc = post_data["desc"], user = request.user)
        return Response("Success", status=Config.success)
    
    def delete(self, request):
        deleteId = request.data["postId"]
        post = self.queryset.filter(id = deleteId, user=request.user.id)
        if post.exists():
            post.delete()
            return Response("Success", status=Config.success)
        else:
            return Response(status=Config.no_content)