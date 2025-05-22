document.addEventListener('DOMContentLoaded', function() {
    // First ensure the tab content display state matches the active tab
    const activeTab = document.querySelector('.tab.active');
    if (activeTab) {
        const targetId = activeTab.getAttribute('href')?.substring(1);
        if (targetId) {
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                if (content) {
                    content.style.display = content.id === targetId ? 'block' : 'none';
                }
            });
        }
    }

    // Tab Navigation
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the target tab content id
            const targetId = tab.getAttribute('href')?.substring(1);
            if (!targetId) return;
            
            // Get the target content element
            const targetContent = document.getElementById(targetId);
            if (!targetContent) return;
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                if (content) {
                    content.style.display = 'none';
                }
            });
            
            // Show target content
            targetContent.style.display = 'block';
        });
    });

    // Edit Profile Functionality
    const editProfileBtn = document.getElementById('editProfileBtn');
    const formActions = document.querySelector('.form-actions');
    const infoValues = document.querySelectorAll('.info-value');
    let isEditing = false;

    editProfileBtn.addEventListener('click', function() {
        isEditing = !isEditing;
        
        if (isEditing) {
            // Switch to edit mode
            editProfileBtn.style.display = 'none';
            formActions.style.display = 'flex';
            
            infoValues.forEach(info => {
                const displayValue = info.querySelector('.display-value');
                const editInput = info.querySelector('.edit-input');
                
                displayValue.style.display = 'none';
                editInput.style.display = 'block';
            });
        } else {
            // Switch back to display mode
            editProfileBtn.style.display = 'block';
            formActions.style.display = 'none';
            
            infoValues.forEach(info => {
                const displayValue = info.querySelector('.display-value');
                const editInput = info.querySelector('.edit-input');
                
                displayValue.style.display = 'block';
                editInput.style.display = 'none';
            });
        }
    });

    // Add these validation functions at the beginning of the file
    const validations = {
        required: (value) => {
            return value.trim() !== '' ? '' : 'This field is required';
        },
        email: (value) => {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return emailRegex.test(value) ? '' : 'Please enter a valid email address (e.g., user@example.com)';
        },
        phone: (value) => {
            // Indian phone number validation (with or without country code)
            const phoneRegex = /^(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}$/;
            return phoneRegex.test(value) ? '' : 'Please enter a valid 10-digit mobile number (e.g., 9876543210)';
        },
        pan: (value) => {
            const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
            return panRegex.test(value) ? '' : 'Please enter a valid PAN number (e.g., ABCDE1234F)';
        },
        gst: (value) => {
            const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            return gstRegex.test(value) ? '' : 'Please enter a valid GST number (e.g., 27AAPFU0939F1ZV)';
        },
        pincode: (value) => {
            const pincodeRegex = /^[1-9][0-9]{5}$/;
            return pincodeRegex.test(value) ? '' : 'Please enter a valid 6-digit PIN code';
        },
        name: (value) => {
            const nameRegex = /^[a-zA-Z\s.&'-]{3,100}$/;
            return nameRegex.test(value) ? '' : 'Please enter a valid name (3-100 characters, letters, spaces, and some special characters allowed)';
        },
        password: (value) => {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return passwordRegex.test(value) ? '' : 'Password must have 8+ characters with 1 uppercase, 1 lowercase, 1 number & 1 special character';
        },
        url: (value) => {
            if (!value) return ''; // URL is optional
            try {
                new URL(value);
                return '';
            } catch {
                return 'Please enter a valid URL (e.g., https://example.com)';
            }
        },
        numeric: (value) => {
            return /^\d+$/.test(value) ? '' : 'Please enter numbers only';
        },
        vehicleCount: (value) => {
            const count = parseInt(value);
            return !isNaN(count) && count >= 0 ? '' : 'Please enter a valid number of vehicles (0 or more)';
        }
    };

    function validateField(input) {
        const validationType = input.dataset.validation;
        if (!validationType) return true;

        const value = input.value;
        let isValid = true;
        let errorMessage = '';

        // Check required validation first
        if (validationType.includes('required')) {
            errorMessage = validations.required(value);
            if (errorMessage) {
                isValid = false;
            }
        }

        // Check other validations
        if (isValid && value) {
            const validationTypes = validationType.split(' ');
            for (const type of validationTypes) {
                if (validations[type]) {
                    errorMessage = validations[type](value);
                    if (errorMessage) {
                        isValid = false;
                        break;
                    }
                }
            }
        }

        // Check minlength and maxlength
        if (isValid && input.hasAttribute('minlength')) {
            const minLength = parseInt(input.getAttribute('minlength'));
            if (value.length < minLength) {
                isValid = false;
                errorMessage = `Minimum ${minLength} characters required`;
            }
        }

        if (isValid && input.hasAttribute('maxlength')) {
            const maxLength = parseInt(input.getAttribute('maxlength'));
            if (value.length > maxLength) {
                isValid = false;
                errorMessage = `Maximum ${maxLength} characters allowed`;
            }
        }

        // Update UI
        const validationMessage = input.parentElement.querySelector('.validation-message');
        if (validationMessage) {
            validationMessage.textContent = errorMessage;
            validationMessage.classList.toggle('show', !isValid);
        }
        input.classList.toggle('error', !isValid);

        return isValid;
    }

    // Modify the save function to include validation and better error handling
    const saveProfileBtn = document.querySelector('.save-profile');
    saveProfileBtn.addEventListener('click', function() {
        // First validate all fields
        const allInputs = document.querySelectorAll('.edit-input');
        let isValid = true;
        
        // Reset all validation messages
        document.querySelectorAll('.validation-message').forEach(msg => {
            msg.textContent = '';
            msg.classList.remove('show');
        });
        
        document.querySelectorAll('.edit-input').forEach(input => {
            input.classList.remove('error');
        });
        
        allInputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) {
            alert('Please correct the errors before saving.');
            return;
        }

        // Define field mappings to backend fields
        const fieldMapping = {
            'companyName': 'name',
            'gstin': 'gst_in',
            'pan': 'pan',
            'email': 'email',
            'phone': 'primary_contact',
            'primary_contact': 'primary_contact',
            'street_address': 'street_address',
            'city': 'city',
            'state': 'state',
            'pin': 'pin',
            'zip_code': 'pin',
            'pinCode': 'pin',
            'alternate_phone': 'secondary_contact'
        };
        
        // Collect data for valid fields
        const updatedData = {};
        
        infoValues.forEach(info => {
            const fieldName = info.dataset.field;
            const editInput = info.querySelector('.edit-input');
            
            if (editInput && editInput.value !== '') {
                // Use data-field-type if available, otherwise try mapping the field name
                const backendField = editInput.dataset.fieldType || fieldMapping[fieldName] || fieldName;
                updatedData[backendField] = editInput.value;
            }
        });
        
        console.log('Sending update data:', updatedData);

        // Send update to server
        fetch('/transporter/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to update profile');
                }
                return data;
            });
        })
        .then(data => {
            // Update display values
            infoValues.forEach(info => {
                const fieldName = info.dataset.field;
                const displayValue = info.querySelector('.display-value');
                const editInput = info.querySelector('.edit-input');
                
                if (editInput) {
                    displayValue.textContent = editInput.value || 'Not Set';
                }
            });
            
            // Switch back to display mode
            isEditing = false;
            editProfileBtn.style.display = 'block';
            formActions.style.display = 'none';
            
            infoValues.forEach(info => {
                const displayValue = info.querySelector('.display-value');
                const editInput = info.querySelector('.edit-input');
                const validationMessage = info.querySelector('.validation-message');
                
                displayValue.style.display = 'block';
                editInput.style.display = 'none';
                editInput.classList.remove('error');
                if (validationMessage) {
                    validationMessage.classList.remove('show');
                }
            });
            
            alert('Profile updated successfully');
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || 'Failed to update profile');
        });
    });

    // Add real-time validation
    infoValues.forEach(info => {
        const editInput = info.querySelector('.edit-input');
        if (editInput) {
            editInput.addEventListener('input', function() {
                validateField(this);
            });
            
            editInput.addEventListener('blur', function() {
                validateField(this);
            });
        }
    });

    // Cancel Edit
    const cancelEditBtn = document.querySelector('.cancel-edit');
    cancelEditBtn.addEventListener('click', function() {
        isEditing = false;
        editProfileBtn.style.display = 'block';
        formActions.style.display = 'none';
        
        // Reset all validation messages and states
        document.querySelectorAll('.validation-message').forEach(msg => {
            msg.textContent = '';
            msg.classList.remove('show');
        });
        
        document.querySelectorAll('.edit-input').forEach(input => {
            input.classList.remove('error');
        });
        
        infoValues.forEach(info => {
            const displayValue = info.querySelector('.display-value');
            const editInput = info.querySelector('.edit-input');
            
            // Reset input value to original
            editInput.value = displayValue.textContent;
            
            displayValue.style.display = 'block';
            editInput.style.display = 'none';
        });
    });
     // Password change functionality
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    const passwordForm = document.getElementById('password-form');

    // Initialize password visibility toggles
    if (togglePasswordButtons && togglePasswordButtons.length > 0) {
        togglePasswordButtons.forEach(toggle => {
            if (!toggle) return;
            
            toggle.addEventListener('click', function() {
                const input = this.previousElementSibling;
                if (!input) return;
                
                if (input.type === 'password') {
                    input.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    input.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        });
    }
    
    // Prevent default form submission
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            return false;
        });
    }

    // Show password form
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            // Get parent tab content
            const securityTab = document.getElementById('security');
            const passwordContent = document.querySelector('#security .profile-section');
            
            if (!securityTab || !passwordContent) {
                console.error('Security tab or password content not found');
                return;
            }
            
            // Show password content
            passwordContent.style.display = 'block';
            
            // Reset form and validation messages
            if (currentPasswordInput) currentPasswordInput.value = '';
            if (newPasswordInput) newPasswordInput.value = '';
            if (confirmPasswordInput) confirmPasswordInput.value = '';
            
            document.querySelectorAll('.validation-message').forEach(msg => {
                if (msg) {
                    msg.textContent = '';
                    msg.classList.remove('show');
                }
            });
            
            document.querySelectorAll('.password-input-container input').forEach(input => {
                if (input) {
                    input.classList.remove('error');
                }
            });
        });
    }
    
    // Cancel password change
    if (cancelPasswordBtn) {
        cancelPasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Reset form
            if (currentPasswordInput) currentPasswordInput.value = '';
            if (newPasswordInput) newPasswordInput.value = '';
            if (confirmPasswordInput) confirmPasswordInput.value = '';
            
            document.querySelectorAll('.validation-message').forEach(msg => {
                if (msg) {
                    msg.textContent = '';
                    msg.classList.remove('show');
                }
            });
        });
    }

    // Save password button click handler
    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', function(e) {
            if (e) e.preventDefault();
            
            // Simple validation
            let isValid = true;
            const currentPassword = currentPasswordInput?.value || '';
            const newPassword = newPasswordInput?.value || '';
            const confirmPassword = confirmPasswordInput?.value || '';
            
            // Reset validation messages
            document.querySelectorAll('.validation-message').forEach(msg => {
                if (msg) {
                    msg.textContent = '';
                    msg.classList.remove('show');
                }
            });
            
            document.querySelectorAll('.password-input-container input').forEach(input => {
                if (input) {
                    input.classList.remove('error');
                }
            });
            
            // Validate current password
            if (!currentPassword) {
                const validationMessage = currentPasswordInput?.parentElement?.querySelector('.validation-message');
                if (validationMessage) {
                    validationMessage.textContent = 'Current password is required';
                    validationMessage.classList.add('show');
                    currentPasswordInput.classList.add('error');
                    isValid = false;
                }
            }
            
            // Basic new password validation
            if (!newPassword) {
                const validationMessage = newPasswordInput?.parentElement?.querySelector('.validation-message');
                if (validationMessage) {
                    validationMessage.textContent = 'New password is required';
                    validationMessage.classList.add('show');
                    newPasswordInput.classList.add('error');
                    isValid = false;
                }
            } else {
                // Complex password validation
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                if (!passwordRegex.test(newPassword)) {
                    const validationMessage = newPasswordInput?.parentElement?.querySelector('.validation-message');
                    if (validationMessage) {
                        validationMessage.textContent = 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character';
                        validationMessage.classList.add('show');
                        newPasswordInput.classList.add('error');
                        isValid = false;
                    }
                }
            }
            
            // Validate password confirmation
            if (!confirmPassword) {
                const validationMessage = confirmPasswordInput?.parentElement?.querySelector('.validation-message');
                if (validationMessage) {
                    validationMessage.textContent = 'Please confirm your password';
                    validationMessage.classList.add('show');
                    confirmPasswordInput.classList.add('error');
                    isValid = false;
                }
            } else if (newPassword !== confirmPassword) {
                const validationMessage = confirmPasswordInput?.parentElement?.querySelector('.validation-message');
                if (validationMessage) {
                    validationMessage.textContent = 'Passwords do not match';
                    validationMessage.classList.add('show');
                    confirmPasswordInput.classList.add('error');
                    isValid = false;
                }
            }
            
            if (!isValid) {
                alert('Please correct the errors before saving.');
                return;
            }
            
            // Prepare data for API call
            const passwordData = {
                currentPassword,
                newPassword,
                confirmPassword
            };
            
            console.log('Sending password update request');
            
            // Send password update to server
            fetch('/transporter/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest' 
                },
                body: JSON.stringify(passwordData)
            })
            .then(response => {
                return response.json().then(data => {
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to update password');
                    }
                    return data;
                });
            })
            .then(data => {
                console.log('Password updated successfully:', data);
                alert('Password updated successfully');
                
                // Reset form
                if (currentPasswordInput) currentPasswordInput.value = '';
                if (newPasswordInput) newPasswordInput.value = '';
                if (confirmPasswordInput) confirmPasswordInput.value = '';
                
                document.querySelectorAll('.validation-message').forEach(msg => {
                    if (msg) {
                        msg.textContent = '';
                        msg.classList.remove('show');
                    }
                });
            })
            .catch(error => {
                console.error('Error updating password:', error);
                alert(error.message || 'Failed to update password');
            });
        });
    }
});
