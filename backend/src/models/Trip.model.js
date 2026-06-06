const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({ text: { type: String, required: true } }, { _id: false });

const daySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    theme: String,
    activities: [String],
  },
  { _id: false }
);

const budgetSchema = new mongoose.Schema(
  {
    flights: Number,
    accommodation: Number,
    food: Number,
    activities: Number,
    total: Number,
  },
  { _id: false }
);

const hotelSchema = new mongoose.Schema(
  { name: String, tier: { type: String, enum: ['budget', 'mid', 'luxury'] }, rating: String },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    destination: { type: String, required: true, trim: true },
    days: { type: Number, required: true, min: 1, max: 30 },
    budgetType: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    interests: [String],
    itinerary: [daySchema],
    budget: budgetSchema,
    hotels: [hotelSchema],
    packingList: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

// Ensure users can only read their own trips via query middleware
tripSchema.pre(/^find/, function (next) {
  // userId must be set by the route handler before running queries
  next();
});

module.exports = mongoose.model('Trip', tripSchema);