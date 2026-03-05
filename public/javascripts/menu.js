document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const menuItems = document.querySelector('.menu-items');
  const dropdowns = document.querySelectorAll('.menu-dropdown');

  // Toggle main menu
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    menuItems.classList.toggle('active');
    hamburger.classList.toggle('active');

    // Reset submenu state on menu open/close
    menuItems.classList.remove('submenu-active');
    dropdowns.forEach(d => d.classList.remove('active'));
  });

  // Close menu if clicking outside
  document.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      menuItems.classList.remove('active', 'submenu-active');
      hamburger.classList.remove('active');
      dropdowns.forEach(d => d.classList.remove('active'));
    }
  });

  // Prevent clicks inside menu from closing it
  menuItems.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Handle dropdown clicks
  dropdowns.forEach(menu => {
    menu.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.stopPropagation();

        const isActive = menu.classList.contains('active');

        // Close all dropdowns and show all main items if closing submenu
        if (isActive) {
          menu.classList.remove('active');
          menuItems.classList.remove('submenu-active');
        } else {
          // Close all others
          dropdowns.forEach(d => d.classList.remove('active'));
          // Activate clicked submenu
          menu.classList.add('active');
          // Hide siblings (show only active dropdown)
          menuItems.classList.add('submenu-active');
        }
      }
    });
  });
});