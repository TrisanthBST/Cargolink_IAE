
const {asyncHandler} = require('./utils');
const Transporter = require('../models/transporter')
const Order = require('../models/order')
const authController = require('../controller/authController') 



const signup = asyncHandler(async (req, res) => {
    
    const {  name, email, primary_contact, secondary_contact, password, pan, gst_in, street_address, city, state, pin, vehicles} = req.body;

    const transporterData = { name, gst_in, pan, street_address, city, state,pin, primary_contact, secondary_contact, email, password};

    const existing = await Transporter.findOne({email: transporterData.email});
    if (existing) {
        return res.status(400).json({ error: 'Email is already in use' });
    }
    
    const transporter = new Transporter(transporterData);
    await transporter.save();
  
  if (transporter.error) {
      return res.status(400).json({ error: transporter.error });
  }
  
  // Loop through each vehicle submitted and add a corresponding truck record.
  if (vehicles && Array.isArray(vehicles)) {
      for (let vehicle of vehicles) {
          // Map the vehicle data fields.
          const truckData = {
              name: vehicle.name,                        
              registration: vehicle.registration,                
              capacity: vehicle.capacity,
              manufacture_year: vehicle.manufacture_year,        
              truck_type: vehicle.truck_type ,     
              last_service_date: new Date().toISOString().split('T')[0] 
          };

          // Add the truck to the Fleet table
          transporter.fleet.push(truckData);
          truckResult = await transporter.save();
          
          if (truckResult.error) {
              console.error('Error adding truck:', truckResult.error);
          } else {
              console.log('Truck added:', truckResult);
          }
      }
  }
  return res.json({success: "Sign up successful"});
});

const loadProfile = asyncHandler(async (req, res) => {
    const transporter_id = authController.getTransporterId(req);
    const transporter = await Transporter.findById(transporter_id).select('-password');
    if (!transporter) {
        return res.status(404).send('Transporter not found');
    }

    const orderCount = await Order.countDocuments({ transporter_id: transporter._id });

    // Build transporter data
    const transporterData = {
        profileImage: '/images/default-avatar.png', // Default profile image
        companyName: transporter.name,
        email: transporter.email,
        phone: transporter.primary_contact,
        secondaryContact: transporter.secondary_contact,
        gstNumber: transporter.gst_in,
        panNumber: transporter.pan,
        address: transporter.street_address,
        city: transporter.city,
        state: transporter.state,
        pinCode: transporter.pin,
        memberSince: transporter.memberSince,
        totalDeliveries: orderCount,
        status: 'Active',
        vehicleCount: transporter.fleet.length,
    };

    res.render('transporter/profile', { 
        transporter: transporterData,
        pageTitle: 'My Profile',
        title: 'Transporter Profile - CargoLink'
    });
});

const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const transporter_id = authController.getTransporterId(req); 
      
    const transporter = await Transporter.findById(transporter_id);
    if (!transporter) {
        return res.status(404).json({ error: 'Transporter not found' });
    }

    const isMatch = await transporter.verifyPassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
    }
    transporter.updatePassword(newPassword); 
    
    res.json({ success: true, message: 'Password updated successfully' });
});


const updateProfile = asyncHandler(async (req, res) => {
    const transporter_id = authController.getTransporterId(req);
    const updates = req.body;
    console.log("Updates: ", updates);

    const updatedTransporter = await Transporter.findByIdAndUpdate(
        transporter_id,
        updates,
        { new: true, runValidators: true }
    );

    console.log("Updated: ", updatedTransporter);
    
 
    if (!updatedTransporter) {
        return res.status(404).send('Transporter not found');
    }
    res.status(200).json({ message: 'Profile updated', data: updatedTransporter });

});

const getFleet = asyncHandler(async (req, res) => {
    const transporter_id = authController.getTransporterId(req); 
    const result = await Transporter.findById(transporter_id).select('fleet');

    // Format the fleet data for better display
    const formattedFleet = result.fleet.map(truck => ({
        truck_id: truck._id,
        name: truck.name,
        registration: truck.registration,
        capacity: truck.capacity,
        manufacture_year: truck.manufacture_year,
        truck_type: truck.truck_type,
        status: truck.status,
        last_service_date: truck.last_service_date,
        next_service_date: truck.next_service_date,
        current_order_id: truck.current_order_id
    }));
    
    res.render('transporter/fleet', { 
        title: 'My Fleet - CargoLink',
        pageTitle: 'My Fleet',
        fleet: formattedFleet
    });

});

const getTruck = asyncHandler(async (req, res) => {
    const transporter_id = authController.getTransporterId(req); 
    const truck_id = req.params.id;

    const truckData = await Transporter.findOne({
      _id: transporter_id,
      'fleet._id': truck_id
    }, {'fleet.$': 1});
    
    if (truckData.fleet.length == 0){
        return res.status(404).json({ error: 'Truck not found' });
    }

    const truck = truckData.fleet[0]
    // Format the truck data for better display
    const formattedTruck = {
        truck_id: truck.truck_id,
        name: truck.name,
        registration: truck.registration,
        capacity: truck.capacity,
        manufacture_year: truck.manufacture_year,
        truck_type: truck.truck_type,
        status: truck.status,
        last_service_date: truck.last_service_date,
        next_service_date: truck.next_service_date,
        current_order_id: truck.current_order_id
    };

    res.render('transporter/truck-details', {
        title: `${truck.name} Details - CargoLink`,
        truck: formattedTruck
    });
});

const deleteTruck = asyncHandler(async (req, res) => {
    const transporter_id = authController.getTransporterId(req); 
    const truck_id = req.params.id;


    const transporter = await Transporter.findById(transporter_id);
    if (!transporter) {
        return res.status(404).json({ error: 'Transporter not Found' })
    };
    
    const result = await Transporter.updateOne(
    { _id: transporter_id },
    { $pull: { fleet: { _id: truck_id } } }
    );
        
    console.log(result);
    
    res.json({ message: 'Truck Removed' });

});

const addTruck =  asyncHandler(async (req, res) => {
    const transporter_id = authController.getTransporterId(req);

    // Extract truck data from request body
    const truckData = {
        transporter_id,
        name: req.body.name,
        registration: req.body.registration,
        capacity: parseFloat(req.body.capacity),
        manufacture_year: parseInt(req.body.manufacture_year),
        truck_type: req.body.truck_type,
        status: 'Available',
        last_service_date: req.body.last_service_date
    };

    const result = await Transporter.updateOne(
      { _id: transporter_id },
      { $push: { fleet: truckData } }
    );

    res.status(201).json({
        message: 'Vehicle added successfully',
        truck: result
    });

});

const truckStatus = asyncHandler(async (req, res) => {
    const transporter_id = authController.getTransporterId(req);
    const truck_id = req.params.id;

    const { status } = req.body; // Assuming `status` is 'In Maintenance' or 'Available'
    
    if (!['Available', 'In Maintenance'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

      // Use findOneAndUpdate to directly update the embedded fleet document
      const updatedTransporter = await Transporter.findOneAndUpdate(
        { 
          '_id': transporterId, 
          'fleet._id': fleetId, 
          'fleet.status': { $ne: 'Assigned' }
        },
        {$set: {
            'fleet.$.status': status,
            ...(status === 'In Maintenance' && { 'fleet.$.last_service_date': new Date() })
          }},{ new: true }
      );
      if (!updatedTransporter) {
        return res.status(404).json({ message: 'Truck not found or cannot be updated' });
      }
      return res.json({ message: `Truck status updated to ${status}` });
    
    
});



//===================================================

const getTransporterOrders = asyncHandler(async (req, res) => {
    const transporterId = req.session.user.id;

    const orders = await orderModel.getOrdersByTransporter(transporterId);

    let transporterOrders = [];

    for (const order of orders) {
        const shipment = {
            orderId: order.order_id,
            status: order.status,
            order_date: new Date(order.order_date).toLocaleDateString('en-IN'),
            from: `${order.pickup_city}, ${order.pickup_state}`,
            to: `${order.delivery_city}, ${order.delivery_state}`,
            distance: order.distance,
            date: order.pickup_date,
            vehicleType: order.truck_type,
            cargoType: order.goods_type,
            weight: order.load, // Added weight to match orders.ejs
            price: order.final_price || order.max_price
        };
        transporterOrders.push(shipment);
    }
    console.log(transporterOrders);

    res.render('transporter/orders', { transporterOrders });
});

const getOrderDetails = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;
    const orderData = await orderModel.getOrderById(orderId);

    // Mock shipment items data (replace with actual database query if available)
    const shipmentItems = [
        {
            item_name: "Electronics",
            quantity: 10,
            price: 5000,
            delivery_status: "Pending"
        },
        {
            item_name: "Furniture",
            quantity: 5,
            price: 3000,
            delivery_status: "In Transit"
        },
        {
            item_name: "Clothing",
            quantity: 20,
            price: 2000,
            delivery_status: "Delivered"
        }
    ];

    const order = {
        orderId: orderData.order_id,
        from: `${orderData.pickup_street}, ${orderData.pickup_city}, ${orderData.pickup_state}, ${orderData.pickup_zip}`,
        to: `${orderData.delivery_street}, ${orderData.delivery_city}, ${orderData.delivery_state}, ${orderData.delivery_zip}`,
        distance: orderData.distance,
        pickup_time: orderData.pickup_time,
        pickup_date: orderData.pickup_date,
        vehicleType: orderData.truck_type,
        cargoType: orderData.goods_type,
        weight: orderData.load,
        price: orderData.final_price || orderData.max_price,
        advance: Number.parseInt(orderData.final_price || orderData.max_price) / 4,
        remaining: Number.parseInt(orderData.final_price || orderData.max_price) * 3 / 4,
        status: "in transit",
        shipmentItems: shipmentItems // Added shipmentItems
    };

    if (!order) {
        return res.status(404).send('Order not found');
    }

    res.render('order-info', { order, userType: "transporter" });
});

// Helper function to calculate time remaining (example implementation)
function calculateTimeRemaining(bidDuration, bidTime) {
    const endTime = new Date(bidTime);
    endTime.setHours(endTime.getHours() + bidDuration);
    const now = new Date();
    const diffMs = endTime - now;

    if (diffMs <= 0) return "00:00:00";

    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    return `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
}

const getBids = asyncHandler(async (req, res) => {
    const bids = await orderModel.getOrderCurrentBid();
    res.render('transporter/bid', { bids });
});

const getMyBids = asyncHandler(async (req, res) => {
    const transporterId = req.session.user.id;

    // Sample data for "My Bids" with bidTime
    const myBids = [
        {
            orderId: "ORD-2025-0001",
            pickupDate: "2025-05-10",
            pickupTime: "09:00 AM",
            pickup: "Chennai, Tamil Nadu",
            delivery: "Bengaluru, Karnataka",
            bidAmount: 1200,
            bidTime: "2025-05-08 10:15 AM",
            notes: "Urgent delivery, please prioritize."
        },
        {
            orderId: "ORD-2025-0002",
            pickupDate: "2025-05-12",
            pickupTime: "11:30 AM",
            pickup: "Mumbai, Maharashtra",
            delivery: "Pune, Maharashtra",
            bidAmount: 800,
            bidTime: "2025-05-08 11:00 AM",
            notes: ""
        },
        {
            orderId: "ORD-2025-0003",
            pickupDate: "2025-05-15",
            pickupTime: "02:00 PM",
            pickup: "Delhi, Delhi",
            delivery: "Chennai, Tamil Nadu",
            bidAmount: 2000,
            bidTime: "2025-05-08 01:30 PM",
            notes: "Fragile goods, handle with care."
        },
        {
            orderId: "ORD-2025-0004",
            pickupDate: "2025-05-18",
            pickupTime: "08:00 AM",
            pickup: "Bengaluru, Karnataka",
            delivery: "Mumbai, Maharashtra",
            bidAmount: 1500,
            bidTime: "2025-05-08 02:45 PM",
            notes: ""
        },
        {
            orderId: "ORD-2025-0005",
            pickupDate: "2025-05-20",
            pickupTime: "10:00 AM",
            pickup: "Pune, Maharashtra",
            delivery: "Delhi, Delhi",
            bidAmount: 1800,
            bidTime: "2025-05-08 03:20 PM",
            notes: "Requires refrigerated truck."
        },
        {
            orderId: "ORD-2025-0006",
            pickupDate: "2025-05-22",
            pickupTime: "03:00 PM",
            pickup: "Chennai, Tamil Nadu",
            delivery: "Pune, Maharashtra",
            bidAmount: 1100,
            bidTime: "2025-05-08 04:10 PM",
            notes: "Delivery must be completed by evening."
        }
    ];

    res.render('transporter/myBids', { myBids });
});

module.exports = {
    signup ,
    loadProfile,
    updateProfile,
    updatePassword,
    getFleet,
    getTruck,
    deleteTruck,
    addTruck,
    truckStatus,

    getBids,
    getTransporterOrders,
    getOrderDetails,
    getMyBids
};