import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { ShoppingCart, Plus, Minus, Trash2, Edit, Settings, X, Check, Clock, Users, DollarSign } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

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
  id: string;
  customerName: string;
  items: CartItem[];
  total: number;
  timestamp: any;
  specialInstructions?: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
}

const initialMenuItems: FoodItem[] = [
  // Breakfast
  { id: '1', name: 'Classic Pancakes', description: 'Fluffy pancakes with maple syrup and butter', price: 12.99, category: 'Breakfast', image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg', available: true },
  { id: '2', name: 'Avocado Toast', description: 'Sourdough bread with smashed avocado, cherry tomatoes, and feta', price: 14.99, category: 'Breakfast', image: 'https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg', available: true },
  { id: '3', name: 'Full English Breakfast', description: 'Eggs, bacon, sausages, beans, mushrooms, and toast', price: 18.99, category: 'Breakfast', image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg', available: true },
  
  // Lunch
  { id: '4', name: 'Grilled Chicken Salad', description: 'Mixed greens with grilled chicken, cherry tomatoes, and balsamic dressing', price: 16.99, category: 'Lunch', image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg', available: true },
  { id: '5', name: 'Caesar Wrap', description: 'Chicken caesar salad wrapped in a flour tortilla', price: 13.99, category: 'Lunch', image: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg', available: true },
  { id: '6', name: 'Fish & Chips', description: 'Beer-battered cod with crispy fries and mushy peas', price: 19.99, category: 'Lunch', image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg', available: true },
  { id: '7', name: 'Margherita Pizza', description: 'Fresh mozzarella, tomato sauce, and basil on thin crust', price: 17.99, category: 'Lunch', image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg', available: true },
  
  // Dinner
  { id: '8', name: 'Ribeye Steak', description: '12oz ribeye with garlic mashed potatoes and seasonal vegetables', price: 32.99, category: 'Dinner', image: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg', available: true },
  { id: '9', name: 'Grilled Salmon', description: 'Atlantic salmon with lemon herb butter and rice pilaf', price: 26.99, category: 'Dinner', image: 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg', available: true },
  { id: '10', name: 'Chicken Parmesan', description: 'Breaded chicken breast with marinara sauce and mozzarella', price: 22.99, category: 'Dinner', image: 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg', available: true },
  { id: '11', name: 'Vegetarian Pasta', description: 'Penne with roasted vegetables in a creamy pesto sauce', price: 18.99, category: 'Dinner', image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg', available: true },
  
  // Desserts
  { id: '12', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center and vanilla ice cream', price: 8.99, category: 'Desserts', image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg', available: true },
  { id: '13', name: 'Tiramisu', description: 'Classic Italian dessert with coffee-soaked ladyfingers', price: 7.99, category: 'Desserts', image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg', available: true },
  { id: '14', name: 'Cheesecake', description: 'New York style cheesecake with berry compote', price: 7.99, category: 'Desserts', image: 'https://images.pexels.com/photos/140831/pexels-photo-140831.jpeg', available: true },
  
  // Beverages
  { id: '15', name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 4.99, category: 'Beverages', image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg', available: true },
  { id: '16', name: 'Cappuccino', description: 'Espresso with steamed milk and foam', price: 4.50, category: 'Beverages', image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', available: true },
  { id: '17', name: 'Craft Beer', description: 'Local IPA on tap', price: 6.99, category: 'Beverages', image: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg', available: true },
  { id: '18', name: 'House Wine', description: 'Red or white wine by the glass', price: 8.99, category: 'Beverages', image: 'https://images.pexels.com/photos/434311/pexels-photo-434311.jpeg', available: true },
  
  // Appetizers
  { id: '19', name: 'Buffalo Wings', description: 'Spicy chicken wings with blue cheese dip', price: 11.99, category: 'Appetizers', image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg', available: true },
  { id: '20', name: 'Mozzarella Sticks', description: 'Breaded mozzarella with marinara sauce', price: 9.99, category: 'Appetizers', image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', available: true },
  { id: '21', name: 'Loaded Nachos', description: 'Tortilla chips with cheese, jalapeños, and sour cream', price: 13.99, category: 'Appetizers', image: 'https://images.pexels.com/photos/1108117/pexels-photo-1108117.jpeg', available: true }
];

export default function App() {
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
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState<Omit<FoodItem, 'id'>>({
    name: '',
    description: '',
    price: 0,
    category: 'Lunch',
    image: '',
    available: true
  });

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
        // Only set initial items if we have no items at all
        setMenuItems(prevItems => prevItems.length === 0 ? initialMenuItems : prevItems);
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
      ordersList.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return b.timestamp.seconds - a.timestamp.seconds;
        }
        return 0;
      });
      
      setOrders(ordersList);
    });

    return () => unsubscribe();
  }, []);

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

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    
    if (!customerName.trim()) {
      toast.error('Please enter your name!');
      return;
    }

    try {
      const order: Omit<Order, 'id'> = {
        customerName: customerName.trim(),
        items: cart,
        total: getTotalPrice(),
        timestamp: new Date(),
        specialInstructions: specialInstructions.trim() || undefined,
        status: 'pending'
      };

      await addDoc(collection(db, 'orders'), order);
      
      toast.success('Order placed successfully!');
      setCart([]);
      setCustomerName('');
      setSpecialInstructions('');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
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

  const deleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const toggleItemAvailability = async (itemId: string) => {
    try {
      const item = menuItems.find(item => item.id === itemId);
      if (!item) return;
      
      await updateDoc(doc(db, 'menuItems', itemId), { 
        available: !item.available 
      });
      
      toast.success(`${item.name} is now ${!item.available ? 'available' : 'unavailable'}`);
    } catch (error) {
      console.error('Error updating item availability:', error);
      toast.error('Failed to update item availability');
    }
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.description || newItem.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addDoc(collection(db, 'menuItems'), newItem);
      toast.success('Menu item added successfully!');
      setShowAddItem(false);
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category: 'Lunch',
        image: '',
        available: true
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
    }
  };

  const updateMenuItem = async () => {
    if (!editingItem) return;

    try {
      const { id, ...updateData } = editingItem;
      await updateDoc(doc(db, 'menuItems', id), updateData);
      toast.success('Menu item updated successfully!');
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'menuItems', itemId));
      toast.success('Menu item deleted successfully!');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === import.meta.env.VITE_ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      toast.success('Admin access granted!');
    } else {
      toast.error('Invalid admin password');
      setAdminPassword('');
    }
  };

  const categories = ['Breakfast', 'Appetizers', 'Lunch', 'Dinner', 'Desserts', 'Beverages'];

  if (!menuLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delicious Bites</h1>
                <p className="text-sm text-gray-600">Fresh food, delivered fast</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isAdmin && (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                </button>
              )}
              
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600 font-medium">Admin Mode</span>
                  <button
                    onClick={() => setIsAdmin(false)}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin ? (
          // Admin Dashboard
          <div className="space-y-8">
            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <Users className="h-12 w-12 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {orders.filter(order => order.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-12 w-12 text-orange-500" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-12 w-12 text-green-500" />
                </div>
              </div>
            </div>

            {/* Menu Management */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <p className="text-lg font-bold text-orange-600">${item.price}</p>
                      <p className="text-sm text-gray-500">Category: {item.category}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleItemAvailability(item.id)}
                          className={`p-1 rounded ${
                            item.available 
                              ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                              : 'bg-green-100 hover:bg-green-200 text-green-600'
                          }`}
                        >
                          {item.available ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteMenuItem(item.id)}
                          className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Orders Management */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders Management</h2>
              
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{order.customerName}</h3>
                        <p className="text-sm text-gray-600">
                          {order.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}
                        </p>
                        {order.specialInstructions && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Special Instructions:</strong> {order.specialInstructions}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="px-3 py-1 border rounded-md text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                        </select>
                        
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {orders.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Customer View
          <div>
            {/* Menu Display */}
            <div className="space-y-8">
              {categories.map(category => {
                const categoryItems = menuItems.filter(item => item.category === category);
                if (categoryItems.length === 0) return null;
                
                return (
                  <div key={category}>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryItems.map(item => (
                        <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                            <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-2xl font-bold text-orange-600">${item.price}</span>
                              {item.available ? (
                                <button
                                  onClick={() => addToCart(item)}
                                  className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span>Add</span>
                                </button>
                              ) : (
                                <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg">
                                  Unavailable
                                </span>
                              )}
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
        )}
      </div>

      {/* Floating Cart Button (Customer View Only) */}
      {!isAdmin && cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="group relative">
            {/* Cart Button */}
            <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <ShoppingCart className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </button>
            
            {/* Cart Details on Hover */}
            <div className="absolute bottom-16 right-0 w-80 bg-white rounded-xl shadow-2xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Order</h3>
                
                {/* Customer Name Input */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                {/* Special Instructions */}
                <div className="mb-4">
                  <textarea
                    placeholder="Special instructions (optional)"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>
                
                {/* Cart Items */}
                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-orange-600 font-semibold">${item.price}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Minus className="h-4 w-4 text-gray-600" />
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Plus className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total and Actions */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-orange-600">${getTotalPrice().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={clearCart}
                      className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={placeOrder}
                      className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Login</h2>
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-6"
            />
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAdminLogin(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminLogin}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Menu Item</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              
              <textarea
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={3}
              />
              
              <input
                type="number"
                placeholder="Price"
                step="0.01"
                value={newItem.price || ''}
                onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <input
                type="url"
                placeholder="Image URL"
                value={newItem.image}
                onChange={(e) => setNewItem({...newItem, image: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowAddItem(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addMenuItem}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Menu Item</h2>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item name"
                value={editingItem.name}
                onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              
              <textarea
                placeholder="Description"
                value={editingItem.description}
                onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={3}
              />
              
              <input
                type="number"
                placeholder="Price"
                step="0.01"
                value={editingItem.price}
                onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              
              <select
                value={editingItem.category}
                onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <input
                type="url"
                placeholder="Image URL"
                value={editingItem.image}
                onChange={(e) => setEditingItem({...editingItem, image: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateMenuItem}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}