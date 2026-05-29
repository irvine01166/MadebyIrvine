// Run immediately to prevent flash of incorrect theme
(function() {
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
        currentTheme = 'dark'; // Default to dark mode
        localStorage.setItem('theme', 'dark');
    }
    document.documentElement.setAttribute('data-theme', currentTheme);
})();

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    
    function updateToggleState() {
        if (!themeToggle) return;
        const currentTheme = document.documentElement.getAttribute('data-theme');
        // Let's assume checked = dark mode
        themeToggle.checked = (currentTheme === 'dark');
    }

    // Set initial state
    updateToggleState();

    if (themeToggle) {
        themeToggle.addEventListener('change', (e) => {
            let newTheme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Global Scroll Animations
    const scrollObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, scrollObserverOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        scrollObserver.observe(el);
    });
});
