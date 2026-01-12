# Payment Setup Guide

## Environment Configuration

Create a `.env.local` file in the root directory with the following:

```env
# Stripe Configuration
# Get your keys from https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key

# API Configuration  
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## How to Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to Developers → API keys
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Replace the placeholder in your `.env.local` file

## Payment Flow

The booking confirmation page now supports:

1. **Card Input**: Properly styled Stripe PaymentElement for secure card entry
2. **Error Handling**: Better error messages and user feedback
3. **Fallback**: If payment intent is missing, generates payment link automatically
4. **Security**: All card data is handled by Stripe, never stored on your servers

## Testing

- Use Stripe test cards for testing: https://stripe.com/docs/testing#cards
- Card number: `4242 4242 4242 4242`
- Any future expiry date
- Any CVC
- Any ZIP code

## Troubleshooting

If payment doesn't work:

1. Check that backend server is running on port 5000
2. Verify Stripe keys are correctly set in `.env.local`
3. Check browser console for error messages
4. Ensure user is logged in before attempting payment
