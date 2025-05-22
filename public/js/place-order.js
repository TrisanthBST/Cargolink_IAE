function validatePlaceOrderForm(event) {

    event.preventDefault();
  
  // Get field values
  const pickupStreet = document.getElementById('pickup-street').value.trim();
  const pickupCity = document.getElementById('pickup-city').value.trim();
  const pickupState = document.getElementById('pickup-state').value.trim();
  const pickupZip = document.getElementById('pickup-zip').value.trim();

  const dropoffStreet = document.getElementById('dropoff-street').value.trim();
  const dropoffCity = document.getElementById('dropoff-city').value.trim();
  const dropoffState = document.getElementById('dropoff-state').value.trim();
  const dropoffZip = document.getElementById('dropoff-zip').value.trim();

  const pickupDateStr = document.getElementById('pickup-date').value;
  const pickupTimeStr = document.getElementById('pickup-time').value;
  const distance = document.getElementById('distance').value;
  const goodsType = document.getElementById('goods-type').value;
  const vehicleType = document.getElementById('vehicle-type').value;
  const weight = parseFloat(document.getElementById('weight').value);
  const cargoDescription = document.getElementById('cargo-description').value.trim();
  const maxPrice = parseFloat(document.getElementById('max-price').value);
  const numItems = parseInt(document.getElementById('num-item-types').value, 10);
  
    const pincodeRegex = /^[1-9][0-9]{5}$/;
  
    // Pickup and Drop-off Locations must be non-empty
    if (!pickupStreet || !pickupCity || !pickupState || !pickupZip){
        showError('Pickup Address is incomplete');
        return;
    } else if (!pincodeRegex.test(pickupZip)) {
        showError('Invalid Pickup Pincode');
        return;
    }

    if (!dropoffStreet || !dropoffCity || !dropoffState || !dropoffZip){
        showError('Dropoff Address is incomplete');
        return;
    } else if (!pincodeRegex.test(dropoffZip)) {
        showError('Invalid Dropoff Pincode');
        return;
    }
    
    // Pickup Date must be provided and not in the past
    if (!pickupDateStr) {
        showError("Pickup Date is required.");
        return false;
    } else {
        const pickupDate = new Date(pickupDateStr);
        const currentDatePlus4 = new Date();
        currentDatePlus4.setDate(currentDatePlus4.getDate() + 4);
        currentDatePlus4.setHours(0, 0, 0, 0); // Normalize time to midnight
        
        pickupDate.setHours(0, 0, 0, 0); // Normalize time to midnight
        if (pickupDate < currentDatePlus4) {
            showError("Pickup Date must be later than 4 days from today");
            return false;
        }        
    }

    // Pickup Time must be provided
    if (!pickupTimeStr) {
        showError("Pickup Time is required.");
        return false;
    }

    // Distance must be provided
    if (!distance) {
        showError("Distance is required.");
        return false;
    }
    
    // Goods Type must be selected
    if (!goodsType) {
        showError("Please select a Type of Goods.");
        return false;
    }
    
    // Vehicle Type must be selected
    if (!vehicleType) {
        showError("Please select a Vehicle Type Required.");
        return false;
    }
    
    // Weight must be a positive number
    if (isNaN(weight) || weight <= 0) {
        showError("Weight must be a positive number.");
        return false;
    }
    
    // Cargo Description must not be empty
    if (!cargoDescription) {
        showError("Cargo Description is required.");
        return false;
    }
    
    // Maximum Price must be a positive number
    if (isNaN(maxPrice) || maxPrice <= 0) {
        showError("Maximum Price must be a positive number.");
        return false;
    }
    
    if (isNaN(numItems) || numItems <= 0) {
        showError("Number of Item Types must be a positive integer.");
        return false;
    }

    for (let i = 1; i <= numItems; i++) {
        const name = document.querySelector(`input[name="item-${i}-name"]`).value.trim();
        const quantity = document.querySelector(`input[name="item-${i}-quantity"]`).value;
        const price = parseFloat(document.querySelector(`input[name="item-${i}-price"]`).value);
        if (!name) {
            showError(`Item ${i} Name is required.`);
            return false;
        }
        if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
            showError(`Item ${i} Quantity must be a positive integer.`);
            return false;
        }
        if (!price || isNaN(price) || parseInt(price) <= 0) {
            showError(`Item ${i} Price must be a positive integer.`);
            return false;
        }
    }
    
    submitOrder();
    return true;
}

function submitOrder() {
    const button = document.getElementById("submitButton");
    button.disabled = true
    // Collect pickup and drop-off details
    const pickupStreet = document.getElementById("pickup-street").value;
    const pickupCity = document.getElementById("pickup-city").value;
    const pickupState = document.getElementById("pickup-state").value;
    const pickupZip = document.getElementById("pickup-zip").value;

    const dropoffStreet = document.getElementById("dropoff-street").value;
    const dropoffCity = document.getElementById("dropoff-city").value;
    const dropoffState = document.getElementById("dropoff-state").value;
    const dropoffZip = document.getElementById("dropoff-zip").value;

    const pickupDate = document.getElementById("pickup-date").value;
    const pickupTime = document.getElementById("pickup-time").value;
    const distance = document.getElementById("distance").value;

    // Collect cargo information
    const goodsType = document.getElementById("goods-type").value;
    const vehicleType = document.getElementById("vehicle-type").value;
    const weight = document.getElementById("weight").value;;
    const cargoDescription = document.getElementById("cargo-description").value;

    // Collect pricing details
    const maxPrice = document.getElementById("max-price").value;

    const numItems = parseInt(document.getElementById('num-item-types').value, 10);
    const items = [];
    for (let i = 1; i <= numItems; i++) {
        const name = document.querySelector(`input[name="item-${i}-name"]`).value;
        const quantity = parseInt(document.querySelector(`input[name="item-${i}-quantity"]`).value, 10);
        const price = parseFloat(document.querySelector(`input[name="item-${i}-price"]`).value);
        items.push({ name, quantity, price });
    }

    // Prepare data object
    const orderData = {
        pickup: {
            street: pickupStreet,
            city: pickupCity,
            state: pickupState,
            zip: pickupZip,
        },
        delivery: {
            street: dropoffStreet,
            city: dropoffCity,
            state: dropoffState,
            zip: dropoffZip,
        },
        transit: {
            date: pickupDate,
            time: pickupTime,
            distance: distance,
        },
        cargo: {
            type: goodsType,
            vehicle: vehicleType,
            weight: weight,
            description: cargoDescription,
            maxPrice: maxPrice,
        },
        shipments: items,
    };



    fetch('/customer/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        //redirecting to orders
        setTimeout(() => {
            window.location.href = '/customer/orders';
        }, 1000);
        
        if (data.error) {
            showError(data.error);
        } else {
            showNotification("Order Placed Successfully!", true);
        }
    })
    .catch(error => {
        console.error('Error:', error); 
        button.disabled = false;});
}

// New function to calculate bidding end time (2 days prior to pickup)
function updateBiddingEndTime() {
    const pickupDateStr = document.getElementById('pickup-date').value;
    const pickupTimeStr = document.getElementById('pickup-time').value;
    const countdownTimer = document.querySelector('.countdown-timer');

    if (!pickupDateStr || !pickupTimeStr) {
        countdownTimer.textContent = 'Please select pickup date and time';
        return;
    }

    // Combine date and time into a single Date object
    const [hours, minutes] = pickupTimeStr.split(':').map(Number);
    const pickupDate = new Date(pickupDateStr);
    pickupDate.setHours(hours, minutes, 0, 0);

    // Calculate bidding end time (2 days prior)
    const biddingEndDate = new Date(pickupDate);
    biddingEndDate.setDate(pickupDate.getDate() - 2);

    // Format the bidding end time
    countdownTimer.textContent = biddingEndDate.toLocaleString([], {
        year: 'numeric',
        month: 'long',  
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    // Add event listeners for pickup date and time changes
    document.getElementById('pickup-date').addEventListener('change', updateBiddingEndTime);
    document.getElementById('pickup-time').addEventListener('change', updateBiddingEndTime);

    // Initial update
    updateBiddingEndTime();
});

function showNotification(message, isSuccess = true) {
    const notification = document.createElement('div');
    notification.className = isSuccess ? 'notification success' : 'notification error';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

function getRecommendedVehicleType(goodsType, weight) {
    weight = parseFloat(weight);
    if (isNaN(weight)) return 'any';

    switch (goodsType) {
        case 'general':
            if (weight < 1) return 'van';
            else if (weight < 5) return 'truck-small';
            else if (weight < 10) return 'truck-medium';
            else return 'truck-large';
        case 'fragile':
            if (weight < 5) return 'truck-small';
            else return 'truck-medium';
        case 'perishable':
            return 'refrigerated';
        case 'hazardous':
            return 'container';
        case 'machinery':
            if (weight < 10) return 'flatbed';
            else return 'truck-large';
        case 'furniture':
            if (weight < 5) return 'truck-small';
            else return 'truck-medium';
        case 'agricultural':
            if (weight < 10) return 'truck-medium';
            else return 'truck-large';
        case 'construction':
            return 'flatbed';
        case 'other':
        default:
            return 'any';
    }
}

function updateVehicleTypeRecommendation() {
    const goodsType = document.getElementById('goods-type').value;
    const weight = document.getElementById('weight').value;
    const recommendedType = getRecommendedVehicleType(goodsType, weight);
    document.getElementById('vehicle-type').value = recommendedType;
}

function updateMaxPrice() {
    const distance = parseFloat(document.getElementById('distance').value);
    if (isNaN(distance) || distance <= 0) {
        document.getElementById('max-price').value = '';
        return;
    }

    let pricePerKm;
    if (distance <= 1000) {
        pricePerKm = 30;
    } else if (distance <= 2000) {
        pricePerKm = 28;
    } else {
        pricePerKm = 25;
    }

    const maxPrice = distance * pricePerKm;
    document.getElementById('max-price').value = maxPrice.toFixed(2);
}

function generateItemFields() {
    const numItems = parseInt(document.getElementById('num-item-types').value, 10);
    const container = document.getElementById('item-details-container');
    container.innerHTML = ''; // Clear existing fields

    if (isNaN(numItems) || numItems <= 0) return;

    for (let i = 1; i <= numItems; i++) {
        const itemRow = document.createElement('div');
        itemRow.className = 'form-row';

        const nameGroup = document.createElement('div');
        nameGroup.className = 'form-group';
        const nameLabel = document.createElement('label');
        nameLabel.className = 'form-label';
        nameLabel.textContent = `Item ${i} Name`;
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'input-field';
        nameInput.name = `item-${i}-name`;
        nameInput.placeholder = 'Item name';
        nameInput.required = true;
        nameGroup.appendChild(nameLabel);
        nameGroup.appendChild(nameInput);

        const quantityGroup = document.createElement('div');
        quantityGroup.className = 'form-group';
        const quantityLabel = document.createElement('label');
        quantityLabel.className = 'form-label';
        quantityLabel.textContent = `Item ${i} Quantity`;
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.className = 'input-field';
        quantityInput.name = `item-${i}-quantity`;
        quantityInput.placeholder = 'Quantity';
        quantityInput.min = '1';
        quantityInput.required = true;
        quantityGroup.appendChild(quantityLabel);
        quantityGroup.appendChild(quantityInput);

        itemRow.appendChild(nameGroup);
        itemRow.appendChild(quantityGroup);

        container.appendChild(itemRow);

        const priceGroup = document.createElement('div');
        priceGroup.className = 'form-group';
        const priceLabel = document.createElement('label');
        priceLabel.className = 'form-label';
        priceLabel.textContent = `Item ${i} Price`;
        const priceInput = document.createElement('input');
        priceInput.type = 'number';
        priceInput.className = 'input-field';
        priceInput.name = `item-${i}-price`;
        priceInput.placeholder = 'Price';
        priceInput.min = '0';
        priceInput.step = '0.01';
        priceInput.required = true;
        priceGroup.appendChild(priceLabel);
        priceGroup.appendChild(priceInput);
        itemRow.appendChild(priceGroup);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('goods-type').addEventListener('change', updateVehicleTypeRecommendation);
    document.getElementById('weight').addEventListener('input', updateVehicleTypeRecommendation);
    document.getElementById('distance').addEventListener('input', updateMaxPrice);
    document.getElementById('num-item-types').addEventListener('input', generateItemFields);
});