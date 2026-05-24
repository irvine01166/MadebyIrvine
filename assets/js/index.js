document.addEventListener('DOMContentLoaded', () => {
    const scrollDownBtn = document.getElementById('scroll-down');
    const categoriesSection = document.getElementById('categories');
    const nav = document.getElementById('main-nav');

    if (scrollDownBtn && categoriesSection) {
        scrollDownBtn.addEventListener('click', () => {
            categoriesSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Show navbar when scrolling past hero section
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                // Hero is out of view, show navbar
                nav.style.opacity = '1';
                nav.style.pointerEvents = 'auto'; // allow clicks
            } else {
                // Hero is in view, hide navbar
                nav.style.opacity = '0';
                nav.style.pointerEvents = 'none'; // prevent clicks when hidden
            }
        });
    }, { threshold: 0.1 });

    const hero = document.querySelector('.hero');
    if (hero && nav) {
        observer.observe(hero);
    }
});
