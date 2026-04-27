import Stripe from 'stripe';
import prisma from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─── Create Payment Intent ────────────────────────────
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'usd' } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // stripe uses cents
    currency,
    metadata: { userId: req.user.id }
  });

  res.json({
    success: true,
    clientSecret: paymentIntent.client_secret
  });
});

// ─── Confirm Payment ──────────────────────────────────
export const confirmPayment = asyncHandler(async (req, res) => {
  const { stripeId, amount, currency } = req.body;

  const payment = await prisma.payment.create({
    data: {
      userId: req.user.id,
      amount,
      currency,
      status: 'succeeded',
      stripeId
    }
  });

  res.json({ success: true, payment });
});