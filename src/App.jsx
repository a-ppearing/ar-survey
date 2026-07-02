import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Lock, ChevronRight, ChevronLeft, CheckCircle2, BarChart3, Dumbbell } from "lucide-react";
import { supabase } from "./supabaseClient";

const FONT_LINK_ID = "gym-survey-fonts";

function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

const ACCENT = "#D4A24C";
const ACCENT_DIM = "#9A7A3C";
const BG = "#1B1E24";
const PANEL = "#242830";
const LINE = "#343A45";
const TEXT = "#EDEBE4";
const SUBTEXT = "#9CA3AF";

const QUESTIONS = [
  { id: "hasFitIssues", type: "yesno", text: "Have you experienced clothing fit issues since starting the gym — in gym wear or in everyday/casual clothes (fitting, stretchiness, etc.)?", isNew: false },
  { id: "issueTypes", type: "multi", text: "Which of these have been issues for you? Select all that apply.", isNew: false,
    options: ["Breathability", "Restriction / not enough stretch", "Not fitting properly", "Ripping often", "Doesn't suit my build/shape", "Too big a jump between sizes (e.g. M to L)", "Need oversized shirts for chest size", "Uneven hip-to-thigh ratio in trousers", "Hard to find accessible sizes nearby", "Want a more tailored look", "Tight at the waist when cutting", "Polyester trade-off (sweat vs. cutting goals)", "Thighs too big for a good length"] },
  { id: "fitsLengthNotWidth", type: "yesno", text: "Do clothes — gym wear or everyday — generally fit you length-wise, but not account for your build width-wise?", isNew: false },
  { id: "age", type: "number", text: "What's your age?", isNew: true, min: 13, max: 90 },
  { id: "gymDuration", type: "select", text: "How long have you been training?", isNew: true,
    options: ["Under 3 months", "3–6 months", "6–12 months", "1–2 years", "2–5 years", "5+ years"] },
  { id: "bulkOrCut", type: "select", text: "Are you currently bulking or cutting?", isNew: true,
    options: ["Bulking", "Cutting", "Maintaining"] },
  { id: "stretchCompensates", type: "yesno", text: "Are clothes stretchy enough to compensate for muscle growth?", isNew: true },
  { id: "breathabilityImportant", type: "yesno", text: "Is breathability something you consider important?", isNew: true },
  { id: "complimentedFrameImportant", type: "yesno", text: "Is having clothes that compliment your frame important to you?", isNew: true },
  { id: "fashionInterest", type: "select", text: "Would you consider yourself into fashion?", isNew: true,
    options: ["Yes", "Partially", "No"] },
  { id: "bodyRegionMostProblematic", type: "select", text: "Which body region causes you the most fit problems?", isNew: true,
    options: ["Chest", "Waist", "Hips / glutes", "Thighs", "Shoulders", "Arms"] },
  { id: "fitIssueFrequencyBulk", type: "scale", text: "When bulking, how often do fit issues come up?", isNew: true,
    labels: ["Never", "Rarely", "Sometimes", "Often", "Always"] },
  { id: "fitIssueFrequencyCut", type: "scale", text: "When cutting, how often do fit issues come up?", isNew: true,
    labels: ["Never", "Rarely", "Sometimes", "Often", "Always"] },
  { id: "brandsTriedBeforeFit", type: "number", text: "How many brands or sizes do you typically try before finding one that fits?", isNew: true, min: 0, max: 20 },
  { id: "returnItemsRegularly", type: "yesno", text: "Do you return gym clothing items regularly due to fit?", isNew: true },
  { id: "willingnessToPayMore", type: "select", text: "Would you pay more for sizing built around physique (e.g. \"athletic fit\" tiers) rather than standard S–XL?", isNew: true,
    options: ["Yes", "Maybe", "No"] },
  { id: "garmentTypeMostTrouble", type: "select", text: "Which type of clothing gives you the most trouble with fit — tops, bottoms, or both equally?", isNew: true,
    options: ["Tops", "Bottoms", "Both equally"] },
  { id: "gymWearVsEveryday", type: "select", text: "Do these fit issues happen more in gym/activewear, in everyday clothes, or both equally?", isNew: true,
    options: ["Gym / activewear", "Everyday clothes", "Both equally"] },
  { id: "shoppingRoute", type: "select", text: "What's your usual shopping route for clothes?", isNew: true,
    options: ["High-street brands", "Activewear specialists", "Tailored / made-to-measure", "Mix of the above"] },
  { id: "priceForGoodFit", type: "select", text: "Roughly how much would you pay for a top or bottom that actually fit your build well?", isNew: true,
    options: ["Under £20", "£20–40", "£40–60", "£60+"] },
  { id: "avoidedBuyingDueToFit", type: "yesno", text: "Have you ever avoided buying something you liked because you knew the fit would be wrong?", isNew: true },
  { id: "styleEffortChanged", type: "yesno", text: "Has your style or how much effort you put into your appearance changed since you started training?", isNew: true },
  { id: "wardrobeReflectsPhysique", type: "select", text: "Outside the gym, does your current wardrobe reflect your physique, or feel like it hides it?", isNew: true,
    options: ["Reflects it well", "Hides it", "Neutral / doesn't think about it"] },
  { id: "trainSpecificSizingInterest", type: "yesno", text: "Would you be interested in clothing made specifically for people who train, rather than general sizing?", isNew: true },
  { id: "fabricRanking", type: "rank", text: "Rank these from most to least important in your fabric choice.", isNew: true,
    options: ["Breathability", "Stretch", "Durability"] },
];

const CONDITIONAL = { issueTypes: (a) => a.hasFitIssues === "Yes" };

// Free-text "time in gym" answers from early responses — kept as raw notes
// since they weren't collected in the structured gymDuration buckets.
const LEGACY_GYM_DURATION_NOTES = [
  "N/A",
  "1 year and a half — 15 yo",
  "1 year — 15 yo",
  "1 year — 27 yo",
  "8 months — 17 yo",
  "5 years — 22 yo",
  "5 years — 26 yo",
  "2 months — 20 yo",
  "1.5 years — 19 yo",
  "9 months — 17 yo",
  "2 years — 26 yo",
];

// Themes noted from early opportunity-sampling responses before the survey
// was digitized. Shown as a plain reference list in results, not counted
// against respondents since we don't know how many people raised each one.
const LEGACY_ISSUE_NOTES = [
  "Breathability",
  "Restriction / wiggle room — stretchiness",
  "Not fitting",
  "Ripping often",
  "Body shape",
  "Too big a jump between M and L",
  "Having to wear oversized shirts due to chest size",
  "Trousers — uneven hip-to-leg ratio, flared look from quads or glutes",
  "Oversized more often — more shopping needed to find accessible items",
  "Wanting a more tailored look to compliment the physique",
  "Tight on waist from cutting",
  "Polyester trade-off — helps when cutting but increases sweat, depending on goals",
  "Thighs too big for good length, or too long",
];

function visibleQuestions(answers) {
  return QUESTIONS.filter(q => !CONDITIONAL[q.id] || CONDITIONAL[q.id](answers));
}

function NewBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter",
      fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      color: BG, background: ACCENT, padding: "4px 9px", borderRadius: 3,
    }}>
      New — needs responses
    </span>
  );
}

function ProgressPlates({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 6, flex: 1, borderRadius: 2,
          background: i <= current ? ACCENT : LINE,
          transition: "background 0.25s ease",
        }} />
      ))}
    </div>
  );
}

function Button({ children, onClick, primary, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: "Inter", fontWeight: 600, fontSize: 15, cursor: disabled ? "not-allowed" : "pointer",
      padding: "12px 22px", borderRadius: 6, border: primary ? "none" : `1px solid ${LINE}`,
      background: primary ? (disabled ? ACCENT_DIM : ACCENT) : "transparent",
      color: primary ? BG : TEXT, opacity: disabled ? 0.6 : 1,
      display: "inline-flex", alignItems: "center", gap: 6,
      transition: "transform 0.1s ease", ...style,
    }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

function QuestionScreen({ question, value, onChange, detail, onDetailChange }) {
  const set = (v) => onChange(question.id, v);
  const [detailOpen, setDetailOpen] = useState(!!detail);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
        <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 22, lineHeight: 1.35, color: TEXT, margin: 0 }}>
          {question.text}
        </h2>
      </div>
      {question.isNew && <div style={{ marginBottom: 18 }}><NewBadge /></div>}

      {question.type === "yesno" && (
        <div style={{ display: "flex", gap: 12 }}>
          {["Yes", "No"].map(opt => (
            <OptionPill key={opt} label={opt} selected={value === opt} onClick={() => set(opt)} />
          ))}
        </div>
      )}

      {question.type === "select" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {question.options.map(opt => (
            <OptionRow key={opt} label={opt} selected={value === opt} onClick={() => set(opt)} />
          ))}
        </div>
      )}

      {question.type === "multi" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {question.options.map(opt => {
            const arr = value || [];
            const selected = arr.includes(opt);
            return (
              <OptionRow key={opt} label={opt} selected={selected} checkbox
                onClick={() => set(selected ? arr.filter(o => o !== opt) : [...arr, opt])} />
            );
          })}
        </div>
      )}

      {question.type === "number" && (
        <input type="number" min={question.min} max={question.max} value={value || ""}
          onChange={e => set(e.target.value)}
          placeholder={`${question.min}–${question.max}`}
          style={inputStyle} />
      )}

      {question.type === "scale" && (
        <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
          {question.labels.map((label, i) => (
            <div key={label} onClick={() => set(i + 1)} style={{
              flex: 1, textAlign: "center", cursor: "pointer", padding: "14px 4px",
              borderRadius: 6, border: `1px solid ${value === i + 1 ? ACCENT : LINE}`,
              background: value === i + 1 ? "rgba(212,162,76,0.12)" : "transparent",
            }}>
              <div style={{ fontFamily: "Bebas Neue", fontSize: 22, color: value === i + 1 ? ACCENT : TEXT }}>{i + 1}</div>
              <div style={{ fontFamily: "Inter", fontSize: 11, color: SUBTEXT, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {question.type === "rank" && (
        <RankPicker options={question.options} value={value} onChange={set} />
      )}

      <div style={{ marginTop: 20 }}>
        {!detailOpen ? (
          <button onClick={() => setDetailOpen(true)} style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            fontFamily: "Inter", fontSize: 13, color: SUBTEXT, textDecoration: "underline",
          }}>
            + Add detail or context
          </button>
        ) : (
          <div>
            <label style={{ display: "block", fontFamily: "Inter", fontSize: 12, color: SUBTEXT, marginBottom: 6 }}>
              Anything you want to add about this one? (optional)
            </label>
            <textarea
              value={detail || ""}
              onChange={e => onDetailChange(question.id, e.target.value)}
              placeholder="e.g. specific brand, exact spot it fits wrong, when it happens…"
              rows={3}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "Inter" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function RankPicker({ options, value, onChange }) {
  const order = value && value.length === options.length ? value : options;
  const move = (idx, dir) => {
    const next = [...order];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {order.map((opt, i) => (
        <div key={opt} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", borderRadius: 6, background: PANEL, border: `1px solid ${LINE}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "Bebas Neue", fontSize: 20, color: ACCENT, width: 22 }}>{i + 1}</span>
            <span style={{ fontFamily: "Inter", fontSize: 15, color: TEXT }}>{opt}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => move(i, -1)} disabled={i === 0} style={rankBtnStyle(i === 0)}>↑</button>
            <button onClick={() => move(i, 1)} disabled={i === order.length - 1} style={rankBtnStyle(i === order.length - 1)}>↓</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const rankBtnStyle = (disabled) => ({
  width: 30, height: 30, borderRadius: 4, border: `1px solid ${LINE}`, background: "transparent",
  color: disabled ? SUBTEXT : TEXT, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
});

function OptionPill({ label, selected, onClick }) {
  return (
    <div onClick={onClick} style={{
      flex: 1, textAlign: "center", padding: "16px 0", borderRadius: 6, cursor: "pointer",
      fontFamily: "Inter", fontWeight: 600, fontSize: 15,
      border: `1px solid ${selected ? ACCENT : LINE}`,
      background: selected ? "rgba(212,162,76,0.14)" : "transparent",
      color: selected ? ACCENT : TEXT,
    }}>
      {label}
    </div>
  );
}

function OptionRow({ label, selected, onClick, checkbox }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 6, cursor: "pointer",
      border: `1px solid ${selected ? ACCENT : LINE}`,
      background: selected ? "rgba(212,162,76,0.10)" : "transparent",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: checkbox ? 4 : 9, flexShrink: 0,
        border: `1.5px solid ${selected ? ACCENT : SUBTEXT}`,
        background: selected ? ACCENT : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && <CheckCircle2 size={14} color={BG} strokeWidth={3} />}
      </div>
      <span style={{ fontFamily: "Inter", fontSize: 15, color: TEXT }}>{label}</span>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "14px 16px", borderRadius: 6, border: `1px solid ${LINE}`,
  background: PANEL, color: TEXT, fontFamily: "Inter", fontSize: 16, outline: "none", boxSizing: "border-box",
};

function isAnswered(q, value) {
  if (q.type === "multi") return Array.isArray(value) && value.length > 0;
  if (q.type === "number") return value !== undefined && value !== "" && value !== null;
  return value !== undefined && value !== null && value !== "";
}

function Survey({ onDone }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [details, setDetails] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const qs = visibleQuestions(answers);
  const q = qs[step];

  const setAnswer = (id, val) => setAnswers(a => ({ ...a, [id]: val }));
  const setDetail = (id, val) => setDetails(d => ({ ...d, [id]: val }));

  const next = async () => {
    if (step < qs.length - 1) {
      setStep(step + 1);
    } else {
      setSaving(true);
      setSubmitError(null);
      try {
        const cleanDetails = Object.fromEntries(Object.entries(details).filter(([, v]) => v && v.trim()));
        const { error } = await supabase.from("survey_responses").insert({
          answers,
          details: cleanDetails,
        });
        if (error) throw error;
        onDone();
      } catch (e) {
        console.error("Storage error", e);
        setSubmitError("Couldn't save your answers — check your connection and try again.");
      } finally {
        setSaving(false);
      }
    }
  };

  const back = () => step > 0 && setStep(step - 1);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 20px" }}>
      <ProgressPlates current={step} total={qs.length} />
      <div style={{ fontFamily: "Inter", fontSize: 12, color: SUBTEXT, marginBottom: 14, letterSpacing: "0.04em" }}>
        QUESTION {step + 1} OF {qs.length}
      </div>
      <QuestionScreen key={q.id} question={q} value={answers[q.id]} onChange={setAnswer}
        detail={details[q.id]} onDetailChange={setDetail} />
      {submitError && (
        <div style={{ marginTop: 16, fontFamily: "Inter", fontSize: 13, color: "#E08A82" }}>
          {submitError}
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 34 }}>
        <Button onClick={back} style={{ visibility: step === 0 ? "hidden" : "visible" }}>
          <ChevronLeft size={16} /> Back
        </Button>
        <Button primary disabled={!isAnswered(q, answers[q.id]) || saving} onClick={next}>
          {saving ? "Saving…" : step === qs.length - 1 ? "Submit" : "Next"} <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}

function ThankYou({ onViewResults }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <Dumbbell size={36} color={ACCENT} />
      <h1 style={{ fontFamily: "Bebas Neue", fontSize: 34, letterSpacing: "0.02em", color: TEXT, margin: "18px 0 8px" }}>
        LOGGED
      </h1>
      <p style={{ fontFamily: "Inter", color: SUBTEXT, fontSize: 15, lineHeight: 1.6 }}>
        Thanks — your answers are in. If you want to fill it out again for someone else nearby, refresh the page.
      </p>
      <div style={{ marginTop: 26 }}>
        <button onClick={onViewResults} style={{
          background: "none", border: "none", color: SUBTEXT, fontFamily: "Inter", fontSize: 12,
          cursor: "pointer", textDecoration: "underline", opacity: 0.6,
        }}>
          Creator access
        </button>
      </div>
    </div>
  );
}

function PasscodeGate({ onUnlock }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const CODE = "results2024";
  const submit = () => {
    if (code === CODE) onUnlock();
    else { setError(true); setTimeout(() => setError(false), 1200); }
  };
  return (
    <div style={{ maxWidth: 360, margin: "0 auto", padding: "100px 20px", textAlign: "center" }}>
      <Lock size={28} color={ACCENT} />
      <h2 style={{ fontFamily: "Bebas Neue", fontSize: 26, color: TEXT, margin: "16px 0 4px" }}>CREATOR ACCESS</h2>
      <p style={{ fontFamily: "Inter", fontSize: 13, color: SUBTEXT, marginBottom: 20 }}>
        This is a soft gate, not real security — anyone with the code (or the page source) can view results.
      </p>
      <input type="password" value={code} onChange={e => setCode(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        placeholder="Passcode" style={{ ...inputStyle, textAlign: "center", borderColor: error ? "#C0524A" : LINE }} />
      <div style={{ marginTop: 16 }}>
        <Button primary onClick={submit}>Unlock</Button>
      </div>
    </div>
  );
}

// Real-time: loads once, then listens for INSERTs on the table instead of
// polling. Falls back to a slow poll too, in case a realtime event is missed.
const FALLBACK_POLL_MS = 30000;

function useResponses(active) {
  const [responses, setResponses] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("survey_responses")
          .select("answers, details, submitted_at")
          .order("submitted_at", { ascending: true });
        if (error) throw error;
        if (!cancelled) {
          setResponses(data.map(r => ({
            answers: r.answers,
            details: r.details,
            submittedAt: r.submitted_at,
          })));
          setLastUpdated(new Date());
          setError(null);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("Couldn't load responses.");
          setResponses(prev => prev ?? []);
        }
      }
    };

    load();

    const channel = supabase
      .channel("survey_responses_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "survey_responses" }, load)
      .subscribe();

    const interval = setInterval(load, FALLBACK_POLL_MS);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [active]);

  return { responses, error, lastUpdated };
}

function aggregateFor(question, responses) {
  const answered = responses.map(r => r.answers[question.id]).filter(v => v !== undefined && v !== null && v !== "");
  if (question.type === "yesno" || question.type === "select") {
    const counts = {};
    answered.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    return { kind: "counts", data: Object.entries(counts).map(([name, count]) => ({ name, count })), n: answered.length };
  }
  if (question.type === "multi") {
    const counts = {};
    answered.forEach(arr => (arr || []).forEach(v => { counts[v] = (counts[v] || 0) + 1; }));
    return { kind: "counts", data: Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count), n: answered.length };
  }
  if (question.type === "scale") {
    const counts = {};
    question.labels.forEach((l, i) => counts[i + 1] = 0);
    answered.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    const avg = answered.length ? (answered.reduce((a, b) => a + Number(b), 0) / answered.length).toFixed(2) : null;
    return { kind: "counts", data: Object.entries(counts).map(([k, count]) => ({ name: question.labels[Number(k) - 1], count })), n: answered.length, avg };
  }
  if (question.type === "number") {
    const nums = answered.map(Number).filter(n => !isNaN(n));
    const avg = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1) : null;
    return { kind: "stat", avg, min: nums.length ? Math.min(...nums) : null, max: nums.length ? Math.max(...nums) : null, n: nums.length };
  }
  if (question.type === "rank") {
    const totals = {};
    question.options.forEach(o => totals[o] = []);
    answered.forEach(order => (order || []).forEach((opt, i) => totals[opt] && totals[opt].push(i + 1)));
    const data = question.options.map(o => ({
      name: o,
      avgRank: totals[o].length ? (totals[o].reduce((a, b) => a + b, 0) / totals[o].length).toFixed(2) : null,
    }));
    return { kind: "rank", data, n: answered.length };
  }
  return { kind: "counts", data: [], n: 0 };
}

function DetailList({ question, responses }) {
  const items = responses
    .map(r => r.details && r.details[question.id])
    .filter(t => t && t.trim());
  if (items.length === 0) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontFamily: "Inter", fontSize: 11, color: SUBTEXT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        Added detail ({items.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((t, i) => (
          <div key={i} style={{
            fontFamily: "Inter", fontSize: 13, color: TEXT, background: PANEL,
            border: `1px solid ${LINE}`, borderRadius: 6, padding: "10px 12px", lineHeight: 1.5,
          }}>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultsView({ responses, lastUpdated }) {
  const total = responses.length;
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart3 size={22} color={ACCENT} />
          <h1 style={{ fontFamily: "Bebas Neue", fontSize: 30, color: TEXT, margin: 0, letterSpacing: "0.02em" }}>RESULTS</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "Inter", fontSize: 11, color: SUBTEXT }}>
          <span style={{ width: 7, height: 7, borderRadius: 99, background: "#5BAE72", display: "inline-block", boxShadow: "0 0 0 3px rgba(91,174,114,0.2)" }} />
          Live{lastUpdated ? ` · updated ${lastUpdated.toLocaleTimeString()}` : ""}
        </div>
      </div>
      <p style={{ fontFamily: "Inter", fontSize: 13, color: SUBTEXT, marginBottom: 30 }}>
        {total} total submission{total === 1 ? "" : "s"}, updating in real time. Questions marked <NewBadge /> have fewer responses since they were added later — read percentages on those with caution.
      </p>

      <div style={{ marginBottom: 30, paddingBottom: 26, borderBottom: `1px solid ${LINE}` }}>
        <h3 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: TEXT, margin: "0 0 4px" }}>
          Issues noted from early responses
        </h3>
        <div style={{ fontFamily: "Inter", fontSize: 12, color: SUBTEXT, marginBottom: 12 }}>
          Collected before the survey was digitized — listed as themes, not tied to individual respondent counts.
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          {LEGACY_ISSUE_NOTES.map((note, i) => (
            <li key={i} style={{ fontFamily: "Inter", fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{note}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: 30, paddingBottom: 26, borderBottom: `1px solid ${LINE}` }}>
        <h3 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: TEXT, margin: "0 0 4px" }}>
          Time in gym — early responses
        </h3>
        <div style={{ fontFamily: "Inter", fontSize: 12, color: SUBTEXT, marginBottom: 12 }}>
          Free-text answers collected before this became a structured question. Format: duration — age.
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          {LEGACY_GYM_DURATION_NOTES.map((note, i) => (
            <li key={i} style={{ fontFamily: "Inter", fontSize: 13, color: TEXT, lineHeight: 1.5 }}>{note}</li>
          ))}
        </ul>
      </div>

      {QUESTIONS.map(q => {
        const agg = aggregateFor(q, responses);
        return (
          <div key={q.id} style={{ marginBottom: 30, paddingBottom: 26, borderBottom: `1px solid ${LINE}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 4 }}>
              <h3 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: TEXT, margin: 0 }}>{q.text}</h3>
              {q.isNew && <NewBadge />}
            </div>
            <div style={{ fontFamily: "Inter", fontSize: 12, color: SUBTEXT, marginBottom: 12 }}>
              n = {agg.n}{agg.avg !== undefined && agg.avg !== null ? ` · avg ${agg.avg}` : ""}
            </div>

            {agg.kind === "counts" && agg.data.length > 0 && (
              <div style={{ width: "100%", height: Math.max(80, agg.data.length * 34) }}>
                <ResponsiveContainer>
                  <BarChart data={agg.data} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={LINE} horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: SUBTEXT, fontSize: 11, fontFamily: "Inter" }} stroke={LINE} />
                    <YAxis type="category" dataKey="name" width={190} tick={{ fill: TEXT, fontSize: 12, fontFamily: "Inter" }} stroke={LINE} />
                    <Tooltip contentStyle={{ background: PANEL, border: `1px solid ${LINE}`, fontFamily: "Inter", fontSize: 12 }} />
                    <Bar dataKey="count" fill={ACCENT} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {agg.kind === "stat" && (
              <div style={{ fontFamily: "Inter", fontSize: 14, color: TEXT }}>
                {agg.n > 0 ? `avg ${agg.avg} (range ${agg.min}–${agg.max})` : "No responses yet."}
              </div>
            )}

            {agg.kind === "rank" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[...agg.data].sort((a, b) => (a.avgRank ?? 99) - (b.avgRank ?? 99)).map(d => (
                  <div key={d.name} style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter", fontSize: 13, color: TEXT }}>
                    <span>{d.name}</span>
                    <span style={{ color: SUBTEXT }}>{d.avgRank !== null ? `avg rank ${d.avgRank}` : "—"}</span>
                  </div>
                ))}
              </div>
            )}

            {agg.n === 0 && <div style={{ fontFamily: "Inter", fontSize: 13, color: SUBTEXT, fontStyle: "italic" }}>No responses yet.</div>}

            <DetailList question={q} responses={responses} />
          </div>
        );
      })}
    </div>
  );
}

function wantsResultsFromUrl() {
  try {
    const { search, hash } = window.location;
    return /results/i.test(search) || /results/i.test(hash);
  } catch (e) {
    return false;
  }
}

export default function App() {
  useFonts();
  const [view, setView] = useState(() => (wantsResultsFromUrl() ? "gate" : "survey")); // survey | thanks | gate | results
  const isResultsActive = view === "results";
  const { responses, error, lastUpdated } = useResponses(isResultsActive);

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>
      <div style={{ borderBottom: `1px solid ${LINE}`, padding: "16px 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "Bebas Neue", fontSize: 20, letterSpacing: "0.03em", color: TEXT }}>
            <Dumbbell size={18} color={ACCENT} /> GYM FIT SURVEY
          </div>
          {view !== "gate" && view !== "results" && (
            <button
              onClick={() => setView("gate")}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                fontFamily: "Inter", fontSize: 11, color: SUBTEXT, opacity: 0.55,
                textDecoration: "underline",
              }}
            >
              results
            </button>
          )}
        </div>
      </div>

      {view === "survey" && <Survey onDone={() => setView("thanks")} />}
      {view === "thanks" && <ThankYou onViewResults={() => setView("gate")} />}
      {view === "gate" && <PasscodeGate onUnlock={() => setView("results")} />}
      {view === "results" && (
        responses === null
          ? <div style={{ textAlign: "center", padding: 80, fontFamily: "Inter", color: SUBTEXT }}>Loading responses…</div>
          : error
            ? <div style={{ textAlign: "center", padding: 80, fontFamily: "Inter", color: "#C0524A" }}>{error}</div>
            : <ResultsView responses={responses} lastUpdated={lastUpdated} />
      )}
    </div>
  );
}
