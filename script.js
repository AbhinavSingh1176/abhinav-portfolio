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
  if (mobileMenuButton) {
    mobileMenuButton.setAttribute('aria-expanded', 'false');
  }
  
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
    if (backToTop) {
      if (window.scrollY > 300) {
        backToTop.style.display = 'flex';
      } else {
        backToTop.style.display = 'none';
      }
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
  
  if (mobileMenu && mobileMenu.classList.contains('active') && 
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
    if (mobileMenu && mobileMenu.classList.contains('active')) {
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

// NEW: Project details toggle function
function toggleProjectDetails(projectId) {
  const details = document.getElementById(`details-${projectId}`);
  const button = document.getElementById(`btn-${projectId}`);
  
  if (details.classList.contains('expanded')) {
    details.classList.remove('expanded');
    button.textContent = 'View Technical Details ↓';
  } else {
    details.classList.add('expanded');
    button.textContent = 'Hide Technical Details ↑';
  }
  
  // Prevent event bubbling to avoid triggering card click
  if (event) {
    event.stopPropagation();
  }
}

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

// Project Modal Functionality
let currentGalleryIndex = 0;
let currentProjectImages = [];

// Project data with sample images - REPLACE THIS ENTIRE SECTION
const projectData = {
  project1: {
    title: "Powertrains Development - ASME Racing",
    meta: "Automotive Engineering • Jan 2025 - Present",
    description: "Designed Purdue's first in-house CVT mount in Autodesk Fusion, coordinating with chassis and engine teams to optimize transmission packaging. Fabricated custom metal shroud for heat protection and engineered repositionable exhaust mount to correct misalignment issues, ensuring secure fit and improved drivetrain stability.",
    images: [
      "images/projects/asme-racing/main.jpg",
      "images/projects/asme-racing/cvt-mount-1.jpg",
      "images/projects/asme-racing/cvt-mount-2.jpg",
      "images/projects/asme-racing/exhaust-system-1.jpg",
      "images/projects/asme-racing/exhaust-system-2.jpg"
    ],
    specs: [
      { title: "Software", value: "Autodesk Fusion 360" },
      { title: "Materials", value: "Steel, Aluminum" },
      { title: "Team Size", value: "3 engineers across chassis and engine teams" },
      { title: "Timeline", value: "4 months development" }
    ],
    challenges: [
      "Coordinated with multiple teams to ensure optimal packaging",
      "Designed heat protection system for exhaust components",
      "Resolved transmission misalignment issues through custom mounting",
      "Balanced performance requirements with manufacturing constraints"
    ]
  },
  project2: {
    title: "EV Kart Manual Development - EPICS",
    meta: "Technical Documentation • Jan 2025 - May 2025",
    description: "Produced comprehensive beginner-friendly assembly manual for MSTEM3 EV Kart, partnering with Purdue Motorsports and TopKart USA. Created detailed CAD visuals using SolidWorks and integrated customer feedback from high school teams to streamline processes for the Purdue EV Grand Prix.",
    images: [
      "images/projects/ev-kart/main.jpg",
      "images/projects/ev-kart/manual-page-1.jpg",
      "images/projects/ev-kart/manual-page-2.jpg",
      "images/projects/ev-kart/cad-visual-1.jpg",
      "images/projects/ev-kart/assembly-guide.jpg"
    ],
    specs: [
      { title: "Software", value: "SolidWorks, Adobe Creative Suite" },
      { title: "Manual Length", value: "50+ detailed assembly instructions" },
      { title: "Target Audience", value: "High school students" },
      { title: "Partners", value: "Purdue Motorsports, TopKart USA" }
    ],
    challenges: [
      "Created beginner-friendly instructions for complex assembly",
      "Integrated feedback from multiple stakeholder groups",
      "Developed clear visual communication for technical processes",
      "Streamlined assembly process for competitive racing events"
    ]
  },
  project3: {
    title: "Custom Wheel Rim & Exhaust Manifold Design",
    meta: "CAD Engineering • Jan 2025 - May 2025",
    description: "Designed 17-inch steel wheel rim meeting Toyota Prius V AW60 specifications in Siemens NX, applying GD&T and precise engineering drawings. Developed multi-branch exhaust manifold for BB6 header set on 1955-57 Chevy, emphasizing airflow optimization and thermal performance with manufacturing-ready drawings.",
    images: [
      "images/projects/wheel-exhaust/main.jpg",
      "images/projects/wheel-exhaust/wheel-rim-cad.jpg",
      "images/projects/wheel-exhaust/wheel-rim-drawing.jpg",
      "images/projects/wheel-exhaust/exhaust-manifold-1.jpg",
      "images/projects/wheel-exhaust/exhaust-manifold-2.jpg"
    ],
    specs: [
      { title: "Software", value: "Siemens NX" },
      { title: "Wheel Specs", value: "17-inch Toyota Prius V AW60" },
      { title: "Exhaust Type", value: "Multi-branch manifold for BB6 header" },
      { title: "Standards", value: "GD&T applied, manufacturing-ready drawings" }
    ],
    challenges: [
      "Met precise OEM specifications for wheel rim design",
      "Optimized exhaust manifold for airflow and thermal performance",
      "Applied proper GD&T standards for manufacturing accuracy",
      "Balanced structural integrity with weight optimization"
    ]
  }
};

function openProjectModal(projectId) {
  const project = projectData[projectId];
  if (!project) return;

  const modal = document.getElementById('projectModal');
  const modalTitle = document.getElementById('modal-title');
  const modalMeta = document.querySelector('.modal-meta');
  const modalDescription = document.getElementById('modal-description');
  const modalSpecs = document.getElementById('modal-specs');
  const modalChallenges = document.getElementById('modal-challenges');

  // Set content
  modalTitle.textContent = project.title;
  modalMeta.textContent = project.meta;
  modalDescription.textContent = project.description;

  // Set up gallery
  currentProjectImages = project.images;
  currentGalleryIndex = 0;
  setupGallery();

  // Set up specs
  modalSpecs.innerHTML = project.specs.map(spec => `
    <div class="project-spec-modal">
      <h4>${spec.title}</h4>
      <p>${spec.value}</p>
    </div>
  `).join('');

  // Set up challenges
  modalChallenges.innerHTML = `
    <h4>Key Challenges & Solutions</h4>
    <ul>
      ${project.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
    </ul>
  `;

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Focus trap
  modalTitle.focus();
}

function closeProjectModal() {
  const modal = document.getElementById('projectModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function setupGallery() {
  const mainImage = document.getElementById('gallery-main-image');
  const thumbnailContainer = document.getElementById('gallery-thumbnails');
  const prevBtn = document.querySelector('.gallery-nav.prev');
  const nextBtn = document.querySelector('.gallery-nav.next');

  if (currentProjectImages.length === 0) return;

  // Set main image
  mainImage.src = currentProjectImages[currentGalleryIndex];
  mainImage.alt = `Project image ${currentGalleryIndex + 1}`;

  // Create thumbnails
  thumbnailContainer.innerHTML = currentProjectImages.map((src, index) => `
    <img 
      src="${src}" 
      alt="Thumbnail ${index + 1}" 
      class="gallery-thumbnail ${index === currentGalleryIndex ? 'active' : ''}"
      onclick="setGalleryImage(${index})"
    />
  `).join('');

  // Update navigation buttons
  prevBtn.disabled = currentGalleryIndex === 0;
  nextBtn.disabled = currentGalleryIndex === currentProjectImages.length - 1;
}

function setGalleryImage(index) {
  currentGalleryIndex = index;
  setupGallery();
}

function navigateGallery(direction) {
  const newIndex = currentGalleryIndex + direction;
  if (newIndex >= 0 && newIndex < currentProjectImages.length) {
    currentGalleryIndex = newIndex;
    setupGallery();
  }
}

// Close modal on ESC key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    const modal = document.getElementById('projectModal');
    if (modal && modal.classList.contains('active')) {
      closeProjectModal();
    }
  }
});

// Keyboard navigation for gallery
document.addEventListener('keydown', function(event) {
  const modal = document.getElementById('projectModal');
  if (modal && modal.classList.contains('active')) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      navigateGallery(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      navigateGallery(1);
    }
  }
});
