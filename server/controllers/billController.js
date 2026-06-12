const Bill = require('../models/Bill');
const Product = require('../models/Product');

const createBill = async (req, res) => {
  try {
    const { customerId, items, subtotal, gst, discount, total } = req.body;
    
    // Check stock availability
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}`
        });
      }
    }
    
    // Update inventory
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });
    }
    
    // Create bill
    const bill = await Bill.create({
      customer: customerId,
      items,
      subtotal,
      gst,
      discount,
      total,
      createdBy: req.user._id
    });
    
    const populatedBill = await Bill.findById(bill._id)
      .populate('customer', 'name phone email')
      .populate('createdBy', 'name');
    
    res.status(201).json({
      success: true,
      bill: populatedBill
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBills = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { billNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    const bills = await Bill.find(query)
      .populate('customer', 'name phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: bills.length,
      bills
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('customer')
      .populate('items.product')
      .populate('createdBy', 'name');
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBill, getBills, getBillById };