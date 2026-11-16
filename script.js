/* =========================================================================
   Pritish Premlal — interaction layer
   No dependencies. Every feature degrades safely:
   - if this file fails to load, all content is visible (CSS reveal is
     gated behind `html.js`, which this file is what adds)
   - if IntersectionObserver is missing, everything reveals immediately
   ========================================================================= */

(function () {
    "use strict";

    var reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /* ---------------------------------------------------------------------
       Year
    --------------------------------------------------------------------- */

    var year = document.getElementById("year");
    if (year) {
        year.textContent = new Date().getFullYear();
    }


    /* ---------------------------------------------------------------------
       Navigation — scrolled state, mobile menu, active section
    --------------------------------------------------------------------- */

    var navbar = document.getElementById("navbar");
    var menuToggle = document.getElementById("menu-toggle");
    var navLinks = document.getElementById("nav-links");
    var linkItems = navLinks
        ? Array.prototype.slice.call(navLinks.querySelectorAll("a"))
        : [];

    function closeMenu() {
        if (!navLinks || !menuToggle) return;
        navLinks.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation");
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", function () {
            var open = navLinks.classList.toggle("is-open");
            menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
            menuToggle.setAttribute(
                "aria-label",
                open ? "Close navigation" : "Open navigation"
            );
        });

        linkItems.forEach(function (link) {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && navLinks.classList.contains("is-open")) {
                closeMenu();
                menuToggle.focus();
            }
        });

        document.addEventListener("click", function (event) {
            if (!navLinks.classList.contains("is-open")) return;
            if (navLinks.contains(event.target)) return;
            if (menuToggle.contains(event.target)) return;
            closeMenu();
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 860) closeMenu();
        });
    }


    /* ---------------------------------------------------------------------
       Scroll — progress bar + navbar tint (single rAF-throttled listener)
    --------------------------------------------------------------------- */

    var progressBar = document.getElementById("progress-bar");
    var ticking = false;

    function onScrollFrame() {
        var y = window.scrollY || 0;
        var max = document.documentElement.scrollHeight - window.innerHeight;

        if (progressBar) {
            var ratio = max > 0 ? Math.min(y / max, 1) : 0;
            progressBar.style.transform = "scaleX(" + ratio + ")";
        }

        if (navbar) {
            navbar.classList.toggle("is-scrolled", y > 12);
        }

        ticking = false;
    }

    function requestScrollFrame() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(onScrollFrame);
    }

    window.addEventListener("scroll", requestScrollFrame, { passive: true });
    window.addEventListener("resize", requestScrollFrame);
    onScrollFrame();


    /* ---------------------------------------------------------------------
       Reveal on scroll
       `html.js` is already set inline, so anything still hidden after the
       failsafe below is force-revealed rather than left invisible.
    --------------------------------------------------------------------- */

    var revealTargets = Array.prototype.slice.call(
        document.querySelectorAll(".reveal")
    );

    function revealAll() {
        revealTargets.forEach(function (el) {
            el.classList.add("is-visible");
        });
    }

    if (
        reduceMotion ||
        !("IntersectionObserver" in window)
    ) {
        revealAll();
    } else {
        var revealObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
        );

        revealTargets.forEach(function (el) {
            revealObserver.observe(el);
        });

        // Failsafe: nothing stays invisible for longer than 2.5s.
        window.setTimeout(revealAll, 2500);
    }


    /* ---------------------------------------------------------------------
       Active nav section
    --------------------------------------------------------------------- */

    var sections = linkItems
        .map(function (link) {
            var id = link.getAttribute("href");
            if (!id || id.charAt(0) !== "#") return null;
            return document.querySelector(id);
        })
        .filter(Boolean);

    if (sections.length && "IntersectionObserver" in window) {
        var sectionObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;

                    linkItems.forEach(function (link) {
                        if (link.getAttribute("href") === "#" + entry.target.id) {
                            link.setAttribute("aria-current", "true");
                        } else {
                            link.removeAttribute("aria-current");
                        }
                    });
                });
            },
            {
                rootMargin: "-45% 0px -50% 0px",
                threshold: 0
            }
        );

        sections.forEach(function (section) {
            sectionObserver.observe(section);
        });
    }


    /* ---------------------------------------------------------------------
       Hero ticker
    --------------------------------------------------------------------- */

    var ticker = document.getElementById("ticker");

    if (ticker && !reduceMotion) {
        var phrases = [
            "building ScaleUp AI",
            "working on scientific computing",
            "modelling biotech processes",
            "automating lab workflows"
        ];

        var index = 0;

        window.setInterval(function () {
            index = (index + 1) % phrases.length;
            ticker.classList.add("is-swapping");

            window.setTimeout(function () {
                ticker.textContent = phrases[index];
                ticker.classList.remove("is-swapping");
            }, 280);
        }, 3200);
    }
})();
