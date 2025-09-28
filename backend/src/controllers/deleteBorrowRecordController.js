const BorrowRecord = require('../models/BorrowRecord');

// Delete borrow record by ID (admin only)
exports.deleteBorrowRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BorrowRecord.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }
    res.json({ success: true, message: 'Borrow record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete borrow record', error });
  }
};
