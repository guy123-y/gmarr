import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

const errorMessages = {
  "auth/invalid-credential": "אימייל או סיסמה שגויים",
  "auth/email-already-in-use": "האימייל כבר רשום",
  "auth/weak-password": "הסיסמה חלשה מדי (לפחות 6 תווים)",
  "auth/invalid-email": "כתובת אימייל לא תקינה",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(errorMessages[err.code] || "אירעה שגיאה, נסה שוב");
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "80px auto" }}>
      <h1>TaskMind</h1>
      <h3>{isRegister ? "יצירת חשבון" : "התחברות"}</h3>

      <input
        type="email"
        placeholder="אימייל"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      />
      <input
        type="password"
        placeholder="סיסמה"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        style={{ display: "block", width: "100%", marginBottom: 8 }}
      />

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <button onClick={submit}>{isRegister ? "הרשמה" : "כניסה"}</button>
      <p>
        <button onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? "כבר יש לי חשבון" : "אין לי חשבון, הרשמה"}
        </button>
      </p>
    </div>
  );
}
