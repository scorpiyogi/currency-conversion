import { Router } from "express";
import { get } from "axios";
require("dotenv").config();

const router = Router();
const EXCHANGE_RATE_API_URL = "https://v6.exchangerate-api.com/v6/latest/USD"

const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

router.get("/convert", async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    const response = await get(
      `${EXCHANGE_RATE_API_URL}${API_KEY}/latest/${from}`
    );
    const data = response.data;

    if (!data.conversion_rates || !data.conversion_rates[to]) {
      return res.status(400).json({ error: "Invalid target currency." });
    }

    const exchangeRate = data.conversion_rates[to];
    const convertedAmount = amount * exchangeRate;

    res.json({
      base_currency: from,
      target_currency: to,
      amount: parseFloat(amount),
      converted_amount: convertedAmount,
      exchange_rate: exchangeRate,
    });
  } catch (error) {
    console.error("Error fetching exchange rate:", error.message);
    res.status(500).json({ error: "Failed to fetch exchange rates." });
  }
});

export default router;