// admin_panel/static/admin_panel/js/admin_site_pagination.js

class ActivityPagination {
    constructor() {
        this.currentPage = 1;
        this.isLoading = false;
        this.container = document.querySelector('.recent-activity .module');
        this.init();
    }

    init() {
        // Check if pagination is needed
        const hasPagination = document.querySelector('[data-has-pagination]')?.dataset.hasPagination === 'true';
        
        if (hasPagination) {
            this.createPaginationControls();
            this.attachEventListeners();
        }
    }

    createPaginationControls() {
        const paginationHTML = `
            <div class="activity-pagination">
                <button class="pagination-btn prev-btn" data-action="prev" disabled>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Previous
                </button>
                <span class="page-info">
                    <span class="current-page">1</span> / <span class="total-pages">1</span>
                </span>
                <button class="pagination-btn next-btn" data-action="next">
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        `;

        // Insert pagination after the activities
        if (this.container) {
            this.container.insertAdjacentHTML('beforeend', paginationHTML);
        }
    }

    attachEventListeners() {
        const prevBtn = document.querySelector('.pagination-btn.prev-btn');
        const nextBtn = document.querySelector('.pagination-btn.next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigatePage('prev'));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigatePage('next'));
        }
    }

    async navigatePage(direction) {
        if (this.isLoading) return;

        const newPage = direction === 'next' ? this.currentPage + 1 : this.currentPage - 1;
        
        if (newPage < 1) return;

        await this.loadPage(newPage);
    }

    async loadPage(pageNumber) {
        this.isLoading = true;
        this.showLoadingState();

        try {
            const response = await fetch(`/custom-admin/recent-activities/?page=${pageNumber}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }

            const data = await response.json();
            await this.updateActivities(data);
            this.updatePaginationState(data);
            this.currentPage = pageNumber;

        } catch (error) {
            console.error('Error loading activities:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
        }
    }

    showLoadingState() {
        const activitiesContainer = document.querySelector('.recent-activity .module');
        if (!activitiesContainer) return;

        // Find all activity items and add loading class
        const activityItems = activitiesContainer.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.style.opacity = '0.5';
            item.style.transform = 'scale(0.98)';
        });

        // Disable pagination buttons
        this.togglePaginationButtons(true);
    }

    showErrorState() {
        const activitiesContainer = document.querySelector('.recent-activity .module');
        if (!activitiesContainer) return;

        // Show error message
        const errorHTML = `
            <div class="activity-error">
                <div class="activity-icon" style="background: rgba(245, 101, 101, 0.2); color: #f56565;">⚠️</div>
                <div class="activity-content">
                    <p>Failed to load activities. Please try again.</p>
                    <div class="activity-time">Error occurred</div>
                </div>
            </div>
        `;

        // Replace existing activities with error
        const existingActivities = activitiesContainer.querySelectorAll('.activity-item');
        if (existingActivities.length > 0) {
            existingActivities[0].outerHTML = errorHTML;
            // Remove other activities
            for (let i = 1; i < existingActivities.length; i++) {
                existingActivities[i].remove();
            }
        }

        this.togglePaginationButtons(false);
    }

    async updateActivities(data) {
        const activitiesContainer = document.querySelector('.recent-activity .module');
        if (!activitiesContainer) return;

        // Remove existing activity items
        const existingActivities = activitiesContainer.querySelectorAll('.activity-item');
        
        // Fade out existing activities
        await this.fadeOutElements(existingActivities);

        // Remove them from DOM
        existingActivities.forEach(item => item.remove());

        // Add new activities with fade-in effect
        const newActivitiesHTML = data.activities.map(activity => `
            <div class="activity-item" style="opacity: 0; transform: translateY(20px);">
                <div class="activity-icon" style="background: ${activity.bg_color}; color: ${activity.text_color};">
                    ${activity.icon}
                </div>
                <div class="activity-content">
                    <p>${activity.description}</p>
                    <div class="activity-time">${activity.time_since}</div>
                </div>
            </div>
        `).join('');

        // Insert new activities after h2
        const h2Element = activitiesContainer.querySelector('h2');
        if (h2Element) {
            h2Element.insertAdjacentHTML('afterend', newActivitiesHTML);
        }

        // Fade in new activities
        const newActivities = activitiesContainer.querySelectorAll('.activity-item');
        await this.fadeInElements(newActivities);
    }

    fadeOutElements(elements) {
        return new Promise(resolve => {
            if (!elements.length) {
                resolve();
                return;
            }

            elements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.transition = 'all 0.3s ease';
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(-10px) scale(0.95)';
                    
                    if (index === elements.length - 1) {
                        setTimeout(resolve, 300);
                    }
                }, index * 50);
            });
        });
    }

    fadeInElements(elements) {
        return new Promise(resolve => {
            if (!elements.length) {
                resolve();
                return;
            }

            elements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.transition = 'all 0.4s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0) scale(1)';
                    
                    if (index === elements.length - 1) {
                        setTimeout(resolve, 400);
                    }
                }, index * 100 + 200);
            });
        });
    }

    updatePaginationState(data) {
        const prevBtn = document.querySelector('.pagination-btn.prev-btn');
        const nextBtn = document.querySelector('.pagination-btn.next-btn');
        const currentPageSpan = document.querySelector('.current-page');
        const totalPagesSpan = document.querySelector('.total-pages');

        if (prevBtn) {
            prevBtn.disabled = !data.has_previous;
        }

        if (nextBtn) {
            nextBtn.disabled = !data.has_next;
        }

        if (currentPageSpan) {
            currentPageSpan.textContent = data.current_page;
        }

        if (totalPagesSpan) {
            totalPagesSpan.textContent = data.total_pages;
        }

        this.togglePaginationButtons(false);
    }

    togglePaginationButtons(disabled) {
        const buttons = document.querySelectorAll('.pagination-btn');
        buttons.forEach(btn => {
            if (disabled) {
                btn.style.opacity = '0.6';
                btn.style.pointerEvents = 'none';
            } else {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }
        });
    }
}

// Initialize pagination when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ActivityPagination();
});

// Auto-refresh activities every 30 seconds
setInterval(async function() {
    const pagination = window.activityPagination;
    if (pagination && !pagination.isLoading) {
        await pagination.loadPage(pagination.currentPage);
    }
}, 30000);