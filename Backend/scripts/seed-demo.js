/* Development-only demo seed. It creates real MongoDB records for an existing user. */
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const User = require("../src/models/User");
const Plant = require("../src/models/Plant");
const CareLog = require("../src/models/CareLog");
const GrowthRecord = require("../src/models/GrowthRecord");
const Recommendation = require("../src/models/Recommendation");

const demoPlants = [
  {
    name: "Living Room Monstera",
    species: "Monstera Deliciosa",
    scientificName: "Monstera deliciosa",
    category: "tropical",
    location: "Bright indirect window",
    lightCondition: "bright-indirect",
    indoorOutdoor: "indoor",
    wateringFrequency: 7,
    fertilizingFrequency: 30,
    healthStatus: "healthy",
    description: "A thriving Monstera used for LeafLens development demos.",
    careNotes: "Rotate weekly for even growth.",
  },
  {
    name: "Desk Snake Plant",
    species: "Snake Plant",
    scientificName: "Dracaena trifasciata",
    category: "succulent",
    location: "Home office",
    lightCondition: "low",
    indoorOutdoor: "indoor",
    wateringFrequency: 21,
    fertilizingFrequency: 90,
    healthStatus: "healthy",
    description: "A low-maintenance plant used for LeafLens development demos.",
    careNotes: "Let the soil dry between waterings.",
  },
  {
    name: "Kitchen Peace Lily",
    species: "Peace Lily",
    scientificName: "Spathiphyllum wallisii",
    category: "flowering",
    location: "Kitchen shelf",
    lightCondition: "indirect",
    indoorOutdoor: "indoor",
    wateringFrequency: 5,
    fertilizingFrequency: 45,
    healthStatus: "attention",
    description: "A flowering plant used for LeafLens development demos.",
    careNotes: "Watch for drooping leaves as a watering cue.",
  },
];

async function seedDemo() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo seeding is disabled when NODE_ENV=production.");
  }

  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error("Usage: npm run seed:demo -- user@example.com");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error(`No user found for ${email}. Register an account first.`);
  }

  for (const data of demoPlants) {
    const plant = await Plant.findOneAndUpdate(
      { user: user._id, name: data.name },
      { $set: data, $setOnInsert: { user: user._id } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    await CareLog.findOneAndUpdate(
      { user: user._id, plant: plant._id, notes: "LeafLens demo care record." },
      {
        $setOnInsert: {
          user: user._id,
          plant: plant._id,
          actionType: data.name.includes("Snake") ? "watering" : "misting",
          notes: "LeafLens demo care record.",
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );

    await GrowthRecord.findOneAndUpdate(
      { user: user._id, plant: plant._id, notes: "LeafLens demo growth record." },
      {
        $setOnInsert: {
          user: user._id,
          plant: plant._id,
          height: data.name.includes("Monstera") ? 62 : 34,
          heightUnit: "cm",
          notes: "LeafLens demo growth record.",
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );

    await Recommendation.findOneAndUpdate(
      { user: user._id, plant: plant._id, "metadata.demo": true },
      {
        $setOnInsert: {
          user: user._id,
          plant: plant._id,
          source: "system",
          category: data.name.includes("Peace") ? "watering" : "general_care",
          priority: data.name.includes("Peace") ? "high" : "medium",
          title: "LeafLens demo care suggestion",
          message: "Check the soil moisture before the next scheduled watering.",
          action: "Inspect the top few centimetres of soil.",
          reason: "This sample recommendation demonstrates the plant care workflow.",
          metadata: { demo: true },
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    );
  }

  console.log(`Seeded ${demoPlants.length} demo plants for ${email}.`);
}

seedDemo()
  .catch((error) => {
    console.error(`Demo seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
