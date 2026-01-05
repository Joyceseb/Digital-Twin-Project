# api/urls.py - Updated routes
from django.urls import path
from . import views

urlpatterns = [
    path("chat/<str:model>/", views.chat_view, name="chat_api"),
    path("upload/", views.upload_document_view, name="upload_api"),
    path("compare/", views.compare_view, name="compare_api"),
    path("judge/", views.judge_view, name="judge_api"),
    path("memory/<str:model>/", views.memory_view, name="memory_api"),
    path("generate_document/", views.generate_document_view, name="generate_document_view"),
    path("arena/stats/", views.arena_stats_view, name="arena_stats_api"),
    path("arena/delete/", views.delete_battle_view, name="arena_delete_api"),
    path("analyze/", views.analyze_view, name="analyze_api"),
    path("preview/", views.preview_document_view, name="preview_api"),
]
