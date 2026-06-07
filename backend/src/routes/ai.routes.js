const router = require('express').Router();
const { generateItinerary, regenerateDay, generatePackingList, getSmartRecommendations } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/generate', generateItinerary);
router.post('/regen-day', regenerateDay);
router.post('/packing-list', generatePackingList);
router.post('/recommendations', getSmartRecommendations);

module.exports = router;