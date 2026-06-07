const Trip = require('../models/Trip.model');

// All queries are scoped to req.user._id — strict data isolation
exports.getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort('-createdAt').select('-itinerary -budget -hotels -packingList');
    res.json({ trips });
  } catch (err) { next(err); }
};

exports.getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ trip });
  } catch (err) { next(err); }
};

exports.createTrip = async (req, res, next) => {
  try {
    const { destination, days, budgetType, interests, itinerary, budget, hotels } = req.body;
    const trip = await Trip.create({
      user: req.user._id,
      destination, days, budgetType, interests, itinerary, budget, hotels,
    });
    res.status(201).json({ trip });
  } catch (err) { next(err); }
};

exports.updateTrip = async (req, res, next) => {
  try {
    // findOneAndUpdate with user filter ensures ownership
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ trip });
  } catch (err) { next(err); }
};

exports.deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
  } catch (err) { next(err); }
};

exports.updateDay = async (req, res, next) => {
  try {
    const { dayIndex, activities } = req.body;
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (dayIndex < 0 || dayIndex >= trip.itinerary.length) {
      return res.status(400).json({ message: 'Invalid day index' });
    }
    trip.itinerary[dayIndex].activities = activities;
    await trip.save();
    res.json({ trip });
  } catch (err) { next(err); }
};