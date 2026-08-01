import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Lock, ChevronRight, ChevronLeft, CheckCircle2, BarChart3, Sun, Moon, FlaskConical, X } from "lucide-react";
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

function GlobalStyles() {
  useEffect(() => {
    // iOS Safari won't trigger :active on tap unless a touchstart listener exists somewhere.
    document.addEventListener("touchstart", () => {}, { passive: true });
  }, []);
  return (
    <style>{`
      * { box-sizing: border-box; }
      html { -webkit-tap-highlight-color: transparent; scroll-behavior: smooth; }
      body { margin: 0; overscroll-behavior-y: none; }

      @keyframes qFadeSlide { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes viewFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 65% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); } }
      @keyframes cardPulse { 0% { box-shadow: 0 0 0 0 rgba(125,46,55,0.25); } 100% { box-shadow: 0 0 0 8px rgba(125,46,55,0); } }
      @keyframes shake { 10%, 90% { transform: translateX(-1px); } 20%, 80% { transform: translateX(2px); } 30%, 50%, 70% { transform: translateX(-4px); } 40%, 60% { transform: translateX(4px); } }
      .shake { animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97); }

      .q-anim { animation: qFadeSlide 0.34s cubic-bezier(0.22, 1, 0.36, 1); }
      .view-fade { animation: viewFade 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
      .pop-in { animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); display: flex; }

      .tap-target {
        transition: transform 0.12s ease, background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
      }
      .tap-target:active { transform: scale(0.96); }
      @media (hover: hover) {
        .opt-hover:hover { border-color: ${ACCENT_DIM}; }
      }

      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-thumb { background: ${LINE}; border-radius: 8px; }

      :root, :root[data-theme="dark"] {
        --bg: #15110F; --panel: #241C18; --panel-2: #2E2521; --line: #3A2F27; --line-strong: #4E4038;
        --text: #F1E6D9; --subtext: #AC9C8C; --text-faint: #7C6F62;
        --error: #D98D85; --success: #6FAE85; --success-glow: rgba(111,174,133,0.22);
        --header-bg: rgba(21,17,15,0.82); --panel-shadow: 0 8px 28px rgba(0,0,0,0.32);
        --ambient: radial-gradient(ellipse 900px 500px at 50% -8%, rgba(125,46,55,0.16), transparent 60%),
                   radial-gradient(ellipse 700px 500px at 100% 100%, rgba(125,46,55,0.06), transparent 60%);
      }
      :root[data-theme="light"] {
        --bg: #EFE6D8; --panel: #F8F1E6; --panel-2: #EDE2D0; --line: #DCCDB0; --line-strong: #C7B594;
        --text: #2A2015; --subtext: #7C6C57; --text-faint: #9C8C76;
        --error: #A63B33; --success: #327A4D; --success-glow: rgba(50,122,77,0.16);
        --header-bg: rgba(239,230,216,0.82); --panel-shadow: 0 8px 28px rgba(75,55,35,0.10);
        --ambient: radial-gradient(ellipse 900px 500px at 50% -8%, rgba(125,46,55,0.07), transparent 60%),
                   radial-gradient(ellipse 700px 500px at 100% 100%, rgba(125,46,55,0.04), transparent 60%);
      }
      html, body { background: var(--bg); transition: background-color 0.25s ease; }
      body, body * { transition: background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease; }
      .ambient-bg { background-image: var(--ambient); background-attachment: fixed; }
    `}</style>
  );
}

const ACCENT = "#7D2E37";
const ACCENT_DIM = "#4C1B22";
const BG = "var(--bg)";
const PANEL = "var(--panel)";
const PANEL_2 = "var(--panel-2)";
const LINE = "var(--line)";
const LINE_STRONG = "var(--line-strong)";
const TEXT = "var(--text)";
const SUBTEXT = "var(--subtext)";
const TEXT_FAINT = "var(--text-faint)";
const ON_ACCENT = "#F6ECDF";
const ERROR = "var(--error)";
const SUCCESS = "var(--success)";

function Logo({ size = 20, color = ACCENT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <line x1="10" y1="10" x2="24" y2="24" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="10" cy="10" r="2.4" fill={color} />
      <line x1="30" y1="10" x2="16" y2="24" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="30" cy="10" r="2.4" fill={color} />
    </svg>
  );
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="tap-target"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 34, height: 34, flexShrink: 0, borderRadius: 8, border: `1px solid ${LINE}`,
        background: "transparent", color: TEXT, cursor: "pointer",
        WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
      }}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

const QUESTIONS_V1 = [
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

const CONDITIONAL_V1 = { issueTypes: (a) => a.hasFitIssues === "Yes" };

// ---------------------------------------------------------------------
// V2 — Fit & Expression follow-up survey
// ---------------------------------------------------------------------
const QUESTIONS_V2 = [
  {
    id: "respondentInitials", type: "shorttext",
    text: "To start, please enter your initials.",
    note: "We ask for this so we can tell which answers belong to the same person — it makes the results more reliable. Initials aren't shown individually in public results or linked to your identity.",
    placeholder: "e.g. JS",
    maxLength: 4,
  },
  {
    id: "prefaceFit", type: "interstitial",
    title: "Before you begin",
    subtitle: "The following questions concern the fit of clothing — sizing, cut, and comfort. Please keep this focus in mind as you answer, rather than style, price, or brand preference.",
  },
  {
    id: "thighWaistMismatch", type: "multi",
    text: "Have you experienced either of these in trousers or joggers? Select all that apply.",
    options: [
      "Tight or restrictive around the thighs, even when the waist fits",
      "Loose or baggy around the waist, even when adjusted for the thighs",
      "Neither",
    ],
  },
  {
    id: "chestStomachMismatch", type: "multi",
    text: "Have you experienced either of these in tops? Select all that apply.",
    options: [
      "Had to size up for chest or shoulders, resulting in bagginess around the stomach",
      "Tops fit the stomach but are tight or restrictive across the chest or shoulders",
      "Neither",
    ],
  },
  {
    id: "fitAffectsBuying2", type: "scale",
    text: "How often do fit issues affect your choice of what to buy?",
    labels: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: "consideredAltering", type: "select",
    text: "Have you ever considered having clothing altered to fix a fit problem, whether or not you went through with it?",
    options: ["Yes, and I did", "Yes, but I didn't", "No"],
    detailLabel: "What was the issue?",
    detailPlaceholder: "e.g. length, waist, chest",
    detailVisibleIf: (v) => typeof v === "string" && v.startsWith("Yes"),
    detailAutoOpen: true,
  },
  {
    id: "brandNaming", type: "dualtext", optional: true,
    text: "Which specific brands, if any, have you personally experienced fit issues with?",
    subLabels: ["Casual wear", "Smart / dress wear"],
  },
  {
    id: "poorFitLimitsStyle", type: "select",
    text: "Has poor fit ever stopped you from wearing something in your own style?",
    options: ["Yes", "No", "Sometimes"],
  },
  {
    id: "priceLimitsFit", type: "select",
    text: "Does price ever stop you from buying clothing that actually fits your build well?",
    options: ["Yes", "No", "Sometimes"],
  },
  {
    id: "sectionBreak1", type: "interstitial",
    title: "Shifting focus",
    subtitle: "You're halfway through. The following questions concern expression and personality — how clothing reflects your individual style and identity. Please keep this focus in mind as you answer, rather than fit or sizing.",
  },
  {
    id: "lessExpressionNow", type: "select",
    text: "Compared to older pieces you've seen or owned, do fashion brands (e.g. Zara, H&M) now feel like they offer less expression or identity in their clothing?",
    options: ["Yes", "No", "Not sure"],
  },
  {
    id: "expressionRanking", type: "rank",
    text: "Rank the following from most to least important in making a piece of clothing feel expressive or stand out to you.",
    options: [
      "Bold or varied colour choices", "Minimalist tones", "Silhouette or cut", "Fabric texture",
      "Detailing (stitching, trims, etc.)", "Versatility (works across multiple outfits)",
      "Craftsmanship", "Pieces that work together",
    ],
  },
  {
    id: "marketLimitsExpression", type: "select",
    text: "Do you feel the current clothing market limits your ability to express yourself through fashion?",
    options: ["Yes", "No", "Sometimes", "Not sure"],
  },
  {
    id: "priceLimitsStyle", type: "select",
    text: "Does price ever stop you from buying clothing that best matches your personal style?",
    options: ["Yes", "No", "Sometimes"],
  },
  {
    id: "stylesWanted", type: "multi",
    text: "What styles would you like to see more often in the current market? Select all that apply.",
    options: [
      "Vintage", "Old money / preppy", "Streetwear", "Minimalist", "Maximalist", "Workwear",
      "Y2K", "Grunge / alternative", "Formalwear / tailoring", "Sportswear-inspired (athleisure)",
      "Cottagecore / romantic", "Techwear", "Other",
    ],
    detailLabel: "Anything else? (optional)",
    detailPlaceholder: "Tell us more…",
    detailVisibleIf: (arr) => Array.isArray(arr) && arr.includes("Other"),
  },
  {
    id: "sectionBreakDemo", type: "interstitial",
    title: "Last thing",
    subtitle: "A few closing questions about your training and background. These are only collected to see whether answers differ across groups, and are not used for any other purpose.",
  },
  {
    id: "gymRegular", type: "yesno", page: "demographics",
    text: "Do you regularly go to the gym?",
    detailLabel: "How long have you been attending?",
    detailPlaceholder: "e.g. 6 months, 2 years",
    detailVisibleIf: (v) => v === "Yes",
    detailAutoOpen: true,
    requireDetailIf: (v) => v === "Yes",
  },
  {
    id: "respondentAge", type: "select", page: "demographics",
    text: "Which age range do you fall into?",
    options: ["Under 18", "18–24", "25–34", "35–44", "45–54", "55+"],
  },
  {
    id: "respondentGender", type: "select", page: "demographics",
    text: "Which gender do you identify as?",
    options: ["Male", "Female", "Non-binary", "Prefer not to say"],
  },
];
const CONDITIONAL_V2 = {};

const SURVEYS = {
  v2: {
    key: "v2", table: "expression_survey_responses", title: "AR SURVEY",
    shortTitle: "AR Survey", questions: QUESTIONS_V2, conditional: CONDITIONAL_V2, legacy: false,
  },
  v1: {
    key: "v1", table: "survey_responses", title: "GYM FIT SURVEY (ARCHIVED)",
    shortTitle: "Original Gym Fit", questions: QUESTIONS_V1, conditional: CONDITIONAL_V1, legacy: true,
  },
};

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

function visibleQuestions(answers, questions, conditional) {
  return questions.filter(q => !conditional[q.id] || conditional[q.id](answers));
}

function NewBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter",
      fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
      color: ON_ACCENT, background: ACCENT, padding: "4px 9px", borderRadius: 3,
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

function Button({ children, onClick, primary, disabled, style, className = "" }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`tap-target ${className}`} style={{
      fontFamily: "Inter", fontWeight: 600, fontSize: 15, cursor: disabled ? "not-allowed" : "pointer",
      padding: "13px 24px", borderRadius: 8, border: primary ? "none" : `1px solid ${LINE}`,
      background: primary ? (disabled ? ACCENT_DIM : ACCENT) : "transparent",
      color: primary ? ON_ACCENT : TEXT, opacity: disabled ? 0.6 : 1,
      display: "inline-flex", alignItems: "center", gap: 6,
      WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
      boxShadow: primary && !disabled ? "0 4px 18px rgba(125,46,55,0.22)" : "none",
      ...style,
    }}>
      {children}
    </button>
  );
}

function QuestionScreen({ question, value, onChange, detail, onDetailChange, compact }) {
  const set = (v) => onChange(question.id, v);
  const detailShouldShow = !question.detailVisibleIf || question.detailVisibleIf(value);
  const detailIsRequired = !!(question.requireDetailIf && question.requireDetailIf(value));
  const [detailOpen, setDetailOpen] = useState(!!detail || !!question.detailAutoOpen);
  useEffect(() => {
    if (question.detailAutoOpen && question.detailVisibleIf && question.detailVisibleIf(value)) {
      setDetailOpen(true);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: compact ? 6 : 22 }}>
        <h2 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: compact ? 17 : 22, lineHeight: 1.35, color: TEXT, margin: 0 }}>
          {question.text}
        </h2>
      </div>
      {question.type === "multi" && !question.optional && (
        <div style={{ fontFamily: "Inter", fontSize: 12, color: SUBTEXT, marginBottom: 14 }}>
          Multiple choice — select at least 1.
        </div>
      )}
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

      {question.type === "shorttext" && (
        <input type="text" value={value || ""}
          onChange={e => set(e.target.value)}
          maxLength={question.maxLength || undefined}
          autoCapitalize="characters"
          placeholder={question.placeholder || ""}
          style={{ ...inputStyle, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em" }} />
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
              background: value === i + 1 ? "rgba(125,46,55,0.12)" : "transparent",
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

      {question.type === "dualtext" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {question.subLabels.map((label, i) => {
            const key = i === 0 ? "a" : "b";
            const dv = value || {};
            return (
              <div key={label}>
                <label style={{ display: "block", fontFamily: "Inter", fontSize: 12, color: SUBTEXT, marginBottom: 6 }}>
                  {label}
                </label>
                <input
                  type="text"
                  value={dv[key] || ""}
                  onChange={e => set({ ...dv, [key]: e.target.value })}
                  placeholder="e.g. brand name(s), or leave blank"
                  style={inputStyle}
                />
              </div>
            );
          })}
        </div>
      )}

      {question.note && (
        <div style={{
          marginTop: 14, fontFamily: "Inter", fontSize: 12.5, color: SUBTEXT, lineHeight: 1.5,
          background: PANEL_2, border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 12px",
        }}>
          {question.note}
        </div>
      )}

      {(!question.detailVisibleIf || detailShouldShow) && (
        <div style={{ marginTop: 20 }}>
          {!detailOpen ? (
            <button onClick={() => setDetailOpen(true)} style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              fontFamily: "Inter", fontSize: 13, color: SUBTEXT, textDecoration: "underline",
            }}>
              + {question.detailLabel || "Add detail or context"}
            </button>
          ) : (
            <div>
              <label style={{ display: "block", fontFamily: "Inter", fontSize: 12, color: SUBTEXT, marginBottom: 6 }}>
                {question.detailLabel || "Anything you want to add about this one? (optional)"}
                {detailIsRequired && <span style={{ color: ACCENT }}> *required</span>}
              </label>
              <textarea
                value={detail || ""}
                onChange={e => onDetailChange(question.id, e.target.value)}
                placeholder={question.detailPlaceholder || "e.g. specific brand, exact spot it fits wrong, when it happens…"}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "Inter", borderColor: detailIsRequired && !(detail && detail.trim()) ? ACCENT_DIM : LINE }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InterstitialScreen({ question, onContinue, onBack, showBack }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <CheckCircle2 size={30} color={ACCENT} />
      <h2 style={{ fontFamily: "Bebas Neue", fontSize: 28, letterSpacing: "0.02em", color: TEXT, margin: "16px 0 6px" }}>
        {question.title}
      </h2>
      <p style={{ fontFamily: "Inter", fontSize: 14, color: SUBTEXT, marginBottom: 26 }}>
        {question.subtitle}
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        {showBack && (
          <Button onClick={onBack}><ChevronLeft size={16} /> Back</Button>
        )}
        <Button primary onClick={onContinue}>Continue <ChevronRight size={16} /></Button>
      </div>
    </div>
  );
}

function RankPicker({ options, value, onChange }) {
  const order = value && value.length === options.length ? value : options;
  const itemRefs = useRef({});
  const pendingFirstRects = useRef(null);

  const captureRects = () => {
    const rects = {};
    order.forEach(opt => {
      const el = itemRefs.current[opt];
      if (el) rects[opt] = el.getBoundingClientRect().top;
    });
    return rects;
  };

  const move = (idx, dir) => {
    const next = [...order];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    // Record each row's position before the reorder so we can animate from
    // "where it was" to "where it lands" (FLIP), instead of it snapping.
    pendingFirstRects.current = captureRects();
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  };

  // After the reorder has actually re-rendered the rows in their new spots,
  // slide each row back from its old position into place with a slow,
  // clearly-visible glide so it reads as "moving", not "jumping".
  useLayoutEffect(() => {
    const first = pendingFirstRects.current;
    if (!first) return;
    pendingFirstRects.current = null;
    order.forEach(opt => {
      const el = itemRefs.current[opt];
      const fromTop = first[opt];
      if (!el || fromTop === undefined) return;
      const toTop = el.getBoundingClientRect().top;
      const delta = fromTop - toTop;
      if (Math.abs(delta) < 1) return;
      el.style.transition = "none";
      el.style.transform = `translateY(${delta}px)`;
      el.getBoundingClientRect(); // force reflow so the jump above applies instantly
      requestAnimationFrame(() => {
        el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "translateY(0)";
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.join("|")]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {order.map((opt, i) => (
        <div
          key={opt}
          ref={el => { if (el) itemRefs.current[opt] = el; }}
          className="tap-target"
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 14px", borderRadius: 8, background: PANEL_2, border: `1px solid ${LINE}`,
            position: "relative", zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "Bebas Neue", fontSize: 20, color: ACCENT, width: 22 }}>{i + 1}</span>
            <span style={{ fontFamily: "Inter", fontSize: 15, color: TEXT }}>{opt}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => move(i, -1)} disabled={i === 0} className="tap-target" style={rankBtnStyle(i === 0)}>↑</button>
            <button onClick={() => move(i, 1)} disabled={i === order.length - 1} className="tap-target" style={rankBtnStyle(i === order.length - 1)}>↓</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const rankBtnStyle = (disabled) => ({
  width: 32, height: 32, borderRadius: 6, border: `1px solid ${LINE}`, background: "transparent",
  color: disabled ? SUBTEXT : TEXT, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
  WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
});

function OptionPill({ label, selected, onClick }) {
  return (
    <div onClick={onClick} className="tap-target opt-hover" style={{
      flex: 1, textAlign: "center", padding: "17px 0", borderRadius: 8, cursor: "pointer",
      fontFamily: "Inter", fontWeight: 600, fontSize: 15,
      border: `1.5px solid ${selected ? ACCENT : LINE}`,
      background: selected ? "rgba(125,46,55,0.14)" : "transparent",
      color: selected ? ACCENT : TEXT,
      WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
    }}>
      {label}
    </div>
  );
}

function OptionRow({ label, selected, onClick, checkbox }) {
  return (
    <div onClick={onClick} className="tap-target opt-hover" style={{
      display: "flex", alignItems: "center", gap: 10, padding: "14px 14px", borderRadius: 8, cursor: "pointer",
      border: `1.5px solid ${selected ? ACCENT : LINE}`,
      background: selected ? "rgba(125,46,55,0.10)" : "transparent",
      WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
    }}>
      <div className="tap-target" style={{
        width: 18, height: 18, borderRadius: checkbox ? 4 : 9, flexShrink: 0,
        border: `1.5px solid ${selected ? ACCENT : SUBTEXT}`,
        background: selected ? ACCENT : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {selected && <span className="pop-in"><CheckCircle2 size={14} color={ON_ACCENT} strokeWidth={3} /></span>}
      </div>
      <span style={{ fontFamily: "Inter", fontSize: 15, color: TEXT }}>{label}</span>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "14px 16px", borderRadius: 8, border: `1px solid ${LINE}`,
  background: PANEL_2, color: TEXT, fontFamily: "Inter", fontSize: 16, outline: "none", boxSizing: "border-box",
  transition: "border-color 0.18s ease, box-shadow 0.18s ease",
};

function isAnswered(q, value) {
  if (q.optional) return true;
  if (q.type === "interstitial") return true;
  if (q.type === "multi") return Array.isArray(value) && value.length > 0;
  if (q.type === "number") return value !== undefined && value !== "" && value !== null;
  if (q.type === "shorttext") return typeof value === "string" && value.trim().length > 0;
  if (q.type === "dualtext") return true; // dualtext questions are treated as optional by default
  return value !== undefined && value !== null && value !== "";
}

// A field counts as complete once its main answer is given, and — if it has
// a conditionally-required detail box (e.g. "how long?" after a Yes) — once
// that detail is filled in too.
function isFieldComplete(q, value, detail) {
  if (!isAnswered(q, value)) return false;
  if (q.requireDetailIf && q.requireDetailIf(value)) {
    return !!(detail && detail.trim());
  }
  return true;
}

// Groups consecutive questions that share the same `page` key onto a single
// screen, so e.g. age + gender can be answered together before moving on.
function buildPages(qs) {
  const pages = [];
  let i = 0;
  while (i < qs.length) {
    const q = qs[i];
    if (q.page) {
      const group = [q];
      let j = i + 1;
      while (j < qs.length && qs[j].page === q.page) {
        group.push(qs[j]);
        j++;
      }
      pages.push(group);
      i = j;
    } else {
      pages.push([q]);
      i++;
    }
  }
  return pages;
}

// Test-mode answers are kept in sessionStorage (not localStorage) so they
// survive backgrounding/returning to the tab within the same browsing
// session, but never linger indefinitely or leak into a fresh session.
function testProgressKey(surveyKey) {
  return `testProgress_${surveyKey}`;
}
function loadTestProgress(surveyKey) {
  try {
    const raw = sessionStorage.getItem(testProgressKey(surveyKey));
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function saveTestProgress(surveyKey, data) {
  try { sessionStorage.setItem(testProgressKey(surveyKey), JSON.stringify(data)); } catch (e) {}
}
function clearTestProgress(surveyKey) {
  try { sessionStorage.removeItem(testProgressKey(surveyKey)); } catch (e) {}
}

function Survey({ survey, onDone, isTest }) {
  const saved = isTest ? loadTestProgress(survey.key) : null;
  const [step, setStep] = useState(saved?.step ?? 0);
  const [answers, setAnswers] = useState(saved?.answers ?? {});
  const [details, setDetails] = useState(saved?.details ?? {});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const qs = visibleQuestions(answers, survey.questions, survey.conditional);
  const pages = buildPages(qs);
  const page = pages[step] || [];
  const isInterstitialPage = page.length === 1 && page[0].type === "interstitial";
  const realPageCount = pages.filter(p => !(p.length === 1 && p[0].type === "interstitial")).length;
  const realPageIndex = pages.slice(0, step + 1).filter(p => !(p.length === 1 && p[0].type === "interstitial")).length;
  const pageComplete = page.every(fq => isFieldComplete(fq, answers[fq.id], details[fq.id]));

  // Keep test-mode progress saved as it changes, so leaving the tab (or the
  // app view) and coming back resumes exactly where it left off.
  useEffect(() => {
    if (isTest) saveTestProgress(survey.key, { step, answers, details });
  }, [isTest, survey.key, step, answers, details]);

  const setAnswer = (id, val) => setAnswers(a => ({ ...a, [id]: val }));
  const setDetail = (id, val) => setDetails(d => ({ ...d, [id]: val }));

  const next = async () => {
    if (step < pages.length - 1) {
      setStep(step + 1);
    } else if (isTest) {
      // Test mode never writes to the database — nothing to save, so just
      // clear the saved test progress and finish.
      clearTestProgress(survey.key);
      onDone(null);
    } else {
      setSaving(true);
      setSubmitError(null);
      try {
        const cleanDetails = Object.fromEntries(Object.entries(details).filter(([, v]) => v && v.trim()));
        const { data, error } = await supabase.from(survey.table).insert({
          answers,
          details: cleanDetails,
        }).select().single();
        if (error) throw error;
        onDone(data ? data.id : null);
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
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, maxWidth: 560, width: "100%", margin: "0 auto", padding: "28px 20px 110px" }}>
        {isTest && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
            background: "rgba(125,46,55,0.14)", border: `1px solid ${ACCENT_DIM}`, borderRadius: 8,
            padding: "10px 14px", fontFamily: "Inter", fontSize: 12.5, color: TEXT,
          }}>
            <FlaskConical size={15} color={ACCENT} style={{ flexShrink: 0 }} />
            Test mode — these answers won't be saved or counted in the results.
          </div>
        )}
        <ProgressPlates current={step} total={pages.length} />
        {!isInterstitialPage && (
          <div style={{ fontFamily: "Inter", fontSize: 12, color: SUBTEXT, marginBottom: 14, letterSpacing: "0.04em" }}>
            QUESTION {realPageIndex} OF {realPageCount}
          </div>
        )}
        <div key={page.map(fq => fq.id).join("-")} className="q-anim" style={{
          background: PANEL, border: `1px solid ${LINE}`, borderRadius: 14, boxShadow: "var(--panel-shadow)",
          padding: isInterstitialPage ? "8px 20px" : "24px 20px",
        }}>
          {isInterstitialPage ? (
            <InterstitialScreen question={page[0]} onContinue={next} onBack={back} showBack={step > 0} />
          ) : (
            page.map((fq, idx) => (
              <div key={fq.id}>
                {idx > 0 && <div style={{ height: 1, background: LINE_STRONG, margin: "26px 0" }} />}
                <QuestionScreen question={fq} value={answers[fq.id]} onChange={setAnswer}
                  detail={details[fq.id]} onDetailChange={setDetail} compact={page.length > 1} />
              </div>
            ))
          )}
        </div>
        {submitError && (
          <div style={{ marginTop: 16, fontFamily: "Inter", fontSize: 13, color: ERROR }}>
            {submitError}
          </div>
        )}
      </div>
      {!isInterstitialPage && (
        <div style={{
          position: "fixed", left: 0, right: 0, bottom: 0,
          background: `linear-gradient(to top, ${BG} 55%, rgba(27,30,36,0))`,
          paddingTop: 24,
        }}>
          <div style={{
            maxWidth: 560, margin: "0 auto", padding: "0 20px",
            paddingBottom: "calc(18px + env(safe-area-inset-bottom, 0px))",
            display: "flex", justifyContent: "space-between",
          }}>
            <Button onClick={back} style={{ visibility: step === 0 ? "hidden" : "visible" }}>
              <ChevronLeft size={16} /> Back
            </Button>
            <Button primary disabled={!pageComplete || saving} onClick={next}>
              {saving ? "Saving…" : step === pages.length - 1 ? "Submit" : "Next"} <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ThankYou({ table, responseId, onViewResults }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(null);

  const submitEmail = async () => {
    if (!email.trim()) return;
    setSending(true);
    setErr(null);
    try {
      if (responseId) {
        const { error } = await supabase.from(table).update({ contact_email: email.trim() }).eq("id", responseId);
        if (error) throw error;
      }
      setSent(true);
    } catch (e) {
      console.error("Storage error", e);
      setErr("Couldn't save that — check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="view-fade" style={{ maxWidth: 480, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <span className="pop-in" style={{ display: "inline-flex" }}><Logo size={36} /></span>
      <h1 style={{ fontFamily: "Bebas Neue", fontSize: 34, letterSpacing: "0.02em", color: TEXT, margin: "18px 0 8px" }}>
        LOGGED
      </h1>
      <p style={{ fontFamily: "Inter", color: SUBTEXT, fontSize: 15, lineHeight: 1.6 }}>
        Thanks — your answers are in. The questionnaire is finished either way; everything below is optional. If you want to fill it out again for someone else nearby, refresh the page.
      </p>

      <div style={{ marginTop: 30, textAlign: "left", background: PANEL, border: `1px solid ${LINE}`, borderRadius: 12, padding: "20px 20px", boxShadow: "var(--panel-shadow)" }}>
        <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 14, color: TEXT, marginBottom: 4 }}>
          Willing to take other questionnaires?
        </div>
        <div style={{ fontFamily: "Inter", fontSize: 12, color: SUBTEXT, marginBottom: 14 }}>
          Optional — leave your email if you'd be happy to be contacted about other surveys. This doesn't affect the answers you've just submitted.
        </div>
        {sent ? (
          <div style={{ fontFamily: "Inter", fontSize: 13, color: ACCENT }}>Thanks — you're on the list.</div>
        ) : (
          <>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={inputStyle}
              onKeyDown={e => e.key === "Enter" && submitEmail()}
            />
            {err && <div style={{ marginTop: 8, fontFamily: "Inter", fontSize: 12, color: ERROR }}>{err}</div>}
            <div style={{ marginTop: 12 }}>
              <Button primary disabled={!email.trim() || sending} onClick={submitEmail} style={{ padding: "10px 20px", fontSize: 14 }}>
                {sending ? "Saving…" : "Send"}
              </Button>
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: 26 }}>
        <button onClick={onViewResults} className="tap-target" style={{
          background: "none", border: "none", color: SUBTEXT, fontFamily: "Inter", fontSize: 12,
          cursor: "pointer", textDecoration: "underline", opacity: 0.6,
        }}>
          Creator access
        </button>
      </div>
    </div>
  );
}

function TestThankYou({ onBack }) {
  return (
    <div className="view-fade" style={{ maxWidth: 480, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <span className="pop-in" style={{ display: "inline-flex" }}><FlaskConical size={32} color={ACCENT} /></span>
      <h1 style={{ fontFamily: "Bebas Neue", fontSize: 34, letterSpacing: "0.02em", color: TEXT, margin: "18px 0 8px" }}>
        TEST COMPLETE
      </h1>
      <p style={{ fontFamily: "Inter", color: SUBTEXT, fontSize: 15, lineHeight: 1.6 }}>
        Nothing was saved — that was just a test run-through of the questions. Real submissions and results aren't affected.
      </p>
      <div style={{ marginTop: 26 }}>
        <Button primary onClick={onBack}>Back to results <ChevronRight size={16} /></Button>
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
    else { setError(true); setTimeout(() => setError(false), 500); }
  };
  return (
    <div className="view-fade" style={{ maxWidth: 360, margin: "0 auto", padding: "100px 20px", textAlign: "center" }}>
      <span className="pop-in" style={{ display: "inline-flex" }}><Lock size={28} color={ACCENT} /></span>
      <h2 style={{ fontFamily: "Bebas Neue", fontSize: 26, color: TEXT, margin: "16px 0 4px" }}>CREATOR ACCESS</h2>
      <p style={{ fontFamily: "Inter", fontSize: 13, color: SUBTEXT, marginBottom: 20 }}>
        This is a soft gate, not real security — anyone with the code (or the page source) can view results.
      </p>
      <input type="password" value={code} onChange={e => setCode(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
        className={error ? "shake" : ""}
        placeholder="Passcode" style={{ ...inputStyle, textAlign: "center", borderColor: error ? ERROR : LINE }} />
      <div style={{ marginTop: 16 }}>
        <Button primary onClick={submit}>Unlock</Button>
      </div>
    </div>
  );
}

// Real-time: loads once, then listens for INSERTs on the table instead of
// polling. Falls back to a slow poll too, in case a realtime event is missed.
const FALLBACK_POLL_MS = 30000;

function useResponses(active, table) {
  const [responses, setResponses] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setResponses(null); // reset when switching tables

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from(table)
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
      .channel(`${table}_changes`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table }, load)
      .subscribe();

    const interval = setInterval(load, FALLBACK_POLL_MS);

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [active, table]);

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
  if (question.type === "dualtext") {
    const entries = answered.filter(v => v && ((v.a && v.a.trim()) || (v.b && v.b.trim())));
    const data = entries.map(v => ({ a: v.a || "", b: v.b || "" }));
    return { kind: "dualtext", data, n: entries.length };
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

function formatAnswerValue(question, value) {
  if (value === undefined || value === null || value === "") return "—";
  if (question.type === "multi") return Array.isArray(value) && value.length ? value.join(", ") : "—";
  if (question.type === "rank") return Array.isArray(value) ? value.map((v, i) => `${i + 1}. ${v}`).join("  ·  ") : "—";
  if (question.type === "dualtext") {
    const parts = [value.a, value.b].filter(v => v && v.trim());
    return parts.length ? parts.join("  /  ") : "—";
  }
  if (question.type === "scale") return question.labels ? question.labels[Number(value) - 1] || value : value;
  return String(value);
}

function RespondentBreakdown({ survey, responses }) {
  const [openIdx, setOpenIdx] = useState(null);
  const hasInitials = survey.questions.some(q => q.id === "respondentInitials");
  if (!hasInitials) return null;
  const detailQuestions = survey.questions.filter(q => q.type !== "interstitial" && q.id !== "respondentInitials");

  return (
    <div style={{ marginBottom: 30, paddingBottom: 26, borderBottom: `1px solid ${LINE}` }}>
      <h3 style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 15, color: TEXT, margin: "0 0 4px" }}>
        Responses by initials
      </h3>
      <div style={{ fontFamily: "Inter", fontSize: 12, color: SUBTEXT, marginBottom: 12 }}>
        Tap a set of initials to see everything that respondent answered.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {responses.map((r, i) => {
          const initials = (r.answers.respondentInitials || "—").toString().toUpperCase();
          const isOpen = openIdx === i;
          return (
            <button key={i} onClick={() => setOpenIdx(isOpen ? null : i)} className="tap-target" style={{
              fontFamily: "Inter", fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 8,
              border: `1.5px solid ${isOpen ? ACCENT : LINE}`,
              background: isOpen ? "rgba(125,46,55,0.14)" : "transparent",
              color: isOpen ? ACCENT : TEXT, cursor: "pointer",
              WebkitTapHighlightColor: "transparent", touchAction: "manipulation",
            }}>
              {initials}
            </button>
          );
        })}
      </div>

      {openIdx !== null && responses[openIdx] && (
        <div className="q-anim" style={{ marginTop: 16, background: PANEL, border: `1px solid ${LINE}`, borderRadius: 10, padding: "6px 18px" }}>
          {detailQuestions.map(q => (
            <div key={q.id} style={{
              display: "flex", justifyContent: "space-between", gap: 16, padding: "10px 0",
              borderBottom: `1px solid ${LINE}`,
            }}>
              <span style={{ fontFamily: "Inter", fontSize: 13, color: SUBTEXT, maxWidth: "55%" }}>{q.text}</span>
              <span style={{ fontFamily: "Inter", fontSize: 13, color: TEXT, textAlign: "right" }}>
                {formatAnswerValue(q, responses[openIdx].answers[q.id])}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultsView({ survey, responses, lastUpdated, onStartTest }) {
  const total = responses.length;
  const questions = survey.questions.filter(q => q.type !== "interstitial" && q.id !== "respondentInitials");
  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 20px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <BarChart3 size={22} color={ACCENT} />
          <h1 style={{ fontFamily: "Bebas Neue", fontSize: 30, color: TEXT, margin: 0, letterSpacing: "0.02em" }}>
            RESULTS — {survey.shortTitle.toUpperCase()}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Inter", fontSize: 11, color: SUBTEXT }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: SUCCESS, display: "inline-block", boxShadow: "0 0 0 3px var(--success-glow)" }} />
            Live{lastUpdated ? ` · updated ${lastUpdated.toLocaleTimeString()}` : ""}
          </span>
          {onStartTest && !survey.legacy && (
            <Button onClick={onStartTest} style={{ padding: "7px 14px", fontSize: 12.5 }}>
              <FlaskConical size={13} /> Test answers
            </Button>
          )}
        </div>
      </div>
      <p style={{ fontFamily: "Inter", fontSize: 13, color: SUBTEXT, marginBottom: 30 }}>
        {total} total submission{total === 1 ? "" : "s"}, updating in real time. Questions marked <NewBadge /> have fewer responses since they were added later — read percentages on those with caution.
      </p>

      <RespondentBreakdown survey={survey} responses={responses} />

      {survey.legacy && (
        <>
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
        </>
      )}

      {questions.map(q => {
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

            {agg.kind === "dualtext" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {agg.data.length === 0 && <div style={{ fontFamily: "Inter", fontSize: 13, color: SUBTEXT, fontStyle: "italic" }}>No responses yet.</div>}
                {agg.data.map((d, i) => (
                  <div key={i} style={{
                    display: "flex", flexDirection: "column", gap: 4, fontFamily: "Inter", fontSize: 13,
                    background: PANEL, border: `1px solid ${LINE}`, borderRadius: 6, padding: "10px 12px",
                  }}>
                    {d.a && <div><span style={{ color: SUBTEXT }}>{q.subLabels[0]}: </span><span style={{ color: TEXT }}>{d.a}</span></div>}
                    {d.b && <div><span style={{ color: SUBTEXT }}>{q.subLabels[1]}: </span><span style={{ color: TEXT }}>{d.b}</span></div>}
                  </div>
                ))}
              </div>
            )}

            {agg.n === 0 && agg.kind !== "dualtext" && <div style={{ fontFamily: "Inter", fontSize: 13, color: SUBTEXT, fontStyle: "italic" }}>No responses yet.</div>}

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

// --- Theme persistence (survives reloads, via localStorage) ---------------
const THEME_KEY = "gymSurveyTheme";
function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  } catch (e) {}
  return "dark";
}

// --- App-level view persistence --------------------------------------------
// Keeps track of which screen (and which results tab / test mode) the person
// was on, in sessionStorage, so switching away from the tab and coming back
// — or an accidental reload — drops them back where they were instead of
// resetting to the start.
const APP_STATE_KEY = "gymSurveyAppState";
function loadAppState() {
  try {
    const raw = sessionStorage.getItem(APP_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function saveAppState(state) {
  try { sessionStorage.setItem(APP_STATE_KEY, JSON.stringify(state)); } catch (e) {}
}

export default function App() {
  useFonts();
  const survey = SURVEYS.v2; // the questionnaire people fill out is always the current one
  const urlWantsResults = wantsResultsFromUrl();
  // Only ever auto-resume into the test flow (never straight into "results",
  // which stays behind the passcode gate on every fresh load/reload).
  const restored = !urlWantsResults ? loadAppState() : null;
  const resumeTest = restored && (restored.view === "testSurvey" || restored.view === "testThanks");

  // view: survey | thanks | gate | results | testSurvey | testThanks
  const [view, setView] = useState(() => (urlWantsResults ? "gate" : resumeTest ? restored.view : "survey"));
  const [resultsSurveyKey, setResultsSurveyKey] = useState("v2"); // which results are being viewed — v1 is results-only
  const [preTestView, setPreTestView] = useState(resumeTest ? (restored.preTestView || "results") : "results"); // where "test answers" was launched from
  const [lastResponseId, setLastResponseId] = useState(null);
  const [theme, setTheme] = useState(getInitialTheme);
  const resultsSurvey = SURVEYS[resultsSurveyKey];
  const isResultsActive = view === "results";
  const { responses, error, lastUpdated } = useResponses(isResultsActive, resultsSurvey.table);

  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }, [theme]);

  // Only persist/resume navigation state for the test flow: leaving the tab
  // (or reloading) mid-test-run drops the person back into it; leaving test
  // mode clears the saved state so normal navigation is never affected.
  useEffect(() => {
    if (view === "testSurvey" || view === "testThanks") {
      saveAppState({ view, preTestView });
    } else {
      saveAppState(null);
    }
  }, [view, preTestView]);

  const startTest = () => {
    setPreTestView("results");
    setView("testSurvey");
  };
  const exitTest = () => setView(preTestView);

  return (
    <div className="ambient-bg" style={{ minHeight: "100vh", background: BG, color: TEXT }}>
      <GlobalStyles />
      <div style={{
        position: "sticky", top: 0, zIndex: 10, borderBottom: `1px solid ${LINE}`, padding: "16px 20px",
        background: "var(--header-bg)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "Bebas Neue", fontSize: 20, letterSpacing: "0.03em", color: TEXT }}>
            <Logo size={20} />
            {view === "results" ? resultsSurvey.title : view === "testSurvey" || view === "testThanks" ? `${survey.title} — TEST` : survey.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {view === "testSurvey" || view === "testThanks" ? (
              <Button onClick={exitTest} style={{ padding: "8px 16px", fontSize: 13 }}>
                <X size={14} /> Exit test
              </Button>
            ) : view !== "survey" && (
              <Button onClick={() => setView("survey")} style={{ padding: "8px 16px", fontSize: 13 }}>
                <ChevronLeft size={14} /> Back to survey
              </Button>
            )}
            {view !== "gate" && view !== "results" && view !== "testSurvey" && view !== "testThanks" && (
              <button
                onClick={() => setView("gate")}
                className="tap-target"
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  fontFamily: "Inter", fontSize: 11, color: TEXT_FAINT,
                  textDecoration: "underline",
                }}
              >
                results
              </button>
            )}
            {view === "results" && (
              <button
                onClick={() => setResultsSurveyKey(k => (k === "v2" ? "v1" : "v2"))}
                className="tap-target"
                style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  fontFamily: "Inter", fontSize: 11, color: TEXT_FAINT,
                  textDecoration: "underline",
                }}
              >
                {resultsSurveyKey === "v2" ? "view archived survey results" : "back to AR survey results"}
              </button>
            )}
            <ThemeToggle theme={theme} onToggle={() => setTheme(t => (t === "dark" ? "light" : "dark"))} />
          </div>
        </div>
      </div>

      <div key={`${view}-${resultsSurveyKey}`} className="view-fade">
        {view === "survey" && <Survey survey={survey} onDone={(id) => { setLastResponseId(id); setView("thanks"); }} />}
        {view === "testSurvey" && <Survey survey={survey} isTest onDone={() => setView("testThanks")} />}
        {view === "testThanks" && <TestThankYou onBack={exitTest} />}
        {view === "thanks" && <ThankYou table={survey.table} responseId={lastResponseId} onViewResults={() => setView("gate")} />}
        {view === "gate" && <PasscodeGate onUnlock={() => setView("results")} />}
        {view === "results" && (
          responses === null
            ? <div style={{ textAlign: "center", padding: 80, fontFamily: "Inter", color: SUBTEXT }}>Loading responses…</div>
            : error
              ? <div style={{ textAlign: "center", padding: 80, fontFamily: "Inter", color: ERROR }}>{error}</div>
              : <ResultsView survey={resultsSurvey} responses={responses} lastUpdated={lastUpdated} onStartTest={startTest} />
        )}
      </div>
    </div>
  );
}
