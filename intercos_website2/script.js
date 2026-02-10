// ========================================
// INTERCOS KOREA - Interactive Script
// ========================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Loader ---
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        revealHero();
        initAnimations();
    }, 2000);

    // --- Hero Auto Reveal (no scroll needed) ---
    function revealHero() {
        // Reveal non-title elements (tag, desc, cta)
        const heroReveals = document.querySelectorAll('.hero .reveal-up');
        heroReveals.forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('revealed');
            }, i * 220);
        });

        // GSAP split text animation for hero title
        if (typeof gsap !== 'undefined') {
            const splitEls = document.querySelectorAll('[data-split]');
            splitEls.forEach(el => {
                const text = el.textContent;
                el.textContent = '';
                text.split('').forEach(char => {
                    const span = document.createElement('span');
                    span.className = 'split-char';
                    span.textContent = char === ' ' ? '\u00A0' : char;
                    el.appendChild(span);
                });
            });

            const allChars = document.querySelectorAll('.split-char');
            gsap.set(allChars, { opacity: 0, y: 60, rotateX: -40 });

            gsap.to(allChars, {
                opacity: 1,
                y: 0,
                rotateX: 0,
                duration: 1,
                ease: 'power3.out',
                stagger: 0.04,
                delay: 0.3
            });
        }
    }

    // --- Custom Cursor ---
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    if (window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        function animateFollower() {
            followerX += (mouseX - followerX) * 0.12;
            followerY += (mouseY - followerY) * 0.12;
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Hover states
        const hoverElements = document.querySelectorAll('a, button, .process-item-header, .product-card, .innovation-card');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                follower.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                follower.classList.remove('hover');
            });
        });
    }

    // --- Navigation Scroll ---
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    });

    // --- Mobile Menu ---
    const navToggle = document.getElementById('nav-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // --- Reveal Animations (Intersection Observer) ---
    function initAnimations() {
        const reveals = document.querySelectorAll('.reveal-up:not(.hero .reveal-up), .reveal-right');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger delay based on position among siblings
                    const parent = entry.target.parentElement;
                    const siblings = Array.from(parent.querySelectorAll('.reveal-up'));
                    const siblingIndex = siblings.indexOf(entry.target);
                    const delay = siblingIndex * 50;

                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay);

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -70px 0px'
        });

        reveals.forEach(el => observer.observe(el));
    }

    // --- Counter Animation (all finish simultaneously) ---
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        let started = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !started) {
                    started = true;
                    const duration = 2000;
                    const start = performance.now();

                    function updateAll(now) {
                        const elapsed = now - start;
                        const progress = Math.min(elapsed / duration, 1);
                        const ease = 1 - Math.pow(1 - progress, 3);

                        counters.forEach(el => {
                            const target = parseInt(el.dataset.count);
                            const current = Math.round(ease * target);
                            el.textContent = current.toLocaleString();
                        });

                        if (progress < 1) {
                            requestAnimationFrame(updateAll);
                        }
                    }
                    requestAnimationFrame(updateAll);
                    counters.forEach(el => observer.unobserve(el));
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(el => observer.observe(el));
    }
    animateCounters();

    // --- GSAP Timeline Drawing Animation ---
    function initTimelineAnimation() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        const timeline = document.querySelector('.timeline');
        const lineFill = document.querySelector('.timeline-line-fill');
        const items = document.querySelectorAll('.gsap-timeline');
        const dots = document.querySelectorAll('.timeline-dot');

        if (!timeline || !lineFill || items.length === 0) return;

        // Set initial states
        gsap.set(items, { opacity: 0, x: 60 });
        gsap.set(dots, { scale: 0, opacity: 0 });

        // Main timeline - plays once, resets when leaving viewport
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: timeline,
                start: 'top 75%',
                toggleActions: 'play none none reset'
            }
        });

        // Animate the line fill height
        tl.to(lineFill, {
            height: '100%',
            duration: 2.5,
            ease: 'power1.inOut'
        });

        // Each item appears sequentially as the line grows
        items.forEach((item, i) => {
            const dot = item.querySelector('.timeline-dot');
            const delay = i * 0.35;

            tl.to(dot, {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: 'back.out(2)',
            }, delay);

            tl.to(item, {
                opacity: 1,
                x: 0,
                duration: 0.6,
                ease: 'power2.out',
            }, delay + 0.1);
        });
    }
    initTimelineAnimation();

    // --- GSAP Product Card Parallax Images ---
    function initProductParallax() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        const cards = document.querySelectorAll('.product-card');
        if (cards.length === 0) return;

        cards.forEach(card => {
            const img = card.querySelector('.product-img-inner img');
            if (!img) return;

            gsap.fromTo(img, {
                yPercent: -10
            }, {
                yPercent: 10,
                ease: 'none',
                scrollTrigger: {
                    trigger: card,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.5
                }
            });
        });
    }
    initProductParallax();

    // --- GSAP Vision/Mission Slide In ---
    function initVisionSlide() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        gsap.registerPlugin(ScrollTrigger);

        const leftBlock = document.querySelector('.gsap-vision-left');
        const rightBlock = document.querySelector('.gsap-vision-right');
        const divider = document.querySelector('.vision-divider');

        if (!leftBlock || !rightBlock) return;

        // Initial states
        gsap.set(leftBlock, { opacity: 0, x: -120 });
        gsap.set(rightBlock, { opacity: 0, x: 120 });
        if (divider) gsap.set(divider, { opacity: 0, scaleY: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.vision-blocks',
                start: 'top 75%',
                toggleActions: 'play none none none'
            }
        });

        // Vision slides from left
        tl.to(leftBlock, {
            opacity: 1,
            x: 0,
            duration: 1.5,
            ease: 'power3.inOut'
        }, 0);

        // Mission slides from right
        tl.to(rightBlock, {
            opacity: 1,
            x: 0,
            duration: 1.5,
            ease: 'power3.inOut'
        }, 0.15);

        // Divider grows in the middle
        if (divider) {
            tl.to(divider, {
                opacity: 1,
                scaleY: 1,
                duration: 0.6,
                ease: 'power2.out'
            }, 0.3);
        }
    }
    initVisionSlide();

    // --- Process Accordion ---
    const processItems = document.querySelectorAll('.process-item');

    processItems.forEach(item => {
        const header = item.querySelector('.process-item-header');
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            processItems.forEach(i => i.classList.remove('active'));

            // Open clicked if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- Hero Particles ---
    function createParticles() {
        const container = document.getElementById('particles');
        if (!container) return;
        const count = window.innerWidth < 768 ? 20 : 40;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 3 + 1;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.opacity = Math.random() * 0.5 + 0.1;
            particle.style.animation = `particleFloat ${Math.random() * 8 + 6}s ease-in-out infinite`;
            particle.style.animationDelay = Math.random() * 5 + 's';
            container.appendChild(particle);
        }

        // Add keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat {
                0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
                25% { transform: translate(${rand(-30, 30)}px, ${rand(-40, -10)}px) scale(1.5); opacity: 0.5; }
                50% { transform: translate(${rand(-20, 20)}px, ${rand(-60, -20)}px) scale(1); opacity: 0.3; }
                75% { transform: translate(${rand(-30, 30)}px, ${rand(-30, 0)}px) scale(1.3); opacity: 0.4; }
            }
        `;
        document.head.appendChild(style);
    }

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    createParticles();

    // --- Parallax on Hero ---
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');

    window.addEventListener('scroll', () => {
        if (!hero) return;
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;

        if (scrollY < heroHeight) {
            const progress = scrollY / heroHeight;
            heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
            heroContent.style.opacity = 1 - progress * 1.2;
        }
    });

    // --- Tilt Effect on Cards ---
    const tiltCards = document.querySelectorAll('[data-tilt]');

    if (window.matchMedia('(pointer: fine)').matches) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / centerY * -5;
                const rotateY = (x - centerX) / centerX * 5;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // --- Timeline Animation ---
    const timelineLine = document.querySelector('.timeline-line');
    if (timelineLine) {
        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    timelineLine.style.background = `linear-gradient(to bottom, var(--color-accent) 0%, var(--color-border) 100%)`;
                    timelineLine.style.transition = 'background 1s ease';
                }
            });
        }, { threshold: 0.1 });

        timelineObserver.observe(timelineLine);
    }

    // --- Magnetic Button Effect ---
    const magneticBtns = document.querySelectorAll('.hero-cta, .contact-cta');

    if (window.matchMedia('(pointer: fine)').matches) {
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    }

    // --- Active Nav Link on Scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.style.color = 'var(--color-accent)';
            }
        });
    });

    // --- Marquee pause on hover ---
    document.querySelectorAll('.marquee-track').forEach(track => {
        track.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });
        track.addEventListener('mouseleave', () => {
            track.style.animationPlayState = 'running';
        });
    });

});
