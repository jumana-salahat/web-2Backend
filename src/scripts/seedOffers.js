import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Offer from "../models/Offer";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing in .env");
}

const seedOffers = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("Database connected");

  const offers = [
    {
      id: 1,
      tag: "Training",
      title: "Training Only",
      subtitle: "Personal workout program",
      price: 29,
      features: [
        { text: "Custom workout plan", included: true },
        { text: "Progress tracking", included: true },
        { text: "Exercise guidance", included: true },
        { text: "Meal plan", included: false },
        { text: "Priority support", included: false },
      ],
      showDiet: false,
      showTraining: true,
      isActive: true,
    },
    {
      id: 2,
      tag: "Nutrition",
      title: "Diet Plan Only",
      subtitle: "Personal nutrition program",
      price: 39,
      features: [
        { text: "Custom meal plan", included: true },
        { text: "Calorie tracking", included: true },
        { text: "Macro breakdown", included: true },
        { text: "Workout plan", included: false },
        { text: "Priority support", included: false },
      ],
      showDiet: true,
      showTraining: false,
      isActive: true,
    },
    {
      id: 3,
      tag: "Full Package",
      title: "Both Together",
      subtitle: "Complete fitness package",
      price: 59,
      badge: "Best Value",
      discount: "Save 20%",
      features: [
        { text: "Workout + diet plan", included: true },
        { text: "Full progress tracking", included: true },
        { text: "Macro breakdown", included: true },
        { text: "Exercise guidance", included: true },
        { text: "Priority support", included: true },
      ],
      showDiet: true,
      showTraining: true,
      isActive: true,
    },
  ];

  for (const offer of offers) {
    await Offer.updateOne(
      { id: offer.id },
      { $set: offer },
      { upsert: true }
    );
    console.log(`Seeded offer ${offer.id}: ${offer.title}`);
  }

  console.log("Seed complete");
  await mongoose.disconnect();
  process.exit(0);
};

seedOffers().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});