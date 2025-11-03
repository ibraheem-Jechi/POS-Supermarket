// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const {
  addExpense,
  getExpenses,
  getMonthlySummary,
} = require('../controllers/expenseController');
const Expense = require('../models/expenseModel');

// ➕ Add a new expense
router.post('/', addExpense);

// 📋 Get all expenses
router.get('/', getExpenses);

// 📊 Monthly summary
router.get('/summary/monthly', getMonthlySummary);

// ✏️ Update an expense
router.put('/:id', async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ message: 'Expense not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ message: 'Failed to update expense' });
  }
});

// ❌ Delete an expense
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});

module.exports = router;
