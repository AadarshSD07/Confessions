from django.urls import path
from accounts.views import AdminOnlyView

urlpatterns = [
    path("admin-test/", AdminOnlyView.as_view()),
]
