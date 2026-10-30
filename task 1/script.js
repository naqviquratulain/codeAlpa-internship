/**
 * ADVANCED IMAGE GALLERY LOGIC
 * Handles: Filtering, Lightbox, Keyboard Nav, Preloading
 */

// --- State Management ---
const state = {
    allImages: [],       // Master list of all image objects
    visibleImages: [],   // Current list of visible images (changes with filters)
    currentIndex: 0,     // Index of the image currently open in lightbox
    isLightboxOpen: false
};

// --- DOM Elements ---
const galleryContainer = document.getElementById('gallery');
const filterBtns = document.querySelectorAll('.filter-btn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const caption = document.getElementById('caption');
const closeBtn = document.querySelector('.close-btn');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

// --- Initialization ---
function init() {
    const items = document.querySelectorAll('.gallery-item');
    
    // Store all image metadata in state for easier access
    state.allImages = Array.from(items).map(item => ({
        src: item.querySelector('img').src,
        alt: item.querySelector('img').alt,
        category: item.dataset.category,
        element: item // Reference to the actual DOM node
    }));

    // Initially, all images are visible
    state.visibleImages = [...state.allImages];
     setupImageErrorHandling(); 

    setupEventListeners();
}

// --- Event Listeners ---
function setupEventListeners() {
    // 1. Filter Buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            
            // Update UI active state
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            e.target.classList.add('active');
            e.target.setAttribute('aria-selected', 'true');

            filterGallery(filter);
        });
    });

    // 2. Open Lightbox (Event Delegation)
    galleryContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        // Only open if the item exists and is NOT hidden
        if (item && !item.classList.contains('hidden')) {
            // Find the index of this item within the VISIBLE images array
            const visibleIndex = state.visibleImages.findIndex(img => img.element === item);
            openLightbox(visibleIndex);
        }
    });

    // 3. Keyboard support for opening gallery items (Accessibility)
    galleryContainer.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const item = e.target.closest('.gallery-item');
            if (item && !item.classList.contains('hidden')) {
                e.preventDefault();
                const visibleIndex = state.visibleImages.findIndex(img => img.element === item);
                openLightbox(visibleIndex);
            }
        }
    });

    // 4. Lightbox Controls
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => navigate(-1));
    nextBtn.addEventListener('click', () => navigate(1));

    // Close on backdrop click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // 5. Global Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!state.isLightboxOpen) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') navigate(1);
        if (e.key === 'ArrowLeft') navigate(-1);
    });
}

// --- Core Functions ---

function filterGallery(category) {
    // 1. Reset the visible images array
    state.visibleImages = [];

    // 2. Loop through all images and show/hide based on category
    state.allImages.forEach(img => {
        if (category === 'all' || img.category === category) {
            img.element.classList.remove('hidden');
            state.visibleImages.push(img); // Add to visible array
        } else {
            img.element.classList.add('hidden');
        }
    });
}

function openLightbox(index) {
    if (index < 0 || index >= state.visibleImages.length) return;

    state.currentIndex = index;
    state.isLightboxOpen = true;
    
    updateLightboxContent();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    closeBtn.focus(); // Accessibility: move focus to close button
}

function closeLightbox() {
    state.isLightboxOpen = false;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Accessibility: Return focus to the specific DOM element that was clicked
    if(state.visibleImages[state.currentIndex]) {
        state.visibleImages[state.currentIndex].element.focus();
    }
}

function navigate(direction) {
    // Navigate ONLY through the visible images array
    state.currentIndex += direction;
    
    // Loop around if at the end
    if (state.currentIndex >= state.visibleImages.length) state.currentIndex = 0;
    if (state.currentIndex < 0) state.currentIndex = state.visibleImages.length - 1;
    
    updateLightboxContent();
}

function updateLightboxContent() {
    const currentImage = state.visibleImages[state.currentIndex];
    
    if (!currentImage) return;

    // Fade out effect
    lightboxImg.style.opacity = '0';
    
    setTimeout(() => {
        lightboxImg.src = currentImage.src;
        lightboxImg.alt = currentImage.alt;
        caption.textContent = currentImage.alt;
        lightboxImg.style.opacity = '1';
        
        // Preload next and previous images for instant navigation
        preloadImage(state.currentIndex + 1);
        preloadImage(state.currentIndex - 1);
    }, 150); // Matches the CSS transition
}

// Helper: Preload images to avoid flickering
function preloadImage(index) {
    if (index >= state.visibleImages.length) index = 0;
    if (index < 0) index = state.visibleImages.length - 1;
    
    if(state.visibleImages[index]) {
        const img = new Image();
        img.src = state.visibleImages[index].src;
    }
}
// --- Error Handling for Broken Images ---
function setupImageErrorHandling() {
    const allImages = document.querySelectorAll('.gallery-item img');
    
    allImages.forEach(img => {
        img.addEventListener('error', function() {
            // If the image fails to load, replace it with a placeholder
            console.warn(`Image failed to load: ${this.src}`);
            
            // Use a reliable placeholder service (or a local image path)
            this.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Not+Found';
            
            // Remove the error listener so it doesn't loop infinitely if the placeholder fails
            this.removeEventListener('error', arguments.callee);
        });
    });
}

// Start the app
init();