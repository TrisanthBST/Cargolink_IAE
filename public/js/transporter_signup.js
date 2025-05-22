document.addEventListener('DOMContentLoaded', () => {
    // For transporter signup
    if (document.getElementById('transporterSignupForm')) {
        initMultiStepForm('transporterSignupForm', 4);
    }
    
    // Initialize password toggle for all forms
    initPasswordToggles();
});

let vehicleCount = 1;

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
    
    if (step === 1) {
        // Validate name
        const name = document.getElementById('name').value;
        if (!name) {
            isValid = false;
            document.getElementById('name').classList.add('error');
            showError("Please enter your name");
        }

        // Validate primary phone
        const primary_contact = document.getElementById('primary_contact').value;
        if (!/^(\+91\s)?[6-9]\d{9}$/.test(primary_contact)) {
            isValid = false;
            document.getElementById('primary_contact').classList.add('error');
            showError("Primary phone number must be 10 digits");
        }

        // Validate secondary phone (if provided)
        const secondary_contact = document.getElementById('secondary_contact').value;
        if (secondary_contact && !/^(\+91\s)?[6-9]\d{9}$/.test(secondary_contact)) {
            isValid = false;
            document.getElementById('secondary_contact').classList.add('error');
            showError("Secondary phone number must be 10 digits");
        }

        // Validate email
        const email = document.getElementById('email').value;
        const emailPattern = /^[a-zA-Z0-9._%+-]+@([a-zA-Z]+[a-zA-Z0-9-]*\.)+[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            isValid = false;
            document.getElementById('email').classList.add('error');
            showError("Please enter a valid email address");
        }
    } else if (step === 2) {
        // GSTIN validation
        const gst_in = document.getElementById('gst_in').value;
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst_in)) {
            isValid = false;
            document.getElementById('gst_in').classList.add('error');
            showError("Please enter a valid GSTIN number");
        }

        // PAN validation
        const pan = document.getElementById('pan').value;
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
            isValid = false;
            document.getElementById('pan').classList.add('error');
            showError("Please enter a valid PAN number");
        }

        // Address validation
        const requiredFields = ['street_address', 'city', 'state', 'pin'];
        requiredFields.forEach(field => {
            const input = document.getElementById(field);
            if (!input.value) {
                isValid = false;
                input.classList.add('error');
                showError("Please fill in all address fields");
            }
        });

        // PIN code validation
        const pin = document.getElementById('pin').value;
        if (pin && !/^\d{6}$/.test(pin)) {
            isValid = false;
            document.getElementById('pin').classList.add('error');
            showError("PIN code must be 6 digits");
        }
    } else if (step === 3) {
        // Vehicle validation
        const vehicleForms = document.querySelectorAll('.vehicle-form');
        let hasValidVehicle = false;

        vehicleForms.forEach(vehicleForm => {
            const vehicleInputs = vehicleForm.querySelectorAll('input, select');
            let vehicleIsValid = true;

            vehicleInputs.forEach(input => {
                if (input.hasAttribute('required') && !input.value) {
                    vehicleIsValid = false;
                    input.classList.add('error');
                }
            });

            if (vehicleIsValid) {
                hasValidVehicle = true;
            }
        });

        if (!hasValidVehicle) {
            showError("Please enter at least one valid vehicle");
            return false;
        }
    } else if (step === 4) {
        // Password validation
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
        
        // Terms agreement validation
        const termsCheckbox = form.querySelector('input[name="terms"]');
        if (!termsCheckbox.checked) {
            isValid = false;
            termsCheckbox.classList.add('error');
            showError("You must agree to the Terms and Privacy Policy");
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
        const form = document.getElementById('transporterSignupForm');
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
            const passwordField = button.parentElement.querySelector('input');
            const type = passwordField.getAttribute('type');
            passwordField.setAttribute('type', type === 'password' ? 'text' : 'password');
        });
    });
}

function validateTransporterSignupForm() {
    const form = document.getElementById('transporterSignupForm');
    
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
    //validate pan
    const pan = document.getElementById('pan').value;
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
        document.getElementById('pan').classList.add('error');
        showError("PAN Number should be in valid format (e.g., ABCDE1234F)");
        return false;
    }
    
    // Validate GST format
    const gst = document.getElementById('gst_in').value;
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)) {
        document.getElementById('gst_in').classList.add('error');
        showError("GST Number should be in valid format");
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
    submitTransporterForm();
    return false; // Prevent default form submission
}

function submitTransporterForm() {
    const form = document.getElementById('transporterSignupForm');
    
    // Convert form fields to match backend expectations
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const primary_contact = document.getElementById('primary_contact').value;
    const secondary_contact = document.getElementById('secondary_contact').value;
    const pan = document.getElementById('pan').value;
    const gst_in = document.getElementById('gst_in').value;
    const password = document.getElementById('password').value;
    const street_address = document.getElementById(`street_address`).value;
    const city = document.getElementById(`city`).value;
    const state = document.getElementById(`state`).value;
    const pin = document.getElementById(`pin`).value;

    // Collect vehicle information
    const vehicleForms = document.querySelectorAll('.vehicle-form');
    const vehicles = [];

    vehicleForms.forEach(vehicleForm => {
        const registrationNumber = vehicleForm.querySelector('input[name$="[registrationNumber]"]').value;
        const capacity = vehicleForm.querySelector('input[name$="[capacity]"]').value;
        const vehicleType = vehicleForm.querySelector('select[name$="[type]"]').value;
        const name = vehicleForm.querySelector('input[name$="[name]"]').value;
        const manufacture_year = vehicleForm.querySelector('input[name$="[manufacture_year]"]').value;

        vehicles.push({
            name:name,
            registration: registrationNumber,
            capacity: parseFloat(capacity),
            truck_type: vehicleType,
            manufacture_year: manufacture_year
        });
    });

    const formData = {
        name, 
        email, 
        primary_contact, 
        secondary_contact, 
        pan, 
        gst_in, 
        password, 
        street_address, 
        city, 
        state, 
        pin,
        vehicles
    };
   
    // Disable submit button and show loading indicator
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="loading-spinner"></span> Processing...';
    
    fetch('/transporter/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
          
            setTimeout(() => {
                window.location.href = '/transporter/login';
            }, 1000);
        } else {
            showError(data.message || "Registration failed. Please try again.");
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit';
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

function addVehicle() {
    const vehiclesContainer = document.getElementById('vehiclesContainer');
    const newVehicle = document.createElement('div');
    newVehicle.className = 'vehicle-form';
    
    newVehicle.innerHTML = `
        <div class="vehicle-header">
            <h3>Vehicle Details</h3>
            <button type="button" class="btn btn-outline remove-vehicle" onclick="removeVehicle(this)">Remove</button>
        </div>

        <div class="form-group">
            <label class="input-label" for="name">Vehicle Nmae</label>
            <input class="input-field" type="text" name="vehicles[${vehicleCount}][name]" placeholder="Enter vehicle name" required>
        </div>

        <div class="form-group">
             
            <label class="input-label" for="vehicleType">Vehicle Type</label>
            <select class="input-field" name="vehicles[${vehicleCount}][type]" required>
                <option value="" disabled selected>Select vehicle type</option>
                <option value="mini-truck">Mini Truck</option>
                <option value="pickup">Pickup Truck</option>
                <option value="truck">Standard Truck</option>
                <option value="trailer">Trailer</option>
                <option value="container">Container Truck</option>
            </select>
        </div>

        <div class="form-group">
            <label class="input-label" for="vehicleNumber">Vehicle Registration Number</label>
            <input class="input-field" type="text" name="vehicles[${vehicleCount}][registrationNumber]" placeholder="Enter vehicle registration number" required>
        </div>

        <div class="form-group">
            <label class="input-label" for="vehicleCapacity">Vehicle Capacity (in tons)</label>
            <input class="input-field" type="number" step="0.1" name="vehicles[${vehicleCount}][capacity]" placeholder="Enter vehicle capacity" required>
        </div>

        <div class="form-group">
            <label class="input-label" for="manufacture_year">manufacture_year Name</label>
            <input class="input-field" type="text" name="vehicles[${vehicleCount}][manufacture_year]" placeholder="Enter manufacture_year name" required>
        </div>
    `;
    
    vehiclesContainer.appendChild(newVehicle);
    vehicleCount++;
}

function removeVehicle(button) {
    button.closest('.vehicle-form').remove();
}