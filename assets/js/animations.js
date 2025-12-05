/**
 * Premium Animations
 * Parallax, scroll-triggered animations, floating effects, and micro-interactions
 * Optimized for performance with 3-layer parallax system
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        parallaxEnabled: true,
        floatEnabled: true,
        scrollRevealEnabled: true,
        layeredParallaxEnabled: true,
        silhouetteParallaxEnabled: false, // Disabled - causes visual issues
        throttleMs: 16, // ~60fps
        mobileBreakpoint: 768,
        // 3-Layer Parallax Speed Configuration
        parallaxSpeeds: {
            blobs: 0.15,      // Layer 1: Soft blobs
            grid: -0.1,       // Layer 2: Grid/dots (negative = opposite direction)
            shapes: 0.1       // Layer 3: Abstract shapes
        },
        // Silhouette SVG parallax speeds (different for each type)
        silhouetteSpeeds: {
            truck: 0.08,
            car: 0.12,
            plane: 0.15,
            globe: 0.06,
            package: 0.10,
            location: 0.09,
            container: 0.07,
            checklist: 0.11
        }
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check if mobile
    const isMobile = () => window.innerWidth <= CONFIG.mobileBreakpoint;

    // Check for low power mode (battery saver)
    const isLowPowerMode = () => {
        // Check if device has touch and no hover (likely mobile/tablet)
        const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
        // Check for reduced data preference
        const saveData = navigator.connection && navigator.connection.saveData;
        return isTouch || saveData;
    };

    /**
     * Request Animation Frame wrapper with throttling
     */
    function rafCallback(callback) {
        let ticking = false;
        return function(...args) {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    callback.apply(this, args);
                    ticking = false;
                });
                ticking = true;
            }
        };
    }

    /**
     * 3-Layer Parallax Background System
     * Layer 1: Blob SVGs (speed: 0.15)
     * Layer 2: Grid/Dot patterns (speed: -0.1, moves opposite)
     * Layer 3: Abstract shapes (speed: 0.1)
     */
    function initLayeredParallax() {
        if (prefersReducedMotion || isMobile() || isLowPowerMode() || !CONFIG.layeredParallaxEnabled) {
            // Hide parallax container on disabled devices
            const container = document.querySelector('.parallax-bg-container');
            if (container) container.style.display = 'none';
            return;
        }

        const parallaxLayers = document.querySelectorAll('.parallax-layer');
        if (parallaxLayers.length === 0) return;

        let lastScrollY = 0;
        let targetScrollY = 0;
        let rafId = null;

        // Smooth interpolation for buttery animations
        const lerp = (start, end, factor) => start + (end - start) * factor;

        const updateParallax = () => {
            // Smooth scroll value
            lastScrollY = lerp(lastScrollY, targetScrollY, 0.1);

            parallaxLayers.forEach(layer => {
                const speed = parseFloat(layer.dataset.parallaxSpeed) || 0.1;
                const yOffset = lastScrollY * speed;
                
                // Use transform3d for GPU acceleration
                layer.style.transform = `translate3d(0, ${yOffset}px, 0)`;
            });

            // Continue animation if not settled
            if (Math.abs(lastScrollY - targetScrollY) > 0.5) {
                rafId = requestAnimationFrame(updateParallax);
            } else {
                rafId = null;
            }
        };

        const handleScroll = () => {
            targetScrollY = window.pageYOffset;
            
            if (!rafId) {
                rafId = requestAnimationFrame(updateParallax);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial position
        targetScrollY = window.pageYOffset;
        lastScrollY = targetScrollY;
        updateParallax();

        // Cleanup on page unload
        window.addEventListener('unload', () => {
            if (rafId) cancelAnimationFrame(rafId);
        });
    }

    /**
     * Parallax Effect for Individual Elements
     * Elements move at different speeds based on data-speed attribute
     */
    function initParallax() {
        if (prefersReducedMotion || isMobile() || !CONFIG.parallaxEnabled) return;

        const parallaxElements = document.querySelectorAll('.parallax-element');
        if (parallaxElements.length === 0) return;

        const handleParallax = rafCallback(() => {
            const scrollY = window.pageYOffset;

            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.speed) || 0.1;
                const rect = el.getBoundingClientRect();
                const elementTop = rect.top + scrollY;
                const elementCenter = elementTop + rect.height / 2;
                const viewportCenter = scrollY + window.innerHeight / 2;
                const distance = viewportCenter - elementCenter;
                
                // Only animate if element is reasonably close to viewport
                if (Math.abs(distance) < window.innerHeight * 1.5) {
                    const yOffset = distance * speed;
                    el.style.transform = `translate3d(0, ${yOffset}px, 0)`;
                }
            });
        });

        window.addEventListener('scroll', handleParallax, { passive: true });
        handleParallax(); // Initial call
    }

    /**
     * Enhanced Floating Animation with Intersection Observer
     * Only animate elements when they're in view
     */
    function initFloatingAnimations() {
        if (prefersReducedMotion || !CONFIG.floatEnabled) return;

        const floatElements = document.querySelectorAll('.float-element');
        if (floatElements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                } else {
                    entry.target.style.animationPlayState = 'paused';
                }
            });
        }, { threshold: 0.1 });

        floatElements.forEach(el => {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    }

    /**
     * Pause blob floating animations when out of view
     */
    function initBlobAnimationControl() {
        if (prefersReducedMotion || isMobile()) return;

        const blobs = document.querySelectorAll('.parallax-blob');
        if (blobs.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const animations = entry.target.getAnimations();
                animations.forEach(anim => {
                    if (entry.isIntersecting) {
                        anim.play();
                    } else {
                        anim.pause();
                    }
                });
            });
        }, { threshold: 0, rootMargin: '100px' });

        blobs.forEach(blob => observer.observe(blob));
    }

    /**
     * Silhouette SVG Parallax Animation
     * Applies scroll-based parallax movement to logistics decoration elements
     * Each element type has a different speed for independent movement
     */
    function initSilhouetteParallax() {
        if (prefersReducedMotion || isMobile() || !CONFIG.silhouetteParallaxEnabled) return;

        const silhouetteSelectors = [
            '.decor-truck',
            '.decor-car', 
            '.decor-plane',
            '.decor-globe',
            '.decor-package',
            '.decor-location',
            '.decor-container',
            '.decor-checklist'
        ];

        const silhouettes = document.querySelectorAll(silhouetteSelectors.join(', '));
        if (silhouettes.length === 0) return;

        // Store original positions and assign speeds
        const silhouetteData = [];
        silhouettes.forEach((el, index) => {
            // Determine element type for speed
            let speed = 0.1;
            if (el.classList.contains('decor-truck')) speed = CONFIG.silhouetteSpeeds.truck;
            else if (el.classList.contains('decor-car')) speed = CONFIG.silhouetteSpeeds.car;
            else if (el.classList.contains('decor-plane')) speed = CONFIG.silhouetteSpeeds.plane;
            else if (el.classList.contains('decor-globe')) speed = CONFIG.silhouetteSpeeds.globe;
            else if (el.classList.contains('decor-package')) speed = CONFIG.silhouetteSpeeds.package;
            else if (el.classList.contains('decor-location')) speed = CONFIG.silhouetteSpeeds.location;
            else if (el.classList.contains('decor-container')) speed = CONFIG.silhouetteSpeeds.container;
            else if (el.classList.contains('decor-checklist')) speed = CONFIG.silhouetteSpeeds.checklist;

            // Alternate direction for some elements
            if (index % 3 === 0) speed = -speed;

            silhouetteData.push({
                element: el,
                speed: speed,
                // Get existing transform rotation if any
                baseRotation: getComputedRotation(el)
            });
        });

        let lastScrollY = 0;
        let targetScrollY = 0;
        let rafId = null;

        // Smooth interpolation
        const lerp = (start, end, factor) => start + (end - start) * factor;

        const updateSilhouettes = () => {
            lastScrollY = lerp(lastScrollY, targetScrollY, 0.08);

            silhouetteData.forEach(({ element, speed, baseRotation }) => {
                const section = element.closest('section, .hero, footer');
                if (!section) return;

                const rect = section.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

                if (isVisible) {
                    const yOffset = lastScrollY * speed;
                    const subtleRotation = Math.sin(lastScrollY * 0.002 + speed * 100) * 1.5;
                    
                    // Combine parallax with base rotation
                    element.style.transform = `translateY(${yOffset}px) rotate(${baseRotation + subtleRotation}deg)`;
                }
            });

            if (Math.abs(lastScrollY - targetScrollY) > 0.5) {
                rafId = requestAnimationFrame(updateSilhouettes);
            } else {
                rafId = null;
            }
        };

        const handleScroll = () => {
            targetScrollY = window.pageYOffset;
            if (!rafId) {
                rafId = requestAnimationFrame(updateSilhouettes);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial update
        targetScrollY = window.pageYOffset;
        lastScrollY = targetScrollY;
        updateSilhouettes();
    }

    /**
     * Helper to extract rotation from element's transform
     */
    function getComputedRotation(element) {
        const style = window.getComputedStyle(element);
        const transform = style.transform || style.webkitTransform;
        
        if (transform === 'none' || !transform) return 0;

        // Check for rotate in transform string
        const rotateMatch = element.style.transform?.match(/rotate\(([^)]+)\)/);
        if (rotateMatch) {
            return parseFloat(rotateMatch[1]) || 0;
        }

        // For matrix transforms, calculate rotation
        const values = transform.match(/matrix.*\((.+)\)/);
        if (values) {
            const parts = values[1].split(',').map(v => parseFloat(v.trim()));
            if (parts.length >= 6) {
                const a = parts[0];
                const b = parts[1];
                return Math.round(Math.atan2(b, a) * (180 / Math.PI));
            }
        }
        return 0;
    }

    /**
     * Control silhouette floating animations based on visibility
     */
    function initSilhouetteAnimationControl() {
        if (prefersReducedMotion || isMobile()) return;

        const silhouettes = document.querySelectorAll(
            '.decor-truck, .decor-car, .decor-plane, .decor-globe, .decor-package'
        );
        if (silhouettes.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                } else {
                    entry.target.style.animationPlayState = 'paused';
                }
            });
        }, { threshold: 0, rootMargin: '50px' });

        silhouettes.forEach(el => {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    }

    /**
     * Scroll-Triggered Reveal Animations
     * Elements fade in as they enter the viewport
     */
    function initScrollReveal() {
        if (!CONFIG.scrollRevealEnabled) return;

        // Auto-add scroll animation classes
        autoAddScrollClasses();

        const revealElements = document.querySelectorAll(
            '.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in, ' +
            '.reveal, .reveal-left, .reveal-right, .reveal-scale'
        );
        
        if (revealElements.length === 0) return;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible', 'active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    /**
     * Auto-add scroll animation classes to elements
     */
    function autoAddScrollClasses() {
        // Section titles and subtitles
        document.querySelectorAll('.section-title, .section-subtitle').forEach(el => {
            if (!el.classList.contains('reveal') && !el.classList.contains('scroll-fade-in')) {
                el.classList.add('reveal');
            }
        });

        // Feature cards with stagger
        document.querySelectorAll('.feature-card').forEach((card, index) => {
            if (!card.classList.contains('reveal')) {
                card.classList.add('reveal');
                card.style.transitionDelay = `${0.1 + index * 0.1}s`;
            }
        });

        // Service cards
        document.querySelectorAll('.service-card-new').forEach((card, index) => {
            if (!card.classList.contains('reveal')) {
                card.classList.add('reveal');
                card.style.transitionDelay = `${0.1 + (index % 2) * 0.15}s`;
            }
        });

        // How cards
        document.querySelectorAll('.how-card').forEach((card, index) => {
            if (!card.classList.contains('reveal')) {
                card.classList.add('reveal');
                card.style.transitionDelay = `${0.1 + index * 0.1}s`;
            }
        });

        // Quote section
        const quoteCard = document.querySelector('.quote-card');
        const quoteGraphic = document.querySelector('.quote-graphic');
        if (quoteCard && !quoteCard.classList.contains('reveal-left')) {
            quoteCard.classList.add('reveal-left');
        }
        if (quoteGraphic && !quoteGraphic.classList.contains('reveal-right')) {
            quoteGraphic.classList.add('reveal-right');
        }
    }

    /**
     * Background Shape Slide on Scroll
     * Subtle movement of background decorative elements
     * Only moves bg-world-routes, NOT section-decorations (silhouettes)
     */
    function initBackgroundSlide() {
        if (prefersReducedMotion || isMobile()) return;

        // Only move bg-world-routes, not section-decorations
        const bgElements = document.querySelectorAll('.bg-world-routes');
        if (bgElements.length === 0) return;

        const handleSlide = rafCallback(() => {
            bgElements.forEach(el => {
                const parent = el.closest('section');
                if (!parent) return;

                const rect = parent.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

                if (isVisible) {
                    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                    const offset = (progress - 0.5) * 40; // Subtle 20px movement
                    
                    // Apply subtle transform to bg-world-routes only
                    el.style.transform = `translateY(${offset}px)`;
                }
            });
        });

        window.addEventListener('scroll', handleSlide, { passive: true });
    }

    /**
     * Section Background Parallax
     * Applies parallax effect to section ::before and ::after pseudo-elements
     * Uses CSS custom properties to animate pseudo-elements
     */
    function initSectionBgParallax() {
        if (prefersReducedMotion || isMobile()) return;

        const sections = document.querySelectorAll('.why, .services, .quote-section, .section.how');
        if (sections.length === 0) return;

        const handleParallax = rafCallback(() => {
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

                if (isVisible) {
                    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                    const offset = (progress - 0.5) * 60; // 30px movement up/down
                    
                    // Set CSS custom property for pseudo-element parallax
                    section.style.setProperty('--parallax-y', `${offset}px`);
                }
            });
        });

        window.addEventListener('scroll', handleParallax, { passive: true });
        // Initial call
        handleParallax();
    }

    /**
     * Counter Animation for Statistics
     */
    function initCounterAnimation() {
        const counters = document.querySelectorAll('[data-counter]');
        if (counters.length === 0) return;

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const finalValue = parseInt(target.getAttribute('data-counter'), 10);
                    const duration = 2000;
                    const startTime = performance.now();

                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                        const currentValue = Math.floor(easeOutQuart * finalValue);
                        
                        target.textContent = currentValue.toLocaleString();

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        } else {
                            target.textContent = finalValue.toLocaleString();
                        }
                    }

                    requestAnimationFrame(updateCounter);
                    counterObserver.unobserve(target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    /**
     * Magnetic Button Effect
     */
    function initMagneticButtons() {
        if (prefersReducedMotion || isMobile()) return;

        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translateY(-3px) scale(1.02) translate(${x * 0.08}px, ${y * 0.08}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    /**
     * Smooth Section Entrance
     * Trigger animations when sections come into view
     */
    function initSectionEntrance() {
        const sections = document.querySelectorAll('.section, .hero');
        
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('section-visible');
                    
                    // Trigger child animations
                    const bgElements = entry.target.querySelector('.section-bg-elements, .hero-bg-elements');
                    if (bgElements) {
                        bgElements.classList.add('animate-in');
                    }
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px'
        });

        sections.forEach(section => sectionObserver.observe(section));
    }

    /**
     * Initialize Line Drawing Animation for How We Work section
     */
    function initLineDrawing() {
        const lineDesign = document.querySelector('.how-line-design');
        if (!lineDesign) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    lineDesign.classList.add('animate');
                    observer.unobserve(lineDesign);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(lineDesign);
    }

    /**
     * Initialize all animations
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAll);
        } else {
            initAll();
        }
    }

    function initAll() {
        // Core animations
        initScrollReveal();
        initFloatingAnimations();
        initSectionEntrance();
        
        // 3-Layer Parallax System (desktop only)
        if (!isMobile() && !isLowPowerMode()) {
            initLayeredParallax();
            initBlobAnimationControl();
            initParallax();
            initBackgroundSlide();
            initSectionBgParallax(); // Section background parallax
            initMagneticButtons();
            // Silhouette SVG parallax and animation control
            initSilhouetteParallax();
            initSilhouetteAnimationControl();
        }
        
        // Additional effects
        initCounterAnimation();
        initLineDrawing();
        
        console.log('✨ Premium animations initialized (section bg parallax: ' + (!isMobile() && !isLowPowerMode()) + ')');
    }

    // Run initialization
    init();

    // Export for potential external use
    window.PremiumAnimations = {
        init,
        CONFIG,
        // Allow runtime toggling
        toggleParallax: (enabled) => {
            CONFIG.layeredParallaxEnabled = enabled;
            const container = document.querySelector('.parallax-bg-container');
            if (container) container.style.display = enabled ? '' : 'none';
        },
        toggleSilhouetteParallax: (enabled) => {
            CONFIG.silhouetteParallaxEnabled = enabled;
        }
    };

})();
