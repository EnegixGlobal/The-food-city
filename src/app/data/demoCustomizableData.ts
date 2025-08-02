// Demo data for testing customizable products and addons
export const demoCustomizableProducts = [
  {
    _id: "prod_kaju_katli_001",
    title: "Kaju Katli",
    slug: "kaju-katli",
    description: "Premium quality kaju katli made with pure cashews and ghee",
    price: 1408, // Base price for 1kg
    discountedPrice: 352, // Discounted price for 250g (default)
    category: "indian",
    imageUrl: "/images/kaju-katli.jpg",
    isVeg: true,
    isBestSeller: true,
    spicyLevel: 0,
    prepTime: 0,
    rating: 4.8,
    ratingCount: 156,
    isCustomizable: true,
    customizableOptions: [
      {
        label: "Weight",
        value: "Kaju Katli 250G",
        price: 352,
        isDefault: true,
        isAvailable: true
      },
      {
        label: "Weight", 
        value: "Kaju Katli 500G",
        price: 704,
        isDefault: false,
        isAvailable: true
      },
      {
        label: "Weight",
        value: "Kaju Katli 1kg", 
        price: 1408,
        isDefault: false,
        isAvailable: true
      }
    ],
    addOns: []
  },
  {
    _id: "prod_pizza_margherita_001", 
    title: "Margherita Pizza",
    slug: "margherita-pizza",
    description: "Classic pizza with fresh tomatoes, mozzarella, and basil",
    price: 299,
    discountedPrice: 249,
    category: "italian",
    imageUrl: "/images/margherita-pizza.jpg", 
    isVeg: true,
    isBestSeller: false,
    spicyLevel: 1,
    prepTime: 25,
    rating: 4.5,
    ratingCount: 89,
    isCustomizable: true,
    customizableOptions: [
      {
        label: "Size",
        value: "Regular (8 inch)",
        price: 249,
        isDefault: true,
        isAvailable: true
      },
      {
        label: "Size",
        value: "Medium (10 inch)", 
        price: 349,
        isDefault: false,
        isAvailable: true
      },
      {
        label: "Size",
        value: "Large (12 inch)",
        price: 449,
        isDefault: false,
        isAvailable: true
      }
    ],
    addOns: ["addon_extra_cheese", "addon_mushrooms"]
  }
];

export const demoCustomizableAddons = [
  {
    _id: "addon_extra_cheese_001",
    title: "Extra Cheese",
    description: "Premium mozzarella cheese for that extra cheesy goodness",
    price: 80, // Base price for regular
    imageUrl: "/images/extra-cheese.jpg",
    isVeg: true,
    rating: 4.6,
    ratingCount: 234,
    isCustomizable: true,
    customizableOptions: [
      {
        label: "Quantity",
        value: "Regular Extra Cheese",
        price: 80,
        isDefault: true,
        isAvailable: true
      },
      {
        label: "Quantity", 
        value: "Double Extra Cheese",
        price: 150,
        isDefault: false,
        isAvailable: true
      },
      {
        label: "Quantity",
        value: "Triple Extra Cheese",
        price: 220,
        isDefault: false,
        isAvailable: true
      }
    ]
  },
  {
    _id: "addon_cold_drink_001",
    title: "Cold Drink",
    description: "Refresh yourself with our chilled beverages",
    price: 60, // Base price for 250ml
    imageUrl: "/images/cold-drink.jpg",
    isVeg: true,
    rating: 4.2,
    ratingCount: 167,
    isCustomizable: true,
    customizableOptions: [
      {
        label: "Size",
        value: "250ml Bottle",
        price: 60,
        isDefault: true,
        isAvailable: true
      },
      {
        label: "Size",
        value: "500ml Bottle", 
        price: 100,
        isDefault: false,
        isAvailable: true
      },
      {
        label: "Size",
        value: "1L Bottle",
        price: 180,
        isDefault: false,
        isAvailable: false // Out of stock example
      }
    ]
  }
];

// Non-customizable products for comparison
export const demoRegularProducts = [
  {
    _id: "prod_regular_samosa_001",
    title: "Samosa",
    slug: "samosa",
    description: "Crispy and spicy samosas with potato filling",
    price: 25,
    category: "indian",
    imageUrl: "/images/samosa.jpg",
    isVeg: true,
    isBestSeller: false,
    spicyLevel: 2,
    prepTime: 15,
    rating: 4.3,
    ratingCount: 45,
    isCustomizable: false,
    addOns: []
  }
];
