const mongoose = require('mongoose');

// Define the Package model
const PackageSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  storage: {
    type: Number,
  },
  price: {
    type: Number,
  },
});

mongoose.model('packages', PackageSchema);
