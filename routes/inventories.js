var express = require('express');
var router = express.Router();

let inventoryModel = require('../schemas/inventories');
let productModel = require('../schemas/products');

async function getInventoryWithProduct(query) {
  return await inventoryModel.find(query).populate({
    path: 'product',
    select: 'title slug price description category'
  });
}

// Lấy tất cả inventory cùng product
router.get('/', async function (req, res, next) {
  try {
    let result = await getInventoryWithProduct({});
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Lấy inventory theo ID (kèm product)
router.get('/:id', async function (req, res, next) {
  try {
    let inv = await inventoryModel.findById(req.params.id).populate('product');
    if (!inv) return res.status(404).json({ message: 'Inventory not found' });
    res.json(inv);
  } catch (err) {
    res.status(400).json({ message: 'Invalid id or bad request' });
  }
});

async function changeStock(productId, quantityDelta, { stockDelta = 0, reservedDelta = 0, soldDelta = 0 } = {}) {
  if (!productId || typeof quantityDelta !== 'number') {
    throw new Error('product and quantity required');
  }

  let inv = await inventoryModel.findOne({ product: productId });
  if (!inv) throw new Error('Inventory not found for product');

  if (stockDelta) {
    inv.stock += stockDelta;
    if (inv.stock < 0) throw new Error('stock cannot be negative');
  }
  if (reservedDelta) {
    inv.reserved += reservedDelta;
    if (inv.reserved < 0) throw new Error('reserved cannot be negative');
  }
  if (soldDelta) {
    inv.soldCount += soldDelta;
    if (inv.soldCount < 0) throw new Error('soldCount cannot be negative');
  }

  await inv.save();
  return inv;
}

// POST /api/v1/inventories/add_stock
router.post('/add_stock', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    quantity = Number(quantity);
    if (!product || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'product and positive quantity required' });
    }
    let inv = await changeStock(product, quantity, { stockDelta: quantity });
    res.json(inv);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/v1/inventories/remove_stock
router.post('/remove_stock', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    quantity = Number(quantity);
    if (!product || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'product and positive quantity required' });
    }

    let inv = await inventoryModel.findOne({ product });
    if (!inv) throw new Error('Inventory not found for product');
    if (inv.stock < quantity) throw new Error('insufficient stock');

    inv.stock -= quantity;
    await inv.save();
    res.json(inv);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/v1/inventories/reservation
router.post('/reservation', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    quantity = Number(quantity);
    if (!product || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'product and positive quantity required' });
    }

    let inv = await inventoryModel.findOne({ product });
    if (!inv) throw new Error('Inventory not found for product');
    if (inv.stock < quantity) throw new Error('insufficient stock to reserve');

    inv.stock -= quantity;
    inv.reserved += quantity;
    await inv.save();
    res.json(inv);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/v1/inventories/sold
router.post('/sold', async function (req, res, next) {
  try {
    let { product, quantity } = req.body;
    quantity = Number(quantity);
    if (!product || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'product and positive quantity required' });
    }

    let inv = await inventoryModel.findOne({ product });
    if (!inv) throw new Error('Inventory not found for product');
    if (inv.reserved < quantity) throw new Error('insufficient reserved to mark sold');

    inv.reserved -= quantity;
    inv.soldCount += quantity;
    await inv.save();
    res.json(inv);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
