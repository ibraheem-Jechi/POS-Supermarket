const Cart = require("../models/cart");
const Expense = require("../models/expenseModel");

// Helper: generate months for a given year
function getMonths(year) {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`);
}

// GET /api/profit/monthly?year=2025
exports.getMonthlyProfit = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
    const endOfYear = new Date(`${year + 1}-01-01T00:00:00Z`);

    // === SALES ===
    const sales = await Cart.aggregate([
      { $match: { createdAt: { $gte: startOfYear, $lt: endOfYear } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$total" }, // ✅ match your actual Cart field name
        },
      },
    ]);

    // === EXPENSES ===
    const expenses = await Expense.aggregate([
      { $match: { date: { $gte: startOfYear, $lt: endOfYear } } },
      {
        $group: {
          _id: { $month: "$date" },
          totalExpenses: { $sum: "$amount" }, // ✅ match your Expense model field
        },
      },
    ]);

    // === Merge data per month ===
    const result = getMonths(year).map((month, i) => {
      const sale = sales.find((s) => s._id === i + 1);
      const expense = expenses.find((e) => e._id === i + 1);
      const totalSales = sale ? sale.totalSales : 0;
      const totalExpenses = expense ? expense.totalExpenses : 0;
      const profit = totalSales - totalExpenses;

      return { month, totalSales, totalExpenses, profit };
    });

    res.json(result);
  } catch (err) {
    console.error("Error computing profit:", err);
    res.status(500).json({ message: "Failed to compute profit" });
  }
};
