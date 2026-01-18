import { FOOD_CALORIES } from "./food.js";
import { WORKOUTS } from "./workout.js";

export const INTENTS = [
  {
    label: "CALORIES",
    examples: [
      "How many calories are in banana",
      "Calories in apple",
      "Nutrition of rice",
    ],
    //Dynamic response based on user input
    response: ({ text }) => {
      for (const food in FOOD_CALORIES) {
        const readableFood = food.replace("_", " ");
        if (text.includes(readableFood)) {
          const { calories, unit } = FOOD_CALORIES[food];
          return `A ${unit} of ${readableFood} has about ${calories} calories.`;
        }
      }
      //If no food item is found in the input
      return "Tell me the food name and I’ll give you its calorie information.";
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