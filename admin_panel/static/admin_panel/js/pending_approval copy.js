document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const infoModal = document.getElementById('counselorModal');
    const approveModal = document.getElementById('approveModal');
    const rejectModal = document.getElementById('rejectModal');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Close buttons
    const closeBtns = document.querySelectorAll('.close, .confirmation-close');
    const cancelBtns = document.querySelectorAll('.cancel-btn');
    
    // Action buttons
    const viewInfoButtons = document.querySelectorAll('.view-info-btn');
    const approveButtons = document.querySelectorAll('.approve-btn');
    const rejectButtons = document.querySelectorAll('.reject-btn');
    
    // Confirm action buttons
    const approveConfirmBtn = document.querySelector('.approve-confirm');
    const rejectConfirmBtn = document.querySelector('.reject-confirm');
    
    // Loading elements
    const loadingTitle = document.getElementById('loadingTitle');
    const loadingMessage = document.getElementById('loadingMessage');
    
    // Modal elements for updating content
    const modalElements = {
        name: document.getElementById('modalCounselorName'),
        email: document.getElementById('modalEmail'),
        specializations: document.getElementById('modalSpecializations'),
        otherSpecializations: document.getElementById('modalOtherSpecializations'),
        institution: document.getElementById('modalInstitution'),
        institutionEmail: document.getElementById('modalInstitutionEmail'),
        license: document.getElementById('modalLicense'),
        experience: document.getElementById('modalExperience'),
        bio: document.getElementById('modalBio'),
        professionalId: document.getElementById('modalProfessionalId'),
        degree: document.getElementById('modalDegree'),
        created: document.getElementById('modalCreated')
    };
    
    // Variables to store current counselor being processed
    let currentCounselorId = null;
    let currentCounselorName = null;
    
    // Loading overlay functions
    function showLoadingOverlay(title, message) {
        loadingTitle.textContent = title || 'Processing...';
        loadingMessage.textContent = message || 'Please wait while we process your request.';
        loadingOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function hideLoadingOverlay() {
        loadingOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Helper function to get CSRF token - FIXED VERSION
    function getCookie(name) {
        // Try window.csrfToken first (from template)
        if (name === 'csrftoken' && window.csrfToken) {
            return window.csrfToken;
        }
        
        // Try meta tag
        const metaToken = document.querySelector('meta[name="csrf-token"]');
        if (metaToken && name === 'csrftoken') {
            return metaToken.getAttribute('content');
        }
        
        // Fallback to cookie method
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    // Function to create file link or show N/A
    function createFileLink(url, filename) {
        if (url && url !== 'N/A' && url.trim() !== '') {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${filename || 'View File'}</a>`;
        }
        return 'N/A';
    }
    
    // Function to safely get filename from URL
    function getFilename(url) {
        if (!url || url === 'N/A') return 'View File';
        try {
            const parts = url.split('/');
            return parts[parts.length - 1] || 'View File';
        } catch (e) {
            return 'View File';
        }
    }
    
    // Close all modals
    function closeAllModals() {
        infoModal.classList.remove('active');
        approveModal.classList.remove('active');
        rejectModal.classList.remove('active');
        hideLoadingOverlay();
        document.body.style.overflow = 'auto';
    }
    
    // Handle server response
    function handleServerResponse(response, counselorName, action) {
        hideLoadingOverlay();
        
        if (response.success) {
            // Remove the counselor from the list with animation
            const counselorElement = document.getElementById(`counselor-${currentCounselorId}`);
            if (counselorElement) {
                counselorElement.style.transition = 'all 0.3s ease';
                counselorElement.style.opacity = '0';
                counselorElement.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    counselorElement.remove();
                }, 300);
            }
            
            // Show success message with email notification info
            setTimeout(() => {
                if (response.email_sent) {
                    alert(`✅ Counselor ${counselorName} has been ${action} successfully!\n📧 Notification email sent.`);
                } else {
                    alert(`✅ Counselor ${counselorName} has been ${action} successfully!\n⚠️ Email notification failed to send.`);
                }
            }, 100);
        } else {
            alert(`❌ Error ${action} counselor: ${response.message}`);
        }
    }
    
    // Handle fetch errors - IMPROVED VERSION
    function handleFetchError(error, action) {
        console.error('Error:', error);
        hideLoadingOverlay();
        
        let errorMessage = `❌ Network error occurred while ${action} the counselor.`;
        
        if (error.message.includes('404')) {
            errorMessage = '❌ URL not found. Please check if the email notifications app is properly configured.';
        } else if (error.message.includes('403')) {
            errorMessage = '❌ Access denied. Please check if you have proper permissions.';
        } else if (error.message.includes('500')) {
            errorMessage = `❌ Server error occurred while ${action} the counselor.`;
        }
        
        alert(`${errorMessage}\n\nPlease try again or contact your system administrator.`);
    }
    
    // Show modal with counselor info
    viewInfoButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get data from button attributes
            const counselorData = {
                name: this.getAttribute('data-counselor-name') || 'N/A',
                email: this.getAttribute('data-counselor-email') || 'N/A',
                specializations: this.getAttribute('data-counselor-specializations') || 'N/A',
                otherSpecializations: this.getAttribute('data-counselor-other-specializations') || 'N/A',
                institution: this.getAttribute('data-counselor-institution') || 'N/A',
                institutionEmail: this.getAttribute('data-counselor-institution-email') || 'N/A',
                license: this.getAttribute('data-counselor-license') || 'N/A',
                experience: this.getAttribute('data-counselor-experience') || 'N/A',
                bio: this.getAttribute('data-counselor-bio') || 'N/A',
                professionalId: this.getAttribute('data-counselor-professional-id') || 'N/A',
                degree: this.getAttribute('data-counselor-degree') || 'N/A',
                created: this.getAttribute('data-counselor-created') || 'N/A'
            };
            
            // Update modal content
            modalElements.name.textContent = counselorData.name;
            modalElements.email.textContent = counselorData.email;
            modalElements.specializations.textContent = counselorData.specializations;
            modalElements.otherSpecializations.textContent = counselorData.otherSpecializations;
            modalElements.institution.textContent = counselorData.institution;
            modalElements.institutionEmail.textContent = counselorData.institutionEmail;
            modalElements.license.textContent = counselorData.license;
            
            // Handle experience - add "years" if it's a number
            if (counselorData.experience !== 'N/A' && !isNaN(counselorData.experience)) {
                modalElements.experience.textContent = `${counselorData.experience} years`;
            } else {
                modalElements.experience.textContent = counselorData.experience;
            }
            
            modalElements.bio.textContent = counselorData.bio;
            modalElements.created.textContent = counselorData.created;
            
            // Handle file links
            modalElements.professionalId.innerHTML = createFileLink(
                counselorData.professionalId, 
                getFilename(counselorData.professionalId)
            );
            modalElements.degree.innerHTML = createFileLink(
                counselorData.degree, 
                getFilename(counselorData.degree)
            );
            
            // Show modal
            infoModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Show approve confirmation modal
    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentCounselorId = this.getAttribute('data-counselor-id');
            currentCounselorName = this.getAttribute('data-counselor-name');
            
            document.getElementById('approveCounselorName').textContent = currentCounselorName;
            approveModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Show reject confirmation modal
    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentCounselorId = this.getAttribute('data-counselor-id');
            currentCounselorName = this.getAttribute('data-counselor-name');
            
            document.getElementById('rejectCounselorName').textContent = currentCounselorName;
            rejectModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Handle approve confirmation - ENHANCED WITH LOADING
    approveConfirmBtn.addEventListener('click', function() {
        if (currentCounselorId) {
            const csrfToken = getCookie('csrftoken');
            
            if (!csrfToken) {
                alert('🔒 Security token not found. Please refresh the page and try again.');
                return;
            }
            
            // Close confirmation modal and show loading
            approveModal.classList.remove('active');
            showLoadingOverlay(
                'Approving Counselor...', 
                `Processing approval for ${currentCounselorName}. Please wait while we update their status and send notification emails.`
            );
            
            fetch(`/admin/email/approve-counselor/${currentCounselorId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            })

            .then(data => {
    // Create RecentActivity record for approval
    fetch('/custom-admin/create-activity/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            activity_type: 'counselor_approved',
            user_id: currentCounselorId,
            description: `Counselor ${currentCounselorName} was approved`
        })
    }).catch(err => console.error('Failed to create activity record:', err));
    
    handleServerResponse(data, currentCounselorName, 'approved');
})
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => handleServerResponse(data, currentCounselorName, 'approved'))
            .catch(error => handleFetchError(error, 'approving'));
        }
    });
    
    // Handle reject confirmation - ENHANCED WITH LOADING
    rejectConfirmBtn.addEventListener('click', function() {
        if (currentCounselorId) {
            const csrfToken = getCookie('csrftoken');
            
            if (!csrfToken) {
                alert('🔒 Security token not found. Please refresh the page and try again.');
                return;
            }
            
            // Close confirmation modal and show loading
            rejectModal.classList.remove('active');
            showLoadingOverlay(
                'Rejecting Application...', 
                `Processing rejection for ${currentCounselorName}. Please wait while we update their status and send notification emails.`
            );
            
            fetch(`/admin/email/reject-counselor/${currentCounselorId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            })

            .then(data => {
    // Create RecentActivity record for rejection
    fetch('/custom-admin/create-activity/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            activity_type: 'counselor_rejected',
            user_id: currentCounselorId,
            description: `Counselor ${currentCounselorName} was rejected`
        })
    }).catch(err => console.error('Failed to create activity record:', err));
    
    handleServerResponse(data, currentCounselorName, 'rejected');
})

            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => handleServerResponse(data, currentCounselorName, 'rejected'))
            .catch(error => handleFetchError(error, 'rejecting'));
        }
    });
    
    // Add event listeners to close buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Close modals when clicking outside (but not loading overlay)
    window.addEventListener('click', function(event) {
        if (event.target === infoModal || event.target === approveModal || event.target === rejectModal) {
            closeAllModals();
        }
    });
    
    // Close modals with Escape key (but not loading overlay)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !loadingOverlay.classList.contains('active')) {
            closeAllModals();
        }
    });
    
    // Prevent closing loading overlay accidentally
    loadingOverlay.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});