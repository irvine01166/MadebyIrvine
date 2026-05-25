document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Handle dropdown toggles on mobile
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const label = dropdown.querySelector('.nav-label');
        if (label) {
            label.addEventListener('click', (e) => {
                // Check if we are on mobile view
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('open');
                }
            });
        }
    });
});