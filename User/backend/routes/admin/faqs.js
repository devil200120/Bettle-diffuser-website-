const express = require('express');
const router = express.Router();
const FAQ = require('../../models/FAQ');

// @route   GET /api/admin/faqs
// @desc    Get all FAQs
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { category, isActive } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const faqs = await FAQ.find(filter)
      .sort({ sortOrder: 1, createdAt: -1 })
      .select('-__v');

    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/faqs/:id
// @desc    Get single FAQ
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    res.json({ success: true, data: faq });
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/faqs
// @desc    Create new FAQ
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const { question, answer, category, sortOrder, isActive } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ message: 'Question and answer are required' });
    }

    const faq = new FAQ({
      question: question.trim(),
      answer: answer.trim(),
      category: category || 'General',
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await faq.save();

    res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq
    });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/faqs/:id
// @desc    Update FAQ
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const { question, answer, category, sortOrder, isActive } = req.body;

    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    if (question) faq.question = question.trim();
    if (answer) faq.answer = answer.trim();
    if (category) faq.category = category.trim();
    if (sortOrder !== undefined) faq.sortOrder = sortOrder;
    if (isActive !== undefined) faq.isActive = isActive;

    await faq.save();

    res.json({
      success: true,
      message: 'FAQ updated successfully',
      data: faq
    });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/faqs/:id
// @desc    Delete FAQ
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      return res.status(404).json({ message: 'FAQ not found' });
    }

    await FAQ.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'FAQ deleted successfully'
    });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/faqs/categories/list
// @desc    Get unique categories
// @access  Private/Admin
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await FAQ.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
