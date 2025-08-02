import { Request, Response } from 'express';
import Property from '../models/property';
import { GoogleMapsService } from "../services/googleMaps.service";

const maps = new GoogleMapsService(process.env.GOOGLE_MAPS_API_KEY!);

export const searchProperties = async (req: Request, res: Response) => {
  try {
    const {
      city, minPrice, maxPrice, propertyType,
      minBedrooms, sortBy = 'price', page = 1, limit = 10
    } = req.query;

    const query: any = {};
    if (city) query['location.city'] = city;
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
    if (propertyType) query.propertyType = propertyType;
    if (minBedrooms) query.bedrooms = { $gte: Number(minBedrooms) };

    const skip = (Number(page) - 1) * Number(limit);

    const properties = await Property.find(query)
      .sort(sortBy === 'date' ? { listedDate: -1 } : { price: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Property.countDocuments(query);

    res.json({ properties, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching properties' });
  }
};

export const getNearbyAmenities = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { types = "school,restaurant", radius = 2000 } = req.query;

    const property = await Property.findById(id);
    if (!property || !property.coordinates) {
      return res.status(404).json({ message: "Property not found or missing coordinates" });
    }
    const coords = property?.coordinates;

    if (!coords || coords.lat == null || coords.lng == null) {
      return res.status(404).json({ message: "Missing coordinates" });
    }


    const typesArray = (types as string).split(",");
    const results: Record<string, any[]> = {};

    for (const type of typesArray) {
      const places = await maps.searchNearbyPlaces(
        { lat: coords.lat, lng: coords.lng },
        type,
        +radius
      );

      results[type] = places;
    }

    res.json({
      property: {
        id: property._id,
        title: property.title,
        coordinates: property.coordinates,
      },
      amenities: results,
      radius,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch nearby amenities" });
  }
};