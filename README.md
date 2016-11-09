# Fast Cart 
Skip the line and checkout by scanning products from your app!


Link to marvel prototype:

https://marvelapp.com/8h8cc9g


# API / Schema

// login with Twitter / FB
class apiClient
- sharedInstance
- setStore
- getProductWithUpc (upc: Int) -> Product
- getReviewsForProduct (product: Product) -> [Reviews]
- getStores 

class User
  - id: Int
  - class var currentUser: User
  - history: [Receipts]
  - current: Receipt
  - favorites: [Stores]
  - payments: [Payment]

class Review:
 - title: String
 - comment: String
 - rating: Int [0,5]
 - username: String
 - date: Date
 - userImage: Image

class Product
  - upc: Int
  - name: String
  - overview: String
  - image: URL
  - store: Store
  - salePrice: Double
  - brandName: String
  - getReviews: [Review] // if it's constrained, ok but otherwise separate table with foreign key
  - averageRating: Double
  - {optional} color: String 
  - {optional} size: String
  - {optional} recommended: [Products]
  
class Store:
 - name: String
 - location: GPS
 - description: String
 - image: Image
 - class var currentStore: Store

class Payment:
 - Pay: Function [ TODO ] 

class Receipt
 - Products: [Product]
 - Started: Date (When first product is added)
 - Completed: Date (When user submits payment information)
 - Total: Double
 - Store: Store
 - Tax: Double
 - SubTotal: Double
 - Payment: Payment
 - Paid: Bool
 
# Sprint 1.0 (Implement fake models -- Saturday)
- User (Jose)
  1. Sign up, login, logout with FB
  2. Parse integration for user (especially the FB user id)
  3. Save the current user (check to see if the FB user id already exists in parse)
  4. All the properties of the user either filled from Parse or empty
- Store page (Belinda)
  1. A single walmart object and select (create a walmart store)
- Scan (Belinda)
  1. walmart API
  2. scan the product 
  3. returns a fake product even if cancel was clicked
- Product Details (Luis)
  1. Display the current cart in list form with fake products (ability to add)
  2. Implement rudimentary history functionality (display)
  3. Integrate history with Parse


