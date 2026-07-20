/**
 * ============================================
 * PORTFOLIO ADMIN - MASTER JAVASCRIPT
 * ============================================
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // ============================================
    // 1. SIDEBAR TOGGLE
    // ============================================
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    function toggleSidebar() {
        sidebar.classList.toggle('collapsed');
        // Save state
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
    
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', toggleSidebar);
    }
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
    }
    
    // Restore sidebar state
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }
    
    // Close sidebar on outside click (mobile)
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 991 && sidebar.classList.contains('open')) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
    
    // ============================================
    // 2. DARK MODE TOGGLE
    // ============================================
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Check saved theme
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('adminTheme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
    
    function updateThemeIcon(theme) {
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }
    
    // ============================================
    // 3. LOGIN FORM
    // ============================================
    const loginForm = document.getElementById('loginForm');
    const loginAlert = document.getElementById('loginAlert');
    const alertMessage = document.getElementById('alertMessage');
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            const username = document.getElementById('username');
            const password = document.getElementById('password');
            let isValid = true;
            
            if (!username.value.trim()) {
                username.classList.add('is-invalid');
                isValid = false;
            } else {
                username.classList.remove('is-invalid');
            }
            
            if (!password.value) {
                password.classList.add('is-invalid');
                isValid = false;
            } else {
                password.classList.remove('is-invalid');
            }
            
            if (!isValid) return;
            
            // Show loading state
            loginBtn.disabled = true;
            loginText.textContent = 'Signing In...';
            loginSpinner.classList.remove('d-none');
            
            // Simulate login (replace with actual AJAX)
            setTimeout(function() {
                loginBtn.disabled = false;
                loginText.textContent = 'Sign In';
                loginSpinner.classList.add('d-none');
                
                // Success - redirect to dashboard
                window.location.href = 'dashboard.html';
                
                // Show error (for demo)
                // showAlert('Invalid username or password', 'danger');
            }, 1500);
        });
    }
    
    function showAlert(message, type = 'danger') {
        if (loginAlert) {
            loginAlert.className = `alert alert-${type}`;
            alertMessage.textContent = message;
            loginAlert.classList.remove('d-none');
            
            setTimeout(() => {
                loginAlert.classList.add('d-none');
            }, 5000);
        }
    }
    
    // ============================================
    // 4. PASSWORD VISIBILITY TOGGLE
    // ============================================
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
    
    // ============================================
    // 5. FORGOT PASSWORD FORM
    // ============================================
    const forgotForm = document.getElementById('forgotForm');
    const forgotAlert = document.getElementById('alertMessage');
    
    if (forgotForm) {
        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email');
            if (!email.value.trim() || !isValidEmail(email.value)) {
                email.classList.add('is-invalid');
                return;
            }
            
            email.classList.remove('is-invalid');
            
            // Simulate sending
            const btn = this.querySelector('.btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            btn.disabled = true;
            
            setTimeout(function() {
                btn.innerHTML = '<i class="fas fa-check me-2"></i>Sent!';
                btn.className = 'btn btn-success btn-lg w-100';
                
                if (forgotAlert) {
                    forgotAlert.className = 'alert alert-success';
                    forgotAlert.innerHTML = '<i class="fas fa-check-circle me-2"></i>Reset link sent to your email!';
                }
                
                setTimeout(function() {
                    window.location.href = 'index.html';
                }, 2000);
            }, 1500);
        });
    }
    
    // ============================================
    // 6. FORM VALIDATION HELPERS
    // ============================================
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // Real-time validation
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('is-invalid');
            } else if (this.type === 'email' && this.value && !isValidEmail(this.value)) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid') && this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });
    });
    
    // ============================================
    // 7. COUNTER ANIMATION (Dashboard)
    // ============================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersAnimated = false;
    
    function animateCounters() {
        if (countersAnimated) return;
        
        const triggerPoint = window.innerHeight * 0.8;
        const statsSection = document.querySelector('.row.g-4');
        
        if (statsSection && statsSection.getBoundingClientRect().top < triggerPoint) {
            countersAnimated = true;
            
            statNumbers.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count'));
                let current = 0;
                const increment = Math.ceil(target / 50);
                const duration = 1500;
                const stepTime = Math.floor(duration / 50);
                
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
    
    // Run counter animation
    setTimeout(animateCounters, 500);
    window.addEventListener('scroll', animateCounters);
    
    // ============================================
    // 8. CHARTS (Dashboard)
    // ============================================
    // Visitors Chart
    const visitorsCtx = document.getElementById('visitorsChart');
    if (visitorsCtx) {
        new Chart(visitorsCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Visitors',
                    data: [1200, 1350, 1100, 1450, 1600, 1400, 1800, 2000, 1700, 1900, 2100, 2400],
                    borderColor: '#6c63ff',
                    backgroundColor: 'rgba(108, 99, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#6c63ff',
                    pointRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 500
                        }
                    }
                }
            }
        });
    }
    
    // Categories Chart (Pie/Doughnut)
    const categoriesCtx = document.getElementById('categoriesChart');
    if (categoriesCtx) {
        new Chart(categoriesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Web Development', 'UI/UX Design', 'Mobile Apps', 'Branding'],
                datasets: [{
                    data: [35, 25, 20, 20],
                    backgroundColor: ['#6c63ff', '#28a745', '#ffc107', '#dc3545'],
                    borderWidth: 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 12,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
    
    // ============================================
    // 9. SETTINGS FORM SAVING
    // ============================================
    document.querySelectorAll('.tab-pane form').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const btn = this.querySelector('.btn-primary');
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
                btn.disabled = true;
                
                setTimeout(function() {
                    btn.innerHTML = '<i class="fas fa-check me-2"></i>Saved!';
                    btn.className = 'btn btn-success';
                    
                    setTimeout(function() {
                        btn.innerHTML = originalText;
                        btn.className = 'btn btn-primary';
                        btn.disabled = false;
                    }, 1500);
                }, 1000);
            }
        });
    });
    
    // ============================================
    // 10. SMTP TEST CONNECTION
    // ============================================
    const testConnectionBtn = document.querySelector('[data-test="smtp"]');
    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', function() {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Testing...';
            this.disabled = true;
            
            setTimeout(function() {
                testConnectionBtn.innerHTML = '<i class="fas fa-check me-2 text-success"></i>Connected!';
                testConnectionBtn.className = 'btn btn-success ms-2';
                
                setTimeout(function() {
                    testConnectionBtn.innerHTML = originalText;
                    testConnectionBtn.className = 'btn btn-success ms-2';
                    testConnectionBtn.disabled = false;
                }, 2000);
            }, 1500);
        });
    }
    
    // ============================================
    // 11. SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ============================================
    // 12. AUTO-HIDE ALERTS
    // ============================================
    document.querySelectorAll('.alert:not(.alert-permanent)').forEach(alert => {
        setTimeout(function() {
            alert.classList.add('fade');
            setTimeout(function() {
                alert.remove();
            }, 300);
        }, 5000);
    });
    
    // ============================================
    // 13. TOOLTIP INITIALIZATION (Bootstrap)
    // ============================================
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    console.log('✅ Portfolio Admin Loaded Successfully');
});