const Razorpay = require('razorpay');
const Stripe = require('stripe');
const paypal = require('paypal-rest-sdk');
const crypto = require('crypto');

class PaymentService {
  constructor() {
    // Initialize Razorpay
    if (this.isRazorpayConfigured()) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    }

    // Initialize Stripe
    if (this.isStripeConfigured()) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }

    // Initialize PayPal
    if (this.isPaypalConfigured()) {
      paypal.configure({
        mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
        client_id: process.env.PAYPAL_CLIENT_ID,
        client_secret: process.env.PAYPAL_CLIENT_SECRET,
      });
    }
  }

  // Create Razorpay order
  async createOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paisa
        currency,
        receipt,
        notes,
      };

      const order = await this.razorpay.orders.create(options);
      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Verify payment signature
  verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
      const sign = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

      return expectedSign === razorpaySignature;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  // Fetch payment details
  async getPayment(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return {
        success: true,
        payment,
      };
    } catch (error) {
      console.error('Fetch payment error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Refund payment
  async refundPayment(paymentId, amount, notes = {}) {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount * 100,
        notes,
      });
      return {
        success: true,
        refund,
      };
    } catch (error) {
      console.error('Refund error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Check if Razorpay is configured
  isRazorpayConfigured() {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }

  // Check if Stripe is configured
  isStripeConfigured() {
    return !!process.env.STRIPE_SECRET_KEY;
  }

  // Check if PayPal is configured
  isPaypalConfigured() {
    return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  }

  // Legacy method for backward compatibility
  isConfigured() {
    return this.isRazorpayConfigured();
  }

  // Stripe payment methods
  async createStripePaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return {
        success: true,
        paymentIntent,
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async confirmStripePayment(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });
      return {
        success: true,
        paymentIntent,
      };
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async retrieveStripePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        success: true,
        paymentIntent,
      };
    } catch (error) {
      console.error('Stripe payment intent retrieval error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // PayPal payment methods
  async createPaypalPayment(amount, currency = 'USD', description = '', returnUrl, cancelUrl) {
    try {
      const create_payment_json = {
        intent: 'sale',
        payer: {
          payment_method: 'paypal',
        },
        redirect_urls: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
        transactions: [{
          item_list: {
            items: [{
              name: description || 'Fee Payment',
              sku: 'fee_payment',
              price: amount.toFixed(2),
              currency: currency.toUpperCase(),
              quantity: 1,
            }],
          },
          amount: {
            currency: currency.toUpperCase(),
            total: amount.toFixed(2),
          },
          description: description || 'Fee Payment',
        }],
      };

      return new Promise((resolve) => {
        paypal.payment.create(create_payment_json, (error, payment) => {
          if (error) {
            console.error('PayPal payment creation error:', error);
            resolve({
              success: false,
              error: error.response?.details || error.message,
            });
          } else {
            resolve({
              success: true,
              payment,
            });
          }
        });
      });
    } catch (error) {
      console.error('PayPal payment creation error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async executePaypalPayment(paymentId, payerId) {
    try {
      return new Promise((resolve) => {
        paypal.payment.execute(paymentId, { payer_id: payerId }, (error, payment) => {
          if (error) {
            console.error('PayPal payment execution error:', error);
            resolve({
              success: false,
              error: error.response?.details || error.message,
            });
          } else {
            resolve({
              success: true,
              payment,
            });
          }
        });
      });
    } catch (error) {
      console.error('PayPal payment execution error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Unified payment creation method
  async createPaymentOrder(gateway, amount, currency = 'INR', description = '', metadata = {}) {
    switch (gateway) {
      case 'razorpay':
        if (!this.isRazorpayConfigured()) {
          return { success: false, error: 'Razorpay not configured' };
        }
        return this.createOrder(amount, currency, `PAY-${Date.now()}`, metadata);

      case 'stripe':
        if (!this.isStripeConfigured()) {
          return { success: false, error: 'Stripe not configured' };
        }
        return this.createStripePaymentIntent(amount, currency, metadata);

      case 'paypal':
        if (!this.isPaypalConfigured()) {
          return { success: false, error: 'PayPal not configured' };
        }
        // PayPal requires return/cancel URLs which should be provided in metadata
        return this.createPaypalPayment(amount, currency, description, metadata.returnUrl, metadata.cancelUrl);

      default:
        return { success: false, error: 'Unsupported payment gateway' };
    }
  }

  // Unified payment verification method
  async verifyPayment(gateway, paymentData) {
    switch (gateway) {
      case 'razorpay':
        if (!this.isRazorpayConfigured()) {
          return { success: false, error: 'Razorpay not configured' };
        }
        return {
          success: this.verifyPayment(
            paymentData.orderId,
            paymentData.paymentId,
            paymentData.signature
          ),
        };

      case 'stripe':
        if (!this.isStripeConfigured()) {
          return { success: false, error: 'Stripe not configured' };
        }
        return this.retrieveStripePaymentIntent(paymentData.paymentIntentId);

      case 'paypal':
        if (!this.isPaypalConfigured()) {
          return { success: false, error: 'PayPal not configured' };
        }
        return this.executePaypalPayment(paymentData.paymentId, paymentData.payerId);

      default:
        return { success: false, error: 'Unsupported payment gateway' };
    }
  }
}

module.exports = new PaymentService();