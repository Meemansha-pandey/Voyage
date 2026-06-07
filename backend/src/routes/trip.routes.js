const router = require('express').Router();
const { getTrips, getTrip, createTrip, updateTrip, deleteTrip, updateDay } = require('../controllers/trip.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes require auth — users can only access their own data
router.use(protect);

router.route('/').get(getTrips).post(createTrip);
router.route('/:id').get(getTrip).put(updateTrip).delete(deleteTrip);
router.patch('/:id/day', updateDay);

module.exports = router;