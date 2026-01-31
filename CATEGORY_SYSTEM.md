# Enhanced Transaction Categorization

## Overview
Improved AI categorization to properly distinguish between Insurance, Installment, Recurring expenses, and other transaction types.

---

## 🎯 **Category Definitions**

### **1. INSURANCE** 🛡️
**Definition:** Any insurance-related payments and premiums

**Includes:**
- Health insurance
- Life insurance
- Car/auto insurance
- Home/property insurance
- Travel insurance
- Pet insurance
- Insurance premiums and policy payments

**Examples:**
- "Prudential Life Insurance"
- "Allianz Health Premium"
- "State Farm Auto Insurance"
- "AIA Life Policy Payment"
- "Manulife Health Coverage"

**Key Identifiers:**
- Contains words: "insurance", "premium", "policy", "coverage"
- Insurance company names (Prudential, Allianz, AIA, etc.)

---

### **2. INSTALLMENT** 💳
**Definition:** Fixed payment plans for purchases (NOT subscriptions)

**Includes:**
- Device/phone installments (iPhone, Samsung, etc.)
- Furniture payment plans
- Appliance financing
- Buy-now-pay-later (BNPL) schemes
- Loan repayments (car, personal, education)
- Layaway payments

**Examples:**
- "iPhone 15 Installment 3/12"
- "Samsung Galaxy Payment 5/24"
- "IKEA Sofa Payment 2/6"
- "Klarna Payment - Nike Shoes"
- "Afterpay - Laptop 4/4"
- "Car Loan Monthly Payment"
- "Personal Loan Repayment"

**Key Identifiers:**
- Contains: "installment", "payment X/Y", "loan", "financing"
- BNPL services: Klarna, Afterpay, Affirm, Zip
- Shows payment progress (3/12, 2/6, etc.)

---

### **3. RECURRING** 🔄
**Definition:** Regular subscription services and memberships

**Includes:**
- Streaming services (Netflix, Spotify, Disney+, YouTube Premium)
- Software subscriptions (Adobe, Microsoft 365, iCloud, Dropbox)
- Gym memberships and fitness apps
- Club memberships and dues
- Utility bills (electricity, water, gas, internet, phone plan)
- News/magazine subscriptions
- Cloud storage subscriptions

**Examples:**
- "Netflix Monthly Subscription"
- "Spotify Premium"
- "Adobe Creative Cloud"
- "Microsoft 365 Family"
- "Gold's Gym Membership"
- "iCloud Storage 200GB"
- "Internet Bill - Comcast"
- "Electric Company Monthly"

**Key Identifiers:**
- Contains: "subscription", "monthly", "membership", "premium", "plan"
- Streaming services: Netflix, Spotify, Disney+, HBO, Apple TV+
- Software: Adobe, Microsoft, Google, Dropbox
- Utilities: Electric, water, internet, phone

**NOT Recurring:**
- One-time purchases (even from subscription companies)
- Installment payments (those go to INSTALLMENT)
- Insurance (those go to INSURANCE)

---

### **4. FOOD & DINING** 🍔
**Definition:** Meals, groceries, and food-related purchases

**Includes:**
- Restaurants and cafes
- Fast food chains
- Grocery stores and supermarkets
- Food delivery services (Uber Eats, DoorDash, GrabFood)
- Bakeries, coffee shops

**Examples:**
- "McDonald's", "Starbucks", "Chipotle"
- "Whole Foods", "Walmart Grocery"
- "Uber Eats - Pizza Delivery"
- "Local Restaurant"

---

### **5. TRANSPORTATION** 🚗
**Definition:** Travel and commute expenses

**Includes:**
- Gas stations and fuel
- Parking fees and tolls
- Ride-sharing (Uber, Lyft, Grab, Gojek)
- Public transport (metro, bus, train)
- Flights and hotels
- Car rentals

**Examples:**
- "Shell Gas Station"
- "Uber Ride to Airport"
- "Parking Garage Downtown"
- "Delta Airlines Flight"

---

### **6. SHOPPING** 🛍️
**Definition:** Retail purchases and general shopping

**Includes:**
- Clothing and fashion
- Electronics (one-time purchases)
- Home goods and furniture (one-time)
- Online shopping (Amazon, eBay, Shopee)
- Department stores

**Examples:**
- "Amazon - Headphones"
- "Nike Store"
- "Best Buy - Monitor"
- "Target"

---

### **7. ENTERTAINMENT** 🎮
**Definition:** Leisure activities and one-time entertainment

**Includes:**
- Movies and concerts
- Gaming (game purchases, not subscriptions)
- Events and tickets
- Hobbies and crafts
- Books and music (one-time purchases)

**Examples:**
- "AMC Theaters - Movie Ticket"
- "Steam - Video Game"
- "Concert Ticket - Taylor Swift"
- "Amazon - Book Purchase"

---

### **8. HEALTHCARE** 🏥
**Definition:** Medical and health-related expenses

**Includes:**
- Doctor visits and consultations
- Pharmacy and prescriptions
- Dental and vision care
- Medical supplies
- Lab tests and procedures

**Examples:**
- "CVS Pharmacy"
- "Dr. Smith - Checkup"
- "Dental Cleaning"
- "Prescription Medication"

---

### **9. OTHER** 📦
**Definition:** Anything that doesn't fit the above categories

**Includes:**
- Miscellaneous purchases
- Unclear transactions
- Unique one-off expenses

---

## 🔍 **Key Distinctions**

### **Insurance vs Recurring**
| Insurance | Recurring |
|-----------|-----------|
| Specifically insurance policies | General subscriptions |
| Prudential, Allianz, AIA | Netflix, Spotify, Adobe |
| Health/life/auto coverage | Services and utilities |

### **Installment vs Recurring**
| Installment | Recurring |
|-------------|-----------|
| Fixed-term payment plan | Ongoing subscription |
| Pays off a purchase | Continuous service |
| iPhone 3/12, Car Loan | Netflix Monthly |
| Has an end date | Continues indefinitely |
| BNPL (Klarna, Afterpay) | Software subscriptions |

### **Installment vs Shopping**
| Installment | Shopping |
|-------------|----------|
| Payment plan (3/12) | One-time purchase |
| Monthly payments | Full payment |
| "Installment", "Payment" | Regular retail |

---

## 📊 **Examples in Action**

### **Real-World Scenarios**

```
Transaction: "Prudential Life Insurance Premium"
Category: INSURANCE ✓
Reason: Insurance company + premium payment

Transaction: "iPhone 14 Pro Installment 6/24"
Category: INSTALLMENT ✓
Reason: Device payment plan with progress indicator

Transaction: "Netflix Monthly Subscription"
Category: RECURRING ✓
Reason: Ongoing streaming service subscription

Transaction: "Klarna - Nike Shoes Payment 2/4"
Category: INSTALLMENT ✓
Reason: BNPL service with payment progress

Transaction: "Electric Company - Monthly Bill"
Category: RECURRING ✓
Reason: Utility bill (recurring service)

Transaction: "Car Insurance - State Farm"
Category: INSURANCE ✓
Reason: Auto insurance payment

Transaction: "Spotify Premium Family Plan"
Category: RECURRING ✓
Reason: Music streaming subscription

Transaction: "Personal Loan Payment"
Category: INSTALLMENT ✓
Reason: Loan repayment (fixed term)

Transaction: "Gold's Gym Membership"
Category: RECURRING ✓
Reason: Gym membership (ongoing)

Transaction: "Amazon - Headphones"
Category: SHOPPING ✓
Reason: One-time retail purchase
```

---

## ✅ **Benefits**

### **For Users:**
- ✅ **Clear categorization** - Know exactly what type of expense
- ✅ **Better budgeting** - Track recurring vs one-time costs
- ✅ **Identify commitments** - See all installments and subscriptions
- ✅ **Insurance tracking** - Monitor all insurance payments
- ✅ **Financial planning** - Understand fixed vs variable expenses

### **For Analysis:**
- ✅ **Accurate insights** - Better spending patterns
- ✅ **Subscription audit** - Find unused recurring charges
- ✅ **Debt tracking** - Monitor installment progress
- ✅ **Insurance overview** - All coverage in one place

---

## 🎯 **Category Priority**

When a transaction could fit multiple categories, use this priority:

1. **INSURANCE** (most specific)
2. **INSTALLMENT** (payment plans)
3. **RECURRING** (subscriptions)
4. **Specific categories** (Food, Transportation, etc.)
5. **OTHER** (fallback)

**Example:**
- "Health Insurance Premium" → **INSURANCE** (not Healthcare)
- "iPhone Installment" → **INSTALLMENT** (not Shopping)
- "Netflix" → **RECURRING** (not Entertainment)

---

## 🚀 **Result**

The AI now provides:
- ✅ **Precise categorization** for all transaction types
- ✅ **Clear distinction** between similar categories
- ✅ **Consistent classification** across statements
- ✅ **Better financial insights** for users

Users can now easily identify and track their insurance payments, installment plans, and recurring subscriptions separately! 🎊
