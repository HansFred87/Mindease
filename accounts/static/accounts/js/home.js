// Define URLs using Django template syntax
const loginUrl = "{% url 'form' %}?action=login";
const registerUrl = "{% url 'form' %}?action=register";
        
// Navigation functions
function goToLogin(button) {
    window.location.href = button.dataset.url;
}

function goToRegister(button) {
    window.location.href = button.dataset.url;
}

// Modal functionality
    const modalData = {
    ai: {
        icon: "🤖",
        title: "AI Companion",
        description: "Your personal mental health assistant, available 24/7 to provide support, guidance, and coping strategies whenever you need them.",
        features: [
            "Provides instant emotional support responses",
            "Always listens empathetically",
            "Available anytime — never leaves your side"
        ]
    },
    counselor: {
        icon: "👨‍⚕️",
        title: "Expert Counselors",
        description: "Connect with licensed mental health professionals who are verified and ready to provide personalized care through secure video consultations.",
        features: [
            "Verified by admins — licensed counselors with legitimate credentials",
            "Free video consultations with chat messaging",
            "Offers therapeutic techniques and gamified well-being tools",
            "Keeps your records confidential to maintain credible updates"
        ]
    },
    scheduel: {
        icon: "📅",
        title: "Easy Scheduling",
        description: "Effortless scheduling and reminders for your wellness journey.",
        features: [
            "Intuitive scheduling and reminders for your wellness journey",
            "Connects you with your counselor and provides personalized support",
            "Access to Easy Scheduling and well-being tools and resources",
        ]
    },
    counselor: {
        icon: "👨‍⚕️",
        title: "Expert Counselors",
        description: "Connect with licensed mental health professionals who are verified and ready to provide personalized care through secure video consultations.",
        features: [
            "Verified by admins — licensed counselors with legitimate credentials",
            "Free video consultations with chat messaging",
            "Offers therapeutic techniques and gamified well-being tools",
            "Keeps your records confidential to maintain credible updates"
        ]
    },
};

        function openModal(type) {
            const modal = document.getElementById('featureModal');
            const data = modalData[type];
            
            document.getElementById('modalIcon').textContent = data.icon;
            document.getElementById('modalTitle').textContent = data.title;
            document.getElementById('modalDescription').textContent = data.description;
            
            const featuresList = document.getElementById('modalFeatures');
            featuresList.innerHTML = '';
            data.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                featuresList.appendChild(li);
            });
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            const modal = document.getElementById('featureModal');
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        // Enhanced interactivity
        document.addEventListener('DOMContentLoaded', function() {
            // Navbar scroll effect
            let lastScroll = 0;
            const navbar = document.querySelector('.navbar');
            
            window.addEventListener('scroll', () => {
                const currentScroll = window.pageYOffset;
                
                if (currentScroll > lastScroll && currentScroll > 100) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
                
                if (currentScroll > 50) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.15)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.1)';
                }
                
                lastScroll = currentScroll;
            });

            // Parallax effect for floating shapes
            window.addEventListener('mousemove', (e) => {
                const shapes = document.querySelectorAll('.floating-shape');
                const x = (e.clientX / window.innerWidth) * 100;
                const y = (e.clientY / window.innerHeight) * 100;

                shapes.forEach((shape, index) => {
                    const speed = (index + 1) * 0.5;
                    shape.style.transform += ` translate(${x * speed * 0.01}px, ${y * speed * 0.01}px)`;
                });
            });

            // Button click animations
            document.querySelectorAll('.cta-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    ripple.style.cssText = `
                        position: absolute;
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        background: rgba(255, 255, 255, 0.3);
                        border-radius: 50%;
                        transform: scale(0);
                        animation: ripple 0.6s ease-out;
                        pointer-events: none;
                    `;
                    
                    this.appendChild(ripple);
                    
                    setTimeout(() => ripple.remove(), 600);
                });
            });

            // Add ripple animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        });