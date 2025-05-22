const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const FleetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registration: { type: String, required: true },
  capacity: { type: Number, required: true, min: 0 },
  manufacture_year: { type: Number, required: true },
  truck_type: { type: String, required: true },
  status: { type: String, enum: ['Available', 'Assigned', 'In Maintenance'], default: 'Available'},
  last_service_date: Date,
  next_service_date: Date,
  current_order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
}, { _id: true });

const TransporterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gst_in: { type: String, required: true, unique: true },
  pan: { type: String, required: true, unique: true },
  street_address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pin: { type: String, required: true },
  primary_contact: { type: String, required: true },
  secondary_contact: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  fleet: [FleetSchema]
}, { timestamps: true });


TransporterSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


TransporterSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

TransporterSchema.methods.updatePassword = async function(newPassword) {
    this.password = newPassword;
    await this.save();
};


module.exports = mongoose.model('Transporter', TransporterSchema);