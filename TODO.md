# TODO: Implement Seller User Addition Feature

## Current Task: Allow sellers to add users like admins

### Steps:
- [x] Create `app/routes/seller.users.tsx` with seller user management page
- [x] Implement loader to fetch users (or relevant data) with requireVendor auth
- [x] Implement action for user creation (createUser intent)
- [x] Create UI with AddUserModal integration and SellerLayout
- [x] Test the new seller user addition functionality
- [x] Verify proper authorization and API integration
- [x] Fix pagination issue in user fetching (added skip=0&limit=1000 to get all users)

### Notes:
- Reuse existing AddUserModal component
- Use requireVendor instead of requireAdmin
- Follow similar structure to admin.users.tsx but simplified for sellers
- Ensure proper error handling and success messages

---

# TODO: Create Admin Installments Route

## Current Task: Create admin route for managing installments

### Steps:
- [ ] Create `app/routes/admin.installments.tsx` with installments management page
- [ ] Implement loader with requireAdmin auth
- [ ] Add state for stats, installments list, filters
- [ ] Fetch installment stats on load
- [ ] Display stats cards (total, paid, overdue, etc.)
- [ ] Create table with installments, filters (status, date range)
- [ ] Add actions: view, pay, cancel
- [ ] Create modals for pay installment and cancel installment
- [ ] Add button to update overdue status
- [ ] Test the new admin installments functionality
- [ ] Verify proper authorization and API integration

### Notes:
- Follow similar structure to admin.products.tsx
- Use external API https://showroom-backend-2x3g.onrender.com/installments/*
- Implement proper error handling and success messages
