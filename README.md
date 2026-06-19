# RentalHouse – Full Stack MERN House Rental Platform

RentalHouse is a production-ready, feature-rich House Rental Platform designed using the MERN Stack (**MongoDB, Express.js, React.js, Node.js**) with a premium, responsive styling layer built on **Bootstrap 5 + custom glassmorphic styling**.

Similar to modern properties marketplaces like Airbnb, NoBroker, and MagicBricks, it connects tenants directly with property owners, facilitates visit booking inquiries, maps properties locations, and hosts role-based dashboards for Tenants, Owners, and Admins.

---

## Technical Architecture & Core Features

### Tech Stack
- **Frontend:** React.js (Vite bootstrapper), Axios client wrapper, Bootstrap 5, Bootstrap Icons, custom HSL color-scheme stylesheets.
- **Backend:** Node.js, Express.js, JWT Cookie-Parser sessions, Bcryptjs password hashing, Multer file parsing.
- **Database:** MongoDB Atlas Mongoose connection with custom programmatic DNS routing overrides.
- **Notifications & Images:** SMTP-Nodemailer email triggers, Cloudinary SDK upload service integrations (with fully functional local disk storage and console logger fallbacks).

### Key Features
1. **Premium Responsive Design:** Glassmorphic layout headers, hero search dashboard, image gallery sliders, interactive Google Maps embeds, and custom skeleton shimmering loaders.
2. **Role-Based Access Control (RBAC):**
   - **Tenants:** Can search houses, view verified listings, wishlist/favorite properties, send visit bookings, and post property reviews.
   - **Owners:** Can list properties, manage images, approve/reject visit requests, and view listings analytics (active rent, total inquiries).
   - **Admins:** Can monitor statistics, block/unblock malicious users, override property statuses, and audit listings.
3. **Properties Compare Tray:** Sticky compare drawer allowing users to pick and contrast up to 3 listings side-by-side.

---

## Directory Structure

```text
houserent/
├── client/                 # React Client Application
│   ├── src/
│   │   ├── api/            # Axios API instances
│   │   ├── components/     # Header, Footer, Skeletons, Compare overlays
│   │   ├── context/        # Theme, Auth, Property, and Favorite contexts
│   │   ├── pages/          # Home, Browse, Details, Dashboards, Auth forms
│   │   ├── index.css       # Premium style system & animations
│   │   ├── App.jsx         # App router and context wrappers
│   │   └── main.jsx        # Bootstrapper loading Bootstrap JS
│   └── index.html
└── server/                 # Express backend API
    ├── config/             # DB connection logic
    ├── controllers/        # Auth, Properties, Bookings, Favorites, Admin controllers
    ├── middleware/         # Auth protecting, Multer uploads, and error handlers
    ├── models/             # User, Property, Booking, Favorite, and Review schemas
    ├── routes/             # REST routing setups
    ├── scripts/            # Database seeding script (30 properties, 31 users)
    ├── services/           # Nodemailer and Cloudinary helpers
    ├── app.js              # Express middlewares setup
    └── server.js           # Port listener & DNS overrides
```

---

## Quick Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed.
- Access to a MongoDB database (e.g., local database daemon or a remote Atlas connection string).

### 2. Backend Config
Rename `.env.example` in `/server` to `.env` and fill in values:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/rentalhouse

# Optional Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional SMTP Credentials
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### 3. Setup Commands

**Start the Backend Server:**
```bash
cd server
npm install
npm run seed  # Pre-populate database with 30 properties & test accounts
npm run dev   # Start dev server on http://localhost:5000
```

**Start the Frontend Client:**
```bash
cd ../client
npm install
npm run dev   # Start React app on http://localhost:5173
```

---

## Test Accounts (Password: `password123`)
- **Admin account:** `admin@rentalhouse.com`
- **Owner account:** `owner1@rentalhouse.com`
- **Tenant account:** `tenant1@rentalhouse.com`
