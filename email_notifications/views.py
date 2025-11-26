from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404
from accounts.models import User
from .utils import send_counselor_approval_email, send_counselor_rejection_email

@require_POST
@login_required
def approve_counselor(request, counselor_id):
    """Approve counselor and send approval email"""
    try:
        counselor = get_object_or_404(User, id=counselor_id, role='counselor')
        counselor.is_verified = True
        counselor.is_active = True
        counselor.save()
        
        # Send approval email
        email_sent = send_counselor_approval_email(counselor.email, counselor.full_name)
        
        return JsonResponse({
            'success': True,
            'message': 'Counselor approved successfully',
            'email_sent': email_sent
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error approving counselor: {str(e)}'
        }, status=500)

@require_POST
@login_required
def reject_counselor(request, counselor_id):
    """Reject counselor and send rejection email"""
    try:
        counselor = get_object_or_404(User, id=counselor_id, role='counselor')
        counselor.is_verified = False
        counselor.is_active = False
        counselor.save()
        
        # Send rejection email
        email_sent = send_counselor_rejection_email(counselor.email, counselor.full_name)
        
        return JsonResponse({
            'success': True,
            'message': 'Counselor rejected successfully',
            'email_sent': email_sent
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Error rejecting counselor: {str(e)}'
        }, status=500)