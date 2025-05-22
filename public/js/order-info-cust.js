// Simulate map loading
setTimeout(() => {
    document.querySelector('.map-placeholder').innerHTML = `
      <img src="/api/placeholder/400/320" alt="Map showing truck location and route" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" />
    `;
  }, 2000);
  
  // Function to update order status
  function updateOrderStatus(status) {
    fetch(`/api/orders/<%= order.id %>/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Status updated successfully!');
        window.location.reload();
      } else {
        alert('Failed to update status.');
      }
    })
    .catch(error => console.error('Error:', error));
  }
  
  // Function to report delay
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
  
  // Function to save note
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
  
  // Function to send chat message
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
  
  // Function to call customer
  function callCustomer(phone) {
    alert(`Calling ${phone}...`);
  }
  
  // Function to email customer
  function emailCustomer(email) {
    alert(`Emailing ${email}...`);
  }

document.addEventListener('DOMContentLoaded', function() {
    const startTransitBtn = document.getElementById('start-transit');
    const updateStatusBtn = document.getElementById('update-status');
    const completeOrderBtn = document.getElementById('complete-order');
    const backButton = document.getElementById('back-button');

    // Get order ID from URL
    const orderId = window.location.pathname.split('/').pop();

    // Start Transit Button Handler
    if (startTransitBtn) {
        startTransitBtn.addEventListener('click', function() {
            if (confirm('Are you ready to start transit for this order?')) {
                // Here you would typically send a request to your server
                console.log('Starting transit for order:', orderId);
                // Redirect to orders page or refresh current page
                window.location.reload();
            }
        });
    }

    // Update Status Button Handler
    if (updateStatusBtn) {
        updateStatusBtn.addEventListener('click', function() {
            // Here you might open a modal or form to update progress
            const progress = prompt('Enter current progress (0-100)%:');
            if (progress !== null && !isNaN(progress) && progress >= 0 && progress <= 100) {
                // Here you would typically send a request to your server
                console.log('Updating progress for order:', orderId, 'Progress:', progress);
                // Refresh the page to show updated status
                window.location.reload();
            }
        });
    }

    // Complete Order Button Handler
    if (completeOrderBtn) {
        completeOrderBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to mark this order as completed?')) {
                // Here you would typically send a request to your server
                console.log('Completing order:', orderId);
                // Redirect to orders page
                window.location.href = '/transporter/orders';
            }
        });
    }

    // Back Button Handler
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.location.href = '/customer/orders';
        });
    }
});