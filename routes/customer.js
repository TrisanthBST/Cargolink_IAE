const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const authController = require('../controller/authController')
const customerController = require('../controller/customerController')
const orderController = require('../controller/orderController')

const {
    validateOrder,
    validateCustomerSignup,
    validateLogin,
    updateProfileValidation,
    updatePasswordValidation,
    addAddressValidation
  } = require('../middleware/validateMiddleware');



router.get('/signup', (req, res) => {
    res.render('customer/signup', { userType: 'customer' })
});

router.post('/signup', customerController.signup);


router.get('/login', (req, res) => {
    res.render('login', {userType: 'customer'});
});

router.post('/login', validateLogin, authController.loginCustomer);


router.use(authMiddleware.isCustomer)


router.get('/profile', customerController.loadProfile);

router.post('/update-password', updatePasswordValidation, customerController.updatePassword);

router.post('/update-profile', customerController.updateCustomerInfo);

router.post('/add-address',  addAddressValidation, customerController.addAddress)

router.delete('/delete-address/:address_id', customerController.removeAddress);

router.get('/place-order', (req, res) => {
    res.render('customer/place-order');
});


// Updated route for paynow page
router.get('/paynow', orderController.handlePayNow);

router.post('/place-order', validateOrder, orderController.placeOrder); //not tested

router.get('/orders', orderController.getCustomerOrders);

router.delete('/cancel-order/:orderId', orderController.cancelOrder);

router.get('/order/:orderId', orderController.getOrderDetailsCustomer);

// Route to show bids for an order
router.get('/order/:orderId/bids', orderController.getCurrentBids);

// Route to accept a bid
router.post('/order/:orderId/accept-bid', orderController.acceptBid);

router.get('/track/:id', orderController.trackOrderCustomer)


//=================================================================


router.post('/orders/:id/chat', async (req, res) => {
    try {
        if (!req.body.message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Message content is required' 
            });
        }

        await addChatMessage(req.params.id, req.body.message, 1);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in POST /orders/:id/chat:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to send message' 
        });
    }
});
module.exports = router;