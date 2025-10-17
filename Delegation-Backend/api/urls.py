from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'main-events', views.MainEventViewSet)
router.register(r'sub-events', views.SubEventViewSet)
router.register(r'nationalities', views.NationalityViewSet)
router.register(r'cities', views.CitiesViewSet)
router.register(r'airlines', views.AirLineViewSet)
router.register(r'airports', views.AirPortViewSet)
router.register(r'equivalent-jobs', views.EquivalentJobViewSet)
router.register(r'delegations', views.DelegationViewSet)
router.register(r'members', views.MemberViewSet)
router.register(r'check-outs', views.CheckOutViewSet)
router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')
router.register(r'auth', views.AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
]
