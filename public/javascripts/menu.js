document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const menuItems = document.querySelector('.menu-items');
  const menuLinks = document.querySelectorAll('.menu-items a');

  if (!hamburger || !menuItems) return;

  hamburger.addEventListener('click', () => {
    const isOpen = menuItems.classList.toggle('active');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    hamburger.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  document.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      menuItems.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
    }
  });

  menuItems.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  hamburger.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      menuItems.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      menuItems.classList.remove('active');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
    }
  });
});