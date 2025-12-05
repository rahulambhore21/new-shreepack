/**
 * Hero Background Image Slider
 * Automatically fades between 4 images every 3 seconds
 * Images: car1.webp, car2.webp, car3.webp, car4.webp behind black overlay
 */

(function() {
    'use strict';

    const SLIDE_INTERVAL = 3000; // 3 seconds between slides

    let currentSlide = 0;
    let slides = [];
    let intervalId = null;

    /**
     * Initialize the slider
     */
    function init() {
        slides = document.querySelectorAll('.hero-slide');
        
        if (slides.length === 0) {
            return;
        }

        // Set first slide as active
        slides[0].classList.add('active');

        // Start auto-sliding immediately
        startSlider();
    }

    /**
     * Go to next slide with cross-fade effect
     */
    function nextSlide() {
        const prevSlide = currentSlide;
        currentSlide = (currentSlide + 1) % slides.length;

        // Fade out previous, fade in current
        slides[prevSlide].classList.remove('active');
        slides[currentSlide].classList.add('active');
    }

    /**
     * Start automatic sliding
     */
    function startSlider() {
        if (intervalId) return; // Already running
        intervalId = setInterval(nextSlide, SLIDE_INTERVAL);
    }

    /**
     * Pause the slider
     */
    function pauseSlider() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
