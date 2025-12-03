const express = require('express');
const https = require('https');

const router = express.Router();

// @route   GET /api/address/autocomplete
// @desc    Get address suggestions from Google Places API
// @access  Public
router.get('/autocomplete', async (req, res) => {
  try {
    const { input } = req.query;
    
    if (!input || input.length < 3) {
      return res.json({ predictions: [] });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:in&key=${apiKey}`;

    const data = await fetchFromGoogle(url);
    
    res.json({
      predictions: data.predictions.map(p => ({
        placeId: p.place_id,
        description: p.description,
        mainText: p.structured_formatting?.main_text,
        secondaryText: p.structured_formatting?.secondary_text
      }))
    });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ message: 'Failed to fetch address suggestions' });
  }
});

// @route   GET /api/address/details/:placeId
// @desc    Get detailed address from Place ID
// @access  Public
router.get('/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry,address_components&key=${apiKey}`;

    const data = await fetchFromGoogle(url);
    
    if (data.status !== 'OK') {
      return res.status(400).json({ message: 'Invalid place ID' });
    }

    const result = data.result;
    const addressComponents = result.address_components || [];
    
    // Parse address components
    const getComponent = (types) => {
      const component = addressComponents.find(c => 
        types.some(t => c.types.includes(t))
      );
      return component?.long_name || '';
    };

    const address = {
      formattedAddress: result.formatted_address,
      street: `${getComponent(['street_number'])} ${getComponent(['route'])}`.trim() || 
              getComponent(['sublocality_level_1', 'sublocality']),
      city: getComponent(['locality', 'administrative_area_level_2']),
      state: getComponent(['administrative_area_level_1']),
      zipCode: getComponent(['postal_code']),
      country: getComponent(['country']),
      placeId: placeId,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      }
    };

    res.json(address);
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ message: 'Failed to fetch address details' });
  }
});

// @route   POST /api/address/geocode
// @desc    Geocode an address string to get coordinates
// @access  Public
router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const data = await fetchFromGoogle(url);
    
    if (data.status !== 'OK' || !data.results.length) {
      return res.status(400).json({ message: 'Could not geocode address' });
    }

    const result = data.results[0];
    const addressComponents = result.address_components || [];
    
    const getComponent = (types) => {
      const component = addressComponents.find(c => 
        types.some(t => c.types.includes(t))
      );
      return component?.long_name || '';
    };

    res.json({
      formattedAddress: result.formatted_address,
      street: `${getComponent(['street_number'])} ${getComponent(['route'])}`.trim() || 
              getComponent(['sublocality_level_1', 'sublocality']),
      city: getComponent(['locality', 'administrative_area_level_2']),
      state: getComponent(['administrative_area_level_1']),
      zipCode: getComponent(['postal_code']),
      country: getComponent(['country']),
      placeId: result.place_id,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng
      }
    });
  } catch (error) {
    console.error('Geocode error:', error);
    res.status(500).json({ message: 'Failed to geocode address' });
  }
});

// @route   POST /api/address/reverse-geocode
// @desc    Get address from coordinates (lat/lng)
// @access  Public
router.post('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    const data = await fetchFromGoogle(url);
    
    if (data.status !== 'OK' || !data.results.length) {
      return res.status(400).json({ message: 'Could not find address for coordinates' });
    }

    const result = data.results[0];
    const addressComponents = result.address_components || [];
    
    const getComponent = (types) => {
      const component = addressComponents.find(c => 
        types.some(t => c.types.includes(t))
      );
      return component?.long_name || '';
    };

    res.json({
      formattedAddress: result.formatted_address,
      street: `${getComponent(['street_number'])} ${getComponent(['route'])}`.trim() || 
              getComponent(['sublocality_level_1', 'sublocality']),
      city: getComponent(['locality', 'administrative_area_level_2']),
      state: getComponent(['administrative_area_level_1']),
      zipCode: getComponent(['postal_code']),
      country: getComponent(['country']),
      placeId: result.place_id,
      coordinates: { lat, lng }
    });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    res.status(500).json({ message: 'Failed to reverse geocode' });
  }
});

// Helper function to fetch from Google API
function fetchFromGoogle(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

module.exports = router;
