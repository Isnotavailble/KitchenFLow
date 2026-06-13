# KitchenFlow - Smart POS + KDS System

**KitchenFlow** is a modern, managerless Point of Sale (POS) and Kitchen Display System (KDS) designed to tame the chaos of busy restaurant kitchens. By connecting cashiers directly to the cooking line, the system automates order flows, simplifies kitchen communications, and optimizes preparation workflows.

---

## 🛠️ Current Development Status

The project is currently in the **active backend development phase**:
* **Completed Features:**
  * **Database Entity Model:** JPA entities fully mapped (`UserEntity`, `TokenEntity`, `MenuEntity`, `OrderEntity`, `OrderItemEntity`) with optimized lazy fetching and relationship constraints.
  * **JPA Auditing:** Automated timestamping configured for order and menu entities.
  * **Security & Authentication Core:** Stateless JWT access token and stateful refresh token authentication, complete with custom JSON error handlers and 30-second early-refresh loop protection.
* **In Progress / Next Steps:**
  * Cashier POS checkout and order submission endpoints.
  * Chef KDS preparation list and status transition API.
  * Menu management APIs.

---

## 📂 Project Structure

* **`/backend`**: The Spring Boot + Maven application representing the system's core API server, database configurations, and security filters.
* **`/docs`**: Contains all developer and system documentation, including:
  * [features.md](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/docs/features.md) - Active and planned project features.
  * [db_design.md](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/docs/db_design.md) - Database schema specifications and entity relationships.
  * [GEIMINI.md](file:///c:/Users/AnyaWalker/Desktop/POS_KDS/docs/GEIMINI.md) - AI guidelines and development boundaries.

---

## 🍳 Taming the Kitchen Chaos

In typical busy kitchens, orders arrive in a chaotic rush. Chefs face the difficult task of multitasking, tracking preparation times, and handling cooking orders manually. 

**KitchenFlow** solves this by introducing:
* **Chef-Managed Active Batching:** The Chef accepts a controlled amount of orders from the FIFO queue that they have capacity to cook, preventing kitchen overload.
* **Consolidated Prep Helper:** The system automatically identifies and aggregates duplicate menu items across all currently accepted orders (e.g., displaying *"3x Burgers"* total). This allows the Chef to manage cooking batches efficiently in real-time.

---

## 🔮 Future Roadmap

* **AI Chef Recommendations:** In a future phase, we plan to introduce intelligent AI recommendations. This feature will analyze active orders to suggest optimal cooking start times, synchronize dish completion times (so all items on an order finish hot together), and dynamically forecast kitchen throughput.
