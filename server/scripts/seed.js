const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Override DNS servers to bypass local resolution blocks
dns.setServers(['8.8.8.8', '1.1.1.1']);
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Favorite = require('../models/Favorite');
const Review = require('../models/Review');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const images = [
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1527030280862-64139fbe04ca?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=60',
  'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800&auto=format&fit=crop&q=60',
];

const amenitiesList = [
  'WiFi',
  'Air Conditioning',
  'Swimming Pool',
  'Gym',
  'Parking',
  'Power Backup',
  'Security Guard',
  'CCTV',
  'Elevator',
  'Washing Machine',
  'Geyser',
  'Water Purifier',
  'Playground',
  'Clubhouse',
];

const cities = [
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
  { name: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
];

const propertyTypes = ['Apartment', 'Villa', 'Independent House', 'PG'];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Clearing database...');
    await User.deleteMany();
    await Property.deleteMany();
    await Booking.deleteMany();
    await Favorite.deleteMany();
    await Review.deleteMany();

    console.log('Seeding Users...');

    // Create 1 Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@rentalhouse.com',
      password: 'password123',
      phone: '+919999999999',
      role: 'admin',
    });

    // Create 10 Owners
    const owners = [];
    for (let i = 1; i <= 10; i++) {
      const owner = await User.create({
        name: `Owner ${i}`,
        email: `owner${i}@rentalhouse.com`,
        password: 'password123',
        phone: `+91987654321${i-1}`,
        role: 'owner',
      });
      owners.push(owner);
    }

    // Create 20 Tenants
    const tenants = [];
    for (let i = 1; i <= 20; i++) {
      const tenant = await User.create({
        name: `Tenant ${i}`,
        email: `tenant${i}@rentalhouse.com`,
        password: 'password123',
        phone: `+91912345678${i-1}`,
        role: 'tenant',
      });
      tenants.push(tenant);
    }

    console.log('Seeding Properties...');
    const properties = [];
    const titles = [
      'Luxury Sunset Villa',
      'Modern Studio Apartment',
      'Spacious Independent Family House',
      'Premium Co-living PG for Professionals',
      'Elegant 3 BHK Penthouse',
      'Cozy Budget Apartment',
      'Charming Countryside Villa',
      'Contemporary Duplex House',
      'Smart PG Room with Balcony',
      'High-rise Luxury Apartment',
      'Classic Vintage Villa',
      'Spacious Shared PG for Students',
      'Furnished Independent Bungalow',
      'Urban Skyline Flat',
      'Greenfield Eco Villa',
    ];

    for (let i = 1; i <= 30; i++) {
      const cityInfo = cities[i % cities.length];
      const type = propertyTypes[i % propertyTypes.length];
      const owner = owners[i % owners.length];

      const rent = Math.floor(Math.random() * 45000) + 5000; // Rent between 5,000 and 50,000
      const deposit = rent * 3; // Standard deposit
      const bedrooms = type === 'PG' ? 1 : Math.floor(Math.random() * 4) + 1; // 1 to 4 bedrooms
      const bathrooms = Math.max(1, bedrooms - (Math.random() > 0.5 ? 1 : 0));
      const area = bedrooms * 400 + Math.floor(Math.random() * 300);

      // Select random images
      const propImages = [];
      const imageCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 images
      for (let j = 0; j < imageCount; j++) {
        const imgIndex = (i + j * 3) % images.length;
        propImages.push(images[imgIndex]);
      }

      // Select random amenities
      const propAmenities = [];
      const amenitiesCount = Math.floor(Math.random() * 6) + 4; // 4 to 9 amenities
      for (let j = 0; j < amenitiesCount; j++) {
        const amenity = amenitiesList[(i + j * 2) % amenitiesList.length];
        if (!propAmenities.includes(amenity)) {
          propAmenities.push(amenity);
        }
      }

      const titlePrefix = titles[i % titles.length];
      const property = await Property.create({
        title: `${titlePrefix} #${i}`,
        description: `This premium ${bedrooms} BHK ${type} is located in the heart of ${cityInfo.name}. It features modern amenities, beautiful views, and close proximity to public transportation, supermarkets, and local dining places. Ideal for families and working professionals seeking comfort and connectivity.`,
        rent,
        deposit,
        propertyType: type,
        bedrooms,
        bathrooms,
        area,
        address: `Flat No ${100 + i}, Tower B, Park View Residency, Sector ${12 + i}`,
        city: cityInfo.name,
        state: cityInfo.state,
        pincode: `5600${i < 10 ? '0' + i : i}`,
        amenities: propAmenities,
        images: propImages,
        locationCoordinates: {
          lat: cityInfo.lat + (Math.random() - 0.5) * 0.05,
          lng: cityInfo.lng + (Math.random() - 0.5) * 0.05,
        },
        ownerId: owner._id,
        status: i === 5 || i === 12 ? 'rented' : 'available',
      });
      properties.push(property);
    }

    console.log('Seeding Reviews...');
    const reviewTexts = [
      'Amazing property! The owner was very cooperative and the location is exceptionally good.',
      'Decent place for the rent. Wifi was slightly slow but overall good experience.',
      'Super clean and luxurious. True value for money. Loved the swimming pool and gym!',
      'Comfortable rooms and clean bathrooms. Friendly co-living mates.',
      'Very close to the tech park. Clean maintenance and great power backup.',
      'Nice independent house with a private garden. Perfect for pets.',
    ];

    for (let i = 0; i < properties.length; i++) {
      // 2 reviews per property
      const tenant1 = tenants[(i * 2) % tenants.length];
      const tenant2 = tenants[(i * 2 + 1) % tenants.length];

      await Review.create({
        propertyId: properties[i]._id,
        tenantId: tenant1._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 rating
        reviewText: reviewTexts[i % reviewTexts.length],
      });

      await Review.create({
        propertyId: properties[i]._id,
        tenantId: tenant2._id,
        rating: Math.floor(Math.random() * 3) + 3, // 3 to 5 rating
        reviewText: reviewTexts[(i + 3) % reviewTexts.length],
      });
    }

    console.log('Seeding Favorites wishlist...');
    for (let i = 0; i < tenants.length; i++) {
      // Each tenant favorites 3 random properties
      const tenant = tenants[i];
      const selectedProps = [];
      while (selectedProps.length < 3) {
        const randProp = properties[Math.floor(Math.random() * properties.length)];
        if (!selectedProps.includes(randProp._id.toString())) {
          selectedProps.push(randProp._id.toString());
          await Favorite.create({
            tenantId: tenant._id,
            propertyId: randProp._id,
          });
        }
      }
    }

    console.log('Seeding Booking inquiries...');
    for (let i = 0; i < 8; i++) {
      const tenant = tenants[i % tenants.length];
      const property = properties[(i * 3 + 2) % properties.length];
      if (property.status === 'available') {
        await Booking.create({
          tenantId: tenant._id,
          propertyId: property._id,
          status: i % 3 === 0 ? 'approved' : i % 3 === 1 ? 'rejected' : 'pending',
          message: `Hello, I am interested in viewing and renting this property. Please let me know when we can connect.`,
        });
      }
    }

    console.log('\n=======================================');
    console.log('Database Seeding Completed Successfully!');
    console.log(`Admin User: admin@rentalhouse.com (pass: password123)`);
    console.log(`Owners: owner1@rentalhouse.com to owner10@rentalhouse.com (pass: password123)`);
    console.log(`Tenants: tenant1@rentalhouse.com to tenant20@rentalhouse.com (pass: password123)`);
    console.log(`Seeded counts:`);
    console.log(`- Users: ${await User.countDocuments()}`);
    console.log(`- Properties: ${await Property.countDocuments()}`);
    console.log(`- Reviews: ${await Review.countDocuments()}`);
    console.log(`- Favorites: ${await Favorite.countDocuments()}`);
    console.log(`- Bookings: ${await Booking.countDocuments()}`);
    console.log('=======================================');

    mongoose.connection.close();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
