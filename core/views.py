from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
#from accounts.models import User
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta, date
from django.http import JsonResponse
from .models import Appointment, Availability
from admin_panel.models import WellnessTip
from django.views.decorators.csrf import csrf_exempt
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

User = get_user_model()

@login_required
def user_dashboard(request):
    if request.user.role != 'user':
        return redirect('login')

    first_name = request.user.full_name.split()[0] if request.user.full_name else 'User'
    full_name = request.user.full_name or 'User'

    today = timezone.now().date()

    # Today's appointments
    todays_appointments = Appointment.objects.filter(
        patient=request.user,
        date=today
    ).order_by('time')

    # Upcoming sessions (future dates)
    upcoming_sessions = Appointment.objects.filter(
        patient=request.user,
        date__gt=today
    ).order_by('date', 'time')

    # ✅ Wellness Tips (dynamic from admin)
    wellness_tips = WellnessTip.objects.all()[:5]  # you can change count as needed

    return render(
        request,
        'core/user_dashboard.html',
        {
            'first_name': first_name,
            'full_name': full_name,
            'todays_appointments': todays_appointments,
            'upcoming_sessions': upcoming_sessions,
            'wellness_tips': wellness_tips,  # <-- add this
        }
    )


@login_required
def join_session(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id)

    # Make sure only the patient or counselor can access
    if request.user != appointment.patient and request.user != appointment.counselor:
        return redirect('login')

    context = {
        'appointment': appointment,
        'user_role': request.user.role,
        'patient': appointment.patient,
        'counselor': appointment.counselor
    }

    return render(request, 'core/join_session.html', context)


from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

@login_required
def start_session_old(request, appointment_id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request'})

    appointment = get_object_or_404(Appointment, id=appointment_id)

    # Only counselor can start
    if request.user != appointment.counselor:
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=403)

    appointment.status = "started"
    appointment.save()

    # Notify the patient via channels
    channel_layer = get_channel_layer()
    # Note: use appointment.patient.id (not undefined 'user')
    group_name = f"user_{appointment.patient.id}"
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "session_started",  # event type -> maps to consumer.session_started
            "appointment_id": appointment.id,
            "counselor_name": appointment.counselor.full_name or appointment.counselor.get_username(),
        }
    )

    return JsonResponse({'success': True})

@login_required
def start_session(request, appointment_id):
    if request.method != 'POST':
        return JsonResponse({'success': False, 'message': 'Invalid request'}, status=400)

    appointment = get_object_or_404(Appointment, id=appointment_id)

    if request.user != appointment.counselor:
        return JsonResponse({'success': False, 'message': 'Unauthorized'}, status=403)

    # Update appointment
    appointment.status = 'started'
    appointment.google_meet_link = "https://meet.google.com/yez-cwqx-zfg"
    appointment.save()

    # Return the link in JSON
    return JsonResponse({'success': True, 'meet_link': appointment.google_meet_link})



@login_required
@csrf_exempt
def end_session(request, appointment_id):
    if request.method == 'POST':
        appointment = get_object_or_404(Appointment, id=appointment_id)
        if request.user != appointment.counselor:
            return JsonResponse({'success': False, 'message': 'Not authorized.'})
        
        data = json.loads(request.body)
        notes = data.get('notes', '')
        appointment.status = 'completed'
        appointment.counselor_notes = notes
        appointment.save()
        
        return JsonResponse({'success': True})
    
    return JsonResponse({'success': False, 'message': 'Invalid request.'})


@login_required
@csrf_exempt
def cancel_booking(request, appointment_id):
    appointment = get_object_or_404(Appointment, id=appointment_id, patient=request.user)
    
    if request.method == "POST":
        # Decrease booked slots for the corresponding availability
        try:
            slot = Availability.objects.get(
                counselor=appointment.counselor,
                date=appointment.date,
                start_time=appointment.time
            )
            if slot.booked_slots > 0:
                slot.booked_slots -= 1
                slot.save()
        except Availability.DoesNotExist:
            pass  # If slot doesn't exist, just continue
        
        appointment.delete()
        return JsonResponse({'success': True})
    
    return JsonResponse({'success': False, 'message': 'Invalid request'})

@login_required
def counselor_dashboard1(request):
    if request.user.role != 'counselor':
        return redirect('login')
    
    first_name = request.user.full_name.split()[0] if request.user.full_name else 'Counselor'
    return render(request, 'core/counselor_dashboard.html', {'first_name': first_name})


def counselors_page(request):
   counselors = User.objects.filter(role='counselor', is_verified=True, is_active=True)
   return render(request, 'core/counselorsfilter.html', {'counselors': counselors})



def manage_availability(request):
    return render(request, 'core/manage_availability.html')


@login_required
def counselor_dashboard(request):
    if request.user.role != 'counselor':
        return redirect('login')

    today = timezone.now().date()

    today_appointments = Appointment.objects.filter(counselor=request.user, date=today)
    upcoming_appointments = Appointment.objects.filter(counselor=request.user, date__gt=today).order_by('date', 'time')[:5]

    total_patients = Appointment.objects.filter(counselor=request.user).count()
    sessions_count = Appointment.objects.filter(counselor=request.user).count()
    hours_count = 0  # You can calculate hours if you have a duration field

    context = {
        'today_appointments': today_appointments,
        'upcoming_appointments': upcoming_appointments,
        'total_patients': total_patients,
        'sessions_count': sessions_count,
        'hours_count': hours_count,
    }
    return render(request, 'core/counselor_dashboard.html', context)

@login_required
def get_counselor_availability(request, counselor_id):
    counselor = get_object_or_404(User, id=counselor_id, role='counselor')
    slots = Availability.objects.filter(counselor=counselor).order_by('date', 'start_time')
    
    data = [
        {
            "id": s.id,
            "weekday": s.weekday,
            "date": s.date.strftime("%Y-%m-%d"),
            "start_time": s.start_time.strftime("%I:%M %p"),
            "end_time": s.end_time.strftime("%I:%M %p"),
            "total_slots": s.total_slots,
            "booked_slots": s.booked_slots,
            "available_slots": s.total_slots - s.booked_slots
        }
        for s in slots if s.total_slots - s.booked_slots > 0
    ]
    
    return JsonResponse({"slots": data})


@login_required
def manage_availability(request):
    if request.user.role != 'counselor':
        return redirect('login')

    if request.method == 'POST':
        date = request.POST.get('date')
        start_time = request.POST.get('start_time')
        end_time = request.POST.get('end_time')

        if date and start_time and end_time:
            Availability.objects.create(
                counselor=request.user,
                date=date,
                start_time=start_time,
                end_time=end_time
            )
            return redirect('manage_availability')

    availabilities = Availability.objects.filter(counselor=request.user, date__gte=timezone.now().date())
    return render(request, 'core/manage_availability.html', {'availabilities': availabilities})


def get_support(request):
    if request.method == "POST":
        name = request.POST.get("name")
        email = request.POST.get("email")
        message = request.POST.get("message")

        return render(request, "core/get_support.html", {
            "success": True,
            "name": name
        })

    return render(request, "core/get_support.html")


@login_required
def patient_records(request):
    if request.user.role != "counselor":
        return redirect("login")

    completed_sessions = Appointment.objects.filter(counselor=request.user).order_by('-date', '-time')

    patients = []
    seen = set()
    for session in completed_sessions:
        if session.patient.id in seen:
            continue
        seen.add(session.patient.id)
        patients.append({
            "id": session.patient.id,
            "full_name": session.patient.full_name,
            "status": session.status,
            "last_session": session.date.strftime("%b %d, %Y"),
            "sessions_count": Appointment.objects.filter(counselor=request.user, patient=session.patient).count(),
            "primary_concern": getattr(session.patient, "primary_concern", "Counseling")
        })

        sessions = Appointment.objects.filter(counselor=request.user).order_by('patient__full_name', '-date', '-time')

    return render(request, 'core/patient_records.html', {'sessions': sessions})

@login_required
def past_sessions(request):
    sessions = Appointment.objects.filter(patient=request.user).order_by('-date', '-time')
    return render(request, 'core/past_sessions.html', {'sessions': sessions})


@login_required
def counselor_profile_update(request):
    user = request.user
    if user.role != "counselor":
        messages.error(request, "Unauthorized access.")
        return redirect('home')

    if request.method == "POST":
        try:
            # Update basic info
            user.full_name = request.POST.get("full_name", user.full_name)
            user.years_experience = request.POST.get("years_experience", user.years_experience)
            user.bio = request.POST.get("bio", user.bio)
            user.institution_name = request.POST.get("institution_name", user.institution_name)
            user.institution_email = request.POST.get("institution_email", user.institution_email)
            user.license_number = request.POST.get("license_number", user.license_number)

            # Update specializations (multi-select or checkboxes)
            specializations = request.POST.getlist("specializations")
            if specializations:
                user.specializations = specializations  # JSONField stores list directly
            else:
                user.specializations = []

            # Update other specializations
            user.other_specializations = request.POST.get("other_concerns", user.other_specializations)

            # Handle file uploads
            if 'professional_id' in request.FILES:
                user.professional_id = request.FILES['professional_id']
            if 'degree_certificate' in request.FILES:
                user.degree_certificate = request.FILES['degree_certificate']

            user.save()
            messages.success(request, "Profile updated successfully!")
            return redirect('counselor_dashboard')

        except Exception as e:
            messages.error(request, f"Error updating profile: {str(e)}")
            return redirect('counselor_dashboard')

    # GET request: render form prefilled
    return render(request, "core/counselor_profile_update.html", {
        "user": user,
        "specializations": [
            "Anxiety & Stress",
            "Depression & Mood",
            "Relationship Issues",
            "Trauma & PTSD",
            "Grief & Loss",
            "Self-Esteem",
            "Life Transitions",
            "Work Stress",
            "Financial Stress",
            "Academic Pressure",
            "Parenting",
            "Anger Management",
            "Mindfulness",
            "Other Mild Concerns"
        ],
        "selected_specializations": user.specializations or []
    })


@login_required
def user_profile(request):
    return render(request, 'core/user_profile.html')

@login_required
def counselor_profile(request):
    user = request.user
    if user.role != "counselor":
        return redirect("counselor_dashboard")

    if request.method == "POST":
        # Update fields from POST
        user.full_name = request.POST.get("fullname") or user.full_name
        user.email = request.POST.get("email") or user.email
        user.years_experience = request.POST.get("experience") or user.years_experience
        user.bio = request.POST.get("bio") or user.bio
        user.license_number = request.POST.get("license_number") or user.license_number
        user.institution_name = request.POST.get("institution_name") or user.institution_name

        # Specializations
        specializations = request.POST.getlist("specializations")
        user.specializations = specializations if specializations else []

        user.save()

        # Return JSON if AJAX
        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            return JsonResponse({
                "status": "success",
                "full_name": user.full_name,
                "email": user.email,
                "years_experience": user.years_experience,
                "bio": user.bio,
                "license_number": user.license_number,
                "institution_name": user.institution_name,
                "specializations": user.specializations
            })

        return redirect("counselor_profile")

    return render(request, "core/counselor_profile_update.html", {
        "user": user,
        "selected_specializations": user.specializations or []
    })



@login_required
@csrf_exempt
def book_counselor(request, counselor_id):
    counselor = get_object_or_404(User, id=counselor_id, role='counselor')

    if request.method == 'POST':
        slot_id = request.POST.get('slot_id')
        if not slot_id:
            return JsonResponse({'error': 'Invalid data'}, status=400)

        slot = get_object_or_404(Availability, id=slot_id, counselor=counselor)
        remaining = slot.total_slots - slot.booked_slots
        if remaining <= 0:
            return JsonResponse({'error': 'This slot is fully booked'}, status=400)

        # Check if user already booked a session today
        today = timezone.now().date()
        existing_booking = Appointment.objects.filter(
            patient=request.user,
            date=slot.date  # slot.date is the date of this slot
        ).exists()

        if existing_booking:
            return JsonResponse({
                'error': 'Sorry! You can only book once per day'
            }, status=400)

        # Increment booked slots
        slot.booked_slots += 1
        slot.save()

        # Create appointment
        Appointment.objects.create(
            patient=request.user,
            counselor=counselor,
            date=slot.date,
            time=slot.start_time
        )

        return JsonResponse({'success': True})

    return JsonResponse({'error': 'Invalid request'}, status=400)



@login_required
def get_availability(request):
    slots = Availability.objects.filter(counselor=request.user)
    data = [
        {
            "id": s.id,
            "weekday": s.weekday,
            "date": s.date.strftime("%Y-%m-%d"),
            "start_time": s.start_time.strftime("%I:%M %p"),
            "end_time": s.end_time.strftime("%I:%M %p"),
            "total_slots": s.total_slots,
            "booked_slots": s.booked_slots
        }
        for s in slots
    ]
    return JsonResponse({"slots": data})

@csrf_exempt
@login_required
def add_availability(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            date_str = data.get("date")
            start_time = data.get("start_time")
            end_time = data.get("end_time")
            total_slots = int(data.get("total_slots", 1))

            if not date_str or not start_time or not end_time:
                return JsonResponse({"success": False, "message": "Missing fields"})

            # Convert date and time
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
            start_time_obj = datetime.strptime(start_time, "%I:%M %p").time()
            end_time_obj = datetime.strptime(end_time, "%I:%M %p").time()

            # Create slot
            slot = Availability.objects.create(
                counselor=request.user,
                date=date_obj,
                start_time=start_time_obj,
                end_time=end_time_obj,
                total_slots=total_slots,
                booked_slots=0
            )

            return JsonResponse({"success": True, "slot_id": slot.id})

        except Exception as e:
            return JsonResponse({"success": False, "message": str(e)})


@login_required
@csrf_exempt
def delete_availability(request, slot_id):
    try:
        slot = Availability.objects.get(id=slot_id, counselor=request.user)
        slot.delete()
        return JsonResponse({"success": True})
    except Availability.DoesNotExist:
        return JsonResponse({"success": False, "message": "Slot not found"})
    

@csrf_exempt
@login_required
def copy_last_week(request):
    if request.method == "POST":
        today = date.today()
        last_week_start = today - timedelta(days=7)
        last_week_end = last_week_start + timedelta(days=6)
        slots = Availability.objects.filter(counselor=request.user, date__range=[last_week_start, last_week_end])
        for slot in slots:
            # Calculate next week same weekday
            next_week_date = slot.date + timedelta(days=7)
            Availability.objects.create(
                counselor=request.user,
                weekday=slot.weekday,
                date=next_week_date,
                start_time=slot.start_time,
                end_time=slot.end_time
            )
        return JsonResponse({"success": True})
    return JsonResponse({"success": False, "message": "Invalid request"})

@csrf_exempt
@login_required
def clear_week(request):
    if request.method == "POST":
        today = date.today()
        week_start = today
        week_end = today + timedelta(days=6)
        Availability.objects.filter(counselor=request.user, date__range=[week_start, week_end]).delete()
        return JsonResponse({"success": True})
    return JsonResponse({"success": False, "message": "Invalid request"})

@csrf_exempt
@login_required
def vacation_mode(request):
    if request.method == "POST":
        import json
        data = json.loads(request.body)
        start = data.get("start")
        end = data.get("end")
        if not start or not end:
            return JsonResponse({"success": False, "message": "Invalid dates"})
        Availability.objects.filter(counselor=request.user, date__range=[start, end]).delete()
        return JsonResponse({"success": True})
    return JsonResponse({"success": False, "message": "Invalid request"})






