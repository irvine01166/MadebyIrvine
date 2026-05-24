document.addEventListener('DOMContentLoaded', () => {
    const mockupImage = document.getElementById('mockup-image');
    const appSections = document.querySelectorAll('.app-section');

    const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px', // Trigger when section is in the middle 20% of the screen
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const newImgSrc = entry.target.getAttribute('data-img');
                
                // Only change if different to avoid unnecessary flashes
                if (mockupImage.src !== newImgSrc) {
                    mockupImage.style.opacity = 0;
                    setTimeout(() => {
                        mockupImage.src = newImgSrc;
                        mockupImage.style.opacity = 1;
                    }, 400); // Matches CSS transition
                }
            }
        });
    }, observerOptions);

    appSections.forEach(section => {
        observer.observe(section);
    });
});
