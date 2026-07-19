document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // ================================================
    // 1. LOADING SCREEN
    // ================================================
    const loader = document.getElementById('loader');
    window.addEventListener('load', function() {
        setTimeout(function() {
            loader.classList.add('hidden');
        }, 800);
    });
    
    // ================================================
    // 2. STICKY NAVIGATION
    // ================================================
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
        
        // Active nav link highlight
        updateActiveNavLink();
    });
    
    // ================================================
    // 3. MOBILE MENU TOGGLE
    // ================================================
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    mobileToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('open');
    });
    
    // Close menu on link click
    document.querySelectorAll('#navMenu ul a').forEach(link => {
        link.addEventListener('click', function() {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('open');
        });
    });
    
    // ================================================
    // 4. DARK / LIGHT MODE
    // ================================================
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Check for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
    
    // ================================================
    // 5. TYPING TEXT ANIMATION
    // ================================================
    const typingElement = document.getElementById('typingText');
    const phrases = ['Creative Developer', 'UI/UX Designer', 'Problem Solver', 'Digital Creator'];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function typeText() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause before deleting
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Pause before typing next
        }
        
        setTimeout(typeText, typingSpeed);
    }
    
    // Start typing animation
    setTimeout(typeText, 1000);
    
    // ================================================
    // 6. COUNTER ANIMATION
    // ================================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersAnimated = false;
    
    function animateCounters() {
        if (countersAnimated) return;
        
        const triggerPoint = window.innerHeight * 0.8;
        const statsSection = document.querySelector('.statistics');
        
        if (statsSection.getBoundingClientRect().top < triggerPoint) {
            countersAnimated = true;
            
            statNumbers.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count'));
                let current = 0;
                const increment = Math.ceil(target / 60);
                const duration = 1500;
                const stepTime = Math.floor(duration / 60);
                
                const updateCounter = setInterval(function() {
                    current += increment;
                    if (current >= target) {
                        counter.textContent = target;
                        clearInterval(updateCounter);
                    } else {
                        counter.textContent = current;
                    }
                }, stepTime);
            });
        }
    }
    
    // ================================================
    // 7. SKILL PROGRESS BARS
    // ================================================
    let skillBarsAnimated = false;
    
    function animateSkillBars() {
        if (skillBarsAnimated) return;
        
        const triggerPoint = window.innerHeight * 0.8;
        const skillsSection = document.querySelector('.resume');
        
        if (skillsSection.getBoundingClientRect().top < triggerPoint) {
            skillBarsAnimated = true;
            
            document.querySelectorAll('.progress-fill').forEach(bar => {
                const width = bar.getAttribute('data-width');
                setTimeout(function() {
                    bar.style.width = width + '%';
                }, 200);
            });
        }
    }
    
    // ================================================
    // 8. PORTFOLIO FILTER
    // ================================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            portfolioItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
    
    // Add fadeIn animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(styleSheet);
    
    // ================================================
    // 9. IMAGE LIGHTBOX
    // ================================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeLightbox = document.querySelector('.close-lightbox');
    
    document.querySelectorAll('.portfolio-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const parentItem = this.closest('.portfolio-item');
            const img = parentItem.querySelector('img');
            lightboxImg.src = img.src;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    });
    
    function closeLightboxFn() {
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    closeLightbox.addEventListener('click', closeLightboxFn);
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === this) {
            closeLightboxFn();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeLightboxFn();
        }
    });
    
    // ================================================
    // 10. TESTIMONIAL SLIDER
    // ================================================
    const track = document.getElementById('testimonialTrack');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    let currentSlide = 0;
    const totalSlides = dots.length;
    let autoSlideInterval;
    
    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        
        currentSlide = index;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }
    
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    // Dot clicks
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            goToSlide(index);
            resetAutoSlide();
        });
    });
    
    // Button clicks
    nextBtn.addEventListener('click', function() {
        nextSlide();
        resetAutoSlide();
    });
    
    prevBtn.addEventListener('click', function() {
        prevSlide();
        resetAutoSlide();
    });
    
    // Auto-slide
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000);
    }
    
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }
    
    startAutoSlide();
    
    // Pause on hover
    const sliderContainer = document.querySelector('.testimonial-slider');
    sliderContainer.addEventListener('mouseenter', function() {
        clearInterval(autoSlideInterval);
    });
    
    sliderContainer.addEventListener('mouseleave', function() {
        startAutoSlide();
    });
    
    // ================================================
    // 11. SMOOTH SCROLL (for all anchor links)
    // ================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ================================================
    // 12. BACK TO TOP BUTTON
    // ================================================
    const backToTopBtn = document.getElementById('back-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // ================================================
    // 13. ACTIVE NAV LINK ON SCROLL
    // ================================================
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('#navMenu ul a');
        const navHeight = navbar.offsetHeight + 20;
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - navHeight;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionBottom) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + currentSection) {
                link.classList.add('active');
            }
        });
    }
    
    // ================================================
    // 14. CONTACT FORM VALIDATION
    // ================================================
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        // Validate name
        const name = document.getElementById('name');
        const nameError = document.getElementById('nameError');
        if (name.value.trim().length < 2) {
            name.closest('.form-group').classList.add('error');
            isValid = false;
        } else {
            name.closest('.form-group').classList.remove('error');
        }
        
        // Validate email
        const email = document.getElementById('email');
        const emailError = document.getElementById('emailError');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.value.trim())) {
            email.closest('.form-group').classList.add('error');
            isValid = false;
        } else {
            email.closest('.form-group').classList.remove('error');
        }
        
        // Validate message
        const message = document.getElementById('message');
        const messageError = document.getElementById('messageError');
        if (message.value.trim().length < 10) {
            message.closest('.form-group').classList.add('error');
            isValid = false;
        } else {
            message.closest('.form-group').classList.remove('error');
        }
        
        if (isValid) {
            // Show success message
            const originalText = contactForm.querySelector('.btn').textContent;
            contactForm.querySelector('.btn').textContent = '✓ Message Sent!';
            contactForm.querySelector('.btn').style.background = '#28a745';
            contactForm.querySelector('.btn').style.borderColor = '#28a745';
            
            // Reset form
            setTimeout(function() {
                contactForm.reset();
                contactForm.querySelector('.btn').textContent = originalText;
                contactForm.querySelector('.btn').style.background = '';
                contactForm.querySelector('.btn').style.borderColor = '';
            }, 3000);
        }
    });
    
    // Remove error on input
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
        input.addEventListener('input', function() {
            this.closest('.form-group').classList.remove('error');
        });
    });
    
    // ================================================
    // 15. SCROLL ANIMATIONS (Intersection Observer)
    // ================================================
    const animateElements = document.querySelectorAll(
        '.service-card, .portfolio-item, .blog-card, .about-grid, .stat-item'
    );
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // ================================================
    // 16. INITIALIZE: Check for animations on load
    // ================================================
    setTimeout(function() {
        animateCounters();
        animateSkillBars();
    }, 1000);
    
    // Check for animations on scroll
    window.addEventListener('scroll', function() {
        animateCounters();
        animateSkillBars();
    });
});