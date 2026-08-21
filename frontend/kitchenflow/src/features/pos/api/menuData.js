export const POS_CATEGORIES = [
  'All',
  'Burgers',
  'Wraps',
  'Pizzas',
  'Salads',
  'Beverages',
  'Sides',
  'Desserts',
  'Hot Drinks',
  'Combos'
]

export const POS_MENU_ITEMS = [
  {
    id: 'menu-1',
    name: 'Spicy Zinger Burger',
    category: 'Burgers',
    price: 8.50,
    workloadTier: 'medium',
    prepPoints: 4,
    desc: 'Crispy spicy chicken breast, fresh lettuce, and zesty signature sauce.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
    isAvailable: true
  },
  {
    id: 'menu-2',
    name: 'Mushroom Swiss Burger',
    category: 'Burgers',
    price: 9.50,
    workloadTier: 'medium',
    prepPoints: 4,
    desc: 'Savory prime beef patty, melted Swiss cheese, and sautéed garlic mushrooms.',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=80',
    isAvailable: true
  },
  {
    id: 'menu-3',
    name: 'Classic Veggie Wrap',
    category: 'Wraps',
    price: 6.75,
    workloadTier: 'light',
    prepPoints: 1,
    desc: 'Roasted garden vegetables, hummus, fresh spinach in a spinach tortilla.',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&auto=format&fit=crop&q=80',
    isAvailable: true
  },
  {
    id: 'menu-4',
    name: 'Spicy Chicken Wrap',
    category: 'Wraps',
    price: 7.95,
    workloadTier: 'medium',
    prepPoints: 4,
    desc: 'Grilled spicy chicken strips, jalapeños, melted cheddar, chipotle crema.',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&auto=format&fit=crop&q=80',
    isAvailable: false // Unavailable item 1
  },
  {
    id: 'menu-5',
    name: 'Mediterranzer Pizza',
    category: 'Pizzas',
    price: 14.50,
    workloadTier: 'heavy',
    prepPoints: 10,
    desc: 'Wood-fired crust, kalamata olives, sun-dried tomatoes, feta and oregano.',
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400&auto=format&fit=crop&q=80',
    isAvailable: true
  },
  {
    id: 'menu-6',
    name: 'Classic Margherita Pizza',
    category: 'Pizzas',
    price: 12.00,
    workloadTier: 'heavy',
    prepPoints: 10,
    desc: 'San Marzano tomato base, fresh buffalo mozzarella, and fragrant basil.',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&auto=format&fit=crop&q=80',
    isAvailable: false // Unavailable item 2
  },
  {
    id: 'menu-7',
    name: 'Vegan Caesar Salad',
    category: 'Salads',
    price: 7.50,
    workloadTier: 'light',
    prepPoints: 1,
    desc: 'Crisp romaine hearts, sourdough garlic croutons, dairy-free creamy Caesar dressing.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80',
    isAvailable: true
  },
  {
    id: 'menu-8',
    name: 'Crispy Tofu Power Bowl',
    category: 'Salads',
    price: 9.00,
    workloadTier: 'medium',
    prepPoints: 4,
    desc: 'Golden crispy tofu cubes, quinoa, edamame, avocado, sesame ginger glaze.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
    isAvailable: true
  },
  {
    id: 'menu-9',
    name: 'Iced Citrus Lemonade',
    category: 'Beverages',
    price: 3.50,
    workloadTier: 'light',
    prepPoints: 1,
    desc: 'Freshly squeezed lemons with organic mint leaves over crushed ice.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80',
    isAvailable: true
  },
  {
    id: 'menu-10',
    name: 'Cold Brew Craft Coffee',
    category: 'Beverages',
    price: 4.25,
    workloadTier: 'light',
    prepPoints: 1,
    desc: 'Single-origin 18-hour slow-steeped cold brew with velvety finish.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
    isAvailable: true
  },
  {
    id: 'menu-11',
    name: 'House Special Smash Burger',
    category: 'Burgers',
    price: 11.00,
    workloadTier: 'heavy',
    prepPoints: 8,
    desc: 'Double smashed prime beef patties, caramelized onions, secret house glaze, brioche bun.',
    image: null,
    isAvailable: true
  }
]
