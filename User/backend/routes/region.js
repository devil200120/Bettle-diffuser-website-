const express = require('express');
const router = express.Router();

// List of Indian IP ranges (simplified - in production use a proper geo-IP database)
const INDIA_COUNTRY_CODES = ['IN'];

// @route   GET /api/region/detect
// @desc    Auto-detect user's region based on IP
// @access  Public
router.get('/detect', async (req, res) => {
  try {
    // Get client IP
    let clientIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.connection.remoteAddress ||
                   req.socket.remoteAddress ||
                   req.ip;
    
    // Clean up IP (handle IPv6 localhost)
    if (clientIP === '::1' || clientIP === '127.0.0.1' || clientIP.includes('192.168.') || clientIP.includes('10.')) {
      // Local development - default to India
      return res.json({
        success: true,
        data: {
          region: 'IN',
          country: 'India',
          currency: 'INR',
          currencySymbol: '₹',
          isIndia: true,
          ip: clientIP,
          detectionMethod: 'localhost-default'
        }
      });
    }

    // If x-forwarded-for contains multiple IPs, get the first one (original client)
    if (clientIP && clientIP.includes(',')) {
      clientIP = clientIP.split(',')[0].trim();
    }

    // Use free IP geolocation API
    try {
      const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,country,countryCode,currency`);
      const geoData = await geoResponse.json();
      
      if (geoData.status === 'success') {
        const isIndia = geoData.countryCode === 'IN';
        
        return res.json({
          success: true,
          data: {
            region: geoData.countryCode,
            country: geoData.country,
            currency: isIndia ? 'INR' : 'USD',
            currencySymbol: isIndia ? '₹' : '$',
            isIndia: isIndia,
            ip: clientIP,
            detectionMethod: 'geo-ip'
          }
        });
      }
    } catch (geoError) {
      console.error('Geo IP lookup failed:', geoError);
    }

    // Fallback: Check Accept-Language header for Indian languages
    const acceptLanguage = req.headers['accept-language'] || '';
    const indianLanguages = ['hi', 'ta', 'te', 'mr', 'bn', 'gu', 'kn', 'ml', 'pa', 'or'];
    const isIndianLanguage = indianLanguages.some(lang => acceptLanguage.toLowerCase().includes(lang));
    
    if (isIndianLanguage) {
      return res.json({
        success: true,
        data: {
          region: 'IN',
          country: 'India',
          currency: 'INR',
          currencySymbol: '₹',
          isIndia: true,
          ip: clientIP,
          detectionMethod: 'language-header'
        }
      });
    }

    // Default to international
    res.json({
      success: true,
      data: {
        region: 'INTL',
        country: 'International',
        currency: 'USD',
        currencySymbol: '$',
        isIndia: false,
        ip: clientIP,
        detectionMethod: 'default'
      }
    });

  } catch (error) {
    console.error('Region detection error:', error);
    // Default to India on error
    res.json({
      success: true,
      data: {
        region: 'IN',
        country: 'India',
        currency: 'INR',
        currencySymbol: '₹',
        isIndia: true,
        detectionMethod: 'error-fallback'
      }
    });
  }
});

module.exports = router;
