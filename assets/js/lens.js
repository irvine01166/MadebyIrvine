document.addEventListener('DOMContentLoaded', () => {
    const mainPhoto = document.getElementById('main-photo');
    const mainCaption = document.getElementById('main-caption');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    let currentIndex = 0;

    function updateMainPhoto(index) {
        if (index < 0 || index >= thumbnails.length) return;
        currentIndex = index;
        
        const targetThumb = thumbnails[currentIndex];
        
        // Remove active class from all
        thumbnails.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked
        targetThumb.classList.add('active');

        // Update main photo instantly for smooth continuous scrolling
        mainPhoto.src = targetThumb.getAttribute('data-large');
        mainCaption.textContent = targetThumb.getAttribute('data-caption');
        mainPhoto.style.opacity = 1;
        
        // Scroll thumbnail into view if partially hidden
        targetThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    thumbnails.forEach((thumb, index) => {
        thumb.addEventListener('click', function() {
            updateMainPhoto(index);
        });
    });

    // Add scroll listener to main stage to navigate images
    const mainStage = document.querySelector('.main-stage');
    let wheelAccumulator = 0;
    
    if (mainStage) {
        mainStage.addEventListener('wheel', (e) => {
            e.preventDefault(); // Prevent default vertical scroll
            
            // Accumulate scroll delta to support continuous rapid scrolling
            wheelAccumulator += e.deltaY;
            
            let targetIndex = currentIndex;
            const scrollThreshold = 60; // Pixels of scroll required to switch one image
            
            while (wheelAccumulator > scrollThreshold) {
                targetIndex++;
                wheelAccumulator -= scrollThreshold;
            }
            while (wheelAccumulator < -scrollThreshold) {
                targetIndex--;
                wheelAccumulator += scrollThreshold;
            }
            
            // Clamp targetIndex bounds
            if (targetIndex < 0) {
                targetIndex = 0;
                wheelAccumulator = 0; // Reset accumulator at bounds
            }
            if (targetIndex >= thumbnails.length) {
                targetIndex = thumbnails.length - 1;
                wheelAccumulator = 0;
            }
            
            if (targetIndex !== currentIndex) {
                updateMainPhoto(targetIndex);
            }
        });
    }

    // Add scroll listener to thumbnail track to scroll horizontally
    const trackContainer = document.querySelector('.thumbnail-track-container');
    if (trackContainer) {
        trackContainer.addEventListener('wheel', (e) => {
            // Prevent default vertical scrolling and instead scroll horizontally
            e.preventDefault();
            trackContainer.scrollLeft += e.deltaY;
        });
    }
});
