import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Minus, ShoppingCart, User, X, UserPlus, Scan } from 'lucide-react';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productCode, setProductCode] = useState('');
  const productCodeRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    productCodeRef.current?.focus();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products || []);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data.customers || []);
    } catch (error) {
      toast.error('Failed to fetch customers');
    }
  };

  // Handle product code entry (Enter key)
  const handleProductCodeSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const code = productCode.trim();
      if (code) {
        addProductByCode(code);
        setProductCode('');
      }
    }
  };

  const addProductByCode = (code) => {
    // Search by SKU
    const product = products.find(p => 
      p.sku.toLowerCase() === code.toLowerCase() ||
      p.name.toLowerCase().includes(code.toLowerCase())
    );
    
    if (product) {
      addToCart(product);
      toast.success(`${product.name} added`);
    } else {
      toast.error('Product not found. Check code.');
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product._id === product._id);
    if (existingItem) {
      if (existingItem.quantity + 1 > product.quantity) {
        toast.error('Not enough stock');
        return;
      }
      setCart(cart.map(item =>
        item.product._id === product._id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      if (product.quantity < 1) {
        toast.error('Out of stock');
        return;
      }
      setCart([...cart, {
        product: product,
        quantity: 1,
        price: product.wholesalePrice,
        total: product.wholesalePrice
      }]);
    }
  };

  const updateQuantity = (index, newQuantity) => {
    const item = cart[index];
    if (newQuantity < 1) {
      removeFromCart(index);
      return;
    }
    if (newQuantity > item.product.quantity) {
      toast.error(`Only ${item.product.quantity} available`);
      return;
    }
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    updatedCart[index].total = newQuantity * updatedCart[index].price;
    setCart(updatedCart);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + item.total, 0);
  const calculateGST = () => calculateSubtotal() * 0.18;
  const calculateDiscount = () => cart.some(item => item.quantity > 50) ? calculateSubtotal() * 0.05 : 0;
  const calculateTotal = () => calculateSubtotal() + calculateGST() - calculateDiscount();

  const handleQuickAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Name and Phone required');
      return;
    }

    try {
      const response = await api.post('/customers', {
        name: newCustomer.name,
        email: newCustomer.email || `customer_${Date.now()}@example.com`,
        phone: newCustomer.phone,
        address: { street: 'Walk-in Customer' }
      });
      toast.success('Customer added!');
      setCustomers([...customers, response.data.customer]);
      setSelectedCustomer(response.data.customer);
      setShowNewCustomerForm(false);
      setNewCustomer({ name: '', phone: '', email: '' });
    } catch (error) {
      toast.error('Failed to add customer');
    }
  };

  const handleGenerateBill = async () => {
    if (!selectedCustomer) {
      toast.error('Select or add customer');
      return;
    }
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setLoading(true);
    try {
      const billData = {
        customerId: selectedCustomer._id,
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        subtotal: calculateSubtotal(),
        gst: calculateGST(),
        discount: calculateDiscount(),
        total: calculateTotal()
      };

      const response = await api.post('/bills', billData);
      toast.success('Bill generated!');
      
      printInvoice(response.data.bill);
      
      setCart([]);
      setSelectedCustomer(null);
      fetchProducts();
      productCodeRef.current?.focus();
    } catch (error) {
      toast.error('Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = (bill) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${bill.billNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .invoice-title { font-size: 20px; margin: 20px 0; }
            .details { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { text-align: right; margin-top: 20px; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">Wholesale Billing System</div>
            <div>123 Business Street, Mumbai - 400001</div>
          </div>
          <div class="invoice-title">INVOICE</div>
          <div class="details">
            <strong>Bill No:</strong> ${bill.billNumber}<br>
            <strong>Date:</strong> ${new Date(bill.createdAt).toLocaleString()}<br>
            <strong>Customer:</strong> ${bill.customer.name}<br>
            <strong>Phone:</strong> ${bill.customer.phone}
          </div>
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              ${bill.items.map(item => `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>₹${item.price}</td><td>₹${item.total}</td></tr>`).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Subtotal: ₹${bill.subtotal}</p>
            <p>GST (18%): ₹${bill.gst}</p>
            ${bill.discount > 0 ? `<p>Discount: -₹${bill.discount}</p>` : ''}
            <h3>Total: ₹${bill.total}</h3>
          </div>
          <div class="footer">Thank you!</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Left Panel */}
      <div className="lg:w-1/2 space-y-4">
        {/* Product Code Entry */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Scan className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Enter Product Code</h2>
          </div>
          <p className="text-indigo-100 text-sm mb-3">Type product SKU or name and press Enter</p>
          <input
            ref={productCodeRef}
            type="text"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            onKeyPress={handleProductCodeSubmit}
            placeholder="Enter product code (e.g., ELEC001) or name..."
            className="w-full px-4 py-3 rounded-lg text-lg font-mono focus:outline-none focus:ring-2 focus:ring-white"
            autoFocus
          />
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Products</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
              <div key={product._id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => addToCart(product)}>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-gray-500">SKU: {product.sku} | Stock: {product.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">{formatCurrency(product.wholesalePrice)}</p>
                  <Plus className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="lg:w-1/2 space-y-4">
        {/* Customer */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Customer</h2>
            <button onClick={() => setShowNewCustomerForm(!showNewCustomerForm)} className="flex items-center space-x-1 text-indigo-600">
              <UserPlus className="h-4 w-4" />
              <span className="text-sm">New Customer</span>
            </button>
          </div>
          
          {showNewCustomerForm ? (
            <div className="space-y-3">
              <input type="text" placeholder="Name *" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input type="tel" placeholder="Phone *" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <div className="flex space-x-2">
                <button onClick={handleQuickAddCustomer} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg">Add</button>
                <button onClick={() => setShowNewCustomerForm(false)} className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          ) : (
            <select className="w-full px-3 py-2 border rounded-lg" value={selectedCustomer?._id || ''} onChange={(e) => {
              const customer = customers.find(c => c._id === e.target.value);
              setSelectedCustomer(customer);
            }}>
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>)}
            </select>
          )}
        </div>

        {/* Cart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cart</h2>
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2" />
              <p>Add products by entering code</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => updateQuantity(index, item.quantity - 1)} className="text-gray-600"><Minus className="h-4 w-4" /></button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, item.quantity + 1)} className="text-gray-600"><Plus className="h-4 w-4" /></button>
                      <button onClick={() => removeFromCart(index)} className="text-red-600"><Trash2 className="h-5 w-5" /></button>
                    </div>
                    <div className="ml-4 font-bold">{formatCurrency(item.total)}</div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(calculateSubtotal())}</span></div>
                <div className="flex justify-between"><span>GST (18%):</span><span>{formatCurrency(calculateGST())}</span></div>
                {calculateDiscount() > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span><span>-{formatCurrency(calculateDiscount())}</span></div>}
                <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total:</span><span className="text-indigo-600">{formatCurrency(calculateTotal())}</span></div>
              </div>
              
              <button onClick={handleGenerateBill} disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-lg mt-4 font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
                {loading ? 'Generating...' : 'Generate Bill'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;