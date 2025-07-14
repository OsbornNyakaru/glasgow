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

// Sample data with main course meals
const initialMenuItems: FoodItem[] = [
  // Chapati Meals
  {
    id: '1',
    name: 'Chapati with Beans',
    price: 120,
    description: 'Soft chapati served with delicious cooked beans',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '2',
    name: 'Chapati with Ndengu',
    price: 120,
    description: 'Fresh chapati with nutritious green gram (ndengu)',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '3',
    name: 'Chapati with Matumbo',
    price: 140,
    description: 'Chapati served with well-prepared matumbo (tripe)',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '4',
    name: 'Chapati with Beef',
    price: 160,
    description: 'Soft chapati with tender beef stew',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '5',
    name: 'Chapati with Kuku',
    price: 170,
    description: 'Chapati served with flavorful chicken (kuku)',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '6',
    name: 'Chapati with Mayai',
    price: 120,
    description: 'Chapati with scrambled eggs (mayai)',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '7',
    name: 'Chapati with Pork',
    price: 170,
    description: 'Chapati served with succulent pork',
    available: true,
    category: 'Chapati Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },

  // Rice Meals
  {
    id: '8',
    name: 'Rice with Beans',
    price: 120,
    description: 'Steamed rice served with cooked beans',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  },
  {
    id: '9',
    name: 'Rice with Ndengu',
    price: 120,
    description: 'White rice with green gram (ndengu)',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  },
  {
    id: '10',
    name: 'Rice with Matumbo',
    price: 140,
    description: 'Rice served with well-prepared matumbo',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  },
  {
    id: '11',
    name: 'Rice with Beef',
    price: 160,
    description: 'Steamed rice with tender beef stew',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  },
  {
    id: '12',
    name: 'Rice with Kuku',
    price: 170,
    description: 'Rice served with chicken (kuku)',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  },
  {
    id: '13',
    name: 'Rice with Mayai',
    price: 120,
    description: 'Rice with scrambled eggs',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  },
  {
    id: '14',
    name: 'Rice with Pork',
    price: 170,
    description: 'Rice served with pork',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  },

  // Ugali Meals
  {
    id: '15',
    name: 'Ugali with Matumbo',
    price: 140,
    description: 'Traditional ugali with matumbo',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '16',
    name: 'Ugali with Beef',
    price: 160,
    description: 'Ugali served with beef stew',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '17',
    name: 'Ugali with Kuku',
    price: 170,
    description: 'Ugali with chicken',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '18',
    name: 'Ugali with Mayai',
    price: 120,
    description: 'Ugali with eggs',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '19',
    name: 'Ugali with Pork',
    price: 170,
    description: 'Ugali served with pork',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    id: '20',
    name: 'Ugali with Omena',
    price: 120,
    description: 'Traditional ugali with omena (small fish)',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },

  // Special Rice
  {
    id: '21',
    name: 'Pilau',
    price: 140,
    description: 'Aromatic spiced rice (pilau)',
    available: true,
    category: 'Special Rice',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  }
];

function App() {
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');
  const [menuItems, setMenuItems] = useState<FoodItem[]>(initialMenuItems);
  const [cart, setCart] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const addToCart = (item: FoodItem) => {
    if (!isOrderingTime()) {
      alert('Ordering is closed. Orders must be placed before 12:45 PM.');
      return;
    }
    setCart([...cart, item]);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price, 0);
  };

  const submitOrder = () => {
    if (!customerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (cart.length === 0) {
      alert('Please add items to your cart');
      return;
    }
    if (!isOrderingTime()) {
      alert('Ordering is closed. Orders must be placed before 12:45 PM.');
      return;
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      customerName: customerName.trim(),
      items: [...cart],
      specialInstructions: specialInstructions.trim(),
      timestamp: getCurrentTime(),
      status: 'pending'
    };

    setOrders([...orders, newOrder]);
    setCart([]);
    setCustomerName('');
    setSpecialInstructions('');
    alert('Order submitted successfully!');
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const addMenuItem = (item: Omit<FoodItem, 'id'>) => {
    const newItem: FoodItem = {
      ...item,
      id: Date.now().toString()
    };
    setMenuItems([...menuItems, newItem]);
    setShowAddItemForm(false);
  };

  const updateMenuItem = (updatedItem: FoodItem) => {
    setMenuItems(menuItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingItem(null);
  };

  const deleteMenuItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems(menuItems.filter(item => item.id !== itemId));
    }
  };

  const toggleItemAvailability = (itemId: string) => {
    setMenuItems(menuItems.map(item => 
      item.id === itemId ? { ...item, available: !item.available } : item
    ));
  };

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  const categories = ['Chapati Meals', 'Rice Meals', 'Ugali Meals', 'Special Rice'];

  const AddItemForm = ({ onSubmit, initialItem, onCancel }: {
    onSubmit: (item: Omit<FoodItem, 'id'> | FoodItem) => void;
    initialItem?: FoodItem;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: initialItem?.name || '',
      price: initialItem?.price || 0,
      description: initialItem?.description || '',
      category: initialItem?.category || 'Chapati Meals',
      available: initialItem?.available ?? true,
      image: initialItem?.image || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (initialItem) {
        onSubmit({ ...initialItem, ...formData });
      } else {
        onSubmit(formData);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">
            {initialItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (KES)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full p-2 border rounded-lg"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-lg"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full p-2 border rounded-lg"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="available" className="text-sm font-medium">Available</label>
            </div>
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                {initialItem ? 'Update' : 'Add'} Item
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => exportToCSV(orders)}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <Download className="w-4 h-4" />
                  Export Orders
                </button>
                <button
                  onClick={() => setCurrentView('customer')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Customer View
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Orders ({orders.length})
                </h2>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium">{order.customerName}</h3>
                          <p className="text-sm text-gray-500">{formatTime(order.timestamp)}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            className={`p-1 rounded ${order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}
                            title="Confirm Order"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className={`p-1 rounded ${order.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                            title="Complete Order"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm">
                        <p className="mb-1">
                          <strong>Items:</strong> {order.items.map(item => `${item.name} (KES ${item.price})`).join(', ')}
                        </p>
                        <p className="mb-1">
                          <strong>Total:</strong> KES {order.items.reduce((sum, item) => sum + item.price, 0)}
                        </p>
                        {order.specialInstructions && (
                          <p><strong>Instructions:</strong> {order.specialInstructions}</p>
                        )}
                        <p className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Menu Management Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Menu Management</h2>
                <button
                  onClick={() => setShowAddItemForm(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {categories.map(category => {
                  const items = groupedMenuItems[category] || [];
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <h3 className="font-medium text-gray-700 mb-2">{category}</h3>
                      <div className="space-y-2 ml-4">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-gray-600">KES {item.price}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleItemAvailability(item.id)}
                                className={`p-1 rounded ${item.available ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                title={item.available ? 'Available' : 'Unavailable'}
                              >
                                {item.available ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => setEditingItem(item)}
                                className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                title="Edit Item"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteMenuItem(item.id)}
                                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                title="Delete Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Item Modal */}
        {showAddItemForm && (
          <AddItemForm
            onSubmit={addMenuItem}
            onCancel={() => setShowAddItemForm(false)}
          />
        )}
        {editingItem && (
          <AddItemForm
            onSubmit={updateMenuItem}
            initialItem={editingItem}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold">Workshop Food Ordering</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatTime(currentTime)}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  isOrderingTime() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isOrderingTime() ? 'Open' : 'Closed'}
                </span>
              </div>
              <button
                onClick={() => setCurrentView('admin')}
                className="flex items-center gap-2 bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 text-sm"
              >
                <Settings className="w-4 h-4" />
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Today's Menu</h2>
              
              {!isOrderingTime() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 text-sm">
                    ⚠️ Ordering is currently closed. Orders must be placed before 12:45 PM.
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {categories.map(category => {
                  const items = groupedMenuItems[category] || [];
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={category}>
                      <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                        {category === 'Chapati Meals' && '🥖'}
                        {category === 'Rice Meals' && '🍚'}
                        {category === 'Ugali Meals' && '🌽'}
                        {category === 'Special Rice' && '🍛'}
                        {category}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {items.map(item => (
                          <div key={item.id} className={`border rounded-lg p-4 ${!item.available ? 'opacity-50' : ''}`}>
                            <div className="flex gap-3">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                                  <span className="text-lg font-bold text-blue-600 ml-2">KES {item.price}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                                <button
                                  onClick={() => addToCart(item)}
                                  disabled={!item.available || !isOrderingTime()}
                                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${
                                    item.available && isOrderingTime()
                                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  {!item.available ? 'Unavailable' : !isOrderingTime() ? 'Ordering Closed' : 'Add to Cart'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Your Order ({cart.length})
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    placeholder="Enter your name"
                    disabled={!isOrderingTime()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Special Instructions (Optional)</label>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                    rows={2}
                    placeholder="Any special requests..."
                    disabled={!isOrderingTime()}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                ) : (
                  cart.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-blue-600 font-medium">KES {item.price}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        disabled={!isOrderingTime()}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-blue-600">KES {getTotalPrice()}</span>
                  </div>
                  <button
                    onClick={submitOrder}
                    disabled={!isOrderingTime() || !customerName.trim() || cart.length === 0}
                    className={`w-full py-3 px-4 rounded-lg font-medium ${
                      isOrderingTime() && customerName.trim() && cart.length > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {!isOrderingTime() ? 'Ordering Closed' : 'Submit Order'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;