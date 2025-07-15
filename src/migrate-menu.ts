import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';

// 1. Your Firebase config here (replace with your actual config):
const firebaseConfig = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Your initialMenuItems array (copy from App.tsx, REMOVE the id field)
const initialMenuItems = [
  // Chapati Meals
  {
    name: 'Chapati with Beans',
    price: 130,
    description: 'Soft chapati served with delicious cooked beans',
    available: true,
    category: 'Chapati Meals',
    image: '/assets/images/chapo-beans.png'
  },
  {
    name: 'Chapati with Greengrams',
    price: 130,
    description: 'Fresh chapati with nutritious green gram (ndengu)',
    available: true,
    category: 'Chapati Meals',
    image: '/assets/images/chapo-greengrams.jpg'
  },
  {
    name: 'Chapati with Matumbo',
    price: 150,
    description: 'Chapati served with well-prepared matumbo (tripe)',
    available: true,
    category: 'Chapati Meals',
    image: '/assets/images/chapo-matumbo.jpg'
  },
  {
    name: 'Chapati with Beef',
    price: 170,
    description: 'Soft chapati with tender beef stew',
    available: true,
    category: 'Chapati Meals',
    image: '/assets/images/chapo-beef.jpg'
  },
  {
    name: 'Chapati with Chicken',
    price: 180,
    description: 'Chapati served with flavorful chicken (kuku)',
    available: true,
    category: 'Chapati Meals',
    image: '/assets/images/chapo-chicken.jpg'
  },
  {
    name: 'Chapati with Eggs',
    price: 130,
    description: 'Chapati with scrambled eggs (mayai)',
    available: true,
    category: 'Chapati Meals',
    image: '/assets/images/chapo-eggs.jpg'
  },
  {
    name: 'Chapati with Pork',
    price: 180,
    description: 'Chapati served with succulent pork',
    available: true,
    category: 'Chapati Meals',
    image: '/assets/images/chapo-pork.jpg'
  },
  // Rice Meals
  {
    name: 'Rice with Beans',
    price: 130,
    description: 'Steamed rice served with cooked beans',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  },
  {
    name: 'Rice with Greengrams',
    price: 130,
    description: 'White rice with green gram (ndengu)',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  },
  {
    name: 'Rice with Matumbo',
    price: 150,
    description: 'Rice served with well-prepared matumbo (tripe)',
    available: true,
    category: 'Rice Meals',
    image: '/assets/images/matumbo-rice.jpg'
  },
  {
    name: 'Rice with Beef',
    price: 170,
    description: 'Steamed rice with tender beef stew',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  },
  {
    name: 'Rice with Chicken',
    price: 180,
    description: 'Rice served with chicken (kuku)',
    available: true,
    category: 'Rice Meals',
    image: '/assets/images/rice-chicken.jpg'
  },
  {
    name: 'Rice with Eggs',
    price: 130,
    description: 'Rice with scrambled eggs',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  },
  {
    name: 'Rice with Pork',
    price: 180,
    description: 'Rice served with pork',
    available: true,
    category: 'Rice Meals',
    image: 'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg'
  },
  // Ugali Meals
  {
    name: 'Ugali with Matumbo',
    price: 150,
    description: 'Traditional ugali with matumbo (tripe)',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    name: 'Ugali with Beef',
    price: 170,
    description: 'Ugali served with beef stew',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    name: 'Ugali with Chicken',
    price: 180,
    description: 'Ugali with chicken',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  {
    name: 'Ugali with Eggs',
    price: 130,
    description: 'Ugali with eggs',
    available: true,
    category: 'Ugali Meals',
    image: '/assets/images/ugali-eggs.jpg'
  },
  {
    name: 'Ugali with Pork',
    price: 180,
    description: 'Ugali served with pork',
    available: true,
    category: 'Ugali Meals',
    image: '/assets/images/ugali-pork.jpg'
  },
  {
    name: 'Ugali with Omena',
    price: 130,
    description: 'Traditional ugali with omena (small fish)',
    available: true,
    category: 'Ugali Meals',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg'
  },
  // Special Rice
  {
    name: 'Pilau',
    price: 150,
    description: 'Aromatic spiced rice (pilau)',
    available: true,
    category: 'Special Rice',
    image: '/assets/images/pilau-image.jpg'
  }
];

async function migrateMenu() {
  const menuCol = collection(db, 'menuItems');
  // Delete all existing menu items
  const snapshot = await getDocs(menuCol);
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, 'menuItems', docSnap.id));
    console.log(`Deleted: ${docSnap.id}`);
  }
  // Add initial menu items
  for (const item of initialMenuItems) {
    await addDoc(menuCol, item);
    console.log(`Added: ${item.name}`);
  }
  console.log('Migration complete.');
}

migrateMenu(); 