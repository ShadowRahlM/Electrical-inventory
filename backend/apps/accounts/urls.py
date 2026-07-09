from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView
from . import views

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path("register/", views.RegisterView.as_view(), name="register"),
    path("me/", views.UserDetailView.as_view(), name="user_detail"),
    path("users/", views.UserListView.as_view(), name="user_list"),
    path("change-password/", views.ChangePasswordView.as_view(), name="change_password"),
    path("profile/", views.UpdateProfileView.as_view(), name="update_profile"),
    path("<uuid:pk>/activate/", views.UserActivateView.as_view(), name="user_activate"),
    path("<uuid:pk>/deactivate/", views.UserDeactivateView.as_view(), name="user_deactivate"),
]
