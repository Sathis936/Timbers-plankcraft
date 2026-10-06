/**
 * Timber & Plank Craft Studio - Gallery Filter, Lightbox & Before/After Comparison
 */

const GalleryApp = {
  activeFilter: 'all',
  currentLightboxIndex: 0,
  galleryItems: [],

  init() {
    this.collectItems();
    this.bindFilterEvents();
    this.bindLightboxEvents();
    this.initBeforeAfterSliders();
  },

  collectItems() {
    const cards = document.querySelectorAll('.gallery-item');
    this.galleryItems = Array.from(cards).map((card, index) => {
      return {
        element: card,
        category: card.getAttribute('data-category'),
        title: card.getAttribute('data-title') || 'Craftsmanship Project',
        wood: card.getAttribute('data-wood') || 'Select Timber',
        location: card.getAttribute('data-location') || 'Architectural Residence',
        src: card.querySelector('img')?.src || '',
        index: index
      };
    });
  },

  bindFilterEvents() {
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        this.activeFilter = filter;

        // Button active state
        filterButtons.forEach(b => {
          b.classList.remove('bg-[#2c1d16]', 'text-white');
          b.classList.add('bg-white', 'text-[#5a3a29]', 'border-[#e4d8c7]');
        });
        btn.classList.remove('bg-white', 'text-[#5a3a29]');
        btn.classList.add('bg-[#2c1d16]', 'text-white', 'border-[#2c1d16]');

        // Filter items
        this.galleryItems.forEach(item => {
          if (filter === 'all' || item.category === filter) {
            item.element.classList.remove('hidden');
            item.element.classList.add('modal-fade-in');
          } else {
            item.element.classList.add('hidden');
          }
        });
      });
    });
  },

  bindLightboxEvents() {
    this.galleryItems.forEach((item, index) => {
      item.element.addEventListener('click', () => {
        this.openLightbox(index);
      });
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      const modal = document.getElementById('gallery-lightbox-modal');
      if (!modal || modal.classList.contains('hidden')) return;

      if (e.key === 'Escape') this.closeLightbox();
      if (e.key === 'ArrowRight') this.nextImage();
      if (e.key === 'ArrowLeft') this.prevImage();
    });
  },

  openLightbox(index) {
    this.currentLightboxIndex = index;
    const item = this.galleryItems[index];
    const modal = document.getElementById('gallery-lightbox-modal');
    if (!modal || !item) return;

    document.getElementById('lightbox-image').src = item.src;
    document.getElementById('lightbox-title').textContent = item.title;
    document.getElementById('lightbox-wood').textContent = item.wood;
    document.getElementById('lightbox-location').textContent = item.location;
    document.getElementById('lightbox-counter').textContent = `${index + 1} / ${this.galleryItems.length}`;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeLightbox() {
    const modal = document.getElementById('gallery-lightbox-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  },

  nextImage() {
    let next = this.currentLightboxIndex + 1;
    if (next >= this.galleryItems.length) next = 0;
    this.openLightbox(next);
  },

  prevImage() {
    let prev = this.currentLightboxIndex - 1;
    if (prev < 0) prev = this.galleryItems.length - 1;
    this.openLightbox(prev);
  },

  // Interactive Before & After Slider
  initBeforeAfterSliders() {
    const sliders = document.querySelectorAll('.ba-container');
    sliders.forEach(container => {
      const beforeImgWrap = container.querySelector('.ba-image-before');
      const handle = container.querySelector('.ba-slider-handle');
      if (!beforeImgWrap || !handle) return;

      let isDragging = false;

      const setPosition = (x) => {
        const rect = container.getBoundingClientRect();
        let posX = x - rect.left;
        if (posX < 0) posX = 0;
        if (posX > rect.width) posX = rect.width;
        const percentage = (posX / rect.width) * 100;

        beforeImgWrap.style.width = `${percentage}%`;
        handle.style.left = `${percentage}%`;
      };

      // Mouse events
      handle.addEventListener('mousedown', () => isDragging = true);
      window.addEventListener('mouseup', () => isDragging = false);
      container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        setPosition(e.clientX);
      });

      // Click anywhere on container
      container.addEventListener('click', (e) => {
        setPosition(e.clientX);
      });

      // Touch events
      handle.addEventListener('touchstart', () => isDragging = true, { passive: true });
      window.addEventListener('touchend', () => isDragging = false);
      container.addEventListener('touchmove', (e) => {
        if (!isDragging || !e.touches[0]) return;
        setPosition(e.touches[0].clientX);
      }, { passive: true });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  GalleryApp.init();
});
