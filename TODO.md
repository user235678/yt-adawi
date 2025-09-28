# TODO: Update Seller Dashboard

## Tasks
- [ ] Update DashboardData interface to include total_orders_today, total_orders_week, total_revenue_today, total_revenue_week
- [ ] Update loader fallback data to include new fields
- [ ] Add state for activePeriod ('total' | 'week' | 'day')
- [ ] Add state for showDetails (boolean)
- [ ] Add tabs for Total, Semaine, Jour above stats cards
- [ ] Modify revenue and orders cards to display based on activePeriod
- [ ] Add ">" button to toggle showDetails
- [ ] Wrap additional sections in conditional render based on showDetails

# TODO: Create Seller Inventory Page

## Tasks
- [x] Create app/routes/seller.inventory.tsx with proper structure
- [x] Implement loader function to fetch data from /inventory/low-stock and /inventory/stats
- [x] Add TypeScript interfaces for API responses (InventoryStats, LowStockProduct)
- [x] Create UI components to display inventory stats and low stock products
- [x] Use SellerLayout for consistent styling
- [x] Handle loading states and errors
- [x] Test the page functionality
