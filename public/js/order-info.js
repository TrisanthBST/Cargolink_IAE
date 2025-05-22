// Simulate map loading (unchanged)
setTimeout(() => {
    document.querySelector('.map-placeholder').innerHTML = `
      <img src="/api/placeholder/400/320" alt="Map showing truck location and route" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" />
    `;
}, 2000);

// Function to report delay (unchanged)
function reportDelay() {
    const note = document.getElementById('status-note').value;
    if (!note) {
        alert('Please provide details about the delay.');
        return;
    }

    fetch(`/api/orders/<%= order.id %>/delay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Delay reported successfully!');
            window.location.reload();
        } else {
            alert('Failed to report delay.');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to save note (unchanged)
function saveNote() {
    const note = document.getElementById('status-note').value;
    if (!note) {
        alert('Please enter a note.');
        return;
    }

    fetch(`/api/orders/<%= order.id %>/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Note saved successfully!');
        } else {
            alert('Failed to save note.');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to send chat message (unchanged)
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    fetch(`/api/orders/<%= order.id %>/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            input.value = '';
            window.location.reload();
        } else {
            alert('Failed to send message.');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to call customer (unchanged)
function callCustomer(phone) {
    alert(`Calling ${phone}...`);
}

// Function to email customer (unchanged)
function emailCustomer(email) {
    alert(`Emailing ${email}...`);
}

// Main event listener for DOM content loading
document.addEventListener('DOMContentLoaded', function() {
    // Get references to buttons
   const backButton = document.getElementById('back-button');

    // Get order ID from URL (for logging/debugging purposes)
    const orderId = window.location.pathname.split('/').pop();

    // Back Button Handler (unchanged)
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '/transporter/orders';
        });
    }

});