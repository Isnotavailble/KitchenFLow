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
      { name: 'Spicy Zinger Burger', qty: 1, desc: 'Crunchy chicken patty, lettuce, zesty mayo', image: FOOD_IMAGES.burger },
      { name: 'Classic Veggie Wrap', qty: 1, desc: 'Fresh veggies, creamy sauce, Extra Pickles (#4229)', image: null },
      { name: 'Vegan Chicken Wrap', qty: 2, desc: 'Mixed greens, sely croutons, dairy free wild dressing', image: FOOD_IMAGES.salad },
      { name: 'Mediterranzer Pizza', qty: 1, desc: 'Extra Cheese (9519)', image: FOOD_IMAGES.pizza },
      { name: 'Vegan Caesar Chicken', qty: 1, desc: 'Grilled greens with olive and feta', image: FOOD_IMAGES.chicken }
    ],
    workloadTier: 'heavy'
  },
  {
    items: [
      { name: 'Mushroom Swiss Burger', qty: 1, desc: 'Savory beef patty, grilled mushrooms, Extra Pickles', image: FOOD_IMAGES.burger },
      { name: 'Vegan Caesar Salad', qty: 1, desc: 'Mixed greens, dairy-free pickles (#459)', image: FOOD_IMAGES.salad },
      { name: 'Spicy Chicken Wrap', qty: 1, desc: 'Crunchy spicy chicken, lettuce, Add Jalapeños', image: null },
      { name: 'Classic Margherita Pizza', qty: 2, desc: 'Wood fired crust, mozzarella, fresh basil', image: FOOD_IMAGES.pizza }
    ],
    workloadTier: 'heavy'
  },
  {
    items: [
      { name: 'Mediterranzer Pizza', qty: 2, desc: 'Extra Cheese (9519)', image: FOOD_IMAGES.pizza },
      { name: 'Vegan Caesar Chicken', qty: 1, desc: 'Grilled greens with olive and feta', image: FOOD_IMAGES.chicken }
    ],
    workloadTier: 'heavy'
  },
  {
    items: [
      { name: 'Classic Veggie Wrap', qty: 1, desc: 'Fresh veggies, creamy sauce, Extra Pickles (#4429)', image: FOOD_IMAGES.wrap }
    ],
    workloadTier: 'light'
  },
  {
    items: [
      { name: 'Classic Margherita Pizza', qty: 1, desc: 'Wood fired crust, mozzarella, fresh basil', image: FOOD_IMAGES.pizza },
      { name: 'Spicy Chicken Wrap', qty: 2, desc: 'Crunchy spicy chicken, lettuce, Add Jalapeños', image: null },
      { name: 'Spicy Zinger Burger', qty: 1, desc: 'Double crunchy chicken patty, extra zesty mayo', image: FOOD_IMAGES.burger },
      { name: 'Vegan Caesar Salad', qty: 1, desc: 'Mixed greens, vegan croutons, No Croutons', image: FOOD_IMAGES.salad }
    ],
    workloadTier: 'heavy'
  },
  {
    items: [
      { name: 'Spicy Zinger Burger', qty: 2, desc: 'Double crunchy chicken patty, extra zesty mayo', image: FOOD_IMAGES.burger },
      { name: 'Classic Veggie Wrap', qty: 1, desc: 'Fresh veggies, creamy sauce', image: FOOD_IMAGES.wrap }
    ],
    workloadTier: 'medium'
  }
]

// Generate 32 seed orders for seamless page size 20 pagination demonstration
export const INITIAL_ORDERS = Array.from({ length: 32 }, (_, i) => {
  const orderNum = 5266 + i
  const template = SAMPLE_TEMPLATES[i % SAMPLE_TEMPLATES.length]
  const elapsedMinutes = Math.max(1, 16 - Math.floor(i * 0.5))
  const elapsedSeconds = (i * 17) % 60

  return {
    id: `ord-${orderNum}`,
    order_number: `#${orderNum}`,
    orderNumberInt: orderNum,
    created_at: new Date(Date.now() - (elapsedMinutes * 60 + elapsedSeconds) * 1000).toISOString(),
    status: 'Waiting',
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
    created_at: new Date().toISOString(),
    status: 'Waiting',
    workloadTier: template.workloadTier,
    items: template.items
  }
}
