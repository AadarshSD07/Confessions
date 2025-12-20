from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication  # Import this
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from accounts.models import UserProfile
from social.models import UserPost
import json

class FetchSocialPosts(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserPost.objects.all()

    def get(self, request, format=None):
        total_posts = list(self.queryset.values("id","imageurl", "user__username", "user__userprofile__image", "user__first_name", "user__last_name", "imageurl", "post_desc"))
        user_role = request.user.get_user_role()
        posts = json.dumps(total_posts)
        response = {"socialPosts": posts, "userRole":user_role}
        return Response(response, status=status.HTTP_200_OK)
    
    def delete(self, request):
        deleteId = request.data["postId"]
        if request.user.get_user_role() == "admin":
            post = self.queryset.filter(id = deleteId)
            if post.exists():
                post.delete()
                return Response("Success", status=status.HTTP_200_OK)
            else:
                return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response("Failure", status=status.HTTP_401_UNAUTHORIZED)


class FetchUserPosts(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserPost.objects.all()

    def get(self, request, format=None):
        total_posts = list(self.queryset.filter(user = request.user).values("id","imageurl", "user__username", "user__userprofile__image", "user__first_name", "user__last_name", "imageurl", "post_desc"))
        mapped_user_images = {item["user"]: item["image"] for item in UserProfile.objects.filter(user = request.user).values("user", "image")}
        posts = json.dumps(total_posts)
        userprofile = json.dumps(mapped_user_images)
        response = {"socialPosts": posts, "userProfile": userprofile}
        return Response(response, status=status.HTTP_200_OK)
    
    def post(self, request):
        post_data = request.data
        UserPost.objects.create(post_desc = post_data["desc"], user = request.user)
        return Response("Success", status=status.HTTP_200_OK)
    
    def delete(self, request):
        deleteId = request.data["postId"]
        post = self.queryset.filter(id = deleteId, user=request.user.id)
        if post.exists():
            post.delete()
            return Response("Success", status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_204_NO_CONTENT)