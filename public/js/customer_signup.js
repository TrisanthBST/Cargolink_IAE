document.addEventListener('DOMContentLoaded', () => {
    // For regular user signup
    if (document.getElementById('signupForm')) {
        initMultiStepForm('signupForm', 4);
    }
    
    // Initialize password toggle for all forms
    initPasswordToggles();
});

function initMultiStepForm(formId, totalSteps) {
    const form = document.getElementById(formId);
    const steps = form.querySelectorAll('.form-step');
    const progressSteps = document.querySelectorAll('.progress-step');
    const progressLines = document.querySelectorAll('.progress-line');
    let currentStep = 1;
    
    // Next button event listeners
    const nextButtons = form.querySelectorAll('.next-step');
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (validateStep(currentStep, formId)) {
                if (currentStep < totalSteps) {
                    // Hide current step
                    document.getElementById(`step${currentStep}`).classList.add('hidden');
                    
                    // Show next step
                    currentStep++;
                    document.getElementById(`step${currentStep}`).classList.remove('hidden');
                    
                    // Update progress indication
                    updateProgress(currentStep, progressSteps, progressLines);
                }
            }
        });
    });
    
    // Previous button event listeners
    const prevButtons = form.querySelectorAll('.prev-step');
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 1) {
                // Hide current step
                document.getElementById(`step${currentStep}`).classList.add('hidden');
                
                // Show previous step
                currentStep--;
                document.getElementById(`step${currentStep}`).classList.remove('hidden');
                
                // Update progress indication
                updateProgress(currentStep, progressSteps, progressLines);
            }
        });
    });
}

function updateProgress(currentStep, progressSteps, progressLines) {
    // Update steps
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
            step.classList.add('active');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
            step.classList.remove('completed');
        }
    });
    
    // Update lines
    progressLines.forEach((line, index) => {
        if (index + 1 < currentStep) {
            line.classList.add('active');
        } else {
            line.classList.remove('active');
        }
    });
}

function validateStep(step, formId) {
    const form = document.getElementById(formId);
    const currentStepElement = document.getElementById(`step${step}`);
    const inputs = currentStepElement.querySelectorAll('input, select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.hasAttribute('required') && !input.value) {
            isValid = false;
            input.classList.add('error');
            showError(`Please fill in all required fields`);
        } else {
            input.classList.remove('error');
        }
    });
    
    // Specific validations for customer signup form
    if (isValid) {
        if (step === 2) {
            // Validate email format
            const email = document.getElementById('email').value;
            const emailPattern = /^[a-zA-Z0-9._%+-]+@([a-zA-Z]+[a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}$/;
            if (!emailPattern.test(email)) {
                isValid = false;
                document.getElementById('email').classList.add('error');
                showError("Please enter a valid email address");
            }
            
            // Validate phone format
            const phone = document.getElementById('phone').value;
            if (phone && !/^(\+91\s)?[6-9]\d{9}$/.test(phone)) {
                isValid = false;
                document.getElementById('phone').classList.add('error');
                showError("Enter a valid Phone Number");
            }
        } else if (step === 3) {
            // Validate PIN code format if provided
            const pin = document.getElementById('pin').value;
            if (pin && !/^\d{6}$/.test(pin)) {
                isValid = false;
                document.getElementById('pin').classList.add('error');
                showError("PIN code should be 6 digits");
            }
        } else if (step === 4) {
            // Validate password
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password.length < 8) {
                isValid = false;
                document.getElementById('password').classList.add('error');
                showError("Password must be at least 8 characters long");
            } else if (password !== confirmPassword) {
                isValid = false;
                document.getElementById('confirmPassword').classList.add('error');
                showError("Passwords do not match");
            }
            
            // Check terms agreement
            const termsCheckbox = form.querySelector('input[name="terms"]');
            if (!termsCheckbox.checked) {
                isValid = false;
                termsCheckbox.classList.add('error');
                showError("You must agree to the Terms and Privacy Policy");
            }
        }
    }
    
    return isValid;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove any existing error messages first
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());
    
    // Add the new error message to the form or signup-form
    const formContainer = document.querySelector('.form-container') || document.querySelector('.signup-form');
    if (formContainer) {
        formContainer.appendChild(errorDiv);
    } else {
        // Fallback to adding it at the top of the form
        const form = document.getElementById('signupForm');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
        }
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Find the nearest input field (sibling)
            const passwordField = button.parentElement.querySelector('input');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                // Update SVG icon to show "hide password" icon
                button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>`;
            } else {
                passwordField.type = 'password';
                // Update SVG icon to show "show password" icon
                button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>`;
            }
        });
    });
}

function validateSignupForm(event) {
    event.preventDefault();
    const form = document.getElementById('signupForm');
    
    // Check if all required fields are filled
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value) {
            field.classList.add('error');
            isValid = false;
        }
    });
    
    if (!isValid) {
        showError("Please fill in all required fields");
        return false;
    }
    
    // Check password match
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        document.getElementById('confirmPassword').classList.add('error');
        showError("Passwords do not match");
        return false;
    }
    
    // Check terms agreement
    const termsCheckbox = form.querySelector('input[name="terms"]');
    if (!termsCheckbox.checked) {
        termsCheckbox.classList.add('error');
        showError("You must agree to the Terms and Privacy Policy");
        return false;
    }
    
    // If all validations pass, submit the form
    submitUserForm();
    return false; // Prevent default form submission
}

function submitUserForm() {
    const form = document.getElementById('signupForm');    
    
    // Convert form fields to match backend expectations
    const firstName = document.getElementById(`firstName`).value;
    const lastName = document.getElementById(`lastName`).value;
    const gender = document.getElementById(`gender`).value;
    const dob = document.getElementById(`dob`).value;
    const email = document.getElementById(`email`).value;
    const phone = document.getElementById(`phone`).value;
    const street_address = document.getElementById(`street_address`).value;
    const city = document.getElementById(`city`).value;
    const state = document.getElementById(`state`).value;
    const pin = document.getElementById(`pin`).value;
    const password = document.getElementById(`password`).value;

    const formData = {firstName, lastName, gender, dob, email, phone, password, 
        address: {street_address, city, state, pin}}

    // Disable submit button and show loading indicator
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading-spinner"></span> Processing...';
    
    fetch('/customer/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        if (data.success) {
            showSuccessMessage("Registration successful! Redirecting to login...");
            setTimeout(() => {
                window.location.href = '/customer/login';
            }, 2000);
        } else {
            showError(data.message || "Registration failed. Please try again.");
            submitButton.disabled = false;
            submitButton.innerHTML = 'Create Account';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError("An error occurred. Please try again later.");
        submitButton.disabled = false;
        submitButton.innerHTML = 'Create Account';
    });
    
    return false; // Prevent default form submission
}

function showSuccessMessage(message) {
    console.log("data added");
}