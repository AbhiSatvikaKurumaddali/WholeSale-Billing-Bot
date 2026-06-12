const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Bill = require('./models/Bill');

dotenv.config();

const products = [
  { sku: 'ELEC001', name: 'iPhone 15 Pro', category: 'Electronics', quantity: 50, reorderLevel: 10, wholesalePrice: 89999, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'ELEC002', name: 'Samsung Galaxy S24', category: 'Electronics', quantity: 45, reorderLevel: 10, wholesalePrice: 79999, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'ELEC003', name: 'MacBook Pro', category: 'Electronics', quantity: 30, reorderLevel: 5, wholesalePrice: 149999, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'CLOTH001', name: "Men's Cotton Shirt", category: 'Clothing', quantity: 200, reorderLevel: 50, wholesalePrice: 599, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'CLOTH002', name: "Women's Jeans", category: 'Clothing', quantity: 150, reorderLevel: 40, wholesalePrice: 1299, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'HARD001', name: 'Hammer', category: 'Hardware', quantity: 100, reorderLevel: 20, wholesalePrice: 299, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'HARD002', name: 'Screwdriver Set', category: 'Hardware', quantity: 80, reorderLevel: 15, wholesalePrice: 499, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'GROC001', name: 'Basmati Rice 5kg', category: 'Grocery', quantity: 300, reorderLevel: 100, wholesalePrice: 399, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'GROC002', name: 'Cooking Oil 1L', category: 'Grocery', quantity: 250, reorderLevel: 80, wholesalePrice: 129, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'ELEC004', name: 'iPad Air', category: 'Electronics', quantity: 25, reorderLevel: 5, wholesalePrice: 54999, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'CLOTH003', name: 'Winter Jacket', category: 'Clothing', quantity: 60, reorderLevel: 15, wholesalePrice: 2499, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'HARD003', name: 'Drill Machine', category: 'Hardware', quantity: 35, reorderLevel: 10, wholesalePrice: 2999, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'GROC003', name: 'Wheat Flour 10kg', category: 'Grocery', quantity: 180, reorderLevel: 50, wholesalePrice: 349, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'ELEC005', name: 'Smart Watch', category: 'Electronics', quantity: 70, reorderLevel: 20, wholesalePrice: 19999, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'CLOTH004', name: 'Sports Shoes', category: 'Clothing', quantity: 90, reorderLevel: 25, wholesalePrice: 1999, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'HARD004', name: 'Measuring Tape', category: 'Hardware', quantity: 5, reorderLevel: 10, wholesalePrice: 99, imageUrl: 'https://via.placeholder.com/100' },
  { sku: 'GROC004', name: 'Sugar 1kg', category: 'Grocery', quantity: 8, reorderLevel: 20, wholesalePrice: 45, imageUrl: 'https://via.placeholder.com/100' }
];

const customers = [
  { name: 'Rajesh Sharma', email: 'rajesh@example.com', phone: '9876543210', address: { street: '123 Main St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' }, gstNumber: 'GST123456789' },
  { name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', address: { street: '456 Park Ave', city: 'Delhi', state: 'Delhi', pincode: '110001' }, gstNumber: '' },
  { name: 'Amit Kumar', email: 'amit@example.com', phone: '9876543212', address: { street: '789 Lake Rd', city: 'Bangalore', state: 'Karnataka', pincode: '560001' }, gstNumber: '' },
  { name: 'Sneha Reddy', email: 'sneha@example.com', phone: '9876543213', address: { street: '321 Hill St', city: 'Hyderabad', state: 'Telangana', pincode: '500001' }, gstNumber: 'GST987654321' },
  { name: 'Vikram Singh', email: 'vikram@example.com', phone: '9876543214', address: { street: '654 Beach Rd', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' }, gstNumber: '' },
  { name: 'Neha Gupta', email: 'neha@example.com', phone: '9876543215', address: { street: '987 Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700001' }, gstNumber: 'GST456789123' }
];

const generateRandomBill = async (customer, productsList, user, daysAgo) => {
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const items = [];
  let subtotal = 0;
  
  const shuffledProducts = [...productsList];
  for (let i = shuffledProducts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledProducts[i], shuffledProducts[j]] = [shuffledProducts[j], shuffledProducts[i]];
  }
  
  for (let i = 0; i < itemCount; i++) {
    const product = shuffledProducts[i];
    const quantity = Math.floor(Math.random() * 10) + 1;
    const total = product.wholesalePrice * quantity;
    items.push({
      product: product._id,
      productName: product.name,
      sku: product.sku,
      quantity,
      price: product.wholesalePrice,
      total
    });
    subtotal += total;
  }
  
  const gst = subtotal * 0.18;
  const discount = items.some(item => item.quantity > 50) ? subtotal * 0.05 : 0;
  const total = subtotal + gst - discount;
  
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0);
  
  // Generate bill number manually
  const count = await Bill.countDocuments();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const billNumber = `INV-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  
  const bill = new Bill({
    billNumber: billNumber,
    customer: customer._id,
    items,
    subtotal,
    gst,
    discount,
    total,
    createdBy: user._id,
    createdAt: date
  });
  
  await bill.save();
  
  // Update inventory
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantity: -item.quantity }
    });
  }
  
  return bill;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Bill.deleteMany({});
    
    console.log('Cleared existing data');
    
    // Create users with plain passwords
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin',
      status: 'active'
    });
    
    const staff = await User.create({
      name: 'Staff User',
      email: 'staff@example.com',
      password: 'Staff@123',
      role: 'staff',
      status: 'active'
    });
    
    console.log('✅ Users created');
    console.log('   Admin: admin@example.com / Admin@123');
    console.log('   Staff: staff@example.com / Staff@123');
    
    // Create products
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ ${createdProducts.length} products created`);
    
    // Create customers
    const createdCustomers = await Customer.insertMany(customers);
    console.log(`✅ ${createdCustomers.length} customers created`);
    
    // Create bills
    let billsCreated = 0;
    for (let i = 0; i < 15; i++) {
      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const user = Math.random() > 0.5 ? admin : staff;
      const daysAgo = Math.floor(Math.random() * 30);
      await generateRandomBill(customer, createdProducts, user, daysAgo);
      billsCreated++;
    }
    
    console.log(`✅ ${billsCreated} bills created`);
    
    // Display summary
    console.log('\n📊 Database seeded successfully!');
    console.log('================================');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Products: ${await Product.countDocuments()}`);
    console.log(`Customers: ${await Customer.countDocuments()}`);
    console.log(`Bills: ${await Bill.countDocuments()}`);
    console.log('================================');
    
    // Display low stock items
    const lowStock = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });
    
    if (lowStock.length > 0) {
      console.log('\n⚠️ Low Stock Items:');
      lowStock.forEach(p => {
        console.log(`   - ${p.name}: ${p.quantity} units (Reorder at ${p.reorderLevel})`);
      });
    }
    
    console.log('\n🚀 You can now start the server with: npm run dev');
    console.log('📝 Login credentials:');
    console.log('   Admin: admin@example.com / Admin@123');
    console.log('   Staff: staff@example.com / Staff@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('Error details:', error.stack);
    process.exit(1);
  }
};

seedDatabase();