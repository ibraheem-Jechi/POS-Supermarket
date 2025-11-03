const express = require("express");
const { getMonthlyProfit } = require("../controllers/profitController");
const router = express.Router();

router.get("/monthly", getMonthlyProfit);

module.exports = router;
