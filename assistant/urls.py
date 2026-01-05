from django.urls import path
from .views import home, assistant_view, compare_view

urlpatterns = [
    path('', home, name='home'),
    path('assistant/', assistant_view, name='assistant'),
    path('compare/', compare_view, name='compare'),
]
