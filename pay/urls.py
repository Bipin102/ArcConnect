from django.urls import path

from . import views

urlpatterns = [
    path("api/activity/record/", views.record_activity, name="record_activity"),
    path("api/activity/<str:address>/", views.get_activity, name="get_activity"),
    path("", views.index, name="index"),
]
