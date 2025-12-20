from django.urls import path
from social.views import FetchSocialPosts, FetchUserPosts

urlpatterns = [
    path('social-posts/', FetchSocialPosts.as_view(), name='social_posts'),
    path('user-posts/', FetchUserPosts.as_view(), name='user_posts'),
]
