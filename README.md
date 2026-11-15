# TaskMind – אפליקציית משימות חכמה

אפליקציית משימות חכמה. המשתמש נרשם, כותב משימה, ובינה מלאכותית
קובעת כמה היא דחופה ותוך כמה ימים כדאי לסיים אותה.
הכול במסלול החינמי של Firebase, בלי שרת ובלי מפתח API בקוד.

## טכנולוגיות
- **React (Vite)** – הממשק
- **Firebase Authentication** – הרשמה והתחברות
- **Cloud Firestore** – שמירת המשימות
- **Firebase AI Logic (Gemini)** – ניתוח הדחיפות של כל משימה

## איך זה עובד
1. המשתמש נרשם או מתחבר עם אימייל וסיסמה.
2. הוא כותב משימה, והמודל מחזיר דחיפות (נמוכה, בינונית או גבוהה)
   ומספר ימים מוצע לסיום.
3. המשימה נשמרת ב-Firestore ומוצגת ברשימה בזמן אמת.
4. אפשר לסמן משימה כבוצעה או למחוק אותה.
5. חוקי האבטחה מבטיחים שכל משתמש רואה ומשנה רק את המשימות שלו.

אם ה-AI לא זמין, האפליקציה ממשיכה לעבוד עם ערכי ברירת מחדל
(דחיפות בינונית, שלושה ימים).

## קבצים עיקריים
- `client/src/Login.jsx` – מסך הרשמה והתחברות
- `client/src/Tasks.jsx` – מסך המשימות
- `client/src/ai.js` – הקריאה ל-Gemini
- `firestore.rules` – חוקי האבטחה

## הכנה חד-פעמית

1. ב-Firebase Console צור פרויקט (השאר במסלול Spark, בלי לחבר חשבון חיוב).
2. Authentication → Get started → הפעל Email/Password.
3. Firestore Database → Create database (Production mode).
4. AI Logic → Get started → בחר Gemini Developer API (המסלול החינמי).
5. Project settings → Add app → Web, והעתק את ה-firebaseConfig.

## הגדרה והרצה

```bash
cp client/.env.example client/.env      # ומלא את ערכי ה-firebaseConfig
cd client
npm install
npm run dev
```

## פריסת חוקי האבטחה

```bash
npm install -g firebase-tools
firebase login
cp .firebaserc.example .firebaserc      # והחלף ל-ID של הפרויקט
firebase deploy --only firestore:rules
```

## הערות

- למסלול החינמי יש מכסות שימוש מוגבלות. אם נחצה את המכסה, האפליקציה
  חוזרת לערכי ברירת מחדל ולא קורסת.
- אם המודל לא נמצא, עדכן את `MODEL_NAME` ב-`client/src/ai.js`
  לפי התיעוד של Firebase AI Logic.
- מומלץ להפעיל Firebase App Check כדי שרק האפליקציה שלך תוכל להשתמש ב-AI.