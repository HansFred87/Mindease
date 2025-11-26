document.addEventListener('DOMContentLoaded', function() {
    // Modals and overlay
    const infoModal = document.getElementById('counselorModal');
    const approveModal = document.getElementById('approveModal');
    const rejectModal = document.getElementById('rejectModal');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Buttons
    const closeBtns = document.querySelectorAll('.close, .confirmation-close');
    const cancelBtns = document.querySelectorAll('.cancel-btn');
    const viewInfoButtons = document.querySelectorAll('.view-info-btn');
    const approveButtons = document.querySelectorAll('.approve-btn');
    const rejectButtons = document.querySelectorAll('.reject-btn');
    const approveConfirmBtn = document.querySelector('.approve-confirm');
    const rejectConfirmBtn = document.querySelector('.reject-confirm');

    // Loading elements
    const loadingTitle = document.getElementById('loadingTitle');
    const loadingMessage = document.getElementById('loadingMessage');

    // Modal content elements
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

    // Current counselor being processed
    let currentCounselorId = null;
    let currentCounselorName = null;

    // --- Helper Functions ---
    function getCookie(name) {
        if (name === 'csrftoken' && window.csrfToken) return window.csrfToken;
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            cookies.forEach(cookie => {
                const [key, value] = cookie.trim().split('=');
                if (key === name) cookieValue = decodeURIComponent(value);
            });
        }
        return cookieValue;
    }

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

    function createFileLink(url, filename) {
        if (url && url !== 'N/A' && url.trim() !== '') {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${filename || 'View File'}</a>`;
        }
        return 'N/A';
    }

    function getFilename(url) {
        if (!url || url === 'N/A') return 'View File';
        return url.split('/').pop() || 'View File';
    }

    function closeAllModals() {
        infoModal.classList.remove('active');
        approveModal.classList.remove('active');
        rejectModal.classList.remove('active');
        hideLoadingOverlay();
    }

    function handleServerResponse(response, counselorName, action) {
        hideLoadingOverlay();
        if (response.success) {
            const element = document.getElementById(`counselor-${currentCounselorId}`);
            if (element) {
                element.style.transition = 'all 0.3s ease';
                element.style.opacity = '0';
                element.style.transform = 'translateX(-20px)';
                setTimeout(() => element.remove(), 300);
            }
            setTimeout(() => {
                if (response.email_sent) {
                    alert(`✅ Counselor ${counselorName} has been ${action} successfully!\n📧 Notification email sent.`);
                } else {
                    alert(`✅ Counselor ${counselorName} has been ${action} successfully!\n⚠️ Email notification failed to send.`);
                }
            }, 100);
        } else {
            alert(`❌ Error ${action} counselor: ${response.message || 'Unknown error'}`);
        }
    }

    function handleFetchError(error, action) {
        console.error('Error:', error);
        hideLoadingOverlay();
        let message = `❌ Network error occurred while ${action} the counselor.`;
        if (error.message.includes('404')) message = '❌ URL not found.';
        if (error.message.includes('403')) message = '❌ Access denied.';
        if (error.message.includes('500')) message = `❌ Server error occurred while ${action} the counselor.`;
        alert(`${message}\nPlease try again or contact the admin.`);
    }

    // --- Info Modal ---
    viewInfoButtons.forEach(btn => btn.addEventListener('click', function() {
        const data = {
            name: this.dataset.counselorName || 'N/A',
            email: this.dataset.counselorEmail || 'N/A',
            specializations: this.dataset.counselorSpecializations || 'N/A',
            otherSpecializations: this.dataset.counselorOtherSpecializations || 'N/A',
            institution: this.dataset.counselorInstitution || 'N/A',
            institutionEmail: this.dataset.counselorInstitutionEmail || 'N/A',
            license: this.dataset.counselorLicense || 'N/A',
            experience: this.dataset.counselorExperience || 'N/A',
            bio: this.dataset.counselorBio || 'N/A',
            professionalId: this.dataset.counselorProfessionalId || 'N/A',
            degree: this.dataset.counselorDegree || 'N/A',
            created: this.dataset.counselorCreated || 'N/A'
        };

        modalElements.name.textContent = data.name;
        modalElements.email.textContent = data.email;
        modalElements.specializations.textContent = data.specializations;
        modalElements.otherSpecializations.textContent = data.otherSpecializations;
        modalElements.institution.textContent = data.institution;
        modalElements.institutionEmail.textContent = data.institutionEmail;
        modalElements.license.textContent = data.license;
        modalElements.experience.textContent = (!isNaN(data.experience) && data.experience !== 'N/A') ? `${data.experience} years` : data.experience;
        modalElements.bio.textContent = data.bio;
        modalElements.created.textContent = data.created;
        modalElements.professionalId.innerHTML = createFileLink(data.professionalId, getFilename(data.professionalId));
        modalElements.degree.innerHTML = createFileLink(data.degree, getFilename(data.degree));

        infoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }));

    // --- Approve / Reject Buttons ---
    approveButtons.forEach(btn => btn.addEventListener('click', function() {
        currentCounselorId = this.dataset.counselorId;
        currentCounselorName = this.dataset.counselorName;
        document.getElementById('approveCounselorName').textContent = currentCounselorName;
        approveModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }));

    rejectButtons.forEach(btn => btn.addEventListener('click', function() {
        currentCounselorId = this.dataset.counselorId;
        currentCounselorName = this.dataset.counselorName;
        document.getElementById('rejectCounselorName').textContent = currentCounselorName;
        rejectModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }));

    // --- Confirm Approve ---
    approveConfirmBtn.addEventListener('click', function() {
        if (!currentCounselorId) return;
        const csrfToken = getCookie('csrftoken');
        if (!csrfToken) return alert('🔒 CSRF token missing. Refresh page.');

        approveModal.classList.remove('active');
        showLoadingOverlay('Approving Counselor...', `Processing ${currentCounselorName}...`);

        fetch(`/admin/email/approve-counselor/${currentCounselorId}/`, {
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken, 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest'},
            credentials: 'same-origin'
        })
        .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
        .then(data => {
            fetch('/custom-admin/create-activity/', {
                method: 'POST',
                headers: {'X-CSRFToken': csrfToken, 'Content-Type': 'application/json'},
                body: JSON.stringify({activity_type: 'counselor_approved', user_id: currentCounselorId, description: `Counselor ${currentCounselorName} approved`})
            }).catch(err => console.error(err));
            handleServerResponse(data, currentCounselorName, 'approved');
        })
        .catch(err => handleFetchError(err, 'approving'));
    });

    // --- Confirm Reject ---
    rejectConfirmBtn.addEventListener('click', function() {
        if (!currentCounselorId) return;
        const csrfToken = getCookie('csrftoken');
        if (!csrfToken) return alert('🔒 CSRF token missing. Refresh page.');

        rejectModal.classList.remove('active');
        showLoadingOverlay('Rejecting Counselor...', `Processing ${currentCounselorName}...`);

        fetch(`/admin/email/reject-counselor/${currentCounselorId}/`, {
            method: 'POST',
            headers: {'X-CSRFToken': csrfToken, 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest'},
            credentials: 'same-origin'
        })
        .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
        .then(data => {
            fetch('/custom-admin/create-activity/', {
                method: 'POST',
                headers: {'X-CSRFToken': csrfToken, 'Content-Type': 'application/json'},
                body: JSON.stringify({activity_type: 'counselor_rejected', user_id: currentCounselorId, description: `Counselor ${currentCounselorName} rejected`})
            }).catch(err => console.error(err));
            handleServerResponse(data, currentCounselorName, 'rejected');
        })
        .catch(err => handleFetchError(err, 'rejecting'));
    });

    // --- Close Modals ---
    closeBtns.forEach(btn => btn.addEventListener('click', closeAllModals));
    cancelBtns.forEach(btn => btn.addEventListener('click', closeAllModals));
    window.addEventListener('click', e => {
        if ([infoModal, approveModal, rejectModal].includes(e.target)) closeAllModals();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllModals(); });
    loadingOverlay.addEventListener('click', e => e.stopPropagation());
});
