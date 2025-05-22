const {asyncHandler} = require('./utils');
const Customer = require('../models/customer');
const Order = require('../models/order')
const authController = require('./authController');



// =======================================================================================




const signup = asyncHandler(async (req, res) =>{

    const { firstName, lastName, email, phone, dob, gender, password, address
    } = req.body;
  
    const customerData = {firstName, lastName, email, phone, dob, gender, password};
  
    const addressData = Object.values(address).some(val => val == null || val.trim() === '') ? null : address;
  
    const existing = await Customer.findOne({ email: customerData.email });
    if (existing) {
      return res.status(400).json({ error: 'Email is already in use' });
    }
    
    const customer = new Customer(customerData);
    await customer.save();
  
  
    if (addressData) {    
        address.address_label = 'Home';
        address.contact_phone = customer.phone;
        customer.addresses.push(addressData);
        await customer.save();
    }
    return res.json({success: "Sign up successful"});
      
  });
  
  
const loadProfile = asyncHandler(async (req, res) => {
    try {
        console.log('Loading profile. Session:', req.session);
        
        if (!req.session.user || req.session.user.role !== 'customer') {
            console.log('No valid customer session found');
            return res.redirect('/customer/login');
        }

        const customer_id = req.session.user.id;
        console.log('Loading profile for customer ID:', customer_id);

        const customer = await Customer.findById(customer_id).select('-password');
        if (!customer) {
            console.log('Customer not found in database:', customer_id);
            // Clear invalid session
            req.session.destroy();
            return res.redirect('/customer/login');
        }

        console.log('Found customer:', customer.email);

        const orderCount = await Order.countDocuments({ customer_id: customer._id });
        
        const userData = {
            profileImage: '/img/Mr.H.jpg', 
            firstName: customer.firstName, 
            lastName: customer.lastName,  
            email: customer.email,
            phone: customer.phone,
            displayDob: customer.formattedDob, 
            dob: customer.dob, 
            memberSince: customer.memberSince, 
            gender: customer.gender,
            totalOrders: orderCount,
            status: 'Active',
            addresses: customer.addresses.map((addr, index) => ({
                address_id: index, 
                label: addr.address_label || 'Home',
                street: addr.street_address,
                city: addr.city,
                state: addr.state,
                zipCode: addr.pin,
                country: 'India',
                phone: addr.contact_phone || customer.phone
            })),
            paymentMethods: [] // Empty for now
        };
        
        res.render('customer/profile', { 
            user: userData,
            userType: 'customer',
            session: req.session // Pass session data to view
        });
    } catch (error) {
        console.error('Error in loadProfile:', error);
        // Clear session on error
        req.session.destroy();
        res.redirect('/customer/login');
    }
});


const updatePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const customer_id = authController.getCustomerId(req); 
      
    const customer = await Customer.findById(customer_id);
    if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
    }

    const isMatch = await customer.verifyPassword(currentPassword);
    if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
    }
    customer.updatePassword(newPassword); 
    
    res.json({ success: true, message: 'Password updated successfully' });
      
    if (result.error) {
        return res.status(400).json({ error: result.error });
    }
      
    res.json({ message: 'Password updated successfully' });

});

const updateCustomerInfo = asyncHandler(async (req, res) => {

    const customer_id = authController.getCustomerId(req);
  
    // Get the update data from request body
    const updates = {};
    
    // Map frontend field names to database field names
    const fieldMappings = {
        'first_name': 'firstName',
        'last_name': 'lastName',
        'email': 'email',
        'phone': 'phone',
        'date_of_birth': 'dob',
        'gender': 'gender'
    };
    
    // Process each field in the request body
    for (const [frontendField, value] of Object.entries(req.body)) {
        const dbField = fieldMappings[frontendField];
        if (dbField && value !== undefined && value !== null) {
            updates[dbField] = value;
        }
    }      
    
    // Update customer info
    const customer = await Customer.findByIdAndUpdate(customer_id, updates, { new: true }).select('-password');
    
    if (!customer) {
        return res.status(404).json({ error: 'Customer not Found' });
    }
          
    res.json({ 
        message: 'Profile updated successfully',
        customer: customer
    });

});

const addAddress = asyncHandler(async (req, res) =>{

    const customer_id = authController.getCustomerId(req)
    const addressData = req.body;
    
    const result = await Customer.updateOne(
        { _id: customer_id },
        { $push: { addresses: addressData } }
    );    

    res.json({ message: 'Address added successfully'});
    
});

const removeAddress = asyncHandler(async (req, res) =>{

    const customer_id = authController.getCustomerId(req)
    const address_id = req.params.address_id;

    const customer = await Customer.findById(customer_id);
    if (!customer) {
        return res.status(404).json({ error: 'Customer not Found' })
    };
    
    if (address_id < 0 || address_id >= customer.addresses.length) {
        return res.status(404).json({ error: 'Invalid address index'});
    }
    
    customer.addresses.splice(address_id, 1);
    const result = await customer.save();
    

    res.json({ message: 'Address Removed' });
    
});

const getCustomerAddresses = async (customer_id) => {
// will be implemented later
};

// waiting ===========================================================================
const placeOrder = asyncHandler(async (req, res) => {
    const { pickup, delivery, transit, cargo, biding } = req.body;

    let orderData = { pickup, delivery, transit, cargo, biding };
    orderData.customer_id = req.session.user.id;

    // Add sample shipment items to the order
    orderData.shipment_items = generateSampleShipmentItems();

    const orderResult = await orderModel.placeOrder(orderData);

    return res.redirect(`/order/${orderResult.order_id}`);
});

//====================================================================================


module.exports = {
    signup,
    updatePassword,
    loadProfile,
    updateCustomerInfo,
    addAddress,
    removeAddress,
    getCustomerAddresses,    
    placeOrder,
};