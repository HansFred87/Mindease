from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/session/notifications/(?P<user_id>\d+)/$", consumers.SessionNotificationConsumer.as_asgi()),
]
