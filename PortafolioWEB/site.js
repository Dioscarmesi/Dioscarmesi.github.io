(() => {
  // Set year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Carousel behavior (per page)
  const carousels = document.querySelectorAll('[data-carousel]');
  carousels.forEach((root) => {
    const mainImg = root.querySelector('[data-carousel-main]');
    const thumbs = Array.from(root.querySelectorAll('[data-carousel-thumb]'));
    const prev = root.querySelector('[data-carousel-prev]');
    const next = root.querySelector('[data-carousel-next]');
    if (!mainImg || thumbs.length === 0) return;

    let idx = Math.max(0, thumbs.findIndex(t => t.getAttribute('aria-current') === 'true'));
    const setIdx = (n) => {
      idx = (n + thumbs.length) % thumbs.length;
      thumbs.forEach((t, i) => t.setAttribute('aria-current', i === idx ? 'true' : 'false'));
      const src = thumbs[idx].dataset.src;
      const alt = thumbs[idx].dataset.alt || mainImg.alt || '';
      mainImg.src = src;
      mainImg.alt = alt;
      // Keep selected thumb in view
      thumbs[idx].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    };

    thumbs.forEach((t, i) => {
      t.addEventListener('click', () => setIdx(i));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIdx(i); }
      });
    });

    if (prev) prev.addEventListener('click', () => setIdx(idx - 1));
    if (next) next.addEventListener('click', () => setIdx(idx + 1));

    // Initialize from current thumb
    setIdx(idx);
  });
})();