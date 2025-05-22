document.addEventListener('DOMContentLoaded', function() {
    const ordersGrid = document.querySelector('.orders-grid');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search');
    const orders = document.querySelectorAll('.order-card');

    // Function to filter orders
    function filterOrders() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedStatus = statusFilter.value.toLowerCase().replace('-', ' ');

        orders.forEach(order => {
            const orderStatus = order.querySelector('.status-badge').textContent.trim().toLowerCase();
            const orderText = order.textContent.toLowerCase();
            const statusMatch = selectedStatus === 'all' || orderStatus === selectedStatus;
            const searchMatch = orderText.includes(searchTerm);

            if (statusMatch && searchMatch) {
                order.style.display = '';
            } else {
                order.style.display = 'none';
            }
        });
    }

    // Event listeners for filter and search
    statusFilter.addEventListener('change', filterOrders);
    searchInput.addEventListener('input', filterOrders);

    // Action buttons handlers
    const actionButtons = document.querySelectorAll('.action-buttons');
    actionButtons.forEach(container => {


        // View Details button handler
        const viewDetailsBtn = container.querySelector('.view-details');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', function() {
                const orderCard = this.closest('.order-card');
                const orderId = orderCard.dataset.id;
                // Redirect to the order info page with the order ID
                window.location.href = `/transporter/order/${orderId}`;
            });
        }
        const trackOrderBtn = container.querySelector('.track-order');
        if (trackOrderBtn) {
            trackOrderBtn.addEventListener('click', function() {
                const orderCard = this.closest('.order-card');
                const orderId = orderCard.dataset.id;
                window.location.href = `/transporter/track/${orderId}`;
            });
        }

        const startTransitBtn = container.querySelector('.start-transit');

        if (startTransitBtn) {
        startTransitBtn.addEventListener('click', function() {
                const orderId = this.closest('.order-card').dataset.id;
                const confirmStart = confirm(`Do you want to start transit for order #${orderId}?`);
                if (confirmStart){
                    console.log(`Start Transit order: ${orderId}`);

                    fetch(`start-transit/${orderId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert(data.message)
                            window.location.href = `/transporter/track/${orderId}`;
                        } else {
                            alert("Error");
                        }
                    })
                    .catch(error => console.error('Error:', error));
                }
            });
        }

    });
});