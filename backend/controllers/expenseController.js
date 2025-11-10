// controllers/expenseController.js
const Expense = require('../models/expenseModel');

// ➕ Add a new expense
exports.addExpense = async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error('Error adding expense:', err);
    res.status(500).json({ message: 'Failed to add expense' });
  }
};

// 📋 Get all expenses (sorted newest first)
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
};

// 📊 Monthly summary (total amount per month)
exports.getMonthlySummary = async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);
    res.json(summary);
  } catch (err) {
    console.error('Error generating summary:', err);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
};
