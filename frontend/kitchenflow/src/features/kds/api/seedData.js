const FOOD_IMAGES = {
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=80',
  wrap: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=100&auto=format&fit=crop&q=80',
  salad: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&auto=format&fit=crop&q=80',
  pizza: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=100&auto=format&fit=crop&q=80',
  chicken: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=100&auto=format&fit=crop&q=80'
}

export const MENU_ITEMS_LIST = [
  'Spicy Zinger Burger',
  'Classic Veggie Wrap',
  'Vegan Chicken Wrap',
  'Vegan Caesar Chicken',
  'Mediterranzer Pizza',
  'Mushroom Swiss Burger',
  'Vegan Caesar Salad',
  'Spicy Chicken Wrap',
  'Classic Margherita Pizza',
  'BBQ Pulled Chicken',
  'Crispy Tofu Bowl'
]

const SAMPLE_TEMPLATES = [
  {
    items: [
      { name: 'Spicy Zinger Burger', qty: 1, desc: 'Crunchy chicken patty, lettuce, zesty mayo', image: FOOD_IMAGES.burger, itemCustomization: 'Extra zesty mayo' },
      { name: 'Classic Veggie Wrap', qty: 1, desc: 'Fresh veggies, creamy sauce', image: null, itemCustomization: 'No onions' },
      { name: 'Vegan Chicken Wrap', qty: 2, desc: 'Mixed greens, sely croutons, dairy free wild dressing', image: FOOD_IMAGES.salad },
      { name: 'Mediterranzer Pizza', qty: 1, desc: 'Extra Cheese', image: FOOD_IMAGES.pizza }
    ],
    workloadTier: 'heavy'
  },
  {
    items: [
      { name: 'Mushroom Swiss Burger', qty: 1, desc: 'Savory beef patty, grilled mushrooms', image: FOOD_IMAGES.burger, itemCustomization: 'Well done' },
      { name: 'Vegan Caesar Salad', qty: 1, desc: 'Mixed greens, dairy-free dressing', image: FOOD_IMAGES.salad }
    ],
    workloadTier: 'medium'
  },
  {
    items: [
      { name: 'Mediterranzer Pizza', qty: 2, desc: 'Wood-fired crust, kalamata olives', image: FOOD_IMAGES.pizza }
    ],
    workloadTier: 'heavy'
  },
  {
    items: [
      { name: 'Classic Veggie Wrap', qty: 1, desc: 'Fresh veggies, hummus', image: FOOD_IMAGES.wrap, itemCustomization: 'Sauce on side' }
    ],
    workloadTier: 'light'
  },
  {
    items: [
      { name: 'Classic Margherita Pizza', qty: 1, desc: 'Wood fired crust, mozzarella', image: FOOD_IMAGES.pizza },
      { name: 'Spicy Zinger Burger', qty: 1, desc: 'Double crunchy chicken patty', image: FOOD_IMAGES.burger }
    ],
    workloadTier: 'medium'
  },
  {
    items: [
      { name: 'Spicy Zinger Burger', qty: 2, desc: 'Double crunchy chicken patty, extra zesty mayo', image: FOOD_IMAGES.burger },
      { name: 'Classic Veggie Wrap', qty: 1, desc: 'Fresh veggies, creamy sauce', image: FOOD_IMAGES.wrap }
    ],
    workloadTier: 'medium'
  }
]

// Generate seed orders including 3 completed orders ready for pickup
export const INITIAL_ORDERS = Array.from({ length: 32 }, (_, i) => {
  const orderNum = 5266 + i
  const template = SAMPLE_TEMPLATES[i % SAMPLE_TEMPLATES.length]
  const elapsedMinutes = Math.max(1, 16 - Math.floor(i * 0.5))
  const elapsedSeconds = (i * 17) % 60
  const orderType = i % 2 === 0 ? 'takeaway' : 'dine_in'

  // Pre-seed 3 recently completed orders for pickup demo (orders at index 29, 30, 31)
  const isCompleted = i >= 29
  const completedMinutesAgo = i === 29 ? 5 : i === 30 ? 3 : 1

  return {
    id: `ord-${orderNum}`,
    order_number: `#${orderNum}`,
    orderNumberInt: orderNum,
    orderType,
    created_at: new Date(Date.now() - (elapsedMinutes * 60 + elapsedSeconds) * 1000).toISOString(),
    completed_at: isCompleted ? new Date(Date.now() - completedMinutesAgo * 60 * 1000).toISOString() : null,
    status: isCompleted ? 'Completed' : 'Waiting',
    workloadTier: template.workloadTier,
    items: template.items
  }
})

let counter = 5300

export function generateSimulatedOrder() {
  counter++
  const template = SAMPLE_TEMPLATES[Math.floor(Math.random() * SAMPLE_TEMPLATES.length)]

  return {
    id: `ord-${counter}`,
    order_number: `#${counter}`,
    orderNumberInt: counter,
    orderType: Math.random() > 0.5 ? 'takeaway' : 'dine_in',
    created_at: new Date().toISOString(),
    status: 'Waiting',
    workloadTier: template.workloadTier,
    items: template.items
  }
}
