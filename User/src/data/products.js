// Product Data
// Order: 1. Beetle Diffuser Pro, 2. Beetle Diffuser Lite, 3. TWIN FLASH
export const products = [
  {
    id: 1,
    name: "Beetle Diffuser Pro",
    description:
      "We will send you the diffuser that matches your equipment. Completely customized design for your equipment.",
    icon: "Pro Grey Background.jpg",
    price: 5500,
    internationalPrice: {
      qty1: 120,
      qty2: 220,
      qty3: 310,
      qty4: 400,
      qty5: 480,
      single: 120,
      double: 220
    },
    rating: 5,
    features: [
      "Light Diffusion",
      "Professional Quality",
      "Easy Setup",
      "Durable Design",
    ],
    specifications: [
      "Available in 3 sizes: Large, Medium, Mini",
      "Compatible with most camera setups",
      "Precision-engineered diffusion",
      "Lightweight aluminum construction",
      "Includes carrying case",
      "Made in USA",
    ],
    compatibility: [
      "Canon EOS Series",
      "Nikon D Series",
      "Sony Alpha",
      "Other DSLR systems",
    ],
    sizes: ["46mm", "58mm", "62mm", "67mm", "Filter thread size not listed"],
    footer: "Inclusive of Shipping charges",
    loader: [
      "All the Prices are inclusive of Fedex Priority/Express shipping",
      "You can always write to us if you have any doubts regarding your gear to info@beetlediffuser.com.",
      "Maximum quantity in one order is 5 nos",
      "For Bulk order write to info@beetlediffuser.com",
    ],
    info: [
      "Though most flash models are supported, a few small flashes—such as the Meike MK-320 and Olympus FL-LM3—are not compatible.",
      "Lenses below Physical length of 2.5 inches (6.3 cm)  are not supported",
      "Most macro lenses use the thread sizes listed in the dropdown, and a matching ring is included. If your lens size isn't listed, select “Filter thread size not listed” — you can still use the diffuser by tightening the cord panel around the lens."
    ],
  },
  {
    id: 2,
    name: "Beetle Diffuser Lite",
    subtitle: "",
    description:
      "Diffuser ring design comes with two variants LED and Non-LED.",
    icon: "Lite grey background.jpg",
    price: 3250,
    internationalPrice: {
      qty1: 110,
      qty2: 200,
      qty3: 280,
      qty4: 360,
      qty5: 430,
      single: 110,
      double: 200
    },
    rating: 5,
    features: [
      "Light Diffusion",
      "Professional Quality",
      "Easy Setup",
      "Durable Design",
    ],
    variant: ["Non-LED", "LED"],
    // Variant-specific pricing
    variantPricing: {
      "LED": {
        price: 3250,
        internationalPrice: { qty1: 110, qty2: 200, qty3: 280, qty4: 360, qty5: 430, single: 110, double: 200 }
      },
      "Non-LED": {
        price: 2500,
        internationalPrice: { qty1: 100, qty2: 180, qty3: 250, qty4: 320, qty5: 380, single: 100, double: 180 }
      }
    },
    specifications: [
      "Designed specifically for Canon MP-E 65mm lens",
      "Optimal 1:1 macro magnification",
      "Minimizes lens creep",
      "Reduces color cast",
      "Quick release mount",
      "Sealed optical elements",
    ],
    compatibility: ["Canon MP-E 65mm (ONLY)"],
    sizes: ["46mm", "58mm", "62mm", "67mm", "Filter thread size not listed"],
    footer: "Inclusive of Shipping charges",
    loader: [
      "All the Prices are inclusive of Fedex Priority/Express shipping",
      "You can always write to us if you have any doubts regarding your gear to info@beetlediffuser.com.",
      "Maximum quantity in one order is 5 nos",
      "For Bulk order write to info@beetlediffuser.com",
    ],
  },
  {
    id: 3,
    name: "TWIN FLASH",
    subtitle: "",
    description:
      "Advanced dual-flash diffusion system for professional macro photography",
    icon: "Twin Grrey Background.jpg",
    price: 3250,
    internationalPrice: {
      qty1: 110,
      qty2: 200,
      qty3: 280,
      qty4: 360,
      qty5: 430,
      single: 110,
      double: 200
    },
    rating: 5,
    features: [
      "Light Diffusion",
      "Professional Quality",
      "Easy Setup",
      "Durable Design",
    ],
    specifications: [
      "Exclusive collaboration with renowned macro photographer Ben Salb",
      "Optimized for Zuiko 90mm lens",
      "Premium optical coating",
      "Precision-engineered diffusion pattern",
      "Includes Ben Salb guide",
      "Limited production series",
    ],
    compatibility: ["Zuiko 90mm Pro lens"],
    sizes: ["46mm", "58mm", "62mm", "67mm", "Filter thread size not listed"],
    footer: "Inclusive of Shipping charges",
    loader: [
      "All the Prices are inclusive of Fedex Priority/Express shipping",
      "You can always write to us if you have any doubts regarding your gear to info@beetlediffuser.com.",
      "Maximum quantity in one order is 5 nos",
      "For Bulk order write to info@beetlediffuser.com",
    ],
  },
];

// Carousel slides data
export const carouselSlides = [
  {
    image: "/images/Pro Grey Background.jpg",
    title: "Perfect Diffusion",
    subtitle: "Unlock new levels of macro Photography.",
  },
  {
    image: "/images/Lite grey background.jpg",
    title: "Lightest Diffuser",
    subtitle: "Lightweight and durable material.",
  },
  {
    image: "/images/Twin Grrey Background.jpg",
    title: "Twin Diffusers",
    subtitle: "Creative Lighting",
  },
];

// FAQ data
export const faqData = [
  {
    title: "Models & Features",
    items: [
      {
        question: "What's the difference between Pro & Lite models?",
        answer: `The Pro can vary the lighting angle precisely, comes with a unique latch strap mechanism to do the same, and has a more powerful LED for faster focus assistance and for shooting macro videos with diffused light.

The Lite diffuser is simple and can be set up real quick. Diffusion is as good as the pro. You can also vary the angle of lighting by adjusting the cord panel. The Lite diffuser can utilise the built-in LED for focus assist, like the Godox 860 version 3, Godox V480, Godox V1 series and any speedlights which come with a built-in LED.

There is an option to buy with mini LED for focus assist.`,
      },
      {
        question: "What is the size of the diffuser?",
        answer: "We collect your gear details during checkout to ensure we send the correct diffuser that fits your camera perfectly and is ideal for macro photography.",
      },
      {
        question: "Is Beetle Diffuser easy to set up and fold completely flat?",
        answer: "Yes, all our flash diffusers have been designed to be quick to set up and fold completely flat for easy storage. Each diffuser there is assembly video which you could refer to when you first receive the diffuser.",
      },
      {
        question: "What's the purpose of the LED light?",
        answer: "The LED light helps for focusing in low-light conditions.",
      },
    ],
  },
  {
    title: "Compatibility & Gear",
    items: [
      {
        question: "What gear is compatible with the Beetle Diffuser?",
        answer: `Lenses:
Lenses shorter than 70 mm or longer than 170 mm in physical length (not focal length) are not compatible. Please make sure to enter your exact lens model during checkout.

Flashes:
Only hot-shoe mount flashes are compatible. Most standard flashes such as the Godox 860, Nikon SB-5000, Canon 600EX-RT, similarly sized models, round-head flashes like the Godox V1, and compact models like the Godox TT/V350 are supported.

Please make sure to enter the exact flash model during checkout.

We do not support certain flashes, including the Godox SU-1, Godox GN12, Olympus FL-LM3, Leica SF 60, and Nissin i60A.`,
      },
    ],
  },
  {
    title: "Pricing & Discounts",
    items: [
      {
        question: "Is there a discount when I buy two diffusers?",
        answer: `For international customers you can purchase up to two diffusers to be shipped to the same address and receive a discount automatically when added to your cart. The discounted rate will be reflected in the total.

For bulk orders, please contact info@beetlediffuser.com.`,
      },
    ],
  },
  {
    title: "Power Bank & LED",
    items: [
      {
        question: "Is powerbank available in the package?",
        answer: "Due to shipping regulations, power banks are not available for international customers. However, a Velcro sticker is provided for use with a power bank when using the diffuser.",
      },
      {
        question: "What Powerbank do you recommend?",
        answer: "Recommended power is 5000mah as it's the right size. They are cheap and you can find them online.",
      },
      {
        question: "What is a power bank, and do I need one?",
        answer: `A power bank functions as a portable charger for the diffuser's LED light. If you don't plan to use the diffuser in low-light conditions, a power bank isn't needed.

For the Pro Model make sure to use a minimum of 5000mah 2.4A power bank.
For the Beetle Lite model any lightweight power bank with specs of 2.4A output will work.`,
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        question: "Do you ship worldwide and what shipping methods do you use?",
        answer: "Yes, we ship worldwide. For all international orders, we use FedEx Priority Shipping — the safest and fastest service offered by FedEx.",
      },
      {
        question: "What is the shipping time?",
        answer: `Once your order is confirmed, it will be shipped within 4 days. The estimated shipping times are listed below.

• Domestic (India): Week to 10 days time.
• International: FedEx priority shipping takes about 10 business days.`,
      },
      {
        question: "When will my order ship?",
        answer: "Once order is confirmed, it will ship within 3 to 4 days time.",
      },
      {
        question: "Will my order come with a tracking number?",
        answer: "Yes, every order includes a tracking number.",
      },
      {
        question: "What is not included with my purchase?",
        answer: "Customs fees may apply depending on the destination country.",
      },
    ],
  },
  {
    title: "Refund Policy",
    items: [
      {
        question: "What is your refund policy?",
        answer: "Due to the customized nature of our products, we're unable to accept returns or issue refunds.",
      },
    ],
  },
];

// Initial testimonials
export const initialReviews = [
  {
    id: 1,
    title: "Great Diffuser",
    date: "Tuesday, November 18, 2025",
    rating: 5,
    body: "The **AK Diffuser** truly changed the way I approach macro photography. Before, lighting felt inconsistent and sometimes distracting, but with this diffuser everything became smoother, more natural, and beautifully balanced.",
    author: "Jose Vega",
  },
  {
    id: 2,
    title: "World record holder",
    date: "Thursday, October 16, 2025",
    rating: 5,
    body: 'The terms "trustworthy" and "customer-oriented" must have been invented especially for these AK guys. Less than 48 hours (!!!) between ordering (in Florida/USA!) and delivery.',
    author: "Example User",
  },
];
