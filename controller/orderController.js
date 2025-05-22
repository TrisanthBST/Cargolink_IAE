const mongoose = require('mongoose');
const { asyncHandler } = require('./utils');
const Order = require('../models/order');
const Bids = require('../models/bids');
const authController = require('./authController');

const placeOrder = asyncHandler(async (req, res) => {
    const orderData = req.body;

    orderData.customer_id = authController.getCustomerId(req);
    console.log(orderData);
    const order = new Order(orderData);
    await order.save();

    return res.json({ success: "Order Placed successfully" });
});

const getCustomerOrders = asyncHandler(async (req, res) => {
    const customer_id = authController.getCustomerId(req);

    const orderData = await Order.find({ customer_id: customer_id });

    const orders = orderData.map(order => ({
        orderId: order._id,
        status: order.status,
        order_date: new Date(order.order_date).toLocaleDateString('en-IN'),
        from: `${order.pickup.city}, ${order.pickup.state}`,
        to: `${order.delivery.city}, ${order.delivery.state}`,
        distance: order.distance,
        date: order.scheduled_at,
        vehicleType: order.truck_type,
        cargoType: order.goods_type,
        price: order.final_price || order.max_price,
        noOfItems: order.shipments.length,
    }));

    res.render('customer/orders', { shipments: orders });
});

const getTransporterOrders = asyncHandler(async (req, res) => {
    const transporter_id = authController.getTransporterId(req);

    const orders = await Order.find({ assigned_transporter_id: transporter_id });

    const transporterOrders = orders.map(order => ({
        orderId: order._id,
        status: order.status,
        order_date: new Date(order.order_date).toLocaleDateString('en-IN'),
        from: `${order.pickup.city}, ${order.pickup.state}`,
        to: `${order.delivery.city}, ${order.delivery.state}`,
        distance: order.distance,
        date: order.pickup.date,
        vehicleType: order.truck_type,
        cargoType: order.goods_type,
        price: order.final_price,
        weight: order.weight,
    }));

    res.render('transporter/orders', { transporterOrders });
});

const cancelOrder = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;
    const customer_id = authController.getCustomerId(req);

    const updatedOrder = await Order.updateOne(
        { _id: orderId, customer_id: customer_id },
        { $set: { status: 'Cancelled' } }
    );

    if (updatedOrder.modifiedCount == 0) {
        return res.status(404).json({ success: false, message: "Order not found or access denied!" });
    }

    return res.json({ success: true, message: "Order cancelled successfully!" });
});

const getOrderDetailsCustomer = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;
    const orderData = await Order.findOne({ _id: orderId }).populate('assigned_transporter_id', 'name email');;

    const order = {
        orderId: orderData._id,
        from: `${orderData.pickup.street}, ${orderData.pickup.city}, ${orderData.pickup.state}, ${orderData.pickup.pin}`,
        to: `${orderData.delivery.street}, ${orderData.delivery.city}, ${orderData.delivery.state}, ${orderData.delivery.pin}`,
        distance: orderData.distance,
        pickup_date: orderData.scheduled_at.toLocaleDateString('en-IN'),
        pickup_time: orderData.scheduled_at.toLocaleTimeString('en-IN'),
        vehicleType: orderData.truck_type,
        cargoType: orderData.goods_type,
        weight: orderData.weight,
        price: orderData.final_price || orderData.max_price,
        advance: Number.parseInt(orderData.final_price || orderData.max_price) / 4,
        remaining: Number.parseInt(orderData.final_price || orderData.max_price) * 3 / 4,
        status: orderData.status,
        shipmentItems: orderData.shipments,
        transporterName: orderData.assigned_transporter_id.name,
        transporterEmail: orderData.assigned_transporter_id.email
    };

    if (!order) {
        return res.status(404).send('Order not found');
    }

    res.render('customer/order-info', { order, userType: "customer" });
});

//transporter
const getOrderDetailsTransporter = asyncHandler(async (req, res) => {
    const orderId = req.params.orderId;
    const orderData = await Order.findOne({ _id: orderId }).populate('customer_id', 'firstName lastName phone email');

    const order = {
        orderId: orderData._id,
        from: `${orderData.pickup.street}, ${orderData.pickup.city}, ${orderData.pickup.state}, ${orderData.pickup.pin}`,
        to: `${orderData.delivery.street}, ${orderData.delivery.city}, ${orderData.delivery.state}, ${orderData.delivery.pin}`,
        distance: orderData.distance,
        pickup_date: orderData.scheduled_at.toLocaleDateString('en-IN'),
        pickup_time: orderData.scheduled_at.toLocaleTimeString('en-IN'),
        vehicleType: orderData.truck_type,
        cargoType: orderData.goods_type,
        weight: orderData.weight,
        price: orderData.final_price || orderData.max_price,
        advance: Number.parseInt(orderData.final_price || orderData.max_price) / 4,
        remaining: Number.parseInt(orderData.final_price || orderData.max_price) * 3 / 4,
        status: orderData.status,
        shipmentItems: orderData.shipments,
        customerName : `${orderData.customer_id.firstName} ${orderData.customer_id.lastName}`,
        customerPhone: orderData.customer_id.phone,
        customerEmail: orderData.customer_id.email

    };
    
    console.log(orderData);
    
    if (!order) {
        return res.status(404).send('Order not found');
    }

    res.render('transporter/order-info', { order, userType: "transporter" });
});


const getCurrentBids = asyncHandler(async (req, res) => {
    const customer_id = authController.getCustomerId(req);
    const orderId = req.params.orderId;

    const order = await Order.findOne({ _id: orderId, customer_id: customer_id });

    if (!order) {
        return res.status(400).json({ message: 'Order not found or does not belong to customer' });
    }

    const bids = await Bids.find({ order_id: orderId }).populate('transporter_id', 'name email');

    const formattedBids = bids.map((bid, index) => ({
        bid_id: bid._id,
        serialNumber: index + 1,
        transporter_id: bid.transporter_id._id,
        transporter_name: bid.transporter_id.name,
        contact_info: bid.transporter_id.email,
        bid_amount: bid.bid_amount,
        bid_time: bid.createdAt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        notes: bid.notes || 'N/A'
    }));

    return res.render('customer/bidsPlaced', { orderId, bids: formattedBids });
});

const acceptBid = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const customerId = authController.getCustomerId(req);
    const { bid_id } = req.body;

    const bid = await Bids.findOne({ _id: bid_id, order_id: orderId });
    if (!bid) {
        return res.status(404).json({ message: 'Bid not found' });
    }

    const order = await Order.findOneAndUpdate(
        {
            _id: orderId,
            customer_id: customerId,
            status: 'Placed'
        },
        {
            assigned_transporter_id: bid.transporter_id,
            final_price: bid.bid_amount,
            status: 'Assigned'
        },
        { new: true }
    );

    if (!order) {
        return res.status(403).json({ message: 'Order not found, unauthorized, or already assigned' });
    }

    await Bids.deleteMany({ order_id: bid.order_id });

    res.status(200).json({success: true,  message: 'Bid accepted and order updated successfully' });
});

const getCurrentOrders = asyncHandler(async (req, res) => {
    const transporter_id = authController.getTransporterId(req);

    const orders = await Order.find({ status: 'Placed' })
        .populate({
            path: 'bid_by_transporter',
            match: { transporter_id: transporter_id },
            select: '_id'
        })
        .lean();

    const transformedBids = orders.map(order => ({
        id: order._id.toString(),
        pickup: `${order.pickup.city}, ${order.pickup.state}`,
        delivery: `${order.delivery.city}, ${order.delivery.state}`,
        pickup_date: new Date(order.scheduled_at).toLocaleDateString(),
        pickup_time: new Date(order.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        distance: order.distance,
        price: order.max_price,
        weight: order.weight,
        type: order.truck_type,
        already_bid: !!order.bid_by_transporter
    }));

    res.render('transporter/bid', { bids: transformedBids });
});

const submitBid = asyncHandler(async (req, res) => {
    const transporter_id = authController.getTransporterId(req);
    const { orderId, bidAmount, notes } = req.body;

    console.log(orderId, bidAmount, notes, transporter_id);

    const order = await Order.findOne({ _id: orderId });
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    const newBid = new Bids({
        order_id: orderId,
        transporter_id: transporter_id,
        bid_amount: bidAmount,
        notes
    });

    await newBid.save();

    return res.json({ success: true, message: "Bid Placed Successfully" });
});

const getTransporterBids = asyncHandler(async (req, res) => {
    const transporter_id = authController.getTransporterId(req);

    const bids = await Bids.find({ transporter_id: transporter_id }).populate('order_id', 'pickup scheduled_at delivery');

    const transformedBids = bids.map(bid => ({
        orderId: bid.order_id._id,
        pickup: `${bid.order_id.pickup.city}, ${bid.order_id.pickup.state}`,
        delivery: `${bid.order_id.delivery.city}, ${bid.order_id.delivery.state}`,
        pickupDate: new Date(bid.order_id.scheduled_at).toLocaleDateString(),
        pickupTime: new Date(bid.order_id.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bidAmount: bid.bid_amount,
        bidTime: bid.createdAt,
        notes: bid.notes
    }));

    return res.render('transporter/myBids', { myBids: transformedBids });
});

const trackOrderTransporter = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const transporter_id = authController.getTransporterId(req);
    const order = await Order.findOne({ _id: orderId, assigned_transporter_id: transporter_id }).populate('customer_id', 'firstName lastName phone email');

    const orderData = {
        id: order._id,
        status: order.status,
        pickupDate: order.scheduled_at.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + order.scheduled_at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        pickupLocation: `${order.pickup.street}, ${order.pickup.city}, ${order.pickup.state} ${order.pickup.pin}`,
        deliveryLocation: `${order.delivery.street}, ${order.delivery.city}, ${order.delivery.state} ${order.delivery.pin}`,
        cargoDescription: `${order.goods_type} - ${order.shipments.length} items`,
        weight: order.weight,
        vehicleAssigned: order.truck_type,
        paymentAmount: order.final_price,
        customer: {
            contactPerson: `${order.customer_id.firstName} ${order.customer_id.lastName}`,
            contactPhone: order.customer_id.phone,
            email: order.customer_id.email
        }
    };

    res.render('transporter/track-order', { order: orderData, user: req.user || {} });
});

const trackOrderCustomer = asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const customer_id = authController.getCustomerId(req);

    // Validate orderId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    // Validate customer_id
    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return res.status(400).json({ success: false, message: 'Invalid customer ID format' });
    }

    // Query the order
    const order = await Order.findOne({
        _id: orderId,
        customer_id: customer_id,
        status: { $in: ['In Transit', 'Completed'] }
    }).populate('assigned_transporter_id', 'name primary_contact email');

    // Check if order exists immediately
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found or not in a trackable state' });
    }

    // Construct orderData
    const orderData = {
        id: order._id,
        status: order.status,
        pickupDate: order.scheduled_at.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + order.scheduled_at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        pickupLocation: `${order.pickup.street}, ${order.pickup.city}, ${order.pickup.state} ${order.pickup.pin}`,
        deliveryLocation: `${order.delivery.street}, ${order.delivery.city}, ${order.delivery.state} ${order.delivery.pin}`,
        cargoDescription: `${order.goods_type} - ${order.shipments.length} items`,
        weight: order.weight,
        vehicleAssigned: order.truck_type,
        paymentAmount: order.final_price,
        transporter: {
            contactPerson: order.assigned_transporter_id ? order.assigned_transporter_id.name : 'Not assigned',
            contactPhone: order.assigned_transporter_id ? order.assigned_transporter_id.primary_contact : 'N/A',
            email: order.assigned_transporter_id ? order.assigned_transporter_id.email : 'N/A'
        },
        items: order.shipments
    };

    console.log(orderData);

    res.render('customer/track-order', { order: orderData, user: req.user || {} });
});

const deliverOrder = asyncHandler(async (req, res) => {
    // To be implemented if needed
});

// New function to handle the paynow route
const handlePayNow = asyncHandler(async (req, res) => {
    const orderId = req.query.orderId;
    const customer_id = authController.getCustomerId(req);

    // Validate orderId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    // Validate customer_id
    if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return res.status(400).json({ success: false, message: 'Invalid customer ID format' });
    }

    // Find the order
    const order = await Order.findOne({ _id: orderId, customer_id: customer_id, status: 'In Transit' });

    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found, not in transit, or access denied!' });
    }

    // Calculate the total amount (considering damaged items)
    let totalAmount = 0;
    order.shipments.forEach(item => {
        const price = item.price;
        const adjustedPrice = item.delivery_status === 'Damaged' ? price * 0.9 : price;
        totalAmount += adjustedPrice;
    });

    // Generate a transaction ID
    const transactionId = `TXN-${Date.now()}`;

    // Update the order status to "Completed" and save the transaction details
    order.status = 'Completed';
    order.transaction = {
        transaction_id: transactionId,
        amount: totalAmount
    };

    await order.save();

    // Render the paynow page with payment details
    res.render('customer/paynow', {
        orderId: order._id,
        totalAmount: totalAmount.toFixed(2),
        transactionId: transactionId,
        message: 'Payment successful! Order status updated to Completed.'
    });
});

const startTransit = asyncHandler(async (req, res) => {

    const order_id = req.params.id;
    const transporter_id = authController.getTransporterId(req);

    console.log(order_id, transporter_id);
    
    const order = await Order.findOneAndUpdate(
        {
            _id: order_id,
            assigned_transporter_id: transporter_id,
            status: 'Assigned'
        },
        {
            status: 'In Transit'
        },
        { new: true }
    );  
    
    console.log(order);
    
    if (!order) {
        return res.status(404).json({message: 'Order Not Found' });
    }

    console.log('Order status updated to:', order.status);
    res.status(200).json({success: true, message: 'Order Status updated successfully' });

});


module.exports = {
    placeOrder,
    cancelOrder,
    getCustomerOrders,
    getOrderDetailsCustomer,
    getCurrentOrders,
    getTransporterOrders,
    submitBid,
    getCurrentBids,
    getTransporterBids,
    acceptBid,
    deliverOrder,
    trackOrderCustomer,
    trackOrderTransporter,
    handlePayNow, // Export the new function
    getOrderDetailsTransporter,
    startTransit
};