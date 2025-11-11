let loaderTimeout;
let loaderDismissed = false;
const rootElement = document.documentElement;
const viewportHeightProperty = '--full-viewport-height';
let viewportRafId = null;

function setViewportHeight() {
    const viewportHeight = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
    rootElement.style.setProperty(viewportHeightProperty, `${viewportHeight}px`);
}

function scheduleViewportHeightUpdate() {
    if (viewportRafId !== null) {
        cancelAnimationFrame(viewportRafId);
    }

    viewportRafId = requestAnimationFrame(() => {
        viewportRafId = null;
        setViewportHeight();
    });
}

function initViewportHeightFix() {
    setViewportHeight();

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', scheduleViewportHeightUpdate);
        window.visualViewport.addEventListener('scroll', scheduleViewportHeightUpdate);
    } else {
        window.addEventListener('resize', scheduleViewportHeightUpdate);
    }

    window.addEventListener('orientationchange', scheduleViewportHeightUpdate);
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            scheduleViewportHeightUpdate();
        }
    });
}

initViewportHeightFix();

// Page initialization
function initPage() {
    loaderTimeout = setTimeout(showContent, 200000);
    initTheme();
    setupThemeToggle();
    setupNavigation();
    setupLoaderSkip();
    updateFooterYear();
}

// Show main content after loading
function showContent() {
    if (loaderDismissed) return;
    loaderDismissed = true;

    const loader = document.getElementById('loader');
    const main = document.getElementById('mainContent');

    loader.classList.add('hide');

    setTimeout(() => {
        loader.style.display = 'none';
        main.style.display = 'block';
        requestAnimationFrame(() => main.classList.add('is-visible'));
    }, 600);
}

function setupLoaderSkip() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    const skip = () => {
        if (loaderDismissed) return;
        clearTimeout(loaderTimeout);
        showContent();
    };

    loader.addEventListener('click', skip);
    loader.addEventListener('keydown', (event) => {
        if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            skip();
        }
    });
}

function updateFooterYear() {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// Navigation setup
function setupNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const animatedSections = document.querySelectorAll('[data-animate="true"]');

    // Toggle mobile menu
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    // Handle navigation clicks with smooth scroll
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get target section
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Calculate offset for sticky navbar
                const navHeight = document.querySelector('.topnav').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                link.classList.add('active');
                
                // Close mobile menu if open
                if (window.innerWidth <= 768) {
                    navMenu.classList.remove('active');
                    menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
                }
            }
        });
    });

    // Handle scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        const navHeight = document.querySelector('.topnav').offsetHeight;
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        let current = '';

        // Check if we're at the bottom of the page
        const isAtBottom = scrollPosition + windowHeight >= documentHeight - 10;
        
        if (isAtBottom) {
            // If at bottom, set last section (Contact) as active
            const lastSection = sections[sections.length - 1];
            current = lastSection.getAttribute('id');
        } else {
            // Otherwise, find which section we're currently viewing
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                // Check if the scroll position is within this section
                // We use a small buffer to make the transition smoother
                if (scrollPosition >= sectionTop - navHeight - 100) {
                    current = section.getAttribute('id');
                }
            });
        }

        // If we're at the very top, ensure Home is active
        if (scrollPosition < 50) {
            current = 'Home';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // Observe all sections for scroll animations
    const allSections = document.querySelectorAll('.section');
    
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        // Don't unobserve so sections can re-animate if needed
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            }
        );

        allSections.forEach(section => {
            sectionObserver.observe(section);
            // Make first section visible immediately
            if (section.id === 'Home') {
                section.classList.add('is-visible');
            }
        });
        
        // Separate observer for data-animate sections
        if (animatedSections.length > 0) {
            const animateObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-visible');
                        }
                    });
                },
                {
                    threshold: 0.15,
                }
            );
            
            animatedSections.forEach(section => animateObserver.observe(section));
        }
    } else {
        // Fallback for browsers without IntersectionObserver
        allSections.forEach(section => section.classList.add('is-visible'));
        animatedSections.forEach(section => section.classList.add('is-visible'));
    }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const navMenu = document.querySelector('.nav-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    
    if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
    }
});

// Theme Toggle Functionality
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme, false);
}

function setTheme(theme, save = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (save) {
        localStorage.setItem('theme', theme);
    }
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            if (theme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                themeToggle.setAttribute('aria-label', 'Toggle light mode');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                themeToggle.setAttribute('aria-label', 'Toggle dark mode');
            }
        }
    }
}

function setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) {
        console.error('Theme toggle button not found');
        return;
    }
    
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme, true);
    });
}

// Social Link Modal
function initSocialModal() {
    const modal = document.getElementById('socialModal');
    const modalBackdrop = document.querySelector('.social-modal-backdrop');
    const closeBtn = document.querySelector('.social-modal-close');
    const previewIcon = document.querySelector('.social-preview-icon i');
    const previewTitle = document.querySelector('.social-preview-title');
    const previewDescription = document.querySelector('.social-preview-description');
    const previewButton = document.querySelector('.social-preview-button');
    
    // Social media data
    const socialData = {
        github: {
            icon: 'fab fa-github',
            title: 'GitHub',
            description: 'Check out my code repositories and open source projects'
        },
        instagram: {
            icon: 'fab fa-instagram',
            title: 'Instagram',
            description: 'Follow my visual journey and creative moments'
        },
        soundcloud: {
            icon: 'fab fa-soundcloud',
            title: 'SoundCloud',
            description: 'Listen to my music and audio creations'
        }
    };
    
    // Open modal
    function openModal(socialType, url) {
        const data = socialData[socialType];
        if (!data) return;
        
        // Update modal content
        previewIcon.className = data.icon;
        previewTitle.textContent = data.title;
        previewDescription.textContent = data.description;
        previewButton.href = url;
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Event listeners for social links
    document.querySelectorAll('.social-link-trigger').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const socialType = link.getAttribute('data-social');
            const url = link.getAttribute('data-url');
            openModal(socialType, url);
        });
    });
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Click backdrop to close
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Initialize social modal
initSocialModal();

// Hobby Modal
function initHobbyModal() {
    const modal = document.getElementById('hobbyModal');
    const modalBackdrop = document.querySelector('.hobby-modal-backdrop');
    const closeBtn = document.querySelector('.hobby-modal-close');
    const previewIcon = document.querySelector('.hobby-preview-icon i');
    const previewTitle = document.querySelector('.hobby-preview-title');
    const previewDescription = document.querySelector('.hobby-preview-description');
    
    // Hobby data
    const hobbyData = {
        yoga: {
            icon: 'fas fa-rainbow',
            title: 'Yoga',
            description: 'Finding balance and peace through mindful movement and meditation. A practice that centers my mind and strengthens my body.'
        },
        cooking: {
            icon: 'fas fa-utensils',
            title: 'Cooking',
            description: 'Experimenting with flavors and ingredients to create delicious meals. Cooking is my creative outlet in the kitchen.'
        },
        music: {
            icon: 'fas fa-music',
            title: 'Music',
            description: 'Exploring sound and rhythm through creative compositions. Music is where I express emotions and experiment with patterns.'
        },
        learning: {
            icon: 'fas fa-book',
            title: 'Self-Learning',
            description: 'Continuously expanding my knowledge and skills. Curiosity drives me to explore new topics and technologies.'
        },
        sports: {
            icon: 'fas fa-basketball',
            title: 'Sports',
            description: 'Staying active and competitive through various sports activities. Physical challenges keep me energized and focused.'
        }
    };
    
    // Open modal
    function openModal(hobbyType) {
        const data = hobbyData[hobbyType];
        if (!data) return;
        
        // Update modal content
        previewIcon.className = data.icon;
        previewTitle.textContent = data.title;
        previewDescription.textContent = data.description;
        
        // Show modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Event listeners for hobby items
    document.querySelectorAll('.hobby-trigger').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const hobbyType = item.getAttribute('data-hobby');
            openModal(hobbyType);
        });
    });
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Click backdrop to close
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }
    
    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Initialize hobby modal
initHobbyModal();
