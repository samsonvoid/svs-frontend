# S.Void Stock (SVS) - Refined Technical Documentation

## 1. Project Overview
**S.Void Stock (SVS)** is a modern, scalable Inventory and Sales Management System designed for small-to-medium retail businesses. Built on a decoupled (headless) architecture, it enables seamless integration across Web, Mobile, and external services.

### Core Value Proposition:
- **Real-time Inventory Tracking**: Accurate and synchronized stock levels across all operations.
- **Sales Intelligence**: Structured tracking of all transactional activities.
- **True Profit Analysis**: Profit derived from actual historical sales data, not static assumptions.
- **Full Traceability**: Complete audit trail for every stock movement.

## 2. System Objectives
1.  **Accuracy**: Maintain real-time, reliable stock data.
2.  **Profitability**: Enable precise profit calculation based on actual transactions.
3.  **Traceability**: Ensure every stock movement is recorded and auditable.
4.  **Performance**: Deliver high-speed operations with scalable infrastructure.
5.  **User Experience (UX)**: Provide a minimalist, responsive, and high-performance interface.

## 3. Core Features & Functional Requirements

### 3.1 Inventory Management
- **Universal Tracking**: Continuous monitoring of stock levels.
- **SKU System**: Unique product identification mechanism.
- **Threshold Alerts**: Automated alerts when stock falls below `min_stock`.
- **Categorization**: Logical grouping of products.

### 3.2 Sales & Transactions
- **Multi-Item Sales Processing**: Handle multiple products per transaction.
- **Automatic Stock Deduction**: Real-time update after each sale.
- **Persistent Sales History**: Immutable record of all transactions.

### 3.3 Financial Intelligence
- **Dynamic Profit Computation**: Based on real transaction data.
- **Revenue Analytics**: Daily, weekly, monthly insights.
- **Financial Reporting**: Aggregated summaries for decision-making.

### 3.4 Stock Audit System (Logs)
- **Bidirectional Tracking**: `IN` (restock) and `OUT` (sales) events.
- **Reference Linking**: Each log tied to a source (e.g., `sale_id` or `restock_id`).
- **Audit Trail**: Full transparency and accountability for all stock changes.

### 3.5 Purchase Management (Stock In)
- **Supplier Tracking**: Record which supplier provided the stock.
- **Cost Analysis**: Track the specific buying price at the time of purchase.
- **Automated Inventory Increase**: Stock quantity is automatically incremented upon purchase entry.
- **Audit Integration**: Each purchase generates a `Stock IN` log for full traceability.

### 3.6 Role-Based Access Control (RBAC)
- **Admin**: Full control over all system features.
- **Manager**: Inventory management and detailed report access.
- **Cashier**: Sales operations and basic stock viewing.

## 4. Technical Stack (The "S.Void" Stack)

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Laravel 12 (PHP 8.2+) | RESTful API & Business Logic |
| **Frontend** | React 19 | High-performance SPA architecture |
| **Database** | PostgreSQL 16 | Relational storage with high data integrity |
| **Styling** | Tailwind CSS v4+ | Modern, utility-first UI design |
| **Communication** | Axios | Optimized API interaction |
| **Caching** | Redis (Optional) | Performance optimization |

## 5. System Architecture & API
SVS follows a **Decoupled (Headless)** architecture:
- **`svs-backend`**: Laravel API with a logic layer, auth, and database interaction.
- **`svs-frontend`**: React SPA consuming the backend API.
- **Versioning**: API routes follow the `/api/v1/` standard (e.g., `/api/v1/products`, `/api/v1/sales`) for maintainability.

## 6. Database Schema Design (UUID-Based)
Primary keys use **UUIDs** for global scale and distributed compatibility.

### 6.1 Products & Categories
| Table: `products` | Table: `categories` |
| :--- | :--- |
| `id` (UUID, PK) | `id` (UUID, PK) |
| `sku` (String, Unique, Indexed) | `name` (String) |
| `name` (String) | |
| `buying_price` (Decimal 15,2) | |
| `selling_price` (Decimal 15,2) | |
| `stock_quantity` (Integer) | |
| `min_stock` (Integer) | |
| `category_id` (UUID, FK) | |

### 6.2 Sales & Audit Logs
- **`sales`**: Tracks total transaction value and timing.
- **`sale_items`**: Junction table for products in a sale.
- **`stock_logs`**: Permanent record of every movement.

### 6.3 Purchase Management
- **`purchases`**: Tracks incoming stock (`id`, `product_id`, `quantity`, `purchase_price`, `supplier_name`).

## 7. Performance & Optimization
- **$O(log n)$ SKU Search**: Utilizing B-Tree indexing for logarithmic search time.
- **Indexing Strategy**: Secondary indices on `sku`, `category_id`, and `stock_quantity`.
- **Query Optimization**: Pagination and Eager Loading (preventing $N+1$ queries).
- **Transactions**: Atomic operations for sales to ensure absolute data consistency.
- **Caching**: Redis implementation for dashboard stats and frequently accessed data.

## 8. Financial Computation & Precision
- **Profit Formula**: $Profit = (Selling\_Price \times Quantity\_Sold) - (Buying\_Price \times Quantity\_Sold)$
- **Monetary Precision**: Stored as `decimal(15,2)` to eliminate floating-point calculation errors.

### 8.2 Inventory Intelligence & Decision Logic
The system goes beyond basic CRUD to provide **Inventory Intelligence**:
- **Fast-Moving Detection**: `SELECT product_id, SUM(quantity) FROM sale_items GROUP BY product_id ORDER BY SUM(quantity) DESC`.
- **Dead Stock Analysis**: Automated identification of products with zero sales in the last 30/60/90 days.
- **Stock Turnover Rate**: $Turnover = \frac{Total\_Sold}{Average\_Stock\_Level}$. High turnover indicates healthy demand; low turnover indicates capital tied in stagnant inventory.
- **Smart Restocking**: Alerts prioritized by sales velocity rather than just simple quantity thresholds.

## 9. Development Guidelines
- **Security**: Token-based authentication (Sanctum/JWT), RBAC, Rate limiting, and Input sanitization.
- **Workflow**: Git version control with a clean feature-branching strategy.
- **Deployment**: VPS (Nginx + PHP-FPM) for API, Vercel/Netlify for Frontend.

## 10. Roadmap (Future Enhancements)
- **AI**: Demand prediction and smart restocking.
- **Mobile**: Native applications for iOS and Android.
- **Offline**: Data synchronization for intermittent connectivity.
- **Scanning**: Barcode integration via camera.