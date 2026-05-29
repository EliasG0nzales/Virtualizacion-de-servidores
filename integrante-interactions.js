(function () {
  const animationClasses = [
    'letter-lightspeed',
    'letter-rotate',
    'letter-roll',
    'letter-jack',
    'letter-bounce',
    'letter-slide'
  ];

  function splitTextNode(node, indexRef) {
    const fragment = document.createDocumentFragment();

    [...node.textContent].forEach((char) => {
      const span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--i', indexRef.value);

      if (char === ' ') {
        span.className = 'letter-space';
        span.textContent = '\u00a0';
      } else {
        span.className = 'letter';
        span.textContent = char;
      }

      indexRef.value += 1;
      fragment.appendChild(span);
    });

    node.replaceWith(fragment);
  }

  function splitElementLetters(element, indexRef) {
    [...element.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        splitTextNode(node, indexRef);
        return;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        splitElementLetters(node, indexRef);
      }
    });
  }

  function initAnimatedLetters() {
    const headings = document.querySelectorAll('header h1, main h2, main h3');

    headings.forEach((heading, index) => {
      if (heading.dataset.lettersReady === 'true') return;

      const label = heading.textContent.trim();
      if (!label) return;

      heading.classList.add('letter-animate', animationClasses[index % animationClasses.length]);
      heading.setAttribute('aria-label', label);
      heading.dataset.lettersReady = 'true';
      splitElementLetters(heading, { value: 0 });
    });
  }

  function setIntegranteBackground() {
    const match = window.location.pathname.match(/integrante(\d+)\.html$/i);
    const integranteNumber = match ? Math.min(Math.max(Number(match[1]), 1), 6) : 1;
    document.body.classList.add(`integrante-bg-${integranteNumber}`);
  }

  function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Vista ampliada de imagen');
    lightbox.innerHTML = `
      <div class="image-lightbox-panel">
        <div class="image-lightbox-frame">
          <button class="image-lightbox-close" type="button" aria-label="Cerrar imagen">&times;</button>
          <img src="" alt="">
        </div>
        <p class="image-lightbox-caption"></p>
      </div>
    `;
    document.body.appendChild(lightbox);
    return lightbox;
  }

  function initImagePreview() {
    const images = document.querySelectorAll('main img');
    if (!images.length) return;

    const lightbox = createLightbox();
    const lightboxImage = lightbox.querySelector('img');
    const caption = lightbox.querySelector('.image-lightbox-caption');
    const closeButton = lightbox.querySelector('.image-lightbox-close');
    let selectedImage = null;

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.classList.remove('lightbox-lock');
    }

    function openLightbox(image) {
      if (selectedImage) selectedImage.classList.remove('selected');
      selectedImage = image;
      selectedImage.classList.add('selected');

      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || 'Imagen seleccionada';
      caption.textContent = image.alt || 'Imagen seleccionada';
      lightbox.classList.add('open');
      document.body.classList.add('lightbox-lock');
      closeButton.focus();
    }

    images.forEach((image) => {
      image.classList.add('previewable-image');
      image.setAttribute('tabindex', '0');
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `Abrir imagen: ${image.alt || 'vista ampliada'}`);

      image.addEventListener('click', () => openLightbox(image));
      image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(image);
        }
      });
    });

    closeButton.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeLightbox();
    });
  }

  function initInteractiveBackground() {
    const root = document.body;
    let targetX = 74;
    let targetY = 22;
    let trailX = 68;
    let trailY = 30;
    let currentX = targetX;
    let currentY = targetY;
    let lastFlameAt = 0;
    let rafId = null;

    function render() {
      trailX += (currentX - trailX) * 0.055;
      trailY += (currentY - trailY) * 0.055;
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      root.style.setProperty('--cursor-x', `${currentX.toFixed(2)}%`);
      root.style.setProperty('--cursor-y', `${currentY.toFixed(2)}%`);
      root.style.setProperty('--trail-x', `${trailX.toFixed(2)}%`);
      root.style.setProperty('--trail-y', `${trailY.toFixed(2)}%`);

      if (Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02) {
        rafId = requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    }

    function createFlame(x, y) {
      const flame = document.createElement('span');
      const size = 70 + Math.random() * 60;

      flame.className = 'mouse-flame';
      flame.style.width = `${size}px`;
      flame.style.height = `${size}px`;
      flame.style.left = `${x}px`;
      flame.style.top = `${y}px`;
      flame.style.animationDuration = `${0.45 + Math.random() * 0.35}s`;
      flame.style.transform = `translate(-50%, -50%) scale(${0.25 + Math.random() * 0.16})`;
      document.body.appendChild(flame);
      flame.addEventListener('animationend', () => flame.remove(), { once: true });
    }

    function moveGlow(event) {
      targetX = (event.clientX / window.innerWidth) * 100;
      targetY = (event.clientY / window.innerHeight) * 100;

      if (!rafId) {
        rafId = requestAnimationFrame(render);
      }

      const now = performance.now();
      if (now - lastFlameAt > 110) {
        lastFlameAt = now;
        createFlame(event.clientX, event.clientY);
      }
    }

    window.addEventListener('pointermove', moveGlow, { passive: true });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setIntegranteBackground();
    initInteractiveBackground();
    initAnimatedLetters();
    initImagePreview();
  });
})();
