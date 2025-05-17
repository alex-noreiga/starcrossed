const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Profile management
router.put('/profile', communityController.updateProfileVisibility);
router.get('/profiles', communityController.getPublicProfiles);
router.get('/profile/:username', communityController.getPublicProfile);

// Chart sharing and visibility
router.put('/chart/:chartId/visibility', communityController.updateChartVisibility);
router.post('/chart/:chartId/share', communityController.generateSharingLink);

// Comments
router.post('/chart/:chartId/comments', communityController.addChartComment);
router.get('/chart/:chartId/comments', communityController.getChartComments);
router.delete('/chart/:chartId/comments/:commentId', communityController.deleteChartComment);

// Forum categories (if implemented)
router.get('/forum/categories', communityController.getForumCategories);

module.exports = router;
