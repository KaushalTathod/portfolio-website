// Submenu toggle + outside click close + scroll shadow
document.addEventListener("DOMContentLoaded", function () {

    var navbar = document.querySelector(".navbar-top");
    window.addEventListener("scroll", function () {
        navbar.style.boxShadow = window.scrollY > 4
            ? "0 2px 10px rgba(0,0,0,0.08)"
            : "0 1px 3px rgba(0,0,0,0.05)";
    });

    document.querySelectorAll(".nav-toggle-btn").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
            e.stopPropagation();
            var menu = document.querySelector(btn.getAttribute("data-target") || btn.getAttribute("aria-controls"));
            var expanded = btn.getAttribute("aria-expanded") === "true";

            document.querySelectorAll(".nav-toggle-btn").forEach(function (b) {
                b.setAttribute("aria-expanded", "false");
            });
            document.querySelectorAll(".collapse").forEach(function (c) {
                c.classList.remove("show");
            });

            if (!expanded && menu) {
                menu.classList.add("show");
                btn.setAttribute("aria-expanded", "true");
            }
        });
    });

    document.addEventListener("click", function (e) {
        if (!e.target.closest(".sidebar")) {
            document.querySelectorAll(".nav-toggle-btn").forEach(function (b) {
                b.setAttribute("aria-expanded", "false");
            });
            document.querySelectorAll(".collapse").forEach(function (c) {
                c.classList.remove("show");
            });
        }
    });

});

// DASHBOARD CONTENT - stat number count-up animation

document.addEventListener("DOMContentLoaded", function () {

    // Animate each stat-number from 0 up to its data-count value
    var statNumbers = document.querySelectorAll(".stat-number[data-count]");

    statNumbers.forEach(function (el) {
        var target = parseInt(el.getAttribute("data-count"), 10) || 0;
        var duration = 900; // total animation time in ms
        var startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // ease-out for a smoother finish
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.floor(eased * target);

            el.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target.toLocaleString();
            }
        }

        requestAnimationFrame(step);
    });

});