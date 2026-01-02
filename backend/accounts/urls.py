from django.urls import path
from accounts.views import AdminOnlyView, UserAccount

urlpatterns = [
    path("admin-test/", AdminOnlyView.as_view()),
    path("user-details/", UserAccount.as_view()),
]
