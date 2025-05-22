document.addEventListener('DOMContentLoaded', async function () {
    // DOM Elements
    const tableBody = document.querySelector('.orders-table tbody');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const fromDate = document.getElementById('fromDate');
    const toDate = document.getElementById('toDate');
    const applyBtn = document.getElementById('applyBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const adminModal = document.getElementById('orderModal');
    const closeModal = document.querySelector('.close-admin-modal');
    const closeBtn = document.querySelector('.close-btn');

    // Close modal when clicking X or close button
    document.querySelector('.close-admin-modal').addEventListener('click', () => {
        document.getElementById('orderModal').style.display = 'none';
    });

    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('orderModal').style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('orderModal')) {
            document.getElementById('orderModal').style.display = 'none';
        }
    });

    // Format date for display
    function formatDisplayDate(dateString) {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    // Fetch all orders from the database
    async function fetchOrders() {
        try {
            const response = await fetch('/admin/orders-data');
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }

    // Fetch order details
    async function fetchOrderDetails(orderId) {
        try {
            const response = await fetch(`/admin/orders/${orderId}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching order details:', error);
            return null;
        }
    }

    // Fetch bids for a specific order
    async function fetchBids(orderId) {
        try {
            const response = await fetch(`/admin/orders/${orderId}/bids`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching bids:', error);
            return [];
        }
    }

    // Render orders in the table
    async function renderOrders(orders) {
        const tableBody = document.querySelector('.orders-table tbody');
        tableBody.innerHTML = '';

        if (orders.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-results">No orders found</td>
                </tr>
            `;
            return;
        }

        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#ORD-${order.order_id}</td>
                <td>${order.customer_name || 'N/A'}</td>
                <td>${order.pickup_city}, ${order.pickup_state}</td>
                <td>${order.delivery_city}, ${order.delivery_state}</td>
                <td>${new Date(order.order_date).toLocaleDateString()}</td>
                <td><span class="status-badge ${order.status.toLowerCase()}">${order.status}</span></td>
                <td><button class="view-btn" data-order-id="${order.order_id}">View Details</button></td>
            `;
            tableBody.appendChild(row);
        });

        // Add click event to view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const orderId = btn.getAttribute('data-order-id');
                await showOrderDetails(orderId);
            });
        });
    }

    // Get bid count for an order
    async function getBidCount(orderId) {
        try {
            const response = await fetch(`/admin/orders/${orderId}/bid-count`);
            if (!response.ok) {
                throw new Error('Failed to fetch bid count');
            }
            const data = await response.json();
            return data.count || 0;
        } catch (error) {
            console.error('Error fetching bid count:', error);
            return 0;
        }
    }

    // Show order details in modal
    async function showOrderDetails(orderId) {
        try {
            // Fetch order details
            const order = await fetchOrderDetails(orderId);
            const bids = await fetchBids(orderId);

            console.log(order);
            
            if (!order) {
                throw new Error('Failed to load order details');
            }

            // Helper function for safe property access
            const getSafeValue = (value, fallback = 'N/A') => {
                return value !== null && value !== undefined ? value : fallback;
            };

            // Populate order details with null checks
            document.getElementById('admin-modalOrderId').textContent = `#ORD-${orderId}`;
            document.getElementById('detail-customer').textContent = getSafeValue(order.data.customer_name);
            document.getElementById('detail-pickup').textContent = [
                getSafeValue(order.data.pickup_street, '').trim(),
                getSafeValue(order.data.pickup_city, '').trim(),
                getSafeValue(order.data.pickup_state, '').trim(),
                getSafeValue(order.data.pickup_zip, '').trim()
            ].filter(Boolean).join(', ') || 'N/A';

            document.getElementById('detail-delivery').textContent = [
                getSafeValue(order.data.delivery_street, '').trim(),
                getSafeValue(order.data.delivery_city, '').trim(),
                getSafeValue(order.data.delivery_state, '').trim(),
                getSafeValue(order.data.delivery_zip, '').trim()
            ].filter(Boolean).join(', ') || 'N/A';

            document.getElementById('detail-date').textContent = order.data.order_date
                ? new Date(order.data.order_date).toLocaleDateString()
                : 'N/A';

            const statusElement = document.getElementById('detail-status');
            statusElement.innerHTML = '';
            const statusBadge = document.createElement('span');
            const orderStatus = getSafeValue(order.data.status, 'pending').toString().toLowerCase();
            statusBadge.className = `status-badge ${orderStatus}`;
            statusBadge.textContent = getSafeValue(order.data.status, 'Pending');
            statusElement.appendChild(statusBadge);

            // Populate bids table with null checks
            const bidsBody = document.getElementById('bids-table-body');
            bidsBody.innerHTML = '';

            if (!bids || bids.length === 0) {
                bidsBody.innerHTML = `
                    <tr>
                        <td colspan="5">No bids available</td>
                    </tr>
                `;
            } else {
                bids.forEach(bid => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${getSafeValue(bid.transporter_name)}</td>
                        <td>${bid.bid_amount ? `$${bid.bid_amount.toFixed(2)}` : 'N/A'}</td>
                        <td>${bid.bid_time ? new Date(bid.bid_time).toLocaleString() : 'N/A'}</td>
                    `;
                    bidsBody.appendChild(row);
                });
            }

            // Show modal
            document.getElementById('orderModal').style.display = 'flex';
        } catch (error) {
            console.error('Error showing order details:', error);
            alert(`Error: ${error.message}`);
            document.getElementById('orderModal').style.display = 'none';
        }
    }

    // Initialize the page
    async function init() {
        const orders = await fetchOrders();
        await renderOrders(orders);
    }

    // Apply filters
    applyBtn.addEventListener('click', async () => {
        const status = statusFilter.value;
        const searchTerm = searchInput.value.toLowerCase();

        const orders = await fetchOrders();
        const filtered = orders.filter(order => {
            const matchesStatus = !status || order.status.toLowerCase() === status.toLowerCase();
            const matchesSearch = !searchTerm ||
                (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm)) ||
                (order.pickup_city && order.pickup_city.toLowerCase().includes(searchTerm)) ||
                (order.delivery_city && order.delivery_city.toLowerCase().includes(searchTerm)) ||
                (`ord-${order.order_id}`.includes(searchTerm));
            let statusMatched;
            if (statusFilter.value === "") {
                statusMatched = true;
            } else {
                statusMatched = (order.status === statusFilter.value);
            }

            return (matchesStatus && matchesSearch) && statusMatched;
        });

        renderOrders(filtered);
    });

    refreshBtn.addEventListener('click', init);

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });

    document.querySelector('.close-admin-modal').addEventListener('click', () => {
        adminModal.style.display = 'none';
    });

    // Initialize the page
    init();
});