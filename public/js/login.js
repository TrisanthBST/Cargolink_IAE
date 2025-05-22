function validateLoginForm(event){
    event.preventDefault();

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    
    if(!email){
        showError("Enter an Email");
        return false;
    }

    const emailPattern = /^[\w\.]+@([\w]+\.)+[\w]{2,}$/;
    if (!emailPattern.test(email)) {
        showError("Enter a valid Email");
        return false;
    }

    if(!password){
        showError("Enter a Password");
        return false;
    }


    if (password.length < 6) {
        showError("Password must be at least 6 characters long");
        return false;
    }
    submitLogin();
    return true;
}

function submitLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    const form = document.getElementById('loginForm'); 
    const action = form.action; 

    const loginData = {email, password, rememberMe};
    console.log('Sending login data:', loginData);
    
    fetch(action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Login response:', data);
        
        if (data.error) {
            showError(data.error);
        } else {
            showMessage('Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/';  // Redirect to home page
            }, 1000);
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showError('Login failed. Please try again.');
    });
}

function showMessage(message) {
    const mainContent = document.querySelector('.login-main-content');
  
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container success';
  
    messageContainer.innerHTML = `
        <div class="message">${message}</div>
        <div class="message-progress-bar"></div>
    `;
  
    mainContent.appendChild(messageContainer);
  
    setTimeout(() => {
        if (messageContainer) {
            messageContainer.remove();
        }
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {

    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    const eyeIcon = 
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
        </svg>`;

    const eyeOffIcon = 
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>`;
        
    togglePassword.addEventListener('click', function () {
        if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.innerHTML = eyeOffIcon;
        } else {
        passwordInput.type = 'password';
        this.innerHTML = eyeIcon;
        }
    });


});

function showError(message) {
  
    const mainContent = document.querySelector('.login-main-content');
  
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
  
    errorContainer.innerHTML = `
      <div class="error-message">${message}</div>
      <button class="error-close-btn" onclick="this.parentElement.remove();">&times;</button>
      <div class="error-progress-bar"></div>
    `;
  
    mainContent.appendChild(errorContainer);
  
    // Automatically hide the error message after 5 seconds
    setTimeout(() => {
        if (errorContainer) {
            errorContainer.remove();
        }
    }, 5000);
  }