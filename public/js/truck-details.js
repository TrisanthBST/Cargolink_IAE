// Truck Details Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Truck details page loaded');
    
    // Show notification function (kept for possible future use)
    function showNotification(message, isSuccess = true) {
        console.log(`NOTIFICATION: ${message}`);
        
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    // Format dates (if needed)
    formatDates();
});

// Function to format dates in a user-friendly way
function formatDates() {
    const dateElements = document.querySelectorAll('.date-format');
    
    dateElements.forEach(element => {
        const dateString = element.textContent.trim();
        if (dateString && dateString !== 'Not available') {
            try {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    const formattedDate = new Intl.DateTimeFormat('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }).format(date);
                    element.textContent = formattedDate;
                }
            } catch (error) {
                console.error('Error formatting date:', error);
            }
        }
    });
} 