document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const addVehicleBtn = document.getElementById('add-vehicle-btn');
    const emptyAddVehicleBtn = document.getElementById('empty-add-vehicle');
    const vehicleModal = document.getElementById('vehicle-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const vehicleForm = document.getElementById('vehicle-form');
    const cancelVehicleBtn = document.getElementById('cancel-vehicle');
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search-btn');
    const statusFilter = document.getElementById('status-filter');
    const typeFilter = document.getElementById('type-filter');
    const closeButtons = document.querySelectorAll('.close');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');
    const removeButtons = document.querySelectorAll('.remove-vehicle');
    
    // Variables to store state
    let targetVehicleId = null;
    let selectedActionType = null;
    
    // Show notification function
    function showNotification(message, isSuccess = true) {
        const notification = document.createElement('div');
        notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
    
    // Reset form fields
    function resetForm() {
        if (vehicleForm) {
            vehicleForm.reset();
            const modalTitle = document.getElementById('modal-title');
            if (modalTitle) modalTitle.textContent = 'Add New Vehicle';
        }
    }
    
    function openModal(modal) {
        if (!modal) return;
        
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        
        modal.style.display = 'flex';
    }
    
    function closeModal(modal) {
        if (!modal) return;
        
        const scrollY = Math.abs(parseInt(document.body.style.top || '0'));
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.overflow = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
        
        modal.style.display = 'none';
        
        if (modal === vehicleModal) {
            resetForm();
        }
    }
    
    // Handle remove button click
    function handleRemove(element) {
        if (!element) return;
        
        const vehicleId = element.getAttribute('data-id');
        if (!vehicleId) return;
        
        targetVehicleId = vehicleId;
        selectedActionType = 'remove';
        
        document.getElementById('confirm-message').textContent = 'Are you sure you want to remove this vehicle? This action cannot be undone.';
        document.getElementById('confirm-yes').textContent = 'Yes, Remove';
        
        openModal(confirmModal);
    }
    
    // Format date to YYYY-MM-DD format
    function formatDateForServer(dateString) {
        if (!dateString) return null;
        
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return null;
            }
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            return `${year}-${month}-${day}`;
        } catch (e) {
            return null;
        }
    }
    
    // Simple validation function
    function validateForm() {
        const name = document.getElementById('truck-name').value.trim();
        const truck_type = document.getElementById('truck-type').value;
        const registration = document.getElementById('truck-registration').value.trim();
        const capacity = document.getElementById('capacity').value.trim();
        const manufacture_year = document.getElementById('manufacture-year').value.trim();
        
        // Basic validation
        if (!name) {
            showNotification('Please enter vehicle name', false);
            return false;
        }
        
        if (!truck_type) {
            showNotification('Please select vehicle type', false);
            return false;
        }
        
        if (!registration) {
            showNotification('Please enter registration number', false);
            return false;
        }

        // Registration format validation (e.g., KA01AB1234)
        const regRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
        if (!regRegex.test(registration)) {
            showNotification('Registration number format should be: XX99XX9999 (e.g., KA01AB1234)\n- First 2 letters: State code (e.g., KA, MH)\n- Next 2 digits: District code (e.g., 01, 02)\n- Next 2 letters: Series code\n- Last 4 digits: Number', false);
            return false;
        }
        
        if (!capacity) {
            showNotification('Please enter capacity', false);
            return false;
        }
        
        if (!manufacture_year) {
            showNotification('Please enter manufacture year', false);
            return false;
        }
        
        return true;
    }

    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        // Get form data
        const vehicleData = {
            name: document.getElementById('truck-name').value.trim(),
            truck_type: document.getElementById('truck-type').value,
            registration: document.getElementById('truck-registration').value.trim(),
            capacity: parseFloat(document.getElementById('capacity').value.trim()),
            manufacture_year: parseInt(document.getElementById('manufacture-year').value.trim()),
            status: 'Available',
            last_service_date: document.getElementById('last-service').value || null
        };
        
        // Disable submit button
        const submitBtn = vehicleForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        // Submit data
        fetch('/transporter/fleet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehicleData),
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showNotification(data.error, false);
            } else {
                showNotification('Vehicle added successfully', true);
                closeModal(vehicleModal);
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        })
        .catch(error => {
            showNotification('Error saving vehicle. Please try again.', false);
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Vehicle';
        });
    }
    
    // Handle confirmation actions
    function handleConfirmation() {
        if (!targetVehicleId || !selectedActionType) {
            closeModal(confirmModal);
            return;
        }
        
        // Disable the button to prevent multiple clicks
        confirmYesBtn.disabled = true;
        confirmYesBtn.textContent = 'Processing...';
        
        let url, method;
        
        if (selectedActionType === 'remove') {
            url = `/transporter/fleet/${targetVehicleId}/delete`;
            method = 'DELETE';
        } else {
            closeModal(confirmModal);
            return;
        }
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                showNotification(data.error, false);
            } else {
                showNotification(data.message || 'Vehicle removed successfully');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        })
        .catch(error => {
            showNotification('An error occurred while removing the vehicle', false);
        })
        .finally(() => {
            confirmYesBtn.disabled = false;
            confirmYesBtn.textContent = 'Yes, Remove';
            closeModal(confirmModal);
        });
    }
    
    // Simple search function
    function performSearch() {
        if (!searchInput) return;
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const vehicles = document.querySelectorAll('.vehicle-card');
        
        vehicles.forEach(vehicle => {
            const vehicleText = vehicle.textContent.toLowerCase();
            const matchesSearch = searchTerm === '' || vehicleText.includes(searchTerm);
            
            // Get filter states
            const statusValue = statusFilter ? statusFilter.value : 'all';
            const typeValue = typeFilter ? typeFilter.value : 'all';
            
            // Check status match
            let statusMatch = true;
            if (statusValue !== 'all') {
                const statusBadge = vehicle.querySelector('.status-badge');
                if (statusBadge) {
                    const vehicleStatus = statusBadge.textContent.trim().toLowerCase();
                    
                    // Handle different status values
                    if (statusValue === 'maintenance') {
                        statusMatch = vehicleStatus === 'in maintenance';
                    } else {
                        statusMatch = vehicleStatus === statusValue;
                    }
                }
            }
            
            // Check type match
            let typeMatch = true;
            if (typeValue !== 'all') {
                const typeElements = vehicle.querySelectorAll('.info-row p');
                if (typeElements.length > 0) {
                    // Find the type row (typically the first one with "Type: X")
                    typeMatch = false; // Default to false until we find a match
                    
                    typeElements.forEach(element => {
                        if (element.textContent.toLowerCase().includes('type:')) {
                            const vehicleType = element.textContent.toLowerCase();
                            typeMatch = vehicleType.includes(typeValue.toLowerCase());
                        }
                    });
                }
            }
            
            // Show/hide based on all filters
            vehicle.style.display = (matchesSearch && statusMatch && typeMatch) ? 'block' : 'none';
        });
        
        updateEmptyState();
    }
    
    // Update empty state visibility
    function updateEmptyState() {
        const vehicles = document.querySelectorAll('.vehicle-card');
        const visibleVehicles = Array.from(vehicles).filter(v => v.style.display !== 'none');
        
        // Find or create empty state
        let emptyState = document.querySelector('.empty-state:not(:first-child)');
        const fleetGrid = document.querySelector('.fleet-grid');
        
        // If we have no visible vehicles and need to show empty state
        if (visibleVehicles.length === 0 && fleetGrid) {
            // If no search empty state exists, create one
            if (!emptyState) {
                emptyState = document.createElement('div');
                emptyState.className = 'empty-state search-empty-state';
                emptyState.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                    <h3>No matching vehicles found</h3>
                    <p>Try adjusting your search or filters</p>
                    <button id="reset-filters" class="btn btn-primary">Reset Filters</button>
                `;
                fleetGrid.appendChild(emptyState);
                
                // Add event listener to the reset button
                document.getElementById('reset-filters').addEventListener('click', function() {
                    if (searchInput) searchInput.value = '';
                    if (statusFilter) statusFilter.value = 'all';
                    if (typeFilter) typeFilter.value = 'all';
                    
                    // Show all vehicles
                    vehicles.forEach(v => v.style.display = 'block');
                    
                    // Remove the empty state
                    if (emptyState) {
                        emptyState.remove();
                    }
                });
            }
        } else if (visibleVehicles.length > 0) {
            // If we have visible vehicles but also have a search empty state, remove it
            if (emptyState) {
                emptyState.remove();
            }
        }
    }

    // Set up event listeners
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', function() {
            openModal(vehicleModal);
        });
    }

    if (emptyAddVehicleBtn) {
        emptyAddVehicleBtn.addEventListener('click', function() {
            openModal(vehicleModal);
        });
    }

    if (cancelVehicleBtn) {
        cancelVehicleBtn.addEventListener('click', function() {
            closeModal(vehicleModal);
        });
    }

    // Setup all remove buttons
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            handleRemove(this);
        });
    });

    // Close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeModal(this.closest('.fleet-dialog'));
        });
    });

    // Confirm button
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', handleConfirmation);
    }

    // Cancel button
    if (confirmNoBtn) {
        confirmNoBtn.addEventListener('click', function() {
            closeModal(confirmModal);
        });
    }

    // Search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Filter functionality
    if (statusFilter) {
        statusFilter.addEventListener('change', performSearch);
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', performSearch);
    }

    // Form submission
    if (vehicleForm) {
        vehicleForm.addEventListener('submit', handleFormSubmit);
    }

    // Initialize
    function init() {
        // Check for success parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            showNotification('Vehicle added successfully', true);
        }
    }
    
    // Start the application
    init();
}); 