document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed'); // Debug log to confirm script execution

    const ordersGrid = document.querySelector('.orders-grid');
    const statusFilter = document.getElementById('status-filter');
    const searchInput = document.getElementById('search');
    const orders = document.querySelectorAll('.order-card');
    const modal = document.getElementById('bids-modal');
    const closeModal = document.querySelector('.close-modal');
    const bidsTableBody = document.getElementById('bids-table-body');

    // Verify DOM elements exist
    console.log('Modal element:', modal); // Debug log
    console.log('Close modal element:', closeModal); // Debug log
    console.log('Bids table body element:', bidsTableBody); // Debug log
    console.log('Order cards found:', orders.length); // Debug log

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

    // Function to show the modal with bids
    function showBidsModal(bids) {
        console.log('Showing bids modal with data:', bids); // Debug log
        if (!bidsTableBody) {
            console.error('Bids table body element not found');
            return;
        }
        if (!modal) {
            console.error('Modal element not found');
            return;
        }

        bidsTableBody.innerHTML = ''; // Clear existing content

        bids.forEach(bid => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${bid.serialNumber}</td>
                <td>${bid.transporter_id}</td>
                <td>₹${bid.bid_amount}</td>
                <td>${bid.bid_time}</td>
                <td>${bid.notes}</td>
            `;
            bidsTableBody.appendChild(row);
        });

        console.log('Setting modal display to flex'); // Debug log
        modal.style.display = 'flex';
    }

    // Close modal when clicking the close button
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            console.log('Close modal clicked'); // Debug log
            if (modal) {
                modal.style.display = 'none';
            }
        });
    } else {
        console.error('Close modal element not found');
    }

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            console.log('Clicked outside modal'); // Debug log
            if (modal) {
                modal.style.display = 'none';
            }
        }
    });

    // Action buttons handlers
    const actionButtons = document.querySelectorAll('.action-buttons');
    console.log('Action buttons containers found:', actionButtons.length); // Debug log

    actionButtons.forEach(container => {
        // Bids Placed button handler
        const bidsPlacedBtn = container.querySelector('.bids-placed');
        if (bidsPlacedBtn) {
            console.log('Bids Placed button found in container'); // Debug log
            bidsPlacedBtn.addEventListener('click', async function(event) {
                event.preventDefault(); // Prevent any default behavior
                console.log('Bids Placed button clicked'); // Debug log
                const orderId = this.closest('.order-card').dataset.id;
                console.log('Order ID:', orderId); // Debug log

                try {
                    const response = await fetch(`/customer/order/${orderId}/bids`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        credentials: 'include' // Include cookies for session authentication
                    });
                    console.log('Fetch response status:', response.status); // Debug log
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Fetch response error text:', errorText); // Debug log
                        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
                    }
                    const data = await response.json();
                    console.log('Fetch response data:', data); // Debug log

                    if (data.success) {
                        showBidsModal(data.bids);
                    } else {
                        console.error('Failed to fetch bids:', data.message);
                        alert(data.message || 'Failed to fetch bids');
                    }
                } catch (error) {
                    console.error('Error fetching bids:', error);
                    alert('An error occurred while fetching bids: ' + error.message);
                }
            });
        }

        // Cancel Order button handler
        const cancelOrderBtn = container.querySelector('.cancel-order');
        if (cancelOrderBtn) {
            cancelOrderBtn.addEventListener('click', function() {
                const orderId = this.closest('.order-card').dataset.id;
                if (confirm('Are you sure you want to cancel this order?')) {
                    console.log('Cancelling order:', orderId);
                    // Add your cancel order logic here
                }
            });
        }

        // View Details button handler
        const viewDetailsBtn = container.querySelector('.view-details');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', function() {
                const orderId = this.closest('.order-card').dataset.id;
                window.location.href = `/customer/order/${orderId}`;
            });
        }
    });

    // Add event listener for view details buttons
    document.querySelectorAll('.view-details-full').forEach(button => {
        button.addEventListener('click', function(e) {
            const orderId = this.closest('.order-card').dataset.id;
            window.location.href = `/customer/order/${orderId}`;
        });
    });
});