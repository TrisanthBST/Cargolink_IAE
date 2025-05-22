const connectDatabase = require("./database/db")
const errorMiddleware = require('./middleware/errorMiddleware')
require('dotenv').config();

const express = require('express');
const session = require("express-session");
const {asyncHandler} = require('./controller/utils');
const authController = require('./controller/authController')

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));     // Serves static files from public folder (like css, images etc)
app.use(express.json())

// Session Middleware
app.use(session({  
  name: 'cargolink',
  secret: process.env.SESSION_SECRET || 'mysecretkey',
  resave: true,
  saveUninitialized: false,  
  cookie: { 
    maxAge: 24*60*60000,
    secure: process.env.NODE_ENV === 'production', // set to true in production with HTTPS
    httpOnly: true,
    sameSite: 'lax'
  } 
}));

// Session debugging middleware
app.use((req, res, next) => {
    console.log('Session state:', {
        id: req.sessionID,
        user: req.session.user,
        cookie: req.session.cookie
    });
    next();
});

// // ================= This is only for testing disable later ==================
// app.use((req, res, next) => {
//   if(req.path.startsWith('/transporter')){
//         req.session.user = {
//           id: "681c669d326396da2ef89c95", // fill with one local  transporter id
//           role: 'transporter',
//         };
//   }else if(req.path.startsWith('/customer')){
//         req.session.user = {
//           id: "681c669d326396da2ef89c8c", // fill with one local customer id
//           role: 'customer',
//         };
//   } else { 
//     req.session.admin = {id: "1"};
//     return next();
//   }
//   next();
// });
// //============================================================================

// Make session data available to all views
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.userType = req.session.user?.role;
    next();
});

// Set up Routes
app.use('/customer', require('./routes/customer'));
app.use('/transporter', require('./routes/transporter'));
app.use('/admin', require('./routes/admin'));
app.use('/static', require('./routes/static'));

// Home route
app.get('/', (req, res) => {
    console.log('Home page session:', req.session);
    res.render('index', { user: req.session.user });
});
app.get('/logout', authController.logout);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
connectDatabase()