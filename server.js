
require('dotenv').config();
const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Stripe backend is running');
});

app.post('/create-checkout-session', async (req, res) => {
  const { skin } = req.body;

  const prices = {
    red: 299,
    blue: 299,
    yellow: 299,
  };

  if (!prices[skin]) {
    return res.status(400).json({ error: 'Invalid skin selected' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `${skin.charAt(0).toUpperCase() + skin.slice(1)} Skin Pack`,
            description: `Unlock the ${skin} bird skin and effects.`,
          },
          unit_amount: prices[skin],
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://yourgameurl.com/success?skin=' + skin,
      cancel_url: 'https://yourgameurl.com/cancel',
    });

    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
