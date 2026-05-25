document.addEventListener('DOMContentLoaded', () => {
    const mockupImage = document.getElementById('mockup-image');
    const appSections = document.querySelectorAll('.app-section');
    const leftArrow = document.getElementById('carousel-left');
    const rightArrow = document.getElementById('carousel-right');
    const dotsContainer = document.getElementById('carousel-dots');

    let currentImages = [];
    let currentIndex = 0;

    function renderDots() {
        dotsContainer.innerHTML = '';
        currentImages.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${idx === currentIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                showImage(idx);
            });
            dotsContainer.appendChild(dot);
        });
        
        // Hide arrows/dots if only 1 image
        const hasMultiple = currentImages.length > 1;
        leftArrow.style.display = hasMultiple ? 'flex' : 'none';
        rightArrow.style.display = hasMultiple ? 'flex' : 'none';
        dotsContainer.style.display = hasMultiple ? 'flex' : 'none';
    }

    function showImage(index) {
        if (currentImages.length === 0) return;
        
        currentIndex = index;
        if (currentIndex < 0) currentIndex = currentImages.length - 1;
        if (currentIndex >= currentImages.length) currentIndex = 0;
        
        const newImgSrc = currentImages[currentIndex];
        
        if (mockupImage.src !== newImgSrc) {
            mockupImage.style.opacity = 0;
            setTimeout(() => {
                mockupImage.src = newImgSrc;
                mockupImage.style.opacity = 1;
            }, 200); // Wait for fade out
        }

        // Update dots
        Array.from(dotsContainer.children).forEach((dot, idx) => {
            dot.className = `carousel-dot ${idx === currentIndex ? 'active' : ''}`;
        });
    }

    leftArrow.addEventListener('click', () => {
        showImage(currentIndex - 1);
    });

    rightArrow.addEventListener('click', () => {
        showImage(currentIndex + 1);
    });

    // Initialize with the first app section immediately so UI isn't broken on load
    if (appSections.length > 0) {
        const imgData = appSections[0].getAttribute('data-img');
        if (imgData) {
            currentImages = imgData.split(',').map(s => s.trim());
            currentIndex = 0;
            renderDots();
            showImage(0);
        }
    }

    const observerOptions = {
        root: null,
        rootMargin: '-40% 0px -40% 0px', // Trigger when section is in the middle 20% of the screen
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const imgData = entry.target.getAttribute('data-img');
                if (imgData) {
                    const newImages = imgData.split(',').map(s => s.trim());
                    
                    // If switching to a completely new app section, reset index and render
                    if (newImages.join(',') !== currentImages.join(',')) {
                        currentImages = newImages;
                        currentIndex = 0;
                        renderDots();
                        showImage(0);
                    }
                }
            }
        });
    }, observerOptions);

    appSections.forEach(section => {
        observer.observe(section);
    });
});
