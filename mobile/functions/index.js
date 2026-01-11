/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

function detectIntent(text){
    text = text.toLowerCase();

    if(text.includes("calories")) return "CALORIES";
    if(text.includes("workout")) return "WORKOUT";
    if(text.includes("pushup") || text.includes("squat")) return "EXERCISE_FORM";
    if(text.includes("time") || text.includes("morning")) return "TIMING"; 
}

exports.fitTrackAssistant = functions.https.onRequest(async (req, res) => {
  const message = req.body.message;
  const intent = detectIntent(message);

  if (intent === "OUT_OF_SCOPE") {
    return res.json({
      reply: "I can help only with fitness, workouts, and nutrition related questions."
    });
  }

  let reply = "";

  if (intent === "CALORIES") {
    reply = await handleCalories(message);
  }

  if (intent === "WORKOUT") {
    reply = await handleWorkout(message);
  }

  if (intent === "EXERCISE_FORM") {
    reply = await handleExerciseForm(message);
  }

  res.json({ reply });
});

async function handleCalories(text) {
  const food = extractFoodName(text);

  const doc = await db.collection("foods").doc(food).get();
  if (!doc.exists) {
    return "I don't have calorie data for that food yet.";
  }

  const data = doc.data();
  return `A medium ${food} contains about ${data.calories} calories.`;
}

async function handleWorkout(text) {
  return "A beginner workout could include squats, pushups, and walking for 20 minutes.";
}

const sendMessage = async (text) => {
  const res = await fetch(FIREBASE_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  const data = await res.json();
  return data.reply;
};

setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
