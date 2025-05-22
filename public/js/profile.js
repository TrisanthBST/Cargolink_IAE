document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    function showNotification(message, isSuccess = true) {
        const notification = document.createElement('div');
        notification.className = isSuccess ? 'notification success' : 'notification error';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    function switchTab(tabId) {
        // Update tab buttons
        tabButtons.forEach(button => {
            if (button.dataset.tab === tabId) {
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-selected', 'false');
            }
        });

        // Update tab panels
        tabPanels.forEach(panel => {
            if (panel.id === tabId) {
                panel.style.display = 'block';
            } else {
                panel.style.display = 'none';
            }
        });
    }

    // Add click handlers to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            switchTab(tabId);
        });
    });


    // Show all edit buttons for easier testing
    document.querySelectorAll('.field-edit-btn').forEach(btn => {
        btn.style.display = 'inline-block';
    });

    // Hide all save and cancel buttons initially
    document.querySelectorAll('.field-save-btn, .field-cancel-btn').forEach(btn => {
        btn.style.display = 'none';
    });

    // Enable all inputs but hide them initially
    document.querySelectorAll('.edit-input').forEach(input => {
        input.disabled = false;
        input.style.display = 'none';
    });

    // Make sure all display values are visible
    document.querySelectorAll('.display-value').forEach(display => {
        display.style.display = 'block';
    });

    // Get all edit buttons
    const editButtons = document.querySelectorAll('.field-edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fieldRow = this.closest('tr');
            const displayValue = fieldRow.querySelector('.display-value');
            const inputField = fieldRow.querySelector('.edit-input');
            
            // Store the original value for cancel
            inputField.dataset.originalValue = inputField.value;
            
            // Show the input field and hide the display value
            displayValue.style.display = 'none';
            inputField.style.display = 'block';
            
            // Show the save and cancel buttons, hide the edit button
            this.style.display = 'none';
            fieldRow.querySelector('.field-save-btn').style.display = 'inline-block';
            fieldRow.querySelector('.field-cancel-btn').style.display = 'inline-block';
            
            // Set input value to current display value to ensure they match
            if (inputField.value !== displayValue.textContent.trim()) {
                inputField.value = displayValue.textContent.trim();
            }
            
            // Focus the input field
            inputField.focus();
        });
    });

    // Get all cancel buttons
    const cancelButtons = document.querySelectorAll('.field-cancel-btn');
    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fieldRow = this.closest('tr');
            const displayValue = fieldRow.querySelector('.display-value');
            const inputField = fieldRow.querySelector('.edit-input');
            const editBtn = fieldRow.querySelector('.field-edit-btn');
            
            // Restore original value if it was changed
            if (inputField.dataset.originalValue) {
                inputField.value = inputField.dataset.originalValue;
            }
            
            // Switch back to display mode
            displayValue.style.display = 'block';
            inputField.style.display = 'none';
            editBtn.style.display = 'inline-block';
            this.style.display = 'none';
            fieldRow.querySelector('.field-save-btn').style.display = 'none';
        });
    });

    // Get all save buttons
    const saveButtons = document.querySelectorAll('.field-save-btn');
    
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get elements
            const fieldRow = this.closest('tr');
            const inputField = fieldRow.querySelector('.edit-input');
            const displayValue = fieldRow.querySelector('.display-value');
            const editBtn = fieldRow.querySelector('.field-edit-btn');
            const cancelBtn = fieldRow.querySelector('.field-cancel-btn');
            const saveBtn = this;
            
            saveBtn.disabled = true;
            const fieldValue = inputField.value.trim();
            const fieldType = inputField.dataset.fieldType;
    
        // Initial state setup
        const resetUI = () => {
            inputField.style.display = 'none';
            displayValue.style.display = 'block';
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
            cancelBtn.style.display = 'none';
            saveBtn.disabled = false;
            inputField.focus();
            setTimeout(() => inputField.focus(), 0); 
        };

        // Enable editing state
        const enableEditing = () => {
            saveBtn.disabled = false;
            inputField.style.display = 'block';
            displayValue.style.display = 'none';
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
            cancelBtn.style.display = 'inline-block';
            setTimeout(() => inputField.focus(), 0); 
        };
    
            // Basic validations
            if (!fieldValue) {
                showNotification('Field must not be Empty', false);
                enableEditing(); 
                return;
            }
            
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (fieldType === 'email' &&  !emailRegex.test(fieldValue)) {
                showNotification('Email Invalid', false);;
                enableEditing();
                return;
            }
            const indianMobileRegex = /^(?:(?:\+91|91|0)?[6-9]\d{9})$|^[6-9]\d{9}$/;
            if (fieldType === 'phone' && !indianMobileRegex.test(fieldValue)) {
                showNotification('Phone number Invalid', false);
                enableEditing();
                return;
            }

            // Date of birth validation
            if (fieldType === 'date_of_birth') {
                const selectedDate = new Date(fieldValue);
                const today = new Date();
                const minDate = new Date('1900-01-01');
                
                if (selectedDate > today) {
                    showNotification('Date of birth cannot be in the future', false);
                    enableEditing();
                    return;
                }
                
                if (selectedDate < minDate) {
                    showNotification('Please enter a valid date of birth', false);
                    enableEditing();
                    return;
                }

                // Format the date for display
                const formattedDate = selectedDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                displayValue.textContent = formattedDate;
            }
    
            // Submit data
            fetch('/customer/update-profile', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({[fieldType]: fieldValue})
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Update failed');
                    });
                }
                return response.json();
            })
            .then(data => {
                resetUI();
                showNotification('Update successful', true);
                window.location.reload();
            })
            .catch(error => {
                showNotification(error.message || 'An Error Occurred', false);
                enableEditing();
            });
        });
    });

    // Password form submission
    const passwordForm = document.getElementById('password-form');
    
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validate passwords
            if (newPassword !== confirmPassword) {
                showNotification('New passwords do not match', false);
                return;
            }
            
            if (newPassword.length < 8) {
                showNotification('Password must be at least 8 characters long', false);
                return;
            }
            
            // Send password update to server
            fetch('/customer/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Failed to update password');
                    });
                }
                return response.json();
            })
            .then(data => {
                // Reset form
                passwordForm.reset();
                showNotification('Password updated successfully');
            })
            .catch(error => {
                console.error('Error updating password:', error);
                showNotification(error.message || 'Failed to update password', false);
            });
        });
    }

    const addAddressBtn = document.getElementById('addAddressBtn');
    let addAddressForm = document.getElementById('addAddressForm');
    
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', function() {
            // Create new address form if it doesn't exist
            if (!addAddressForm) {
                const addressesGrid = document.querySelector('.addresses-grid');
                const newAddressForm = document.createElement('form');
                newAddressForm.id = 'addAddressForm';
                newAddressForm.className = 'address-form';
                newAddressForm.innerHTML = `
                    <h3>Add New Address</h3>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="new-address-type">Address Type</label>
                            <input type="text" id="new-address-type" placeholder="Home, Work, etc." required>
                            <small class="error-message"></small>
                        </div>
                        <div class="form-group">
                            <label for="new-address-name">Full Name</label>
                            <input type="text" id="new-address-name" required>
                            <small class="error-message"></small>
                        </div>
                        <div class="form-group">
                            <label for="new-address-street">Street Address</label>
                            <input type="text" id="new-address-street" required>
                            <small class="error-message"></small>
                        </div>
                        <div class="form-group">
                            <label for="new-address-city">City</label>
                            <input type="text" id="new-address-city" required>
                            <small class="error-message"></small>
                        </div>
                        <div class="form-group">
                            <label for="new-address-state">State</label>
                            <input type="text" id="new-address-state" required>
                            <small class="error-message"></small>
                        </div>
                        <div class="form-group">
                            <label for="new-address-zip">ZIP Code</label>
                            <input type="text" id="new-address-zip" required>
                            <small class="error-message"></small>
                        </div>
                        <div class="form-group">
                            <label for="new-address-country">Country</label>
                            <input type="text" id="new-address-country" required>
                            <small class="error-message"></small>
                        </div>
                        <div class="form-group">
                            <label for="new-address-phone">Phone</label>
                            <input type="text" id="new-address-phone" required>
                            <small class="error-message">Must be a valid Indian phone number</small>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Add Address</button>
                        <button type="button" class="btn btn-outline cancel-add-address">Cancel</button>
                    </div>
                `;
                
                // Remove empty message if present
                const emptyMessage = addressesGrid.querySelector('.no-data-message');
                if (emptyMessage) {
                    emptyMessage.remove();
                }
                
                // Add form to DOM
                addressesGrid.appendChild(newAddressForm);
                addAddressForm = newAddressForm;
                
                // Validation functions
                const validations = {
                    'new-address-type': (value) => {
                        if (!value) return 'Address type is required';
                        if (value.length > 20) return 'Address type too long';
                        return '';
                    },
                    'new-address-name': (value) => {
                        if (!value) return 'Full name is required';
                        if (value.length < 3) return 'Name too short';
                        if (value.length > 50) return 'Name too long';
                        if (!/^[a-zA-Z\s.'-]+$/.test(value)) return 'Invalid characters in name';
                        return '';
                    },
                    'new-address-street': (value) => {
                        if (!value) return 'Street address is required';
                        if (value.length < 5) return 'Address too short';
                        return '';
                    },
                    'new-address-city': (value) => {
                        if (!value) return 'City is required';
                        if (!/^[a-zA-Z\s-]+$/.test(value)) return 'Invalid city name';
                        return '';
                    },
                    'new-address-state': (value) => {
                        if (!value) return 'State is required';
                        if (!/^[a-zA-Z\s-]+$/.test(value)) return 'Invalid state name';
                        return '';
                    },
                    'new-address-zip': (value) => {
                        if (!value) return 'ZIP code is required';
                        if (!/^\d{6}$/.test(value)) return 'Invalid ZIP code (must be 6 digits)';
                        return '';
                    },
                    'new-address-country': (value) => {
                        if (!value) return 'Country is required';
                        return '';
                    },
                    'new-address-phone': (value) => {
                        if (!value) return 'Phone number is required';
                        const phoneRegex = /^(?:(?:\+91|91|0)?[6-9]\d{9})$|^[6-9]\d{9}$/;
                        if (!phoneRegex.test(value)) return 'Invalid Indian phone number';
                        return '';
                    }
                };
                
                // Add input validation on blur
                const inputs = addAddressForm.querySelectorAll('input');
                inputs.forEach(input => {
                    input.addEventListener('blur', function() {
                        const errorElement = this.nextElementSibling;
                        const validationFn = validations[this.id];
                        
                        if (validationFn) {
                            const error = validationFn(this.value);
                            if (error) {
                                this.classList.add('is-invalid');
                                errorElement.textContent = error;
                                errorElement.style.display = 'block';
                            } else {
                                this.classList.remove('is-invalid');
                                errorElement.style.display = 'none';
                            }
                        }
                    });
                });
                
                // Add event listener for form submission
                addAddressForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // Validate all fields before submission
                    let isValid = true;
                    const formData = {};
                    
                    inputs.forEach(input => {
                        const validationFn = validations[input.id];
                        const errorElement = input.nextElementSibling;
                        
                        if (validationFn) {
                            const error = validationFn(input.value);
                            if (error) {
                                input.classList.add('is-invalid');
                                errorElement.textContent = error;
                                errorElement.style.display = 'block';
                                isValid = false;
                            } else {
                                formData[input.id.replace('new-address-', '')] = input.value;
                            }
                        }
                    });
                    
                    if (!isValid) {
                        showNotification('Please correct the errors in the form', false);
                        return;
                    }
                    
                    // Prepare data for API
                    const newAddressData = {
                        type: formData.type,
                        name: formData.name,
                        street: formData.street,
                        city: formData.city,
                        state: formData.state,
                        zipCode: formData.zip,
                        country: formData.country,
                        phone: formData.phone
                    };
                    
                    // Send new address to server
                    fetch('/customer/add-address', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newAddressData)
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to add address');
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Refresh the page to show the new address
                        location.reload();
                    })
                    .catch(error => {
                        console.error('Error adding address:', error);
                        showNotification('Failed to add address', false);
                    });
                });
                
                // Add event listener for cancel button
                addAddressForm.querySelector('.cancel-add-address').addEventListener('click', function() {
                    addAddressForm.remove();
                    addAddressForm = null;
                });
            } else {
                addAddressForm.style.display = 'block';
            }
        });
    }
    
    // Fetch profile info on page load
    fetch('/customer/profile-info')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch profile info');
            }
            return response.json();
        })
        .then(data => {
            console.log('Profile info:', data);
            // You can use this data to update the profile page if needed
        })
        .catch(error => {
            console.error('Error fetching profile info:', error);
        });

    // Initialize the first tab as active
    if (tabButtons.length > 0) {
        switchTab(tabButtons[0].dataset.tab);
    }
    
    // Add CSS for notifications
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: opacity 0.5s;
        }
        .notification.success {
            background-color: #4CAF50;
        }
        .notification.error {
            background-color: #f44336;
        }
        .notification.fade-out {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);
    
    // Address card delete buttons
    const addressDeleteButtons = document.querySelectorAll('.address-card .btn-danger');
    
    addressDeleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this address?')) {
                const addressCard = this.closest('.address-card');
                const addressId = addressCard.dataset.addressId;
                
                if (!addressId) {
                    showNotification('Invalid address ID', false);
                    return;
                }
                
                // Send delete request to server
                fetch(`/customer/delete-address/${addressId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to delete address');
                    }
                    return response.json();
                })
                .then(data => {
                    // Remove address card from DOM
                    addressCard.remove();
                    
                    // Show empty message if no addresses left
                    const addressesGrid = document.querySelector('.addresses-grid');
                    if (!addressesGrid.querySelector('.address-card')) {
                        const emptyMessage = document.createElement('div');
                        emptyMessage.className = 'no-data-message';
                        emptyMessage.innerHTML = '<p>No addresses found. Click "Add New Address" to add one.</p>';
                        addressesGrid.appendChild(emptyMessage);
                    }
                    
                    showNotification('Address deleted successfully');
                })
                .catch(error => {
                    showNotification('Failed to delete address', false);
                });
            }
        });
    });
    
}); 