let mongoose = require('mongoose');

let inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Types.ObjectId,
    ref: 'product',
    required: [true, 'product is required'],
    unique: true
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, 'stock cannot be negative']
  },
  reserved: {
    type: Number,
    default: 0,
    min: [0, 'reserved cannot be negative']
  },
  soldCount: {
    type: Number,
    default: 0,
    min: [0, 'soldCount cannot be negative']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('inventory', inventorySchema);