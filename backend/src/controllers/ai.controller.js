const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const generateJSON = async (prompt) => {
  const result = await model.generateContent(prompt);
  let text = result.response.text();

  // Strip markdown fences
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

  // Replace curly/smart quotes with straight quotes
  text = text.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");

  // Extract the first JSON object or array
  const objMatch = text.match(/\{[\s\S]*\}/);
  const arrMatch = text.match(/\[[\s\S]*\]/);

  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
  }
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch {}
  }

  // Last resort — try parsing the whole thing
  return JSON.parse(text);
};

exports.generateItinerary = async (req, res, next) => {
  try {
    const { origin, destination, days, budgetType, interests } = req.body;
    if (!destination || !days) {
      return res.status(400).json({ message: 'destination and days are required' });
    }

    const routeContext = origin
      ? `Flying from ${origin} to ${destination}. Day 1 should be a light arrival day.`
      : `Destination: ${destination}.`;

    const prompt = `You are a JSON API. Return ONLY a valid JSON object, nothing else.
No markdown, no backticks, no explanation, no comments.
The response must start with { and end with }.

Schema:
{
  "itinerary": [
    {"day": 1, "theme": "Arrival & Explore", "activities": ["activity one", "activity two", "activity three"]}
  ],
  "budget": {"flights": 500, "accommodation": 300, "food": 150, "activities": 100, "total": 1050},
  "hotels": [
    {"name": "Hotel Name", "tier": "budget", "rating": "3.8★"},
    {"name": "Hotel Name", "tier": "mid", "rating": "4.2★"},
    {"name": "Hotel Name", "tier": "luxury", "rating": "4.8★"}
  ]
}

Trip details:
- Route: ${routeContext}
- Days: ${days}
- Budget: ${budgetType}
- Interests: ${(interests || []).join(', ') || 'general sightseeing'}

Rules:
- Exactly ${days} day objects in itinerary array
- Exactly 3 hotels (one budget, one mid, one luxury)
- All costs are integers in USD
- No trailing commas
- Use only standard double quotes`;

    const data = await generateJSON(prompt);
    res.json(data);
  } catch (err) {
    console.log('AI Error:', err.message);
    next(err);
  }
};

exports.regenerateDay = async (req, res, next) => {
  try {
    const { destination, dayNumber, budgetType, interests } = req.body;

    const prompt = `You are a JSON API. Return ONLY a valid JSON array of exactly 3 strings.
No markdown, no backticks, no explanation.
Start with [ and end with ].

Example: ["Visit the local market", "Lunch at a rooftop restaurant", "Evening walk by the river"]

Generate 3 fresh activity ideas for Day ${dayNumber} in ${destination}.
Budget: ${budgetType}. Interests: ${(interests || []).join(', ')}.
Make them specific and interesting, not generic.`;

    const data = await generateJSON(prompt);
    res.json({ activities: Array.isArray(data) ? data : Object.values(data) });
  } catch (err) {
    console.log('Regen Error:', err.message);
    next(err);
  }
};

exports.generatePackingList = async (req, res, next) => {
  try {
    const { origin, destination, days, budgetType, interests } = req.body;
    const routeNote = origin ? `Flying from ${origin} to ${destination}.` : `Trip to ${destination}.`;

    const prompt = `You are a JSON API. Return ONLY a valid JSON object, nothing else.
No markdown, no backticks, no explanation.
Start with { and end with }.

Schema:
{
  "essentials": ["item1", "item2", "item3"],
  "clothing": ["item1", "item2", "item3"],
  "tech": ["item1", "item2", "item3"],
  "extras": ["item1", "item2", "item3"]
}

Trip: ${routeNote} ${days} days. Budget: ${budgetType}. Interests: ${(interests || []).join(', ')}.
Each category should have 3-5 specific, relevant items.`;

    const data = await generateJSON(prompt);
    res.json({ packingList: data });
  } catch (err) {
    console.log('Packing Error:', err.message);
    next(err);
  }
};

exports.getSmartRecommendations = async (req, res, next) => {
  try {
    const { previousDestinations = [], budgetType = 'Medium', interests = [] } = req.body;

    const prompt = `You are a JSON API. Return ONLY a valid JSON array, nothing else.
No markdown, no backticks, no explanation.
Start with [ and end with ].

Schema: [{"name": "City, Country", "tagline": "short phrase", "why": "one sentence reason", "tags": ["tag1", "tag2"]}]

Recommend 3 travel destinations.
Previously visited: ${previousDestinations.join(', ') || 'none'}.
Budget: ${budgetType}. Interests: ${interests.join(', ')}.`;

    const data = await generateJSON(prompt);
    res.json({ recommendations: data });
  } catch (err) {
    next(err);
  }
};