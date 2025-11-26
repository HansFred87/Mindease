from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required 
from django.urls import reverse
from django.http import JsonResponse
from accounts.models import User
import json
# Additional imports for email functionality
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail, EmailMessage
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings

def activate_account(request, uidb64, token):
    """Activate user after email verification."""
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        messages.success(request, "Your account has been activated! You can now log in.")
        return redirect(f"{reverse('form')}?action=login")
    else:
        messages.error(request, "Activation link is invalid or has expired.")
        return redirect('home')

@login_required
def custom_logout(request):
    """Log out the current user."""
    logout(request)
    #messages.success(request, "You have been logged out successfully.")
    return redirect('home')

# -----------------------------
# USER-FACING PAGES
# -----------------------------

def home(request):
    """Render the homepage."""
    return render(request, "accounts/home.html")

def form_page(request):
    """Render the generic form page (registration/login)."""
    return render(request, "accounts/form.html")

# -----------------------------
# REGISTRATION HANDLERS
# -----------------------------

def register_user(request):
    """Handle user registration with email verification."""
    if request.method == 'POST':
        try:
            password1 = request.POST.get('password1')
            password2 = request.POST.get('password2')

            if password1 != password2:
                return redirect(f"{reverse('form')}?action=register&error=password_mismatch")

            if User.objects.filter(email=request.POST.get('email')).exists():
                return redirect(f"{reverse('form')}?action=register&error=email_exists")

            required_fields = [
                'full_name', 'email', 'age', 'gender',
                'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'
            ]

            for field in required_fields:
                if not request.POST.get(field, '').strip():
                    return redirect(f"{reverse('form')}?action=register&error=missing_fields")

            try:
                age = int(request.POST.get('age'))
                if age < 13 or age > 120:
                    return redirect(f"{reverse('form')}?action=register&error=invalid_age")
            except (ValueError, TypeError):
                return redirect(f"{reverse('form')}?action=register&error=invalid_age")

            # Create user but set inactive until email verification
            user = User.objects.create_user(
                email=request.POST.get('email'),
                full_name=request.POST.get('full_name'),
                password=password1,
                role='user',
                age=request.POST.get('age'),
                gender=request.POST.get('gender'),
                emergency_contact_name=request.POST.get('emergency_contact_name'),
                emergency_contact_phone=request.POST.get('emergency_contact_phone'),
                emergency_contact_relationship=request.POST.get('emergency_contact_relationship'),
                accepted_privacy_policy=True,
                is_active=False  # deactivate until verified
            )

            # Send verification email
            current_site = get_current_site(request)
            mail_subject = "Activate your MindEase Account"
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            activation_link = f"http://{current_site.domain}{reverse('activate_account', args=[uid, token])}"

            message = render_to_string('accounts/email_verification.html', {
                'user': user,
                'activation_link': activation_link,
            })

            email = EmailMessage(mail_subject, message, to=[user.email])
            email.content_subtype = "html"
            email.send()

            messages.success(request, "Account created! Please verify your email to activate your account.")
            return redirect('form')

        except Exception as e:
            messages.error(request, f"System error: {str(e)}")
            return redirect(f"{reverse('form')}?action=register")

    return redirect('form')

def register_user_old(request):
    """Handle user registration."""
    if request.method == 'POST':
        try:
            # Validate passwords match
            password1 = request.POST.get('password1')
            password2 = request.POST.get('password2')
            if password1 != password2:
                messages.error(request, "Password Mismatch!!.")
                return redirect(f"{reverse('form')}?action=register&error=password_mismatch")

            # Check if email already exists
            if User.objects.filter(email=request.POST.get('email')).exists():
                messages.error(request, "Email already exists.")
                return redirect(f"{reverse('form')}?action=register&error=email_exists")

            # Validate required fields - let JavaScript handle client-side validation
            required_fields = ['full_name', 'email', 'age', 'gender', 'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship']
            
            for field in required_fields:
                field_value = request.POST.get(field, '').strip()
                if not field_value:
                    # Return to form with validation handled by JavaScript
                    return redirect(f"{reverse('form')}?action=register&error=missing_fields")

            # Validate age
            try:
                age = int(request.POST.get('age'))
                if age < 13 or age > 120:
                    # Return to form with validation handled by JavaScript
                    return redirect(f"{reverse('form')}?action=register&error=invalid_age")
            except (ValueError, TypeError):
                # Return to form with validation handled by JavaScript
                return redirect(f"{reverse('form')}?action=register&error=invalid_age")

            # Create new user
            user = User.objects.create_user(
                email=request.POST.get('email'),
                full_name=request.POST.get('full_name'),
                password=password1,
                role='user',
                age=request.POST.get('age'),
                gender=request.POST.get('gender'),
                emergency_contact_name=request.POST.get('emergency_contact_name'),
                emergency_contact_phone=request.POST.get('emergency_contact_phone'),
                emergency_contact_relationship=request.POST.get('emergency_contact_relationship'),
                accepted_privacy_policy=True
            )

            # Success message only - this will show at the top
            messages.success(request, "Account created successfully! Please log in to continue.")
            return redirect('form')  # Redirect to login form

        except Exception as e:
            # Only show system/server errors at the top, not validation errors
            messages.error(request, f"System error: {str(e)}")
            return redirect(f"{reverse('form')}?action=register")

    return redirect('form')


def register_counselor(request):
    """Handle counselor registration."""
    if request.method == 'POST':
        try:
            # Validate passwords match
            password1 = request.POST.get('password1')
            password2 = request.POST.get('password2')
            if password1 != password2:
                messages.error(request, "Passwords do not match.")
                return redirect(f"{reverse('form')}?action=register")

            # Check if email already exists
            if User.objects.filter(email=request.POST.get('email')).exists():
                messages.error(request, "Email already exists.")
                return redirect(f"{reverse('form')}?action=register")

            # Create counselor user - let JavaScript handle validation
            user = User.objects.create_user(
                email=request.POST.get('email'),
                full_name=f"{request.POST.get('first_name')} {request.POST.get('last_name')}",
                password=password1,
                role='counselor',
                is_verified=False,
                accepted_privacy_policy=True,
                institution_name=request.POST.get('institution_name'),
                institution_email=request.POST.get('institution_email'),
                license_number=request.POST.get('license_number'),
                years_experience=request.POST.get('years_experience'),
                bio=request.POST.get('bio')
            )

            # Handle file uploads
            if 'professional_id' in request.FILES:
                user.professional_id = request.FILES['professional_id']
            if 'degree_certificate' in request.FILES:
                user.degree_certificate = request.FILES['degree_certificate']

            # Handle specializations
            specializations = request.POST.getlist('specializations')
            user.specializations = json.dumps(specializations)
            #specializations = request.POST.getlist('specializations')
            #if specializations:
            #    user.specializations = specializations


            # FIXED: Handle other specializations with correct field name
            other_specializations = request.POST.get('other_concerns')  # Changed from other_specializations
            if other_specializations:
                user.other_specializations = other_specializations

            user.save()
            
            # FIXED: Redirect to registration_pending page instead of showing message
            return redirect('registration_pending')

        except Exception as e:
            messages.error(request, f"System error: {str(e)}")
            return redirect(f"{reverse('form')}?action=register")

    return redirect('form')

# -----------------------------
# LOGIN HANDLER
# -----------------------------

def custom_login(request):
    """Authenticate and log in users."""
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                # Block deactivated accounts
                if not user.is_active:
                    messages.error(request, "Your account is rejected.")
                    return redirect(f"{reverse('form')}?action=login")

                # Block counselors that are not yet verified
                if user.role == 'counselor' and not user.is_verified:
                    messages.error(request, "Your account is still pending review!")
                    return redirect(f"{reverse('form')}?action=login")
                
                # Log the user in
                login(request, user)

                # Redirect based on user role
                if user.role == 'user':
                    return redirect('user_dashboard')
                elif user.role == 'counselor':
                    return redirect('counselor_dashboard')
                else:
                    return redirect('home')
            else:
                messages.error(request, "Invalid password.")
        except User.DoesNotExist:
            messages.error(request, "No account found with this email.")

        return redirect(f"{reverse('form')}?action=login")

    return redirect('form')

# -----------------------------
# OTHER PAGES
# -----------------------------

def registration_pending(request):
    """Show the 'registration pending' page for counselors."""
    return render(request, 'accounts/registration_pending.html')

# -----------------------------
# API ENDPOINTS
# -----------------------------

def api_get_salle_details(request, salle_id):
    """Example API endpoint returning salle details as JSON."""
    return JsonResponse({'id': salle_id, 'name': 'Sample Salle'})