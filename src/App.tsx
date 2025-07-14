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
  // ... (all menu items remain the same)
];

function App() {
  // ... (all component code remains the same)
}

export default App;