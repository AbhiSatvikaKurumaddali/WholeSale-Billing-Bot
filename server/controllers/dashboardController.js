const Product = require('../models/Product');
const Bill = require('../models/Bill');
const Customer = require('../models/Customer');

const getStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaySales = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalCustomers = await Customer.countDocuments();
    
    // Get recent bills
    const recentBills = await Bill.find()
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      stats: {
        totalProducts,
        lowStockItems: lowStockCount,
        todaySales: todaySales[0]?.total || 0,
        todayTransactions: todaySales[0]?.count || 0,
        totalCustomers
      },
      recentBills
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSalesWeek = async (req, res) => {
  try {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last7Days.push(date);
    }
    
    const sales = await Bill.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days[0] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          sales: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const result = last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const sale = sales.find(s => s._id === dateStr);
      return {
        date: dateStr,
        sales: sale ? sale.sales : 0,
        transactions: sale ? sale.count : 0
      };
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, getSalesWeek };