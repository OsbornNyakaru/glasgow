import React, { useState, useEffect } from 'react';
import { Clock, Users, ShoppingCart, Settings, Download, Plus, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react';

// Types
interface FoodItem {
  id: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
  category: string;
  image?: string;
}

interface Order {
  id: string;
  customerName: string;
  items: FoodItem[];
  specialInstructions: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'completed';
}

// Utility functions
const getCurrentTime = () => new Date();
const isOrderingTime = () => {
  const now = getCurrentTime();
  const cutoffTime = new Date();
  cutoffTime.setHours(12, 45, 0, 0);
  return now < cutoffTime;
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const exportToCSV = (orders: Order[]) => {
  const headers = ['Order ID', 'Customer Name', 'Items', 'Special Instructions', 'Time', 'Status'];
  const rows = orders.map(order => [
    order.id,
    order.customerName,
    order.items.map(item => `${item.name} (KES ${item.price})`).join('; '),
    order.specialInstructions || 'None',
    formatTime(order.timestamp),
    order.status
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `food-orders-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Sample data
const initialMenuItems: FoodItem[] = [
  // Chapati-Based Meals
  {
    id: '1',
    name: 'Chapati with Beans',
    price: 120,
    description: 'Soft chapati served with beans',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2',
    name: 'Chapati with Ndengu',
    price: 120,
    description: 'Soft chapati served with green grams (ndengu)',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '3',
    name: 'Chapati with Matumbo',
    price: 140,
    description: 'Soft chapati served with matumbo (tripe)',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/6419733/pexels-photo-6419733.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '4',
    name: 'Chapati with Beef',
    price: 160,
    description: 'Soft chapati served with tender beef stew',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/11401287/pexels-photo-11401287.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '5',
    name: 'Chapati with Kuku',
    price: 170,
    description: 'Soft chapati served with chicken (kuku)',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '6',
    name: 'Chapati with Mayai',
    price: 120,
    description: 'Soft chapati served with eggs (mayai)',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '7',
    name: 'Chapati with Pork',
    price: 170,
    description: 'Soft chapati served with pork stew',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/323682/pexels-photo-323682.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  
  // Rice-Based Meals
  {
    id: '8',
    name: 'Rice with Beans',
    price: 120,
    description: 'Steamed rice served with beans',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '9',
    name: 'Rice with Ndengu',
    price: 120,
    description: 'Steamed rice served with green grams (ndengu)',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '10',
    name: 'Rice with Matumbo',
    price: 140,
    description: 'Steamed rice served with matumbo (tripe)',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/6419733/pexels-photo-6419733.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '11',
    name: 'Rice with Beef',
    price: 160,
    description: 'Steamed rice served with tender beef stew',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/11401287/pexels-photo-11401287.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '12',
    name: 'Rice with Kuku',
    price: 170,
    description: 'Steamed rice served with chicken (kuku)',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '13',
    name: 'Rice with Mayai',
    price: 120,
    description: 'Steamed rice served with eggs (mayai)',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '14',
    name: 'Rice with Pork',
    price: 170,
    description: 'Steamed rice served with pork stew',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/323682/pexels-photo-323682.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  
  // Ugali-Based Meals
  {
    id: '15',
    name: 'Ugali with Matumbo',
    price: 140,
    description: 'Traditional ugali served with matumbo (tripe)',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/6419733/pexels-photo-6419733.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '16',
    name: 'Ugali with Beef',
    price: 160,
    description: 'Traditional ugali served with tender beef stew',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/11401287/pexels-photo-11401287.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '17',
    name: 'Ugali with Kuku',
    price: 170,
    description: 'Traditional ugali served with chicken (kuku)',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '18',
    name: 'Ugali with Mayai',
    price: 120,
    description: 'Traditional ugali served with eggs (mayai)',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '19',
    name: 'Ugali with Pork',
    price: 170,
    description: 'Traditional ugali served with pork stew',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/323682/pexels-photo-323682.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '20',
    name: 'Ugali with Omena',
    price: 120,
    description: 'Traditional ugali served with omena (small dried fish)',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/6419733/pexels-photo-6419733.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  
  // Special Rice Dishes
  {
    id: '21',
    name: 'Pilau',
    price: 140,
    description: 'Fragrant spiced rice cooked with meat and aromatic spices',
    available: true,
    category: 'Special Rice',
    image: 'https://images.pexels.com/photos/8753657/pexels-photo-8753657.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

function App() {
  const [currentView, setCurrentView] = useState<'user' | 'admin'>('user');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [menuItems, setMenuItems] = useState<FoodItem[]>(initialMenuItems);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedItems, setSelectedItems] = useState<FoodItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<FoodItem>>({});

  // Time check effect
  useEffect(() => {
    const timer = setInterval(() => {
      // Force re-render to update time-based restrictions
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  // User functions
  const handleItemSelect = (item: FoodItem) => {
    if (!item.available) return;
    
    const isSelected = selectedItems.some(selected => selected.id === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(selected => selected.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOrderingTime()) {
      alert('Sorry, ordering is closed for today. Orders must be placed before 12:45 PM.');
      return;
    }
    
    if (selectedItems.length === 0 || !customerName.trim()) {
      alert('Please select at least one item and provide your name.');
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      customerName: customerName.trim(),
      items: selectedItems,
      specialInstructions: specialInstructions.trim(),
      timestamp: new Date(),
      status: 'pending'
    };

    setOrders([...orders, newOrder]);
    setSelectedItems([]);
    setCustomerName('');
    setSpecialInstructions('');
    setShowSuccess(true);
    
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Admin functions
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setIsAdminLoggedIn(true);
      setCurrentView('admin');
    } else {
      alert('Invalid password');
    }
  };

  const handleItemSave = () => {
    if (editingItem) {
      setMenuItems(menuItems.map(item => 
        item.id === editingItem.id ? editingItem : item
      ));
    } else if (newItem.name && newItem.price) {
      const item: FoodItem = {
        id: Date.now().toString(),
        name: newItem.name,
        price: Number(newItem.price),
        description: newItem.description || '',
        available: true,
        category: newItem.category || 'Other'
      };
      setMenuItems([...menuItems, item]);
    }
    setEditingItem(null);
    setNewItem({});
  };

  const handleItemDelete = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + item.price, 0);
  };

  const groupedMenuItems = menuItems.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, FoodItem[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Workshop Food Orders</h1>
                <p className="text-sm text-gray-600">3-Week Training Program</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatTime(getCurrentTime())}
                </p>
                <p className="text-xs text-gray-500">
                  {isOrderingTime() ? 'Ordering Open' : 'Ordering Closed'}
                </p>
              </div>
              <button
                onClick={() => setCurrentView(currentView === 'user' ? 'admin' : 'user')}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                {currentView === 'user' ? <Settings className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>Order placed successfully!</span>
        </div>
      )}

      {/* User View */}
      {currentView === 'user' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Order Status */}
          <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <h2 className="font-medium text-gray-900">Today's Lunch Orders</h2>
                <p className="text-sm text-gray-600">
                  {isOrderingTime() 
                    ? 'Orders close at 12:45 PM' 
                    : 'Ordering has closed for today'}
                </p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="space-y-6">
            {Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">{category}</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        !item.available
                          ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                          : selectedItems.some(selected => selected.id === item.id)
                          ? 'bg-orange-50 border-orange-300'
                          : 'bg-white border-gray-200 hover:border-orange-200'
                      }`}
                      onClick={() => handleItemSelect(item)}
                    >
                      <div className="flex items-center space-x-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            {!item.available && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                                Unavailable
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-900">KES {item.price}</p>
                          {selectedItems.some(selected => selected.id === item.id) && (
                            <CheckCircle className="w-5 h-5 text-orange-600 mx-auto mt-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Form */}
          {selectedItems.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Your Order</h3>
              </div>
              <form onSubmit={handleOrderSubmit} className="p-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Selected Items:</h4>
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-medium">KES {item.price}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>KES {getTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Any special requests or dietary requirements..."
                    rows={3}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!isOrderingTime()}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isOrderingTime() ? 'Place Order' : 'Ordering Closed'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Admin View */}
      {currentView === 'admin' && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          {!isAdminLoggedIn ? (
            <div className="max-w-md mx-auto mt-16">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Login</h2>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter admin password"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    Login
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-4">Demo password: admin123</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Admin Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => exportToCSV(orders)}
                    className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Orders</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAdminLoggedIn(false);
                      setCurrentView('user');
                    }}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Orders Section */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-gray-900">Today's Orders ({orders.length})</h3>
                </div>
                <div className="p-4">
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No orders yet today.</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{order.customerName}</h4>
                            <span className="text-sm text-gray-500">{formatTime(order.timestamp)}</span>
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Items:</strong> {order.items.map(item => item.name).join(', ')}
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Total:</strong> KES {order.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                          </div>
                          {order.specialInstructions && (
                            <div className="text-sm text-gray-600">
                              <strong>Instructions:</strong> {order.specialInstructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Menu Management */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Menu Management</h3>
                  <button
                    onClick={() => setEditingItem({} as FoodItem)}
                    className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>
                <div className="p-4">
                  {editingItem && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-4">
                        {editingItem.id ? 'Edit Item' : 'Add New Item'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={editingItem.name || ''}
                            onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={editingItem.price || ''}
                            onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select
                            value={editingItem.category || ''}
                            onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="">Select category</option>
                            <option value="Chapati Meals">Chapati Meals</option>
                            <option value="Rice Meals">Rice Meals</option>
                            <option value="Ugali Meals">Ugali Meals</option>
                            <option value="Special Rice">Special Rice</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <input
                            type="text"
                            value={editingItem.description || ''}
                            onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={handleItemSave}
                          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {menuItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <span className="text-sm text-gray-500">{item.category}</span>
                            <span className="font-medium text-gray-900">KES {item.price}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleItemAvailability(item.id)}
                            className={`p-1 rounded ${
                              item.available 
                                ? 'text-green-600 hover:bg-green-50' 
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            {item.available ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleItemDelete(item.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;