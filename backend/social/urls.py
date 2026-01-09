from django.urls import path
from social import views

urlpatterns = [
    path('social-posts/', views.FetchSocialPosts.as_view(), name='social_posts'),
    path('user-posts/', views.FetchUserPosts.as_view(), name='user_posts'),
    path('like/<int:id>/', views.PostsLike.as_view(), name='like_post'),
    path('comment/<int:id>/', views.PostsComment.as_view(), name='comment_post'),
]
