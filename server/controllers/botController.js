const OpenAI = require('openai');
const Product = require('../models/Product');
const Bill = require('../models/Bill');

let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== '') {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const getStockInfo = async (productName) => {
  const product = await Product.findOne({ 
    name: { $regex: productName, $options: 'i' } 
  });
  
  if (product) {
    return `📦 ${product.name} has ${product.quantity} units in stock. Reorder level is ${product.reorderLevel}. Price: ₹${product.wholesalePrice}`;
  }
  return `❌ Product "${productName}" not found.`;
};

const getLowStockItems = async () => {
  const products = await Product.find({
    $expr: { $lte: ['$quantity', '$reorderLevel'] }
  });
  
  if (products.length === 0) {
    return "✅ No low stock items found. All products are well-stocked!";
  }
  
  let response = "⚠️ **Low Stock Alert:**\n";
  products.forEach(p => {
    response += `• ${p.name}: ${p.quantity} units (Reorder at ${p.reorderLevel})\n`;
  });
  return response;
};

const getTodaySales = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const bills = await Bill.find({
    createdAt: { $gte: today, $lt: tomorrow }
  });
  
  const total = bills.reduce((sum, bill) => sum + bill.total, 0);
  return `💰 Today's Sales Summary:\n• Total Sales: ₹${total.toFixed(2)}\n• Transactions: ${bills.length}\n• Average Bill: ₹${bills.length > 0 ? (total / bills.length).toFixed(2) : 0}`;
};

const getBestSellingProduct = async () => {
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const bills = await Bill.find({
    createdAt: { $gte: lastWeek }
  }).populate('items.product');
  
  const productSales = {};
  
  bills.forEach(bill => {
    bill.items.forEach(item => {
      const productId = item.product._id.toString();
      if (!productSales[productId]) {
        productSales[productId] = {
          name: item.product.name,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[productId].quantity += item.quantity;
      productSales[productId].revenue += item.total;
    });
  });
  
  const best = Object.values(productSales).sort((a, b) => b.quantity - a.quantity)[0];
  
  if (best) {
    return `🏆 **Best Selling Product (Last 7 Days)**\n• ${best.name}\n• Quantity Sold: ${best.quantity} units\n• Revenue Generated: ₹${best.revenue.toFixed(2)}`;
  }
  return "📊 No sales data available for the last 7 days.";
};

const processUserQuery = async (message) => {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('stock of') || lowerMsg.includes('stock for')) {
    const match = message.match(/(?:stock of|stock for)\s+(.+)/i);
    if (match) {
      return await getStockInfo(match[1]);
    }
  }
  
  if (lowerMsg.includes('low stock') || lowerMsg.includes('reorder')) {
    return await getLowStockItems();
  }
  
  if (lowerMsg.includes("today's total sales") || lowerMsg.includes('today sales') || lowerMsg.includes('today\'s sales')) {
    return await getTodaySales();
  }
  
  if (lowerMsg.includes('best selling') || lowerMsg.includes('top product')) {
    return await getBestSellingProduct();
  }
  
  return "🤖 **Available Commands:**\n\n• `Stock of [product name]` - Check product inventory\n• `Low stock items` - View products needing reorder\n• `Today's total sales` - Get today's sales summary\n• `Best selling product` - See top product of the week\n\nHow can I help you today?";
};

const chat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    let reply;
    
    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant for a wholesale inventory and billing system. Provide concise, accurate information about products, sales, and inventory. Use emojis to make responses friendly."
            },
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        });
        
        reply = completion.choices[0].message.content;
      } catch (error) {
        console.log('OpenAI error, falling back to rule-based');
        reply = await processUserQuery(message);
      }
    } else {
      reply = await processUserQuery(message);
    }
    
    res.json({ 
      success: true, 
      reply,
      usingAI: !!openai 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chat };