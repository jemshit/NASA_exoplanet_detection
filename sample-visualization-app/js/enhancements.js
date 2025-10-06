/* ====================================
	S'kaiNet Interactive Enhancements
	Professional UI Interactions & Animations
   ==================================== */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancements();
});

function initializeEnhancements() {
    // Initialize smooth scrolling
    initSmoothScrolling();

    // Initialize navbar effects
    initNavbarEffects();

    // Initialize hero statistics animation
    initHeroStats();

    // Initialize chart controls
    initChartControls();

    // Initialize loading enhancements
    initLoadingEnhancements();

    // Initialize performance optimizations
    initPerformanceOptimizations();
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Navbar scroll effects
function initNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Add/remove background based on scroll position
        if (currentScrollY > 50) {
            navbar.style.background = 'rgba(10, 14, 39, 0.95)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = 'rgba(10, 14, 39, 0.8)';
            navbar.style.boxShadow = 'none';
        }

        // Update active navigation based on scroll position
        updateActiveNavigation();

        lastScrollY = currentScrollY;
    });
}

// Update active navigation item based on scroll position
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id], div[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Animate hero statistics with counting effect
function initHeroStats() {
    const statNumbers = document.querySelectorAll('.hero-stats .stat-number');

    // Initial values (will be updated when data loads)
    const initialStats = {
        'heroTotalObjects': 0,
        'heroConfirmed': 0,
        'heroCandidates': 0
    };

    // Set initial loading state
    statNumbers.forEach(stat => {
        const id = stat.id;
        if (initialStats.hasOwnProperty(id)) {
            stat.textContent = '---';
            stat.classList.add('loading');
        }
    });
}

// Update hero stats with animation when data is loaded
function updateHeroStats(data) {
    const stats = calculateStats(data);

    animateCounter('heroTotalObjects', stats.total, 2000);
    animateCounter('heroConfirmed', stats.confirmed, 2500);
    animateCounter('heroCandidates', stats.candidates, 3000);
}

// Calculate basic stats from dataset
function calculateStats(data) {
    const total = data.length;
    const confirmed = data.filter(item =>
        item.koi_disposition === 'CONFIRMED' ||
        item.koi_pdisposition === 'CANDIDATE'
    ).length;
    const candidates = data.filter(item =>
        item.koi_pdisposition === 'CANDIDATE'
    ).length;

    return { total, confirmed, candidates };
}

// Animate number counting effect
function animateCounter(elementId, finalValue, duration) {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.classList.remove('loading');

    const startValue = 0;
    const startTime = Date.now();

    function updateCounter() {
        const currentTime = Date.now();
        const progress = Math.min((currentTime - startTime) / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = Math.floor(easeOutQuart * finalValue);

        element.textContent = currentValue.toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = finalValue.toLocaleString();
        }
    }

    requestAnimationFrame(updateCounter);
}

// Initialize chart control interactions
function initChartControls() {
    // Add expand functionality to chart controls
    document.querySelectorAll('.chart-controls .btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const chartCard = this.closest('.chart-card');
            toggleChartFullscreen(chartCard);
        });
    });
}

// Toggle chart fullscreen mode
function toggleChartFullscreen(chartCard) {
    if (chartCard.classList.contains('fullscreen')) {
        // Exit fullscreen
        chartCard.classList.remove('fullscreen');
        document.body.classList.remove('chart-fullscreen-active');

        // Remove fullscreen styles
        chartCard.style.position = '';
        chartCard.style.top = '';
        chartCard.style.left = '';
        chartCard.style.width = '';
        chartCard.style.height = '';
        chartCard.style.zIndex = '';
        chartCard.style.background = '';
    } else {
        // Enter fullscreen
        chartCard.classList.add('fullscreen');
        document.body.classList.add('chart-fullscreen-active');

        // Add fullscreen styles
        chartCard.style.position = 'fixed';
        chartCard.style.top = '0';
        chartCard.style.left = '0';
        chartCard.style.width = '100vw';
        chartCard.style.height = '100vh';
        chartCard.style.zIndex = '9999';
        chartCard.style.background = 'rgba(10, 14, 39, 0.98)';
        chartCard.style.backdropFilter = 'blur(20px)';
    }

    // Trigger chart resize after animation
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 300);
}

// Enhanced loading animations
function initLoadingEnhancements() {
    const loadingState = document.getElementById('loadingState');

    if (loadingState) {
        // Add pulsing effect to loading text
        const loadingText = loadingState.querySelector('h3');
        if (loadingText) {
            setInterval(() => {
                loadingText.style.opacity = '0.5';
                setTimeout(() => {
                    loadingText.style.opacity = '1';
                }, 500);
            }, 2000);
        }

        // Simulate loading progress
        const progressBar = loadingState.querySelector('.progress-bar');
        if (progressBar) {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                }
                progressBar.style.width = `${progress}%`;
            }, 200);
        }
    }
}

// Performance optimizations
function initPerformanceOptimizations() {
    // Lazy load charts when they come into view
    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const chartCard = entry.target;
                chartCard.classList.add('visible');
                chartObserver.unobserve(chartCard);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    // Observe all chart cards
    document.querySelectorAll('.chart-card').forEach(card => {
        chartObserver.observe(card);
    });

    // Debounced resize handler for charts
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Trigger chart resize events
            if (window.Plotly) {
                document.querySelectorAll('[id*="Plot"]').forEach(plot => {
                    if (plot._plotly_plot) {
                        window.Plotly.Plots.resize(plot);
                    }
                });
            }
        }, 250);
    });
}

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Escape key to exit fullscreen charts
    if (e.key === 'Escape') {
        const fullscreenChart = document.querySelector('.chart-card.fullscreen');
        if (fullscreenChart) {
            toggleChartFullscreen(fullscreenChart);
        }
    }
});

// Add CSS for chart fullscreen mode
const style = document.createElement('style');
style.textContent = `
    .chart-card.fullscreen {
        transition: all 0.3s ease !important;
    }

    .chart-card.fullscreen .chart-container,
    .chart-card.fullscreen .chart-container-wide {
        height: calc(100vh - 120px) !important;
        padding: 2rem !important;
    }

    .chart-card.fullscreen .chart-header {
        padding: 2rem !important;
    }

    body.chart-fullscreen-active {
        overflow: hidden;
    }

    .chart-card:not(.visible) {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }

    .chart-card.visible {
        opacity: 1;
        transform: translateY(0);
    }

    .stat-number.loading {
        opacity: 0.5;
        animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 0.8; }
    }
`;
document.head.appendChild(style);

// Export functions for use in main app.js
window.sKaiNetEnhancements = {
    updateHeroStats,
    toggleChartFullscreen,
    animateCounter
};