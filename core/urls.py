from django.urls import path
from . import views

urlpatterns = [
    # User profile
    path('user-profile/', views.user_profile, name='user_profile'),
    # user dashboard
    path('user-dashboard/', views.user_dashboard, name='user_dashboard'),
    # counselor dashboard
    path('counselor-dashboard/', views.counselor_dashboard, name='counselor_dashboard'),
    # Get support
    path('get-support/', views.get_support, name='get_support'),
    # filter counselors
    path('counselorsfilter/', views.counselors_page, name='counselors_page'),
    # past sessions
     path('past-sessions/', views.past_sessions, name='past_sessions'),
    path('past-sessions/', views.past_sessions, name='past_sessions'),
    path('counselors/', views.counselors_page, name='counselors_page'),

    # counselorsdashboard
    # manage availability
    path('manage-availability/', views.manage_availability, name='manage_availability'),
    # core/urls.py
    path('patients/', views.patient_records, name='patient_records'),
    # Counselor profile
    path('counselor-profile-update/', views.counselor_profile_update, name='counselor_profile_update'),

    path('counselor/profile/', views.counselor_profile, name='counselor_profile'),

    path('book/<int:counselor_id>/', views.book_counselor, name='book_counselor'),
    #path('counselor-profile/<int:counselor_id>/', views.counselor_profile, name='counselor_profile'),

    path('api/availability/', views.get_availability),
    path('api/availability/add/', views.add_availability),
    path('api/availability/<int:slot_id>/delete/', views.delete_availability),
    path('api/availability/copy-last-week/', views.copy_last_week),
    path('api/availability/clear-week/', views.clear_week),
    path('api/availability/vacation-mode/', views.vacation_mode),

    path('api/availability/counselor/<int:counselor_id>/', views.get_counselor_availability, name='get_counselor_availability'),
    path('cancel-booking/<int:appointment_id>/', views.cancel_booking, name='cancel_booking'),

    # core/urls.py
    path('session/<int:appointment_id>/join/', views.join_session, name='join_session'),
    path('start-session/<int:appointment_id>/', views.start_session, name='start_session'),

    path('start-session/<int:appointment_id>/', views.start_session, name='start_session'),
    path('end-session/<int:appointment_id>/', views.end_session, name='end_session'),


]
    

