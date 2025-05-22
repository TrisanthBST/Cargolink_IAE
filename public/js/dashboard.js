document.addEventListener('DOMContentLoaded', () => {
    // Get dashboard data
    
    const dashboardContainer = document.querySelector('.dashboard-container');
    const dashboardDataStr = dashboardContainer.getAttribute('data-dashboard');
    console.log('Raw dashboard data:', dashboardDataStr);
    
    const dashboardData = JSON.parse(dashboardDataStr);
    console.log('Parsed dashboard data:', dashboardData);

    // Top Transporters Chart
    const transportersCtx = document.getElementById('transportersChart');
    if (transportersCtx) {
        console.log('Initializing Top Transporters chart');
        const transporterLabels = dashboardData.topTransporters.map(item => item.name);
        const transporterData = dashboardData.topTransporters.map(item => item.total_orders);
        new Chart(transportersCtx, {
            type: 'bar',
            data: {
                labels: transporterLabels,
                datasets: [{
                    label: 'Orders Completed',
                    data: transporterData,
                    backgroundColor: 'rgb(255, 99, 132)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    const customersCtx = document.getElementById('customersChart');
    if (customersCtx) {
        console.log('Initializing New Customers chart');
        // Assume dashboardData.newCustomers is an array of objects with month and new_customers keys
        const customerLabels = dashboardData.newCustomersPerMonth.map(item => item.month);
        const customerData = dashboardData.newCustomersPerMonth.map(item => item.new_customers);
        new Chart(customersCtx, {
            type: 'bar',
            data: {
                labels: customerLabels,
                datasets: [{
                    label: 'New Customers',
                    data: customerData,
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
    
    
    const truckTypesCtx = document.getElementById('truckTypesChart');
    if (truckTypesCtx) {
        console.log('Initializing Truck Types chart');
        // Assume dashboardData.truckTypes is an array of objects with truck_type and total_orders keys
        const truckTypeLabels = dashboardData.truckTypes.map(item => item.truck_type);
        const truckTypeData = dashboardData.truckTypes.map(item => item.total_orders);
        new Chart(truckTypesCtx, {
            type: 'bar',
            data: {
                labels: truckTypeLabels,
                datasets: [{
                    label: 'Number of Requests',
                    data: truckTypeData,
                    backgroundColor: 'rgb(75, 192, 192)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Orders per Day Chart
    const ordersCtx = document.getElementById('ordersChart');
    if (ordersCtx) {
        new Chart(ordersCtx, {
            type: 'bar',
            data: {
                labels: dashboardData.ordersPerDay.map(item => item.order_day),
                datasets: [{
                    label: 'Orders Count',
                    data: dashboardData.ordersPerDay.map(item => item.total_orders),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: dashboardData.revenuePerDay.map(item => item.order_day),
                datasets: [{
                    label: 'Revenue',
                    data: dashboardData.revenuePerDay.map(item => item.total_revenue),
                    borderColor: 'rgb(54, 162, 235)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Order Ratio Chart
    const pieLabels = dashboardData.orderStatusDistribution.map(item => item.status);
    const pieData = dashboardData.orderStatusDistribution.map(item => item.count);
    
    new Chart(document.getElementById('orderRatioChart').getContext('2d'), {
        type: 'pie',
        data: {
            labels: pieLabels,
            datasets: [{
                data: pieData,
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(153, 102, 255)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
    
});


async function initializeDashboard() {
    try {
        // Show loading state
        showLoadingState();
        
        // Fetch all dashboard data
        const dashboardData = await fetchDashboardData();
        
        // Update stats
        updateDashboardStats(dashboardData);
        
        // Initialize all charts
        initializeCharts(dashboardData);
        
        // Load orders table
    loadOrders();
  
        // Initialize form handlers
        initializeFormHandlers();
        
        // Hide loading state
        hideLoadingState();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showError('Failed to load dashboard data. Please refresh the page.');
    }
}

async function fetchDashboardData() {
    try {
        const response = await fetch('/dashboard/stats');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
}

function updateDashboardStats(data) {
    document.getElementById('totalOrders').textContent = data.totalOrders;
    document.getElementById('totalRevenue').textContent = `$${(data.totalRevenue).toLocaleString()}`;
    document.getElementById('newCustomers').textContent = data.newCustomers;
    document.getElementById('pendingOrders').textContent = data.pendingOrders;
}

function initializeCharts(data) {
    renderLineChart('ordersChart', data.ordersPerDay.map(item => item.order_day), data.ordersPerDay.map(item => item.total_orders), 'Orders Count', 'rgb(75, 192, 192)');
    renderLineChart('revenueChart', data.revenuePerDay.map(item => item.order_day), data.revenuePerDay.map(item => item.total_revenue), 'Revenue', 'rgb(54, 162, 235)');
    renderBarChart('transportersChart', data.topTransporters.map(item => item.name), data.topTransporters.map(item => item.total_orders), 'Total Orders', 'rgb(255, 99, 132)');
    renderLineChart('customersChart', data.newCustomers.map(item => item.month), data.newCustomers.map(item => item.new_customers), 'New Customers', 'rgb(153, 102, 255)');
    renderBarChart('truckTypesChart', data.truckTypes.map(item => item.truck_type), data.truckTypes.map(item => item.total_orders), 'Total Orders', 'rgb(255, 159, 64)');
    renderPieChart('orderRatioChart', ['Pending', 'Completed'], [data.orderStatusDistribution.Pending, data.orderStatusDistribution.Completed], 'Order Status');
}

function renderLineChart(canvasId, labels, data, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: color,
                backgroundColor: color + '20',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function renderBarChart(canvasId, labels, data, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: color,
                borderColor: color,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

function renderPieChart(canvasId, labels, data, label) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(153, 102, 255)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

async function loadOrders() {
    try {
        const response = await fetch('/orders');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const orders = await response.json();
        renderOrdersTable(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('Failed to load orders. Please try again.');
    }
}

  
    function renderOrdersTable(orders) {
      const tbody = document.querySelector('#ordersTable tbody');
tbody.innerHTML = '';

if (orders.length === 0) {
    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="no-data">No orders found</td>
        </tr>
    `;
    return;
}

      orders.forEach(order => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', order.orderId);
        row.innerHTML = `
          <td>${order.orderId}</td>
          <td>${order.customerName}</td>
          <td>$${Number(order.finalPrice).toLocaleString()}</td>
          <td>${order.status}</td>
          <td>
          <button class="btn-edit edit-order">Edit</button>
          <button class="btn-delete delete-order">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }
  
function showLoadingState() {
    document.querySelectorAll('.chart-container').forEach(container => {
        container.classList.add('loading');
    });
}

function hideLoadingState() {
    document.querySelectorAll('.chart-container').forEach(container => {
        container.classList.remove('loading');
    });
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.dashboard-container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.dashboard-container').prepend(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
}

  