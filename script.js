// Theme management with localStorage persistence
let currentTheme = localStorage.getItem('theme') || 'light';

document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);
    const lightIcon = document.querySelector('.light-icon');
    const darkIcon = document.querySelector('.dark-icon');
    if (currentTheme === 'dark') {
      lightIcon.style.display = 'none';
      darkIcon.style.display = 'inline';
    } else {
      lightIcon.style.display = 'inline';
      darkIcon.style.display = 'none';
    }
  }
  
  // Set initial ARIA attributes
  document.querySelectorAll('.page').forEach(page => {
    if (page.classList.contains('active')) {
      page.setAttribute('aria-hidden', 'false');
    } else {
      page.setAttribute('aria-hidden', 'true');
    }
  });
  
  // Set initial nav aria-current
  const activeNav = document.querySelector('.nav-link.active');
  if (activeNav) {
    activeNav.setAttribute('aria-current', 'page');
  }
  
  // Initialize mobile menu button
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  mobileMenuButton.setAttribute('aria-expanded', 'false');
  
  // Add real-time form validation
  const formFields = document.querySelectorAll('#contact input, #contact textarea');
  formFields.forEach(field => {
    field.addEventListener('blur', function() {
      if (this.value.trim()) {
        this.classList.remove('error');
        const errorElement = document.getElementById(this.id + '-error');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      }
    });
    
    field.addEventListener('input', function() {
      if (this.classList.contains('error') && this.value.trim()) {
        this.classList.remove('error');
        const errorElement = document.getElementById(this.id + '-error');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      }
    });
  });
  
  // Back to top button visibility
  window.addEventListener('scroll', function() {
    const backToTop = document.getElementById('backToTop');
    if (window.scrollY > 300) {
      backToTop.style.display = 'flex';
    } else {
      backToTop.style.display = 'none';
    }
  });
  
  // Announce page changes to screen readers
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.classList.contains('page') && 
          mutation.target.classList.contains('active')) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.textContent = `Navigated to ${mutation.target.id} page`;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
          document.body.removeChild(announcement);
        }, 1000);
      }
    });
  });
  
  document.querySelectorAll('.page').forEach(page => {
    observer.observe(page, { attributes: true, attributeFilter: ['class'] });
  });
});

function toggleTheme() {
  const root = document.documentElement;
  const lightIcon = document.querySelector('.light-icon');
  const darkIcon = document.querySelector('.dark-icon');
  const isDark = root.getAttribute('data-theme') === 'dark';

  if (isDark) {
    root.setAttribute('data-theme', 'light');
    lightIcon.style.display = 'inline';
    darkIcon.style.display = 'none';
    currentTheme = 'light';
  } else {
    root.setAttribute('data-theme', 'dark');
    lightIcon.style.display = 'none';
    darkIcon.style.display = 'inline';
    currentTheme = 'dark';
  }
  
  // Save theme preference
  localStorage.setItem('theme', currentTheme);
}

// Enhanced page switching with accessibility
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.setAttribute('aria-hidden', 'true');
  });
  
  // Show target page
  setTimeout(() => {
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add('active');
      target.setAttribute('aria-hidden', 'false');
      // Focus management for accessibility
      const heading = target.querySelector('h1, h2');
      if (heading) {
        heading.focus();
      }
    }
  }, 50);

  // Update navigation states
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    link.classList.remove('active');
    link.setAttribute('aria-current', 'false');
    if (link.dataset.page === pageId) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // Close mobile menu
  const mobileMenu = document.getElementById('mobileMenu');
  const menuButton = document.getElementById('mobileMenuButton');
  if (mobileMenu && mobileMenu.classList.contains('active')) {
    mobileMenu.classList.remove('active');
    menuButton.classList.remove('active');
    menuButton.setAttribute('aria-expanded', 'false');
  }
}

// Enhanced mobile menu toggle
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  const toggle = document.getElementById('mobileMenuButton');
  const isOpen = mobileMenu.classList.contains('active');
  
  if (isOpen) {
    mobileMenu.classList.remove('active');
    toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open mobile menu');
  } else {
    mobileMenu.classList.add('active');
    toggle.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close mobile menu');
  }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
  const mobileMenu = document.getElementById('mobileMenu');
  const toggle = document.getElementById('mobileMenuButton');
  
  if (mobileMenu.classList.contains('active') && 
      !mobileMenu.contains(event.target) && 
      !toggle.contains(event.target)) {
    toggleMobileMenu();
  }
});

// Keyboard navigation support
function handleKeyPress(event, pageId) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    showPage(pageId);
  }
}

// Enhanced keyboard navigation
document.addEventListener('keydown', function(event) {
  // Escape key closes mobile menu
  if (event.key === 'Escape') {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu.classList.contains('active')) {
      toggleMobileMenu();
    }
  }
  
  // Arrow key navigation through nav links
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentActive = document.querySelector('.nav-link.active');
    if (currentActive && navLinks.length > 0) {
      let currentIndex = Array.from(navLinks).indexOf(currentActive);
      if (event.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % navLinks.length;
      } else {
        currentIndex = (currentIndex - 1 + navLinks.length) % navLinks.length;
      }
      navLinks[currentIndex].click();
      navLinks[currentIndex].focus();
      event.preventDefault();
    }
  }
});

// Form validation and submission
function validateForm() {
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const subject = document.getElementById('subject');
  const message = document.getElementById('message');
  
  let isValid = true;
  
  // Clear previous errors
  document.querySelectorAll('.error-message').forEach(error => {
    error.style.display = 'none';
  });
  document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
    field.classList.remove('error');
  });
  
  // Validate name
  if (!name.value.trim()) {
    showFieldError('name', 'Please enter your name');
    isValid = false;
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    showFieldError('email', 'Please enter your email address');
    isValid = false;
  } else if (!emailRegex.test(email.value.trim())) {
    showFieldError('email', 'Please enter a valid email address');
    isValid = false;
  }
  
  // Validate subject
  if (!subject.value.trim()) {
    showFieldError('subject', 'Please enter a subject');
    isValid = false;
  }
  
  // Validate message
  if (!message.value.trim()) {
    showFieldError('message', 'Please enter your message');
    isValid = false;
  } else if (message.value.trim().length < 10) {
    showFieldError('message', 'Please enter a more detailed message (at least 10 characters)');
    isValid = false;
  }
  
  return isValid;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(fieldId + '-error');
  
  field.classList.add('error');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

function showFormStatus(message, type) {
  const statusElement = document.getElementById('formStatus');
  statusElement.textContent = message;
  statusElement.className = `form-status ${type}`;
  statusElement.style.display = 'block';
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 5000);
}

async function handleFormSubmit(event) {
  event.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  const submitButton = document.getElementById('submitButton');
  const form = event.target;
  
  // Show loading state
  submitButton.classList.add('loading');
  submitButton.disabled = true;
  
  try {
    const formData = new FormData(form);
    
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      showFormStatus('Thank you! Your message has been sent successfully. I\'ll get back to you soon!', 'success');
      form.reset();
    } else {
      const data = await response.json();
      if (data.errors) {
        showFormStatus('Please check your form and try again.', 'error');
      } else {
        showFormStatus('Oops! Something went wrong. Please try again later.', 'error');
      }
    }
  } catch (error) {
    showFormStatus('Network error. Please check your connection and try again.', 'error');
  } finally {
    // Hide loading state
    submitButton.classList.remove('loading');
    submitButton.disabled = false;
  }
}

// Navbar shrink effect
let ticking = false;
function updateNavbar() {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateNavbar);
    ticking = true;
  }
});

// Performance optimization - lazy load animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const intersectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
    }
  });
}, observerOptions);

// Observe animated elements
document.querySelectorAll('.card, .skill-category').forEach(el => {
  el.style.animationPlayState = 'paused';
  intersectionObserver.observe(el);
});