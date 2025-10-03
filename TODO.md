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
