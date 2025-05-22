const mongoose = require('mongoose');
require('dotenv').config();

const connectDatabase = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://TrisuBST:Trisu5049@cluster0.ubetchc.mongodb.net/cargolink?retryWrites=true&w=majority&appName=Cluster0');
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDatabase;
