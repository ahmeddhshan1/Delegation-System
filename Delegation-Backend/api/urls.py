from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'main-events', views.MainEventViewSet)
router.register(r'sub-events', views.SubEventViewSet)
router.register(r'nationalities', views.NationalityViewSet)
router.register(r'military-positions', views.MilitaryPositionViewSet)
router.register(r'airports', views.AirportViewSet)
router.register(r'airlines', views.AirlineViewSet)
router.register(r'delegations', views.DelegationViewSet)
router.register(r'members', views.MemberViewSet)
router.register(r'departure-sessions', views.DepartureSessionViewSet)
router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')
router.register(r'auth', views.AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
]
