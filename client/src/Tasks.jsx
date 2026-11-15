import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { analyzeTask } from "./ai";
const priorityLabel = { low: "נמוכה", medium: "בינונית", high: "גבוהה" };

export default function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // האזנה בזמן אמת למשימות של המשתמש הנוכחי בלבד
  useEffect(() => {
    const q = query(collection(db, "tasks"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // מיון בצד הלקוח, כדי לא להצריך אינדקס מורכב
      list.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() ?? Date.now()) -
          (a.createdAt?.toMillis?.() ?? Date.now())
      );
      setTasks(list);
    });
    return unsubscribe;
  }, [user.uid]);

  const addTask = async () => {
    const title = text.trim();
    if (!title) return;

    setBusy(true);
    setError("");
    try {
      // 1. Gemini מנתח את המשימה (דרך Firebase AI Logic)
      const data = await analyzeTask(title);

      // 2. שומרים ב-Firestore
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + data.daysUntilDeadline);

      await addDoc(collection(db, "tasks"), {
        uid: user.uid,
        title,
        completed: false,
        priority: data.priority,
        suggestedDeadline: Timestamp.fromDate(deadline),
        createdAt: serverTimestamp(),
      });

      setText("");
    } catch (err) {
      console.error(err);
      setError("לא הצלחנו להוסיף את המשימה, נסה שוב");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (t) =>
    updateDoc(doc(db, "tasks", t.id), { completed: !t.completed });

  const remove = (id) => deleteDoc(doc(db, "tasks", id));

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>המשימות שלי</h1>
        <button onClick={() => signOut(auth)}>יציאה</button>
      </div>
      <p>{user.email}</p>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && addTask()}
        placeholder="משימה חדשה..."
        maxLength={200}
      />
      <button onClick={addTask} disabled={busy}>
        {busy ? "הבינה המלאכותית חושבת..." : "הוסף"}
      </button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => toggle(t)}
            />
            <span
              style={{ textDecoration: t.completed ? "line-through" : "none" }}
            >
              {t.title}
            </span>{" "}
            ({priorityLabel[t.priority]})
            {t.suggestedDeadline &&
              ` | יעד: ${t.suggestedDeadline
                .toDate()
                .toLocaleDateString("he-IL")}`}{" "}
            <button onClick={() => remove(t.id)}>מחק</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
