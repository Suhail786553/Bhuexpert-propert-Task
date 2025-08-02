import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  location: {
    city: String,
    state: String,
    pincode: String,
  },
  propertyType: String,
  bedrooms: Number,
  bathrooms: Number,
  area: Number,
  amenities: [String],
  images: [String],
  listedDate: { type: Date, default: Date.now },
  status: String,
  coordinates: {
    lat: Number,
    lng: Number,
  }
});

export default mongoose.model('Property', propertySchema);
