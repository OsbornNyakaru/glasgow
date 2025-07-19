// TEMPORARY SCRIPT TO ADD LIVER MEALS
// Copy this code and temporarily add it to your App.tsx file
// Add it right after your imports and before the App function

// Add this function right after your imports in App.tsx:
const addLiverMealsToDatabase = async () => {
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

  try {
    console.log('Adding liver meals to database...');
    
    for (const meal of liverMeals) {
      await addDoc(collection(db, 'menuItems'), meal);
      console.log(`✅ Added: ${meal.name}`);
    }
    
    console.log('🎉 All liver meals added successfully!');
    alert('Liver meals added successfully! You can now remove this script.');
    
  } catch (error) {
    console.error('Error adding liver meals:', error);
    alert('Error adding liver meals. Check console for details.');
  }
};

// Then add this button temporarily in your admin section:
// <button onClick={addLiverMealsToDatabase} className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700">
//   Add Liver Meals
// </button>

// After running this once, remove both the function and the button from your code. 