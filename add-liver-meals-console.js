// Copy and paste this entire script into your browser's developer console
// when your food ordering app is running (make sure you're on the app page)

console.log('🚀 Starting to add liver meals to database...');

// Liver meals to add
const liverMeals = [
  {
    name: 'Ugali with Liver',
    price: 170,
    description: 'Traditional ugali served with well-prepared liver',
    available: true,
    category: 'Ugali Meals',
    image: '../assets/images/common.jpg'
  },
  {
    name: 'Chapati with Liver',
    price: 170,
    description: 'Soft chapati served with delicious liver',
    available: true,
    category: 'Chapati Meals',
    image: '../assets/images/common.jpg'
  },
  {
    name: 'Rice with Liver',
    price: 170,
    description: 'Steamed rice served with liver',
    available: true,
    category: 'Rice Meals',
    image: '../assets/images/common.jpg'
  }
];

// Function to add meals
async function addLiverMeals() {
  try {
    // Import Firebase functions (these should already be available in your app)
    const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Get the database instance (assuming it's available as 'db' in your app)
    // If your app uses a different variable name, replace 'db' with the correct name
    const db = window.db || document.querySelector('script').__firebaseApp?.firestore();
    
    if (!db) {
      throw new Error('Firebase database not found. Make sure your app is running and Firebase is initialized.');
    }
    
    const menuCol = collection(db, 'menuItems');
    
    for (const meal of liverMeals) {
      const docRef = await addDoc(menuCol, meal);
      console.log(`✅ Added "${meal.name}" with ID: ${docRef.id}`);
    }
    
    console.log('🎉 All liver meals have been successfully added to the database!');
    console.log('You can now see them in your app.');
    
  } catch (error) {
    console.error('❌ Error adding liver meals:', error);
    console.log('💡 Make sure your app is running and you have the correct Firebase configuration.');
  }
}

// Alternative method using the app's existing Firebase instance
async function addLiverMealsAlternative() {
  try {
    // This method tries to access the Firebase instance from your React app
    const reactApp = document.querySelector('#root')?.__react_root$;
    const firebaseInstance = reactApp?.firebase || window.firebase;
    
    if (!firebaseInstance) {
      throw new Error('Firebase instance not found in React app');
    }
    
    const { collection, addDoc } = firebaseInstance.firestore;
    const db = firebaseInstance.firestore();
    const menuCol = collection(db, 'menuItems');
    
    for (const meal of liverMeals) {
      const docRef = await addDoc(menuCol, meal);
      console.log(`✅ Added "${meal.name}" with ID: ${docRef.id}`);
    }
    
    console.log('🎉 All liver meals have been successfully added to the database!');
    
  } catch (error) {
    console.error('❌ Error with alternative method:', error);
    console.log('💡 Trying manual method...');
    
    // Manual method - you'll need to copy your Firebase config from your .env file
    console.log(`
📋 MANUAL METHOD:
1. Copy your Firebase config from your .env file
2. Replace the config in the add-liver-meals.html file
3. Open that file in your browser and click the button
    `);
  }
}

// Try the first method
addLiverMeals().catch(() => {
  console.log('🔄 First method failed, trying alternative...');
  addLiverMealsAlternative();
}); 