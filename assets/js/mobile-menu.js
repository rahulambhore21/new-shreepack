// Mobile Menu JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    
    if (mobileMenuToggle && mainNav && mobileNavOverlay) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
            mobileNavOverlay.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        });
        
        mobileNavOverlay.addEventListener('click', function() {
            mobileMenuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            this.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Close menu when clicking a nav link
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                mobileNavOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
});
