import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { ShoppingCart, Plus, Minus, Edit2, Trash2, Settings, X, Check } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Types
interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

interface CartItem extends FoodItem {
  quantity: number;
}

interface Order {
  id?: string;
  items: CartItem[];
  customerName: string;
  specialInstructions: string;
  total: number;
  timestamp: any;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
}

// Initial menu items
const initialMenuItems: FoodItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Fresh tomatoes, mozzarella, basil',
    price: 12.99,
    category: 'Pizza',
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
    available: true
  },
  {
    id: '2',
    name: 'Pepperoni Pizza',
    description: 'Pepperoni, mozzarella, tomato sauce',
    price: 14.99,
    category: 'Pizza',
    image: 'https://images.pexels.com/photos/708587/pexels-photo-708587.jpeg',
    available: true
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Romaine lettuce, parmesan, croutons',
    price: 8.99,
    category: 'Salads',
    image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
    available: true
  },
  {
    id: '4',
    name: 'Grilled Chicken',
    description: 'Herb-seasoned grilled chicken breast',
    price: 16.99,
    category: 'Main Course',
    image: 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg',
    available: true
  },
  {
    id: '5',
    name: 'Fish & Chips',
    description: 'Beer-battered fish with crispy fries',
    price: 15.99,
    category: 'Main Course',
    image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg',
    available: true
  },
  {
    id: '6',
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake with ganache',
    price: 6.99,
    category: 'Desserts',
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
    available: true
  },
  {
    id: '7',
    name: 'Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, cheese',
    price: 13.99,
    category: 'Burgers',
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
    available: true
  },
  {
    id: '8',
    name: 'Chicken Wings',
    description: 'Spicy buffalo wings with ranch dip',
    price: 11.99,
    category: 'Appetizers',
    image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg',
    available: true
  },
  {
    id: '9',
    name: 'Greek Salad',
    description: 'Olives, feta cheese, cucumber, tomatoes',
    price: 9.99,
    category: 'Salads',
    image: 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg',
    available: true
  },
  {
    id: '10',
    name: 'Pasta Carbonara',
    description: 'Creamy pasta with bacon and parmesan',
    price: 14.99,
    category: 'Pasta',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    available: true
  },
  {
    id: '11',
    name: 'Tiramisu',
    description: 'Classic Italian coffee-flavored dessert',
    price: 7.99,
    category: 'Desserts',
    image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg',
    available: true
  },
  {
    id: '12',
    name: 'Veggie Burger',
    description: 'Plant-based patty with avocado and sprouts',
    price: 12.99,
    category: 'Burgers',
    image: 'https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg',
    available: true
  },
  {
    id: '13',
    name: 'Mozzarella Sticks',
    description: 'Crispy breaded mozzarella with marinara',
    price: 8.99,
    category: 'Appetizers',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    available: true
  },
  {
    id: '14',
    name: 'BBQ Ribs',
    description: 'Slow-cooked ribs with BBQ sauce',
    price: 19.99,
    category: 'Main Course',
    image: 'https://images.pexels.com/photos/323682/pexels-photo-323682.jpeg',
    available: true
  },
  {
    id: '15',
    name: 'Mushroom Risotto',
    description: 'Creamy arborio rice with wild mushrooms',
    price: 16.99,
    category: 'Main Course',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    available: true
  },
  {
    id: '16',
    name: 'Ice Cream Sundae',
    description: 'Vanilla ice cream with chocolate sauce',
    price: 5.99,
    category: 'Desserts',
    image: 'https://images.pexels.com/photos/1362534/pexels-photo-1362534.jpeg',
    available: true
  },
  {
    id: '17',
    name: 'Hawaiian Pizza',
    description: 'Ham, pineapple, mozzarella',
    price: 15.99,
    category: 'Pizza',
    image: 'https://images.pexels.com/photos/708587/pexels-photo-708587.jpeg',
    available: true
  },
  {
    id: '18',
    name: 'Chicken Caesar Wrap',
    description: 'Grilled chicken, caesar dressing, lettuce',
    price: 10.99,
    category: 'Wraps',
    image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg',
    available: true
  },
  {
    id: '19',
    name: 'Seafood Paella',
    description: 'Spanish rice with mixed seafood',
    price: 22.99,
    category: 'Main Course',
    image: 'https://images.pexels.com/photos/16743489/pexels-photo-16743489.jpeg',
    available: true
  },
  {
    id: '20',
    name: 'Garlic Bread',
    description: 'Toasted bread with garlic butter',
    price: 4.99,
    category: 'Appetizers',
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    available: true
  },
  {
    id: '21',
    name: 'Fruit Smoothie',
    description: 'Mixed berry smoothie with yogurt',
    price: 6.99,
    category: 'Beverages',
    image: 'https://images.pexels.com/photos/775032/pexels-photo-775032.jpeg',
    available: true
  }
];

const App: React.FC = () => {
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<FoodItem>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    available: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Firestore: Initialize and listen for real-time updates to menu items
  useEffect(() => {
    const menuCol = collection(db, 'menuItems');
    
    const initializeMenu = async () => {
      try {
        // Check if menu items exist in Firestore
        const menuSnapshot = await getDocs(menuCol);
        
        if (menuSnapshot.empty) {
          // If no menu items exist, populate with initial data
          console.log('Initializing menu items in Firestore...');
          for (const item of initialMenuItems) {
            const { id, ...itemData } = item; // Remove the local id
            await addDoc(menuCol, itemData);
          }
          toast.success('Menu initialized successfully!');
        }
        
        // Set up real-time listener for menu items
        const unsub = onSnapshot(menuCol, (snapshot) => {
          const menuList: FoodItem[] = snapshot.docs.map(docSnap => ({ 
            ...docSnap.data(), 
            id: docSnap.id 
          }) as FoodItem);
          
          // Sort menu items by category and name for consistent display
          menuList.sort((a, b) => {
            if (a.category !== b.category) {
              return a.category.localeCompare(b.category);
            }
            return a.name.localeCompare(b.name);
          });
          
          setMenuItems(menuList);
          setMenuLoaded(true);
        });
        
        return unsub;
      } catch (error) {
        console.error('Error initializing menu:', error);
        toast.error('Failed to load menu items');
        // Fallback to local menu items if Firebase fails
        if (menuItems.length === 0) {
          setMenuItems(initialMenuItems);
        }
        setMenuLoaded(true);
      }
    };
    
    let unsubscribe: (() => void) | undefined;
    initializeMenu().then(unsub => {
      unsubscribe = unsub;
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Firestore: Listen for real-time updates to orders
  useEffect(() => {
    const ordersCol = collection(db, 'orders');
    const unsubscribe = onSnapshot(ordersCol, (snapshot) => {
      const ordersList: Order[] = snapshot.docs.map(doc => ({ 
        ...doc.data(), 
        id: doc.id 
      }) as Order);
      
      // Sort orders by timestamp (newest first)
      ordersList.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      setOrders(ordersList);
    });

    return () => unsubscribe();
  }, []);

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item: FoodItem) => {
    if (!item.available) {
      toast.error('This item is currently unavailable');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart!`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prevCart.filter(cartItem => cartItem.id !== itemId);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    const order: Order = {
      items: cart,
      customerName: customerName.trim(),
      specialInstructions: specialInstructions.trim(),
      total: getTotalPrice(),
      timestamp: new Date(),
      status: 'pending'
    };

    try {
      await addDoc(collection(db, 'orders'), order);
      toast.success('Order placed successfully!');
      clearCart();
      setCustomerName('');
      setSpecialInstructions('');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      toast.success('Admin access granted');
    } else {
      toast.error('Invalid admin password');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    toast.success('Logged out of admin mode');
  };

  const toggleItemAvailability = async (itemId: string) => {
    try {
      const item = menuItems.find(item => item.id === itemId);
      if (!item) return;

      await updateDoc(doc(db, 'menuItems', itemId), {
        available: !item.available
      });

      toast.success(`${item.name} ${!item.available ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error updating item availability:', error);
      toast.error('Failed to update item availability');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.price || !newItem.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addDoc(collection(db, 'menuItems'), {
        ...newItem,
        available: true
      });

      toast.success('Menu item added successfully!');
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        available: true
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
    }
  };

  const updateMenuItem = async () => {
    if (!editingItem) return;

    try {
      await updateDoc(doc(db, 'menuItems', editingItem.id), {
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        category: editingItem.category,
        image: editingItem.image
      });

      toast.success('Menu item updated successfully!');
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await deleteDoc(doc(db, 'menuItems', itemId));
      toast.success('Menu item deleted successfully!');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  if (!menuLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">FoodieHub</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isAdmin ? (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Admin
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600 font-medium">Admin Mode</span>
                  <button
                    onClick={handleAdminLogout}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Admin Login</h2>
              <button
                onClick={() => setShowAdminLogin(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              <button
                onClick={handleAdminLogin}
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin ? (
          /* Admin Dashboard */
          <div className="space-y-8">
            {/* Menu Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Menu Management</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              </div>

              {/* Add Item Form */}
              {showAddForm && (
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-lg font-medium mb-4">Add New Menu Item</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={newItem.name || ''}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={newItem.price || ''}
                      onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={newItem.category || ''}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={newItem.image || ''}
                      onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <textarea
                      placeholder="Description"
                      value={newItem.description || ''}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addMenuItem}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              )}

              {/* Menu Items List */}
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    {editingItem?.id === item.id ? (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input
                          type="text"
                          value={editingItem.name}
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="number"
                          value={editingItem.price}
                          onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="text"
                          value={editingItem.category}
                          onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={updateMenuItem}
                            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                            <div>
                              <h3 className="font-medium text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-600">{item.description}</p>
                              <p className="text-sm font-medium text-orange-600">${item.price.toFixed(2)} • {item.category}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleItemAvailability(item.id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              item.available
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.available ? 'Available' : 'Unavailable'}
                          </button>
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteMenuItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Orders Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Orders Management</h2>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">Order from {order.customerName}</h3>
                          <p className="text-sm text-gray-600">
                            {order.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}
                          </p>
                          {order.specialInstructions && (
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Special Instructions:</strong> {order.specialInstructions}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id!, e.target.value as Order['status'])}
                            className="mt-2 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Customer View */
          <div>
            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <span className="text-lg font-bold text-orange-600">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                      {item.available ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Cart
                        </button>
                      ) : (
                        <span className="text-red-500 text-sm font-medium">Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button (Customer View Only) */}
      {!isAdmin && cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="group relative">
            {/* Cart Button */}
            <button className="bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-all duration-300 hover:scale-110">
              <div className="flex items-center">
                <ShoppingCart className="w-6 h-6" />
                <span className="ml-2 font-semibold hidden sm:inline">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
              {/* Item Count Badge */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                {getTotalItems()}
              </div>
            </button>

            {/* Cart Hover Panel */}
            <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Order</h3>
                
                {/* Cart Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Customer Info */}
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                  <textarea
                    placeholder="Special instructions (optional)"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    rows={2}
                  />
                </div>

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-lg text-orange-600">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={submitOrder}
                    className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors font-medium"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;