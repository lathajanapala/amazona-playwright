


export const testData = {
  validUser: {
    email: process.env.USER_EMAIL || 'test@example.com',
    password: process.env.USER_PASSWORD || 'Password123'
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'WrongPassword!'
  },
  products: {
    searchTerm: 'Laptop',
    search: {
      validTerm: 'Laptop',
      invalidTerm: 'asdfghjklqwerty', // gibberish/non-existing
      blankTerm: ''
    },
    categories: ['Electronics', 'Books', 'Fashion'],
    filters: {
      price: { min: 100, max: 1000 },
      brand: 'Dell',
      rating: 4
    },
    sortOptions: {
      priceLowToHigh: 'Price: Low to High',
      priceHighToLow: 'Price: High to Low',
      newestArrivals: 'Newest Arrivals',
      rating: 'Avg. Customer Review'
    },
    details: {
      sampleId: 'prod-001',
      galleryThumbnails: 3,
      expected: {
        shows: ['title', 'images', 'description', 'price', 'availability', 'ratings', 'addToCart']
      }
    },
    stock: {
      inStockId: 'prod-instock-001',
      outOfStockId: 'prod-outofstock-001'
    },
    reviews: {
      minCount: 1
    }
  },
  pages: {
    home: '/',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    searchResults: '/search',
    categoryBase: '/category', // tests can compose /category/:name
    productDetailBase: '/product', // compose /product/:id or /product/:slug
    cart: '/cart',
    checkout: '/checkout',
    profile: '/profile',
    orders: '/orders',
    orderDetailBase: '/orders' // compose /orders/:id
  },
  messages: {
    invalidLogin: 'Invalid username or password',
    requiredField: 'This field is required',
    resetEmailSent: 'Email with reset link is sent',
    welcome: 'Welcome',
    noProductsFound: 'No products found',
    enterKeyword: 'Please enter a search keyword',
    outOfStock: 'Out of stock',
    addToCartDisabled: 'Add to Cart disabled',
    itemRemoved: 'Item removed from cart',
    cartEmpty: 'Your cart is empty',
    checkoutDisabled: 'Checkout disabled for empty cart',
    orderPlaced: 'Order placed successfully',
    invalidCard: 'Invalid card / transaction failed',
    promoApplied: 'Discount applied',
    invalidPromo: 'Invalid promo code',
    validationErrors: 'Please fix validation errors'
  },
  cart: {
    defaultItem: { id: 'prod-001', qty: 1 },
    increaseStep: 1,
    decreaseStep: 1,
    persistBetweenSessions: true
  },
  checkout: {
    address: {
      valid: {
        fullName: 'Test User',
        address: '123 Test St',
        city: 'Testville',
        postalCode: '12345',
        country: 'USA',
        phone: '+1-555-0100'
      },
      missingRequired: {
        fullName: '',
        address: '',
        city: 'Testville',
        postalCode: '',
        country: 'USA',
        phone: ''
      }
    },
    deliveryOption: 'Standard',
    payment: {
      validCard: {
        cardNumber: '4111111111111111',
        expiry: '12/30',
        cvv: '123',
        name: 'TEST USER'
      },
      invalidCard: {
        cardNumber: '4000000000000002',
        expiry: '01/20',
        cvv: '000',
        name: 'TEST USER'
      }
    },
    promoCodes: {
      valid: 'SAVE10',
      invalid: 'INVALIDCODE'
    },
    taxRate: 0.1
  },
  orders: {
    existingOrderId: 'order-1001',
    withDetails: true
  },
  profile: {
    edits: {
      name: 'Updated User',
      address: '456 Updated Ave',
      phone: '+1-555-0111'
    },
    passwordChange: {
      current: process.env.USER_PASSWORD || 'Password123',
      next: 'NewPassword#123'
    }
  },
  ui: {
    viewports: {
      mobile: { width: 375, height: 812 },
      desktop: { width: 1440, height: 900 }
    }
  },
  perf: {
    pageLoadThresholdMs: 3000
  },
  security: {
    payloads: {
      xss: '<script>alert(1)</script>',
      sql: "' OR 1=1; --"
    }
  },
  accessibility: {
    requireAltText: true,
    keyboardNavigation: true,
    rolesToCheck: ['button', 'link', 'textbox', 'combobox', 'img']
  }
};

export const api = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  endpoints: {
    products: '/api/products',
    users: '/api/users',
    signup: '/api/users/signup',
    login: '/api/users/login',
    logout: '/api/users/logout',
    forgotPassword: '/api/users/forgot-password',
    search: '/api/products/search',
    categories: '/api/categories',
    cart: '/api/cart',
    orders: '/api/orders',
    checkout: '/api/checkout',
    payments: '/api/payments',
    promos: '/api/promos',
    reviews: '/api/reviews'
  }
};
