const mongoose = require("mongoose");
require("dotenv").config();
const Product = require("./models/productModel");

const products = [
  // Beverages
  { productName: "Cola 1L", productPrice: 1.5, productCategory: "Beverages", barcode: "1001" },
  { productName: "Pepsi 1L", productPrice: 1.5, productCategory: "Beverages", barcode: "1002" },
  { productName: "Orange Juice 1L", productPrice: 2.0, productCategory: "Beverages", barcode: "1003" },
  { productName: "Mineral Water 500ml", productPrice: 0.7, productCategory: "Beverages", barcode: "1004" },
  { productName: "Green Tea Box", productPrice: 2.5, productCategory: "Beverages", barcode: "1005" },

  // Snacks
  { productName: "Potato Chips", productPrice: 1.0, productCategory: "Snacks", barcode: "2001" },
  { productName: "Chocolate Bar", productPrice: 0.8, productCategory: "Snacks", barcode: "2002" },
  { productName: "Salted Peanuts", productPrice: 1.2, productCategory: "Snacks", barcode: "2003" },
  { productName: "Popcorn Bag", productPrice: 1.0, productCategory: "Snacks", barcode: "2004" },
  { productName: "Biscuits Pack", productPrice: 1.5, productCategory: "Snacks", barcode: "2005" },

  // Dairy
  { productName: "Fresh Milk 1L", productPrice: 1.2, productCategory: "Dairy", barcode: "3001" },
  { productName: "Cheddar Cheese 200g", productPrice: 3.5, productCategory: "Dairy", barcode: "3002" },
  { productName: "Yogurt Cup", productPrice: 0.9, productCategory: "Dairy", barcode: "3003" },
  { productName: "Butter 250g", productPrice: 2.2, productCategory: "Dairy", barcode: "3004" },
  { productName: "Mozzarella 200g", productPrice: 3.0, productCategory: "Dairy", barcode: "3005" },

  // Bakery
  { productName: "White Bread Loaf", productPrice: 1.0, productCategory: "Bakery", barcode: "4001" },
  { productName: "Croissant", productPrice: 0.8, productCategory: "Bakery", barcode: "4002" },
  { productName: "Donut", productPrice: 1.2, productCategory: "Bakery", barcode: "4003" },
  { productName: "Bagel", productPrice: 1.5, productCategory: "Bakery", barcode: "4004" },
  { productName: "Pita Bread Pack", productPrice: 1.7, productCategory: "Bakery", barcode: "4005" },

  // Vegetables
  { productName: "Tomatoes 1kg", productPrice: 1.5, productCategory: "Vegetables", barcode: "5001" },
  { productName: "Cucumber 1kg", productPrice: 1.2, productCategory: "Vegetables", barcode: "5002" },
  { productName: "Carrots 1kg", productPrice: 1.0, productCategory: "Vegetables", barcode: "5003" },
  { productName: "Onions 1kg", productPrice: 0.9, productCategory: "Vegetables", barcode: "5004" },
  { productName: "Potatoes 1kg", productPrice: 1.1, productCategory: "Vegetables", barcode: "5005" },

  // Fruits
  { productName: "Apples 1kg", productPrice: 2.5, productCategory: "Fruits", barcode: "6001" },
  { productName: "Bananas 1kg", productPrice: 2.0, productCategory: "Fruits", barcode: "6002" },
  { productName: "Oranges 1kg", productPrice: 2.2, productCategory: "Fruits", barcode: "6003" },
  { productName: "Grapes 1kg", productPrice: 3.0, productCategory: "Fruits", barcode: "6004" },
  { productName: "Mango 1kg", productPrice: 4.5, productCategory: "Fruits", barcode: "6005" },

  // Meat & Poultry
  { productName: "Chicken Breast 1kg", productPrice: 5.0, productCategory: "Meat & Poultry", barcode: "7001" },
  { productName: "Beef Mince 1kg", productPrice: 7.5, productCategory: "Meat & Poultry", barcode: "7002" },
  { productName: "Lamb Chops 1kg", productPrice: 10.0, productCategory: "Meat & Poultry", barcode: "7003" },
  { productName: "Whole Chicken", productPrice: 8.0, productCategory: "Meat & Poultry", barcode: "7004" },
  { productName: "Turkey Breast 1kg", productPrice: 9.0, productCategory: "Meat & Poultry", barcode: "7005" },

  // Seafood
  { productName: "Salmon Fillet 1kg", productPrice: 12.0, productCategory: "Seafood", barcode: "8001" },
  { productName: "Shrimp 1kg", productPrice: 10.0, productCategory: "Seafood", barcode: "8002" },
  { productName: "Tuna Can", productPrice: 2.5, productCategory: "Seafood", barcode: "8003" },
  { productName: "Crab Sticks", productPrice: 3.5, productCategory: "Seafood", barcode: "8004" },
  { productName: "Sardines Can", productPrice: 1.5, productCategory: "Seafood", barcode: "8005" },

  // Grains & Rice
  { productName: "Rice 5kg Bag", productPrice: 15.0, productCategory: "Grains & Rice", barcode: "9001" },
  { productName: "Lentils 1kg", productPrice: 3.0, productCategory: "Grains & Rice", barcode: "9002" },
  { productName: "Pasta 500g", productPrice: 2.0, productCategory: "Grains & Rice", barcode: "9003" },
  { productName: "Oats 1kg", productPrice: 4.0, productCategory: "Grains & Rice", barcode: "9004" },
  { productName: "Flour 1kg", productPrice: 1.8, productCategory: "Grains & Rice", barcode: "9005" },

  // Spices & Condiments
  { productName: "Salt 1kg", productPrice: 0.8, productCategory: "Spices & Condiments", barcode: "10001" },
  { productName: "Black Pepper 100g", productPrice: 1.5, productCategory: "Spices & Condiments", barcode: "10002" },
  { productName: "Olive Oil 1L", productPrice: 6.0, productCategory: "Spices & Condiments", barcode: "10003" },
  { productName: "Vinegar 500ml", productPrice: 2.0, productCategory: "Spices & Condiments", barcode: "10004" },
  { productName: "Ketchup Bottle", productPrice: 2.5, productCategory: "Spices & Condiments", barcode: "10005" },

  // Household & Cleaning
  { productName: "Laundry Detergent 1L", productPrice: 4.0, productCategory: "Household & Cleaning", barcode: "11001" },
  { productName: "Dish Soap 750ml", productPrice: 2.5, productCategory: "Household & Cleaning", barcode: "11002" },
  { productName: "Paper Towels Roll", productPrice: 1.5, productCategory: "Household & Cleaning", barcode: "11003" },
  { productName: "Toilet Paper 4-pack", productPrice: 3.0, productCategory: "Household & Cleaning", barcode: "11004" },
  { productName: "Glass Cleaner 500ml", productPrice: 2.8, productCategory: "Household & Cleaning", barcode: "11005" }
];


async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ DB Connected");

    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log("✅ Products seeded!");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

seed();
