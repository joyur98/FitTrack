import { FOOD_CALORIES } from "./food.js";
import { WORKOUTS } from "./workout.js";



function extractGrams(text) {
  const match = text.match(/(\d+(\.\d+)?)\s?(kg|kilogram|kilograms|g|gram|grams)/);

  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[3];

  // Convert kg to grams
  if (unit.startsWith("kg") || unit.startsWith("kilogram")) {
    return Math.round(value * 1000);
  }

  return Math.round(value);
}


export const INTENTS = [
 {
  label: "CALORIES",
  examples: [
    "How many calories are in banana",
    "Calories in 100g chicken breast",
    "Nutrition of 50 grams paneer",
  ],
  response: ({ text }) => {
    const gramsAsked = extractGrams(text);

    for (const food in FOOD_CALORIES) {
      const readableFood = food.replace("_", " ");

      if (text.includes(readableFood)) {
        const { calories, grams, unit } = FOOD_CALORIES[food];
        const caloriesPerGram = calories / grams;

        // If user specified grams
        if (gramsAsked) {
          const totalCalories = Math.round(
            caloriesPerGram * gramsAsked
          );

          return `${gramsAsked}g of ${readableFood} has about ${totalCalories} calories.`;
        }

        // Default response (no grams specified)
        return `A ${unit} of ${readableFood} has about ${calories} calories.`;
      }
    }

    return "Tell me the food name and quantity (for example: 100g chicken).";
  },
},

  {
    label: "WORKOUT",
    examples: [
      "Best chest workout",
      "Exercises for abs",
      "Leg workout",
      "Back exercises",
      "Full body workout",
    ],
    //Dynamic response based on user input
    response: ({ text }) => {
      for (const muscle in WORKOUTS) {
        const readableMuscle = muscle.replace("_", " ");

        if (text.includes(readableMuscle)) {
          const workout = WORKOUTS[muscle];
          return `
${readableMuscle.toUpperCase()} WORKOUT
Goal: ${workout.goal}
Exercises:
- ${workout.exercises.join("\n- ")}
          `.trim();
        }
      }
      //If no muscle group is found in the input
      return "Tell me which body part you want a workout for (chest, abs, legs, etc.).";
    },
  },
];