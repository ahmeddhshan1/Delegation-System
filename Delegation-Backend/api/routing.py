from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/delegations/$', consumers.DelegationConsumer.as_asgi()),
    re_path(r'ws/members/$', consumers.MemberConsumer.as_asgi()),
    re_path(r'ws/events/$', consumers.EventConsumer.as_asgi()),
    re_path(r'ws/dashboard/$', consumers.DashboardConsumer.as_asgi()),
]
