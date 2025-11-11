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
    loaderTimeout = setTimeout(showContent, 20000);
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

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
            }
        });
    });

    // Handle scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section');
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15,
            }
        );

        animatedSections.forEach(section => observer.observe(section));
    } else {
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
    const savedTheme = localStorage.getItem('theme') || 'light';
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
