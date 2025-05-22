
function submitBid(index, orderId) {
    
    const bidAmountString= document.getElementById(`bid-amount-${index}`).value;
    const notes = document.getElementById(`notes-${index}`).value;
    const bidCard = document.getElementById(`bid-card-${index}`)
    const currentBidString= bidCard.querySelector('.bid-price').getAttribute("data-original-price")
 const bidAmount = parseInt(bidAmountString);
 const currentBid = parseInt(currentBidString);
    console.log(orderId, bidAmount, notes);
  
    if (!bidAmount || isNaN(bidAmount) || bidAmount <= 0) {
        alert('Please enter a valid bid amount');
        return;
    }

    if(bidAmount>=currentBid){
        alert("Bid Amount must be less than current bid");
        return;
    }

    fetch('/transporter/submit-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({  
            orderId,
            bidAmount, 
            notes
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Bid submitted successfully!');
            refreshBids(); // Refresh the bids to show the updated list
        } else {
            alert(data.error || 'Error submitting bid');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit bid. Please try again.');
    });
}


function refreshBids() {
    window.location.reload();
}

function applyFilters() {
    const locationFilter = document.getElementById("location").value.toLowerCase();
    const vehicleTypeFilter = document.getElementById("vehicle-type").value.toLowerCase();
    const minPrice = document.getElementById("price-min").value ? parseFloat(document.getElementById("price-min").value) : 0;
    const maxPrice = document.getElementById("price-max").value ? parseFloat(document.getElementById("price-max").value) : Infinity;

    document.querySelectorAll(".bid-card").forEach(card => {
        const pickupLocation = card.querySelector(".bid-detail:nth-child(4) span:nth-child(2)").textContent.toLowerCase();
        const vehicleType = card.querySelector(".bid-detail:nth-child(7) span:nth-child(2)").textContent.toLowerCase();
        const price = parseFloat(card.querySelector(".bid-price").dataset.originalPrice);
        
        const matchesLocation = locationFilter === "" || pickupLocation.includes(locationFilter);
        const matchesVehicleType = vehicleTypeFilter === "" || vehicleType === vehicleTypeFilter;
        const matchesPrice = price >= minPrice && price <= maxPrice;

        if (matchesLocation && matchesVehicleType && matchesPrice) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    applyFilters();
});


