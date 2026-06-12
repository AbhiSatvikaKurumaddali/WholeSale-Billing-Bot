const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Bill = require('./models/Bill');

dotenv.config();

const products = [
  { sku: 'ELEC001', name: 'iPhone 15 Pro', category: 'Electronics', quantity: 50, reorderLevel: 10, wholesalePrice: 89999 },
  { sku: 'ELEC002', name: 'Samsung Galaxy S24', category: 'Electronics', quantity: 45, reorderLevel: 10, wholesalePrice: 79999 },
  { sku: 'ELEC003', name: 'MacBook Pro', category: 'Electronics', quantity: 30, reorderLevel: 5, wholesalePrice: 149999 },
  { sku: 'CLOTH001', name: "Men's Cotton Shirt", category: 'Clothing', quantity: 200, reorderLevel: 50, wholesalePrice: 599 },
  { sku: 'CLOTH002', name: "Women's Jeans", category: 'Clothing', quantity: 150, reorderLevel: 40, wholesalePrice: 1299 },
  { sku: 'HARD001', name: 'Hammer', category: 'Hardware', quantity: 100, reorderLevel: 20, wholesalePrice: 299 },
  { sku: 'HARD002', name: 'Screwdriver Set', category: 'Hardware', quantity: 80, reorderLevel: 15, wholesalePrice: 499 },
  { sku: 'GROC001', name: 'Basmati Rice 5kg', category: 'Grocery', quantity: 300, reorderLevel: 100, wholesalePrice: 399 },
  { sku: 'GROC002', name: 'Cooking Oil 1L', category: 'Grocery', quantity: 250, reorderLevel: 80, wholesalePrice: 129 },
  { sku: 'ELEC004', name: 'iPad Air', category: 'Electronics', quantity: 25, reorderLevel: 5, wholesalePrice: 54999 },
];

const customers = [
  { name: 'Rajesh Sharma', email: 'rajesh@example.com', phone: '9876543210', address: { street: '123 Main St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' }, gstNumber: 'GST123456789' },
  { name: 'Priya Patel', email: 'priya@example.com', phone: '9876543211', address: { street: '456 Park Ave', city: 'Delhi', state: 'Delhi', pincode: '110001' } },
  { name: 'Amit Kumar', email: 'amit@example.com', phone: '9876543212', address: { street: '789 Lake Rd', city: 'Bangalore', state: 'Karnataka', pincode: '560001' } },
  { name: 'Sneha Reddy', email: 'sneha@example.com', phone: '9876543213', address: { street: '321 Hill St', city: 'Hyderabad', state: 'Telangana', pincode: '500001' }, gstNumber: 'GST987654321' },
  { name: 'Vikram Singh', email: 'vikram@example.com', phone: '9876543214', address: { street: '654 Beach Rd', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' } },
];

const generateRandomBill = async (customer, productsList, user, daysAgo) => {
  const itemCount = Math.floor(Math.random() * 2) + 1;
  const items = [];
  let subtotal = 0;
  
  for (let i = 0; i < itemCount; i++) {
    const product = productsList[Math.floor(Math.random() * productsList.length)];
    const quantity = Math.floor(Math.random() * 5) + 1;
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
  const discount = 0;
  const total = subtotal + gst - discount;
  
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  const bill = new Bill({
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
  
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { quantity: -item.quantity }
    });
  }
};

const setupDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Drop all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).drop();
      console.log(`   Dropped: ${collection.name}`);
    }
    console.log('✅ Cleared all existing data');
    
    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin'
    });
    
    const staff = await User.create({
      name: 'Staff User',
      email: 'staff@example.com',
      password: 'Staff@123',
      role: 'staff'
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
    for (let i = 0; i < 10; i++) {
      const customer = createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
      const user = Math.random() > 0.5 ? admin : staff;
      const daysAgo = Math.floor(Math.random() * 30);
      await generateRandomBill(customer, createdProducts, user, daysAgo);
    }
    
    console.log(`✅ 10 bills created`);
    
    console.log('\n🎉 Database setup complete!');
    console.log('================================');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Products: ${await Product.countDocuments()}`);
    console.log(`Customers: ${await Customer.countDocuments()}`);
    console.log(`Bills: ${await Bill.countDocuments()}`);
    console.log('================================');
    
    await mongoose.disconnect();
    console.log('\n🚀 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

setupDatabase();