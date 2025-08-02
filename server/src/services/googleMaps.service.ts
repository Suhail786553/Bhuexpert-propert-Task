import axios from "axios";

export class GoogleMapsService {
  constructor(private apiKey: string) {}

  async searchNearbyPlaces(location: { lat: number; lng: number }, type: string, radius: number) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
    const res = await axios.get(url, {
      params: {
        location: `${location.lat},${location.lng}`,
        radius,
        type,
        key: this.apiKey,
      },
    });
    return res.data.results;
  }
}
