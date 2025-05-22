
const express = require('express');
const router = express.Router();
const transporterController = require('../controller/transporterController');
const authController = require('../controller/authController'); 
const authMiddleware = require("../middleware/authMiddleware")
const orderController = require('../controller/orderController')
const { updateOrderStatus } = require('../controller/orderController');


router.get('/signup', (req, res) => {
    res.render('transporter/signup', {userType: 'transporter'});
});
router.post('/signup', transporterController.signup);

router.get('/login', (req, res) => {
    res.render('login', {userType: 'transporter'});
});

router.post('/login', authController.loginTransporter);


router.use(authMiddleware.isTransporter);



router.get('/profile', transporterController.loadProfile);

router.post('/update-profile', transporterController.updateProfile);

router.post('/update-password', transporterController.updatePassword);

router.get('/fleet', transporterController.getFleet);

router.get('/fleet/:id', transporterController.getTruck);

router.delete('/fleet/:id/delete',transporterController.deleteTruck);

router.post('/fleet', transporterController.addTruck);

router.post('/fleet/:id/status', transporterController.truckStatus)

router.get('/orders',orderController.getTransporterOrders);

router.get('/order/:orderId', orderController.getOrderDetailsTransporter); // change the additional details

router.get('/bid', orderController.getCurrentOrders);

//mybids page route
router.get('/my-bids', orderController.getTransporterBids)

router.post('/submit-bid', orderController.submitBid);

router.get('/track/:id', orderController.trackOrderTransporter);

router.post('/start-transit/:id', orderController.startTransit);

//========================================================================

router.put('/orders/:id/status', async (req, res) => {
    console.log('PUT /orders/:id/status called with ID:', req.params.id, 'and status:', req.body.status);
    try {
        if (!req.body.status) {
            return res.status(400).json({ 
                success: false, 
                error: 'Status is required' 
            }); 
        }

        // Pass req to updateOrderStatus for transporter validation
        await updateOrderStatus(req.params.id, req.body.status, 'transporter', req);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in PUT /orders/:id/status:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to update status' 
        });
    }
});
router.post('/orders/:id/delay', async (req, res) => {
    try {
        if (!req.body.note) {
            return res.status(400).json({ 
                success: false, 
                error: 'Delay note is required' 
            });
        }

        await reportOrderDelay(req.params.id, req.body.note, 1);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in POST /orders/:id/delay:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to report delay' 
        });
    }
});

router.post('/orders/:id/note', async (req, res) => {
    try {
        if (!req.body.note) {
            return res.status(400).json({ 
                success: false, 
                error: 'Note content is required' 
            });
        }

        await addOrderNote(req.params.id, req.body.note, 1);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in POST /orders/:id/note:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to save note' 
        });
    }
});

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