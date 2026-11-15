import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from "firebase/ai";
import { app } from "./firebase";

// Gemini Developer API דרך Firebase AI Logic: אין מפתח API בקוד
const ai = getAI(app, { backend: new GoogleAIBackend() });

// אם המודל לא נמצא, בדוק בתיעוד של Firebase AI Logic את שמות המודלים העדכניים
const MODEL_NAME = "gemini-2.5-flash";

const model = getGenerativeModel(ai, {
  model: MODEL_NAME,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: Schema.object({
      properties: {
        priority: Schema.enumString({ enum: ["low", "medium", "high"] }),
        daysUntilDeadline: Schema.integer(),
      },
    }),
  },
});

const PRIORITIES = ["low", "medium", "high"];
const DEFAULT_RESULT = { priority: "medium", daysUntilDeadline: 3 };

export async function analyzeTask(title) {
  const today = new Date().toISOString().split("T")[0];

  const prompt =
    "You are a task assistant. Decide how urgent this task is " +
    "(low, medium or high, based on urgency and complexity) and in how many " +
    "days (an integer between 0 and 60) it should be finished. " +
    `Today is ${today}. Task: ${title}`;

  try {
    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());

    // לא סומכים על המודל: בודקים שהתשובה תקינה
    const days = Number.isInteger(data.daysUntilDeadline)
      ? Math.min(Math.max(data.daysUntilDeadline, 0), 60)
      : DEFAULT_RESULT.daysUntilDeadline;

    return {
      priority: PRIORITIES.includes(data.priority)
        ? data.priority
        : DEFAULT_RESULT.priority,
      daysUntilDeadline: days,
    };
  } catch (err) {
    console.error("AI error:", err);
    // האפליקציה ממשיכה לעבוד גם אם ה-AI נכשל
    return DEFAULT_RESULT;
  }
}
