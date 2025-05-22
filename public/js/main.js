document.addEventListener('DOMContentLoaded', () => {
    // Header scroll behavior
    let lastScroll = 0;
    const header = document.querySelector('.header');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  
    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      
      if (currentScroll > lastScroll && currentScroll > 100) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }
      
      lastScroll = currentScroll;
    });
  
    // Mobile menu toggle
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        document.body.classList.toggle('mobile-menu-open');
        const spans = mobileMenuBtn.querySelectorAll('span');
        spans[0].classList.toggle('rotate-45');
        spans[1].classList.toggle('opacity-0');
        spans[2].classList.toggle('-rotate-45');
      });
    }
  
    // Parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (hero) {
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
      });
    }
  
    // Login Modal
    const loginBtn = document.querySelector('#login-btn');
    const loginModalOverlay = document.querySelector('#login-modal');
    
    const modalOverlay = document.querySelectorAll('.modal-overlay');
    const modalClose = document.querySelectorAll('.modal-close');
    console.log(modalClose, modalOverlay);
    
  
    // Open modal
    if (loginBtn) {
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModalOverlay.classList.add('active');
        let loginModal = loginModalOverlay.querySelector('.modal');
        loginModal.classList.add('active');
      });
    }
  
    // Close modal
    if (modalClose.length !== 0) {
      modalClose.forEach(closeBtn => {
          closeBtn.addEventListener('click', () => {            
          let parentModal = closeBtn.parentElement;
          let paerntOverlay = parentModal.parentElement;
          paerntOverlay.classList.remove('active');
          parentModal.classList.remove('active');
        });
      });
    }

        // Close modal
    if (modalOverlay.length !== 0) {
      modalOverlay.forEach(overlay => {
          overlay.addEventListener('click', () => {
          let modal = overlay.querySelector('.modal');
          overlay.classList.remove('active');
          modal.classList.remove('active');
        });
      });
    }
  
});


function showError(message) {
  
  const mainContent = document.querySelector('.main-content');

  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-container';

  errorContainer.innerHTML = `
    <div class="error-message">${message}</div>
    <button class="error-close-btn" onclick="this.parentElement.style.display='none';">&times;</button>
    <div class="error-progress-bar"></div>
  `;

  mainContent.appendChild(errorContainer);

  // Automatically hide the error message after 5 seconds
  setTimeout(() => {
      if (errorContainer) {
          errorContainer.style.display = 'none';
      }
  }, 5000);
}

function updateHeaderForLoggedInUser(userPhotoUrl, userName) {
    // Get the header elements
    const loginBtn = document.querySelector('#login-btn');
    const navLinks = document.querySelector('.nav-links');

    // Remove login button if it exists
    if (loginBtn) {
        loginBtn.remove();
    }

    // Create profile section
    const profileSection = document.createElement('div');
    profileSection.className = 'profile-section';
    
    // Create and set up profile photo
    const profilePhoto = document.createElement('img');
    profilePhoto.src = userPhotoUrl || '/img/default-profile.png'; // Fallback to default image
    profilePhoto.alt = `${userName}'s profile photo`;
    profilePhoto.className = 'profile-photo';

    // Create profile dropdown
    const profileDropdown = document.createElement('div');
    profileDropdown.className = 'profile-dropdown';
    profileDropdown.innerHTML = `
        <button class="profile-trigger">
            <img src="${userPhotoUrl || '/img/default-profile.png'}" alt="Profile" class="profile-photo">
            <span class="profile-name">${userName}</span>
            <svg class="dropdown-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6"/>
            </svg>
        </button>
        <div class="dropdown-menu">
            <a href="/profile">Profile</a>
            <a href="/settings">Settings</a>
            <a href="/logout" class="logout-link">Logout</a>
        </div>
    `;

    // Add styles dynamically
    const styles = document.createElement('style');
    styles.textContent = `
        .profile-section {
            display: flex;
            align-items: center;
            position: relative;
        }

        .profile-photo {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--primary);
        }

        .profile-trigger {
            display: flex;
            align-items: center;
            gap: 8px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 20px;
            transition: background-color 0.2s;
        }

        .profile-trigger:hover {
            background-color: var(--light-gray);
        }

        .profile-name {
            color: var(--text-primary);
            font-weight: 500;
        }

        .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 8px 0;
            min-width: 180px;
            display: none;
            z-index: 1000;
        }

        .profile-dropdown:hover .dropdown-menu {
            display: block;
        }

        .dropdown-menu a {
            display: block;
            padding: 8px 16px;
            color: var(--text-primary);
            text-decoration: none;
            transition: background-color 0.2s;
        }

        .dropdown-menu a:hover {
            background-color: var(--light-gray);
        }

        .logout-link {
            color: var(--error) !important;
            border-top: 1px solid var(--border-color);
            margin-top: 4px;
            padding-top: 8px;
        }
    `;

    // Add the styles to the document
    document.head.appendChild(styles);

    // Add profile section to nav
    navLinks.appendChild(profileDropdown);

    // Add click handler for logout
    const logoutLink = profileDropdown.querySelector('.logout-link');
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Add your logout logic here
        console.log('Logging out...');
        // After logout, you might want to redirect to login page
        // window.location.href = '/login';
    });
}

// Example usage:
// Call this function when user logs in
// updateHeaderForLoggedInUser('/path/to/photo.jpg', 'John Doe');
