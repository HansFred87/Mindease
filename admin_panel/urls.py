from django.urls import path
from . import views

app_name = 'admin_panel'

urlpatterns = [
    path('api/news/', views.get_philippines_news, name='philippines_news'),
]