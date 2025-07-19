import React, { useState, useEffect } from 'react';
import { Clock, Users, ShoppingCart, Settings, Download, Plus, Edit3, Trash2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { Toaster, toast } from 'react-hot-toast';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';

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
const formatTime = (date: any) => {
  if (!date) return '';
  if (typeof date === 'number') date = new Date(date);
  if (typeof date.toDate === 'function') date = date.toDate();
  if (date instanceof Date) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }
  return '';
};

const exportToGoogleSheets = (orders: Order[]) => {
  const headers = ['Order ID', 'Customer Name', 'Items', 'Special Instructions', 'Time', 'Status'];
  const rows = orders.map(order => [
    order.id,
    order.customerName,
    order.items.map(item => `${item.name} (KES ${item.price})`).join('; '),
    order.specialInstructions || 'None',
    formatTime(order.timestamp),
    order.status
  ]);
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
  XLSX.writeFile(workbook, `food-orders-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Sample data with main course meals
const initialMenuItems: FoodItem[] = [
  // Chapati Meals
  {
    id: '1',
    name: 'Chapati with Beans',
    price: 130,
    description: 'Soft chapati served with delicious cooked beans',
    available: true,
    category: 'Chapati Meals',
    image: '../assets/images/chapo-beans.png'
  },
  {
    id: '2',
    name: 'Chapati with Greengrams',
    price: 130,
    description: 'Fresh chapati with nutritious green gram (ndengu)',
    available: true,
    category: 'Chapati Meals',
    image: '../assets/images/chapo-greengrams.jpg'
  },
  {
    id: '3',
    name: 'Chapati with Matumbo',
    price: 150,
    description: 'Chapati served with well-prepared matumbo (tripe)',
    available: true,
    category: 'Chapati Meals',
    image: '../assets/images/chapo-matumbo.jpg'
  },
  {
    id: '4',
    name: 'Chapati with Beef',
    price: 170,
    description: 'Soft chapati with tender beef stew',
    available: true,
    category: 'Chapati Meals',
    image: '../assets/images/chapo-beef.jpg'
  },
  {
    id: '5',
    name: 'Chapati with Chicken',
    price: 180,
    description: 'Chapati served with flavorful chicken (kuku)',
    available: true,
    category: 'Chapati Meals',
    image: '../assets/images/chapo-chicken.jpg'
  },
  {
    id: '6',
    name: 'Chapati with Eggs',
    price: 130,
    description: 'Chapati with fried eggs (mayai)',
    available: true,
    category: 'Chapati Meals',
    image: '../assets/images/chapo-eggs.jpg'
  },
  {
    id: '7',
    name: 'Chapati with Pork',
    price: 180,
    description: 'Chapati served with succulent pork',
    available: true,
    category: 'Chapati Meals',
    image: '../assets/images/chapo-pork.jpg'
  },

  // Rice Meals
  {
    id: '8',
    name: 'Rice with Beans',
    price: 130,
    description: 'Steamed rice served with cooked beans',
    available: true,
    category: 'Rice Meals',
    image: '../assets/images/common.jpg'
  },
  {
    id: '9',
    name: 'Rice with Greengrams',
    price: 130,
    description: 'White rice with green gram (ndengu)',
    available: true,
    category: 'Rice Meals',
    image: '../assets/images/common.jpg'
  },
  {
    id: '10',
    name: 'Rice with Matumbo',
    price: 150,
    description: 'Rice served with well-prepared matumbo (tripe)',
    available: true,
    category: 'Rice Meals',
    image: '../assets/images/matumbo-rice.jpg'
  },
  {
    id: '11',
    name: 'Rice with Beef',
    price: 170,
    description: 'Steamed rice with tender beef stew',
    available: true,
    category: 'Rice Meals',
    image: '../assets/images/common.jpg'
  },
  {
    id: '12',
    name: 'Rice with Chicken',
    price: 180,
    description: 'Rice served with chicken (kuku)',
    available: true,
    category: 'Rice Meals',
    image: '../assets/images/rice-chicken.jpg'
  },
  {
    id: '13',
    name: 'Rice with Eggs',
    price: 130,
    description: 'Rice with fried eggs',
    available: true,
    category: 'Rice Meals',
    image: '../assets/images/common.jpg'
  },
  {
    id: '14',
    name: 'Rice with Pork',
    price: 180,
    description: 'Rice served with pork',
    available: true,
    category: 'Rice Meals',
    image: '../assets/images/common.jpg'
  },

  // Ugali Meals
  {
    id: '15',
    name: 'Ugali with Matumbo',
    price: 150,
    description: 'Traditional ugali with matumbo (tripe)',
    available: true,
    category: 'Ugali Meals',
    image: '../assets/images/common.jpg'
  },
  {
    id: '16',
    name: 'Ugali with Beef',
    price: 170,
    description: 'Ugali served with beef stew',
    available: true,
    category: 'Ugali Meals',
    image: '../assets/images/common.jpg'
  },
  {
    id: '17',
    name: 'Ugali with Chicken',
    price: 180,
    description: 'Ugali with chicken',
    available: true,
    category: 'Ugali Meals',
    image: '../assets/images/common.jpg'
  },
  {
    id: '18',
    name: 'Ugali with Eggs',
    price: 130,
    description: 'Ugali with eggs',
    available: true,
    category: 'Ugali Meals',
    image: '../assets/images/ugali-eggs.jpg'
  },
  {
    id: '19',
    name: 'Ugali with Pork',
    price: 180,
    description: 'Ugali served with pork',
    available: true,
    category: 'Ugali Meals',
    image: '../assets/images/ugali-pork.jpg'
  },
  {
    id: '20',
    name: 'Ugali with Omena',
    price: 130,
    description: 'Traditional ugali with omena (small fish)',
    available: true,
    category: 'Ugali Meals',
    image: '../assets/images/common.jpg'
  },

  // Special Rice
  {
    id: '21',
    name: 'Pilau',
    price: 150,
    description: 'Aromatic spiced rice (pilau)',
    available: true,
    category: 'Special Rice',
    image: '../assets/images/pilau-image.jpg'
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
  const [orderClosingTime, setOrderClosingTime] = useState('');
  const [closingTimeLoaded, setClosingTimeLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [adminAuth, setAdminAuth] = useState(() => sessionStorage.getItem('adminAuth') === 'true');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
  const [selectedMeal, setSelectedMeal] = useState<FoodItem | null>(null);
  const [menuLoaded, setMenuLoaded] = useState(false);
  // Add state for vendor phone and loading
  const [vendorPhone, setVendorPhone] = useState('');
  const [vendorPhoneLoaded, setVendorPhoneLoaded] = useState(false);
  const [vendorPhoneEdit, setVendorPhoneEdit] = useState('');
  const [vendorPhoneSaving, setVendorPhoneSaving] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceValue, setEditingPriceValue] = useState<number | null>(null);
  const [priceSaving, setPriceSaving] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Chapati Meals': true,
    'Rice Meals': true,
    'Ugali Meals': true,
    'Special Rice': true
  });
  const [showWeekTwoPopup, setShowWeekTwoPopup] = useState(false);
  const [showVendorPopup, setShowVendorPopup] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Check if it's time to show the daily encouragement popup
  useEffect(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
    
    // Show popup every day from Monday to Friday
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      setShowWeekTwoPopup(true);
    }
  }, []);

  // Get daily message based on day of week
  const getDailyMessage = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    const messages = {
      1: { // Monday
        title: "Monday Motivation! 🚀",
        message: "The only thing better than Friday is Monday with good food!",
        emoji: "🎉",
        color: "from-blue-500 to-indigo-600"
      },
      2: { // Tuesday
        title: "Tuesday Triumph! 💪",
        message: "Tuesday is just Monday's more confident cousin. You've got this!",
        emoji: "⚡",
        color: "from-green-500 to-emerald-600"
      },
      3: { // Wednesday
        title: "Hump Day Happiness! 🐪",
        message: "Halfway there! The weekend is getting closer with every bite.",
        emoji: "🌟",
        color: "from-purple-500 to-pink-600"
      },
      4: { // Thursday
        title: "Thursday Thrills! 🎯",
        message: "Thursday is the new Friday when you have great food to look forward to!",
        emoji: "🎊",
        color: "from-orange-500 to-red-500"
      },
      5: { // Friday
        title: "Friday Freedom! 🎉",
        message: "TGIF! Time to celebrate with some delicious food and weekend vibes!",
        emoji: "🎈",
        color: "from-yellow-500 to-orange-500"
      }
    };
    
    return messages[dayOfWeek as keyof typeof messages] || messages[1];
  };

  // Helper to parse closing time string ("HH:mm") into a Date object for today
  const getClosingDate = () => {
    const [hours, minutes] = orderClosingTime.split(":").map(Number);
    const closing = new Date();
    closing.setHours(hours, minutes, 0, 0);
    return closing;
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const isOrderingTime = () => {
    const now = getCurrentTime();
    const cutoffTime = getClosingDate();
    return now < cutoffTime;
  };

  // Firestore: On mount, fetch closing time and create if missing
  useEffect(() => {
    const closingTimeDoc = doc(db, 'settings', 'orderClosingTime');
    let unsub: (() => void) | undefined;
    (async () => {
      const snap = await getDoc(closingTimeDoc);
      if (!snap.exists()) {
        await setDoc(closingTimeDoc, { value: '12:45' });
        setOrderClosingTime('12:45');
      } else {
        const data = snap.data();
        setOrderClosingTime(data.value || '12:45');
      }
      setClosingTimeLoaded(true);
      // Listen for real-time updates
      unsub = onSnapshot(closingTimeDoc, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setOrderClosingTime(data.value || '12:45');
        }
      });
    })();
    return () => { if (unsub) unsub(); };
  }, []);

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
        setMenuItems(initialMenuItems);
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
  }, []); // Empty dependency array to run only once
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Firestore: Listen for real-time updates to orders
  useEffect(() => {
    const ordersCol = collection(db, 'orders');
    const unsub = onSnapshot(ordersCol, (snapshot) => {
      const orderList: Order[] = snapshot.docs.map(docSnap => ({ ...docSnap.data(), id: docSnap.id }) as Order);
      orderList.sort((a, b) => {
        const getTime = (ts: any) => {
          if (typeof ts === 'number') return ts;
          if (ts && typeof ts.toDate === 'function') return ts.toDate().getTime();
          if (ts instanceof Date) return ts.getTime();
          return 0;
        };
        return getTime(b.timestamp) - getTime(a.timestamp);
      });
      setOrders(orderList);
    });
    return () => unsub();
  }, []);

  // Firestore: Listen for real-time updates to vendor phone number
  useEffect(() => {
    const phoneDoc = doc(db, 'settings', 'vendorPhone');
    let unsub: (() => void) | undefined;
    (async () => {
      const snap = await getDoc(phoneDoc);
      if (!snap.exists()) {
        await setDoc(phoneDoc, { value: '' });
        setVendorPhone('');
      } else {
        setVendorPhone(snap.data().value || '');
      }
      setVendorPhoneLoaded(true);
      unsub = onSnapshot(phoneDoc, (docSnap) => {
        if (docSnap.exists()) {
          setVendorPhone(docSnap.data().value || '');
        }
      });
    })();
    return () => { if (unsub) unsub(); };
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

  // Firestore: Submit order
  const submitOrder = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (cart.length === 0) {
      toast.error('Please add items to your cart');
      return;
    }
    if (!isOrderingTime()) {
      toast.error('Ordering is closed. Orders must be placed before ' + orderClosingTime + '.');
      return;
    }
    const newOrder = {
      customerName: customerName.trim(),
      items: [...cart],
      specialInstructions: specialInstructions.trim(),
      timestamp: Date.now(),
      status: 'pending',
    };
    try {
      await addDoc(collection(db, 'orders'), newOrder);
      setCart([]);
      setCustomerName('');
      setSpecialInstructions('');
      setIsCartOpen(false);
      toast.success('Order submitted successfully!');
      // Show vendor popup after successful order
      if (vendorPhone) {
        setShowVendorPopup(true);
      }
    } catch (err) {
      toast.error('Failed to submit order.');
    }
  };

  // Firestore: Update order status
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status });
    } catch (err) {
      toast.error('Failed to update order status.');
    }
  };

  // Firestore: Delete order
  const deleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
    } catch (err) {
      toast.error('Failed to delete order.');
    }
  };

  // Firestore: Add menu item
  const addMenuItem = async (item: Omit<FoodItem, 'id'>) => {
    try {
      await addDoc(collection(db, 'menuItems'), item);
      setShowAddItemForm(false);
      toast.success('Menu item added successfully!');
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error('Failed to add menu item');
    }
  };

  // Firestore: Update menu item
  const updateMenuItem = async (updatedItem: FoodItem) => {
    try {
      const { id, ...itemData } = updatedItem;
      const itemRef = doc(db, 'menuItems', id);
      await updateDoc(itemRef, itemData);
      setEditingItem(null);
      toast.success('Menu item updated successfully!');
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('Failed to update menu item');
    }
  };

  // Firestore: Delete menu item
  const deleteMenuItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const itemRef = doc(db, 'menuItems', itemId);
      await deleteDoc(itemRef);
      toast.success('Menu item deleted successfully!');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  // Firestore: Toggle item availability
  const toggleItemAvailability = async (itemId: string) => {
    try {
      const item = menuItems.find(item => item.id === itemId);
      if (!item) return;
      
      const itemRef = doc(db, 'menuItems', itemId);
      await updateDoc(itemRef, { available: !item.available });
      
      toast.success(`${item.name} is now ${!item.available ? 'available' : 'unavailable'}`);
    } catch (error) {
      console.error('Error updating item availability:', error);
      toast.error('Failed to update item availability');
    }
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
        // Always include id when editing
        onSubmit({ ...initialItem, ...formData, id: initialItem.id });
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

  // Handle admin login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === ADMIN_PASSWORD) {
      setAdminAuth(true);
      sessionStorage.setItem('adminAuth', 'true');
      setShowAdminLogin(false);
      setAdminPasswordInput('');
      setAdminError('');
      setCurrentView('admin');
    } else {
      setAdminError('Incorrect password');
    }
  };

  // When switching to admin, require login if not authenticated
  const handleAdminClick = () => {
    if (adminAuth) {
      setCurrentView('admin');
    } else {
      setShowAdminLogin(true);
    }
  };

  // Firestore: Update closing time in Firestore when admin changes it
  const handleClosingTimeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setOrderClosingTime(newTime);
    const closingTimeDoc = doc(db, 'settings', 'orderClosingTime');
    try {
      await setDoc(closingTimeDoc, { value: newTime });
    } catch (err) {
      toast.error('Failed to update closing time.');
    }
  };

  if (!closingTimeLoaded || !menuLoaded || !vendorPhoneLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-500">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-2 md:px-4">
        <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-2 md:px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2 md:gap-0">
              <div className="flex items-center gap-3">
                <div className="bg-[#05134c] p-2 rounded-xl shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-[#05134c]">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-600 text-xs">CSA Workshop Management</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <button
                  onClick={() => exportToGoogleSheets(orders)}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 md:px-4 py-2 rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg transition-all duration-200 text-xs md:text-base hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  Export Orders
                </button>
                <button
                  onClick={() => setCurrentView('customer')}
                  className="bg-[#05134c] text-white px-3 md:px-4 py-2 rounded-xl hover:bg-[#16226a] shadow-lg transition-all duration-200 text-xs md:text-base hover:scale-105"
                >
                  Customer View
                </button>
                <button
                  onClick={() => { setAdminAuth(false); sessionStorage.removeItem('adminAuth'); setCurrentView('customer'); }}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 md:px-4 py-2 rounded-xl hover:from-red-600 hover:to-pink-700 shadow-lg transition-all duration-200 text-xs md:text-base hover:scale-105"
                >
                  Logout
                </button>
              </div>
            </div>
            {/* Settings Section */}
            <div className="mt-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-1.5 rounded-lg">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                Restaurant Settings
              </h3>
              
              {/* Closing time control */}
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <label className="font-medium text-gray-700 mb-2 block">Order Closing Time:</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="time"
                    value={orderClosingTime}
                    onChange={handleClosingTimeChange}
                    className="border border-blue-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-blue-200">
                    Current: {orderClosingTime}
                  </span>
                </div>
              </div>
              
              {/* Vendor phone control */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <label className="font-medium text-gray-700 mb-2 block">Vendor Phone Number:</label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={vendorPhoneEdit === '' ? vendorPhone : vendorPhoneEdit}
                    onChange={e => setVendorPhoneEdit(e.target.value)}
                    className="border border-emerald-200 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 flex-1 min-w-48"
                    placeholder="Enter vendor phone number"
                  />
                  <button
                    onClick={async () => {
                      setVendorPhoneSaving(true);
                      try {
                        await setDoc(doc(db, 'settings', 'vendorPhone'), { value: vendorPhoneEdit });
                        setVendorPhoneEdit('');
                        toast.success('Vendor phone updated!');
                      } catch (err) {
                        toast.error('Failed to update phone number');
                      } finally {
                        setVendorPhoneSaving(false);
                      }
                    }}
                    className="bg-[#05134c] text-white px-4 py-2 rounded-lg hover:bg-[#16226a] shadow-md transition-all duration-200 disabled:opacity-50"
                    disabled={vendorPhoneSaving || (vendorPhoneEdit === '' || vendorPhoneEdit === vendorPhone)}
                  >
                    {vendorPhoneSaving ? 'Saving...' : 'Save'}
                  </button>
                  <span className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-emerald-200">
                    Current: {vendorPhone || 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-2 md:p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Orders Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl shadow-md">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                    Orders ({orders.length})
                  </span>
                </h2>
              </div>
              <div className="space-y-2 md:space-y-3 max-h-96 overflow-y-auto">
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-2xl inline-block">
                      <ShoppingCart className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No orders yet</p>
                      <p className="text-gray-400 text-sm">Orders will appear here when customers place them</p>
                    </div>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex flex-wrap items-start justify-between mb-3 gap-2">
                        <div>
                          <h3 className="font-semibold text-sm md:text-base text-gray-800">{order.customerName}</h3>
                          <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(order.timestamp)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            className={`p-2 rounded-lg transition-all duration-200 ${order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-600 shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-yellow-50'}`}
                            title="Confirm Order"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className={`p-2 rounded-lg transition-all duration-200 ${order.status === 'completed' ? 'bg-green-100 text-green-600 shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-green-50'}`}
                            title="Complete Order"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 text-xs shadow-sm"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-xs md:text-sm">
                        <p className="mb-1">
                          <strong>Items:</strong> {order.items.map(item => `${item.name} (KES ${item.price})`).join(', ')}
                        </p>
                        <p className="mb-1">
                          <strong>Total:</strong> KES {order.items.reduce((sum, item) => sum + item.price, 0)}
                        </p>
                        {order.specialInstructions && (
                          <p><strong>Instructions:</strong> {order.specialInstructions}</p>
                        )}
                        <p className="mt-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium shadow-sm ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : order.status === 'confirmed' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-green-100 text-green-800 border border-green-200'}`}>
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
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between mb-4 md:mb-6 gap-3">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-xl shadow-md">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                    Menu Management
                  </span>
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setBulkActionLoading(true);
                      try {
                        const menuCol = collection(db, 'menuItems');
                        const snapshot = await getDocs(menuCol);
                        const batch: Promise<void>[] = [];
                        snapshot.forEach(docSnap => {
                          batch.push(updateDoc(doc(db, 'menuItems', docSnap.id), { available: false }));
                        });
                        await Promise.all(batch);
                        toast.success('All items marked as unavailable!');
                      } catch (err) {
                        toast.error('Failed to mark all unavailable');
                      } finally {
                        setBulkActionLoading(false);
                      }
                    }}
                    className="bg-[#05134c] text-white px-3 py-2 rounded-xl hover:bg-[#16226a] shadow-md transition-all duration-200 text-xs md:text-sm disabled:opacity-50"
                    disabled={bulkActionLoading}
                  >
                    Mark All Unavailable
                  </button>
                  <button
                    onClick={async () => {
                      setBulkActionLoading(true);
                      try {
                        const menuCol = collection(db, 'menuItems');
                        const snapshot = await getDocs(menuCol);
                        const batch: Promise<void>[] = [];
                        snapshot.forEach(docSnap => {
                          batch.push(updateDoc(doc(db, 'menuItems', docSnap.id), { available: true }));
                        });
                        await Promise.all(batch);
                        toast.success('All items marked as available!');
                      } catch (err) {
                        toast.error('Failed to mark all available');
                      } finally {
                        setBulkActionLoading(false);
                      }
                    }}
                    className="bg-[#05134c] text-white px-3 py-2 rounded-xl hover:bg-[#16226a] shadow-md transition-all duration-200 text-xs md:text-sm disabled:opacity-50"
                    disabled={bulkActionLoading}
                  >
                    Mark All Available
                  </button>
                </div>
              </div>
              <div className="space-y-2 md:space-y-4 max-h-96 overflow-y-auto">
                {categories.map(category => {
                  const items = groupedMenuItems[category] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={category}>
                      <h3 className="font-medium text-gray-700 mb-1 md:mb-2 text-xs md:text-base">{category}</h3>
                      <div className="space-y-2 ml-2 md:ml-4">
                        {items.map(item => (
                          <div key={item.id} className="flex flex-wrap items-center justify-between p-3 md:p-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl gap-3 shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="flex items-center gap-3 md:gap-4">
                              {item.image && (
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-lg shadow-sm"
                                />
                              )}
                              <div>
                                <h4 className="font-semibold text-sm md:text-base text-gray-800">{item.name}</h4>
                                                                  {editingPriceId === item.id ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        min="0"
                                        className="w-24 p-2 border border-blue-200 rounded-lg text-sm text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={editingPriceValue ?? item.price}
                                        onChange={e => {
                                          const val = e.target.value;
                                          setEditingPriceValue(val === '' ? 0 : Number(val));
                                        }}
                                        autoFocus
                                      />
                                      <button
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-2 rounded-lg text-xs hover:from-emerald-600 hover:to-teal-700 shadow-md transition-all duration-200 disabled:opacity-50"
                                        disabled={
                                          priceSaving === item.id ||
                                          editingPriceValue === null ||
                                          editingPriceValue < 0 ||
                                          editingPriceValue === item.price
                                        }
                                        onClick={async () => {
                                          if (editingPriceValue === null || editingPriceValue < 0 || editingPriceValue === item.price) return;
                                          setPriceSaving(item.id);
                                          try {
                                            await updateDoc(doc(db, 'menuItems', item.id), { price: editingPriceValue });
                                            toast.success('Price updated!');
                                            setEditingPriceId(null);
                                            setEditingPriceValue(null);
                                          } catch (err) {
                                            toast.error('Failed to update price');
                                          } finally {
                                            setPriceSaving(null);
                                          }
                                        }}
                                      >
                                        {priceSaving === item.id ? 'Saving...' : 'Save'}
                                      </button>
                                      <button
                                        className="bg-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs hover:bg-gray-400 transition-all duration-200"
                                        onClick={() => {
                                          setEditingPriceId(null);
                                          setEditingPriceValue(null);
                                        }}
                                        disabled={priceSaving === item.id}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm md:text-base font-semibold text-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 rounded-lg border border-blue-200">KES {item.price}</span>
                                      <button
                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                        onClick={() => {
                                          setEditingPriceId(item.id);
                                          setEditingPriceValue(item.price);
                                        }}
                                        title="Edit Price"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3h3" /></svg>
                                      </button>
                                    </div>
                                  )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleItemAvailability(item.id)}
                                className={`p-2 rounded-lg transition-all duration-200 ${item.available ? 'bg-green-100 text-green-600 hover:bg-green-200 shadow-sm' : 'bg-red-100 text-red-600 hover:bg-red-200 shadow-sm'}`}
                                title={item.available ? 'Available' : 'Unavailable'}
                              >
                                {item.available ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => deleteMenuItem(item.id)}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 shadow-sm"
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
        {/* Add/Edit Item Modal remains as previously refactored for mobile */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title Section */}
            <div className="flex items-center gap-3">
              <div className="bg-[#05134c] p-2 rounded-xl shadow-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-[#05134c]">
                    CSA Workshop
                  </h1>
                  <p className="text-gray-600 text-xs">Delicious meals, fresh daily</p>
                </div>
                
                {/* Time Display - Horizontal with title */}
                <div className="hidden sm:flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm border border-gray-100">
                  <div className="bg-blue-100 p-1.5 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-800">{formatTime(currentTime)}</div>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      isOrderingTime() 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isOrderingTime() ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                      {isOrderingTime() ? 'Open' : 'Closed'}
                    </div>
                  </div>
                </div>
                
                <div className="hidden sm:block text-xs text-gray-500 bg-white/60 backdrop-blur-sm rounded-xl px-3 py-2">
                  Closes at {orderClosingTime}
                </div>
              </div>
            </div>
            
            {/* Desktop Admin Button */}
            <div className="hidden lg:block">
              <button
                onClick={handleAdminClick}
                className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-2 rounded-xl hover:from-slate-700 hover:to-slate-800 shadow-lg transition-all duration-200 hover:scale-105"
              >
                <Settings className="w-4 h-4" />
                Admin
              </button>
            </div>
            
            {/* Mobile Hamburger Menu */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200 shadow-sm hover:bg-white/80 transition-all duration-200"
                aria-label="Toggle mobile menu"
              >
                <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
                  <div className={`w-4 h-0.5 bg-gray-600 transition-all duration-200 ${showMobileMenu ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                  <div className={`w-4 h-0.5 bg-gray-600 transition-all duration-200 ${showMobileMenu ? 'opacity-0' : ''}`}></div>
                  <div className={`w-4 h-0.5 bg-gray-600 transition-all duration-200 ${showMobileMenu ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                </div>
              </button>
            </div>
          </div>
          
          {/* Mobile Time Display - Below title on mobile */}
          <div className="sm:hidden mt-1">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-2 py-1 shadow-sm border border-gray-100 text-xs">
              <div className="bg-blue-100 p-1 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-semibold text-gray-800">{formatTime(currentTime)}</span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                isOrderingTime() 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isOrderingTime() ? 'bg-blue-500' : 'bg-red-500'}`}></span>
                {isOrderingTime() ? 'Open' : 'Closed'}
              </span>
              <span className="text-gray-500 ml-2">| Closes at {orderClosingTime}</span>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              className="lg:hidden bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <div className="px-4 py-3 space-y-2">
                <button
                  onClick={() => {
                    handleAdminClick();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-3 rounded-xl hover:from-slate-700 hover:to-slate-800 shadow-lg transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                  Admin Access
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Status Banner */}
        {!isOrderingTime() && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-2 sm:p-4 mb-4 sm:mb-6 shadow-sm text-xs sm:text-base"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-red-100 p-2 rounded-xl">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-medium">Ordering is currently closed</p>
                <p className="text-red-600 text-sm">Orders must be placed before {orderClosingTime}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Enhanced Menu Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 p-2 sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 sm:p-3 rounded-2xl shadow-lg">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">Today's Menu</h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {categories.map(category => {
              const items = groupedMenuItems[category] || [];
              if (items.length === 0) return null;
              
              return (
                <motion.div 
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                >
                  {/* Category Header with Dropdown */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-3 sm:p-6 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 sm:p-3 rounded-xl shadow-md">
                        <span className="text-lg sm:text-2xl">
                           {category === 'Chapati Meals' && '🥖'}
                           {category === 'Rice Meals' && '🍚'}
                           {category === 'Ugali Meals' && '🌽'}
                           {category === 'Special Rice' && '🍛'}
                         </span>
                       </div>
                       <div className="text-left">
                        <h3 className="text-base sm:text-xl font-bold text-gray-800">{category}</h3>
                        <p className="text-gray-500 text-xs sm:text-sm">{items.length} items available</p>
                       </div>
                     </div>
                     <motion.div
                       animate={{ rotate: expandedCategories[category] ? 180 : 0 }}
                       transition={{ duration: 0.2 }}
                       className="bg-gray-100 p-2 rounded-xl"
                     >
                       <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </motion.div>
                   </button>

                   {/* Collapsible Content */}
                   <AnimatePresence>
                     {expandedCategories[category] && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         transition={{ duration: 0.3, ease: "easeInOut" }}
                         className="overflow-hidden"
                       >
                         <div className="p-2 sm:p-6 pt-0">
                           <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 sm:pb-4 -mx-2 px-2 snap-x snap-mandatory">
                             {items.map(item => (
                               <motion.div
                                 key={item.id}
                                 whileHover={{ scale: 1.04, rotate: 1 }}
                                 whileTap={{ scale: 0.98, rotate: -1 }}
                                 className={`bg-white rounded-xl sm:rounded-2xl shadow-md border-l-4 border-blue-400 border-t border-b border-r border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-xl snap-start min-w-[220px] sm:min-w-[260px] max-w-[80vw] sm:max-w-xs cursor-pointer ${
                                   !item.available ? 'opacity-60' : 'hover:border-blue-600'
                                 }`}
                                 onClick={() => setSelectedMeal(item)}
                               >
                                 {item.image && (
                                   <div className="h-32 sm:h-40 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                                     <img 
                                       src={item.image} 
                                       alt={item.name}
                                       className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                     />
                                     {!item.available && (
                                       <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                         <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                                           Unavailable
                                         </span>
                                       </div>
                                     )}
                                   </div>
                                 )}
                                 <div className="p-2 sm:p-4">
                                   <div className="flex flex-col items-center text-center mb-1 sm:mb-2">
                                     <h4 className="font-bold text-gray-800 text-base sm:text-lg leading-tight truncate w-full max-w-[150px] sm:max-w-[180px]">{item.name}</h4>
                                     <span className="mt-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-md whitespace-nowrap">
                                       KES {item.price}
                                     </span>
                                   </div>
                                   <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2">{item.description}</p>
                                   <button
                                     onClick={e => { e.stopPropagation(); addToCart(item); }}
                                     disabled={!item.available || !isOrderingTime()}
                                     className={`w-full py-2 sm:py-3 px-2 sm:px-4 rounded-xl font-semibold transition-all duration-200 shadow-md ${
                                       item.available && isOrderingTime()
                                         ? 'bg-gradient-to-r from-[#05134c] to-[#05134c] text-white hover:bg-[#16226a] hover:from-[#16226a] hover:to-[#16226a] hover:shadow-lg hover:scale-105'
                                         : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                     }`}
                                   >
                                     {!item.available ? 'Unavailable' : !isOrderingTime() ? 'Ordering Closed' : 'Add to Cart'}
                                   </button>
                                 </div>
                               </motion.div>
                             ))}
                           </div>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </motion.div>
               );
             })}
           </div>
         </div>
      </div>

      {/* Daily Encouragement Popup */}
      <AnimatePresence>
        {showWeekTwoPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-blue-50 via-white to-indigo-100 rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 relative border border-blue-200"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl focus:outline-none"
                onClick={() => setShowWeekTwoPopup(false)}
                aria-label="Close"
              >
                &times;
              </button>
              
              <div className="text-center">
                {(() => {
                  const dailyMessage = getDailyMessage();
                  return (
                    <>
                      <div className={`bg-gradient-to-r ${dailyMessage.color} p-4 rounded-2xl mb-6 inline-block`}>
                        <span className="text-4xl">{dailyMessage.emoji}</span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        {dailyMessage.title}
                      </h2>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {dailyMessage.message}
                      </p>
                      
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-6 border border-emerald-200">
                        <p className="text-sm text-gray-700 font-medium">
                          <span className="text-emerald-600">🍽️</span> Fresh meals await you
                        </p>
                        <p className="text-sm text-gray-700 font-medium">
                          <span className="text-teal-600">⚡</span> Energy for the day ahead
                        </p>
                        <p className="text-sm text-gray-700 font-medium">
                          <span className="text-emerald-600">😋</span> Because good food makes everything better!
                        </p>
                      </div>
                      
                      <button
                        onClick={() => setShowWeekTwoPopup(false)}
                        className={`bg-gradient-to-r ${dailyMessage.color} text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105`}
                      >
                        Let's Do This! 🚀
                      </button>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vendor Payment Popup */}
      <AnimatePresence>
        {showVendorPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-blue-50 via-white to-indigo-100 rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 relative border border-blue-200"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl focus:outline-none"
                onClick={() => setShowVendorPopup(false)}
                aria-label="Close"
              >
                &times;
              </button>
              
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl mb-6 inline-block">
                  <span className="text-4xl">✅</span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Order Submitted Successfully!
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Your order has been received! Please save the vendor's contact information for payment.
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
                  <p className="text-sm text-gray-700 font-medium mb-3">
                    <span className="text-blue-600">📱</span> Vendor Contact
                  </p>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="font-mono text-lg text-blue-900 font-bold">{vendorPhone}</span>
                    <button
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-200"
                      onClick={() => {
                        navigator.clipboard.writeText(vendorPhone);
                        toast.success("Phone number copied to clipboard!");
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    You can pay via M-Pesa or your preferred payment method
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800 font-medium">
                    💡 <strong>Tip:</strong> Save this number in your contacts for easy access!
                  </p>
                </div>
                
                <button
                  onClick={() => setShowVendorPopup(false)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Got it! 👍
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button - Only show when cart has items */}
      {cart.length > 0 && (
        <>
                      <button
              className="fixed bottom-6 right-6 z-50 bg-[#05134c] text-white p-4 rounded-full shadow-xl flex items-center gap-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300 hover:bg-[#16226a]"
              onClick={() => setIsCartOpen(true)}
              aria-label="View Cart"
            >
            <ShoppingCart className="w-6 h-6" />
            <span className="bg-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center absolute -top-2 -right-2">
              {cart.length}
            </span>
            <span className="hidden sm:inline-block font-medium">KES {getTotalPrice()}</span>
          </button>
          <AnimatePresence>
            {isCartOpen && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative border border-gray-200 dark:border-gray-700"
                  initial={{ scale: 0.8, y: 100, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.8, y: 100, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl focus:outline-none"
                    onClick={() => setIsCartOpen(false)}
                    aria-label="Close Cart"
                  >
                    &times;
                  </button>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <ShoppingCart className="w-6 h-6" />
                    Your Order ({cart.length})
                  </h3>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-white">Your Name</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 text-white placeholder-white"
                        placeholder="Enter your name"
                        disabled={!isOrderingTime()}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-white">Special Instructions (Optional)</label>
                      <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 text-white placeholder-white"
                        rows={2}
                        placeholder="Any special requests..."
                        disabled={!isOrderingTime()}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</h4>
                          <p className="text-indigo-600 dark:text-indigo-300 font-medium text-sm">KES {item.price}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(index)}
                          className="text-pink-500 hover:text-pink-700 p-1"
                          disabled={!isOrderingTime()}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                                      </div>
                    <div className="border-t pt-4 border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Total:</span>
                      <span className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">KES {getTotalPrice()}</span>
                    </div>
                    <button
                      onClick={submitOrder}
                      disabled={!isOrderingTime() || !customerName.trim() || cart.length === 0}
                      className={`w-full py-3 px-4 rounded-lg font-medium text-lg transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        isOrderingTime() && customerName.trim() && cart.length > 0
                          ? 'bg-gradient-to-tr from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {!isOrderingTime() ? 'Ordering Closed' : 'Submit Order'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {selectedMeal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMeal(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative border border-gray-200"
              initial={{ scale: 0.8, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl focus:outline-none"
                onClick={() => setSelectedMeal(null)}
                aria-label="Close"
              >
                &times;
              </button>
              {selectedMeal.image && (
                <img
                  src={selectedMeal.image}
                  alt={selectedMeal.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="text-2xl font-bold mb-2 text-indigo-700">{selectedMeal.name}</h2>
              <p className="text-lg font-semibold text-blue-600 mb-2">KES {selectedMeal.price}</p>
              <p className="text-gray-700 mb-4">{selectedMeal.description}</p>
              <button
                onClick={() => { addToCart(selectedMeal); setSelectedMeal(null); }}
                disabled={!selectedMeal.available || !isOrderingTime()}
                className={`w-full py-3 px-4 rounded-lg font-medium text-lg transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                  selectedMeal.available && isOrderingTime()
                    ? 'bg-gradient-to-r from-[#05134c] to-[#05134c] text-white hover:bg-[#16226a] hover:from-[#16226a] hover:to-[#16226a] hover:shadow-lg hover:scale-105'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {!selectedMeal.available ? 'Unavailable' : !isOrderingTime() ? 'Ordering Closed' : 'Add to Cart'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminLogin && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-2 p-2"
              initial={{ scale: 0.8, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl focus:outline-none"
                onClick={() => setShowAdminLogin(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">Admin Login</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="relative">
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    value={adminPasswordInput}
                    onChange={e => setAdminPasswordInput(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-400 text-white placeholder-white pr-10"
                    placeholder="Enter admin password"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    onClick={() => setShowAdminPassword(v => !v)}
                    tabIndex={-1}
                    aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {adminError && <div className="text-red-500 text-sm">{adminError}</div>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="w-full py-2 px-4 rounded-lg font-medium text-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white hover:from-blue-700 hover:to-indigo-600 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    className="w-full py-2 px-4 rounded-lg font-medium text-lg bg-gray-300 text-gray-700 hover:bg-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    onClick={() => { setShowAdminLogin(false); setAdminPasswordInput(''); setAdminError(''); setCurrentView('customer'); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster position="top-center" toastOptions={{
        style: { background: '#fff', color: '#333', fontWeight: 500 },
        success: { style: { background: '#22c55e', color: '#fff' } },
        error: { style: { background: '#ef4444', color: '#fff' } },
      }} />
    </div>
  );
}

export default App;