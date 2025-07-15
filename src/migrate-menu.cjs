"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
// 1. Your Firebase config here (replace with your actual config):
var firebaseConfig = {
    apiKey: 'your_api_keyAIzaSyDQYF-b1S-5i7DYSviDxydrOVg74VmR8BQ',
    authDomain: 'glasgow-f70ec.firebaseapp.com',
    projectId: 'glasgow-f70ec',
    storageBucket: 'glasgow-f70ec.firebasestorage.app',
    messagingSenderId: '723363686884',
    appId: '1:723363686884:web:aa31e589cca2f7f436bff1',
};
var app = (0, app_1.initializeApp)(firebaseConfig);
var db = (0, firestore_1.getFirestore)(app);
// 2. Your initialMenuItems array (copy from App.tsx, REMOVE the id field)
var initialMenuItems = [
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
function migrateMenu() {
    return __awaiter(this, void 0, void 0, function () {
        var menuCol, snapshot, _i, _a, docSnap, _b, initialMenuItems_1, item;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    menuCol = (0, firestore_1.collection)(db, 'menuItems');
                    return [4 /*yield*/, (0, firestore_1.getDocs)(menuCol)];
                case 1:
                    snapshot = _c.sent();
                    _i = 0, _a = snapshot.docs;
                    _c.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    docSnap = _a[_i];
                    return [4 /*yield*/, (0, firestore_1.deleteDoc)((0, firestore_1.doc)(db, 'menuItems', docSnap.id))];
                case 3:
                    _c.sent();
                    console.log("Deleted: ".concat(docSnap.id));
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    _b = 0, initialMenuItems_1 = initialMenuItems;
                    _c.label = 6;
                case 6:
                    if (!(_b < initialMenuItems_1.length)) return [3 /*break*/, 9];
                    item = initialMenuItems_1[_b];
                    return [4 /*yield*/, (0, firestore_1.addDoc)(menuCol, item)];
                case 7:
                    _c.sent();
                    console.log("Added: ".concat(item.name));
                    _c.label = 8;
                case 8:
                    _b++;
                    return [3 /*break*/, 6];
                case 9:
                    console.log('Migration complete.');
                    return [2 /*return*/];
            }
        });
    });
}
migrateMenu();
