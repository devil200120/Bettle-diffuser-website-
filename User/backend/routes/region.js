const express = require('express');
const router = express.Router();

// @route   GET /api/region/detect
// @desc    Auto-detect user's region based on IP
// @access  Public
router.get('/detect', async (req, res) => {
  try {
    // Get client IP - Render and other cloud providers use x-forwarded-for
    let clientIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.headers['cf-connecting-ip'] || // Cloudflare
                   req.ip ||
                   req.connection?.remoteAddress ||
                   req.socket?.remoteAddress;
    
    // If x-forwarded-for contains multiple IPs, get the first one (original client)
    if (clientIP && clientIP.includes(',')) {
      clientIP = clientIP.split(',')[0].trim();
    }
    
    // Remove IPv6 prefix if present
    if (clientIP && clientIP.startsWith('::ffff:')) {
      clientIP = clientIP.replace('::ffff:', '');
    }

    console.log('Region detection - Client IP:', clientIP);
    console.log('Region detection - Headers:', {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'cf-connecting-ip': req.headers['cf-connecting-ip']
    });
    
    // Only treat as localhost if actually on localhost (not cloud internal IPs)
    const isLocalhost = clientIP === '::1' || clientIP === '127.0.0.1';
    
    if (isLocalhost) {
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

    // Use free IP geolocation API for real IPs
    if (clientIP) {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,country,countryCode,currency,message`);
        const geoData = await geoResponse.json();
        
        console.log('Region detection - Geo API response:', geoData);
        
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
        } else {
          console.log('Geo API failed:', geoData.message);
        }
      } catch (geoError) {
        console.error('Geo IP lookup failed:', geoError.message);
      }
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

    // Default to INTERNATIONAL (not India) when detection fails on deployed server
    res.json({
      success: true,
      data: {
        region: 'INTL',
        country: 'International',
        currency: 'USD',
        currencySymbol: '$',
        isIndia: false,
        ip: clientIP,
        detectionMethod: 'default-international'
      }
    });

  } catch (error) {
    console.error('Region detection error:', error);
    // Default to INTERNATIONAL on error (safer for deployed apps)
    res.json({
      success: true,
      data: {
        region: 'INTL',
        country: 'International',
        currency: 'USD',
        currencySymbol: '$',
        isIndia: false,
        detectionMethod: 'error-fallback-international'
      }
    });
  }
});

module.exports = router;
