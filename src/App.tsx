The script is missing a closing bracket for the `useEffect` hook that initializes the menu items. Here's the fixed version - I'll add the missing closing bracket and its associated comment:

```javascript
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
  }, []); // Added missing closing bracket for useEffect
```