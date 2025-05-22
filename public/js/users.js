document.addEventListener("DOMContentLoaded", () => {
    let currentFilter = "Customer";
    let currentPage = 1;
    const pageSize = 10;

    const searchInput = document.getElementById("searchInput");
    const sortFilter = document.getElementById("sortFilter");

    function fetchUsers() {
        const searchTerm = searchInput.value.trim();
        const sortBy = sortFilter.value;

        fetch(`api/users?role=${currentFilter}&search=${searchTerm}`)
            .then(response => response.json())
            .then(data => {
                updateTable(data.users, currentFilter);
            })
            .catch(error => console.error("Error fetching users:", error));
    }

    function updateTable(users, role) {
        const tableBody = document.querySelector(".users-table tbody");
        tableBody.innerHTML = "";

        if (users.length === 0) {
            const row = document.createElement("div");
            row.innerHTML = `<p style="text-align:center"> No Users Found </p>`;
            tableBody.appendChild(row);
        }

        if (role === 'Customer') {
            users.forEach(user => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.customer_id}</td>
                    <td>${user.first_name} ${user.last_name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${user.noOfOrders}</td>
                    <td>
                        <div class="action-icons">
                            <span class="action-icon delete-icon" onclick="deleteUser('${user.customer_id}')"></span>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            users.forEach(user => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.transporter_id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.primary_contact || 'N/A'}</td>
                    <td>${user.noOfOrders}</td>
                    <td>
                        <div class="action-icons">
                            <span class="action-icon delete-icon" onclick="deleteUser('${user.transporter_id}')"></span>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    window.deleteUser = function (user_id) {
        if (!confirm("Are you sure you want to delete this user?")) {
            return;
        }

        fetch(`/admin/users/delete/${currentFilter}/${user_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
     
            

.then(response => {
            if (!response.ok) throw new Error('Failed to delete user');
            alert('User deleted successfully.');
            fetchUsers();
        })
        .catch(error => {
            console.error("Error deleting user:", error);
            alert('Could not delete user. Please try again.');
        });
    };

    window.filterUsers = function (role) {
        currentFilter = role;
        document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
        document.getElementById(role === "Customer" ? "customersTabBtn" : "transportersTabBtn").classList.add("active");
        currentPage = 1;
        fetchUsers();
    }

    window.applyFilters = function () {
        currentPage = 1;
        fetchUsers();
    }

    sortFilter.addEventListener("change", fetchUsers);
});