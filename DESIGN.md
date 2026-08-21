# 🍳 KitchenFlow — UI & Design System Specification

## 1. Brand Identity & Philosophy

**KitchenFlow** is a modern, real-time Kitchen Display System (KDS) engineered specifically for high-velocity, high-stress commercial kitchen environments. 

### Core Design Principles:
1. **Instant Scannability (3-Second Rule)**: A line cook or head chef must comprehend an incoming ticket's urgency, order number, workload complexity, and dish modifications in under 3 seconds from 3 to 6 feet away.
2. **Deterministic State Model**: Kitchen operations only move in one direction. There are no reversible states, no ambiguous intermediate states (e.g. no "cooking" or "ready"), and `Completed` is a terminal dead-state.
3. **Uniform Grid Harmony**: Every card in the grid maintains an identical, fixed height (`440px`). Cards with many items scroll internally rather than growing infinitely or breaking grid row alignment.
4. **Tactile Haptic Feedback**: Every touch interaction features spring compression physics (`active:scale-[0.95]`) and hover elevations to reinforce intent on kitchen touchscreens.

---

## 2. Color Palette & Design Tokens

### Primary Brand & Accent
| Token | Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Brand Orange** | `#FF5C39` | `bg-[#FF5C39]`, `text-[#FF5C39]` | Primary CTA button, brand title "Flow", active tab states |
| **Brand Orange Hover** | `#F04D28` | `hover:bg-[#F04D28]` | Button hover state |
| **Brand Orange Dark** | `#C2410C` | `text-[#C2410C]` | High-contrast active accents |

### Backgrounds & Surfaces
| Token | Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#ECEEF1` | `bg-[#ECEEF1]` | Soft low-glare slate canvas that reduces eye strain under harsh kitchen lighting |
| **Surface Card** | `#FFFFFF` | `bg-white` | Order ticket cards, header bar, filter buttons |
| **Subtle Surface** | `#F9FAFB` | `bg-zinc-50` | Empty states, thumbnail icon placeholders, completed ticket footer |

### Borders & Dividers
| Token | Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Card Border** | `#E4E4E7` | `border-zinc-200/80` | Card perimeter outline and header divider |
| **Internal Border** | `#F4F4F5` | `border-zinc-100` | Section dividers between header, item list, and footer |
| **Focus Border** | `#FF5C39` | `focus:border-[#FF5C39]` | Single-line active focus for inputs and dropdowns |

### Typography Colors
| Token | Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Text** | `#111827` / `#18181B` | `text-zinc-900` | Large bold order numbers (`#5266`), dish titles, brand name |
| **Secondary Text** | `#71717A` | `text-zinc-600` / `text-zinc-700` | Filter buttons, dish quantity labels, button labels |
| **Muted Meta** | `#A1A1AA` | `text-zinc-400` / `text-zinc-500` | Subtitles (`Order`, `Waiting for`), dish modifier notes |

---

## 3. Status & Urgency Indicators

### Order Status Badges
* **Waiting**: `bg-amber-50 text-amber-700 border border-amber-200/80`
* **Priority**: `bg-red-50 text-red-700 border border-red-200/80 animate-pulse`
* **Completed**: `bg-zinc-100 text-zinc-600 border border-zinc-200/80` (Terminal state)

### Workload Complexity Badges (Kitchen Prep Terminology)
Calculated automatically from backend dish points:
* **Quick Prep** ($\le 4$ pts): `bg-emerald-50 text-emerald-700 border border-emerald-200/80` (e.g. 1–2 wraps or drinks)
* **Normal Prep** ($5-9$ pts): `bg-amber-50 text-amber-700 border border-amber-200/80` (e.g. burgers with sides)
* **Heavy Prep** ($\ge 10$ pts): `bg-red-50 text-red-700 border border-red-200/80` (e.g. multi-pizza combo orders)

### Elapsed Waiting Timers
Positioned at the top right of active cards beneath the subtitle `Waiting for`:
* **< 5 Minutes**: `text-emerald-600` (On Track)
* **5 – 10 Minutes**: `text-amber-600` (Approaching Target)
* **> 10 Minutes**: `text-red-600 animate-pulse` (Critical Kitchen Delay)
* **Completed Orders**: Timer is completely removed.

---

## 4. Typography Hierarchy

* **Font Family**: [Roboto](https://fonts.google.com/specimen/Roboto), `ui-sans-serif, system-ui, sans-serif`
* **Weights**:
  * `900 (Black)`: Order Numbers (`text-2xl font-black`)
  * `700 (Bold)`: Brand Title (`KitchenFlow`), Tab Buttons, Item Names (`1x Spicy Zinger Burger`), Mark Complete CTA
  * `600 (Semi-Bold)`: Dropdowns, Elapsed Timers, Status Badges
  * `500 (Medium)`: Subtitle Overheads (`Order`, `Waiting for`), Search Input Text
  * `400 (Regular)`: Item modifiers and customizations (`Extra Pickles (#4229)`)

---

## 5. Layout Architecture & Anatomy

### 1. Top Header Bar (`h-16`)
* **Left**: 
  * App Icon (`40px x 40px rounded-xl` Coral Orange chef silhouette)
  * Brand Title: `Kitchen`**`Flow`** (`Flow` styled in `#FF5C39`)
* **Right**:
  * `+ Simulate Order` micro-action button for live kitchen simulation

### 2. Filter Row (`px-6 pt-5 pb-4`)
* **Left Group**: Status Filter Tabs (`All`, `Waiting`, `Priority`, `Complete`)
* **Right Group**:
  * **Order Number Search**: Strict integer-only sanitization (`[0-9]*`), explicit `Search` button + `Enter` key execution, instant `✕` clear.
  * **Menu Item Filter Dropdown**: Pure white background (`bg-white`), black text (`text-zinc-800`), fit-content width (`w-fit`), single clean border on active state.

### 3. Ticket Card Anatomy (`h-[440px]`)
```
+-------------------------------------------------------------+
| Order                              Waiting for              |
| #5266                                 14:32 (red alert)     |
| [Waiting] [Heavy Prep]                                      |
+-------------------------------------------------------------+
| (Internal Scrollable Item List - max-h / flex-1)            |
|                                                             |
| [img] 1x Spicy Zinger Burger                                |
|       Crunchy chicken patty, lettuce, zesty mayo            |
|                                                             |
| [img] 1x Classic Veggie Wrap                                |
|       Fresh veggies, creamy sauce, Extra Pickles            |
|                                                             |
| [img] 2x Mediterranzer Pizza                                |
|       Wood fired crust, mozzarella, fresh basil             |
+-------------------------------------------------------------+
| [           Mark Complete  +           ] (or Completed tag) |
+-------------------------------------------------------------+
```

---

## 6. Infinite Scroll & Pagination Standard
* **Page Size**: `20` orders per request.
* **Stream Mechanism**: Client-side Intersection Observer watching a bottom sentinel at grid boundary (`rootMargin: '200px'`).
* **Virtualized Layout**: CSS Grid `grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-5` ensures seamless card rendering without row shifting or viewport stutter.
