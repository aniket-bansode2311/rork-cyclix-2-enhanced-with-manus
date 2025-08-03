import { Symptom } from "@/types/cycle";

export const symptoms: Symptom[] = [
  // Mood symptoms
  {
    id: "mood-happy",
    name: "Happy",
    icon: "smile",
    category: "mood",
  },
  {
    id: "mood-sad",
    name: "Sad",
    icon: "frown",
    category: "mood",
  },
  {
    id: "mood-irritable",
    name: "Irritable",
    icon: "angry",
    category: "mood",
  },
  {
    id: "mood-anxious",
    name: "Anxious",
    icon: "alert-circle",
    category: "mood",
  },
  {
    id: "mood-tired",
    name: "Tired",
    icon: "battery-low",
    category: "mood",
  },
  {
    id: "mood-energetic",
    name: "Energetic",
    icon: "zap",
    category: "mood",
  },
  {
    id: "mood-emotional",
    name: "Emotional",
    icon: "heart",
    category: "mood",
  },
  {
    id: "mood-stressed",
    name: "Stressed",
    icon: "alert-triangle",
    category: "mood",
  },
  {
    id: "mood-calm",
    name: "Calm",
    icon: "leaf",
    category: "mood",
  },
  {
    id: "mood-confident",
    name: "Confident",
    icon: "star",
    category: "mood",
  },
  
  // Physical Pain symptoms
  {
    id: "pain-cramps",
    name: "Cramps",
    icon: "activity",
    category: "pain",
  },
  {
    id: "pain-headache",
    name: "Headache",
    icon: "brain",
    category: "pain",
  },
  {
    id: "pain-backache",
    name: "Back Pain",
    icon: "user",
    category: "pain",
  },
  {
    id: "pain-breast-tenderness",
    name: "Breast Tenderness",
    icon: "heart",
    category: "pain",
  },
  {
    id: "pain-joint-pain",
    name: "Joint Pain",
    icon: "zap",
    category: "pain",
  },
  {
    id: "pain-muscle-aches",
    name: "Muscle Aches",
    icon: "activity",
    category: "pain",
  },
  {
    id: "pain-pelvic-pain",
    name: "Pelvic Pain",
    icon: "circle",
    category: "pain",
  },
  {
    id: "pain-ovulation-pain",
    name: "Ovulation Pain",
    icon: "target",
    category: "pain",
  },
  
  // Physical Body symptoms
  {
    id: "body-bloating",
    name: "Bloating",
    icon: "droplet",
    category: "body",
  },
  {
    id: "body-acne",
    name: "Acne",
    icon: "circle",
    category: "body",
  },
  {
    id: "body-nausea",
    name: "Nausea",
    icon: "alert-circle",
    category: "body",
  },
  {
    id: "body-dizziness",
    name: "Dizziness",
    icon: "rotate-cw",
    category: "body",
  },
  {
    id: "body-hot-flashes",
    name: "Hot Flashes",
    icon: "thermometer",
    category: "body",
  },
  {
    id: "body-cold-chills",
    name: "Cold Chills",
    icon: "snowflake",
    category: "body",
  },
  {
    id: "body-constipation",
    name: "Constipation",
    icon: "pause",
    category: "body",
  },
  {
    id: "body-diarrhea",
    name: "Diarrhea",
    icon: "fast-forward",
    category: "body",
  },
  {
    id: "body-weight-gain",
    name: "Weight Gain",
    icon: "trending-up",
    category: "body",
  },
  {
    id: "body-swollen-breasts",
    name: "Swollen Breasts",
    icon: "heart",
    category: "body",
  },
  
  // Discharge symptoms
  {
    id: "discharge-clear",
    name: "Clear Discharge",
    icon: "droplet",
    category: "discharge",
  },
  {
    id: "discharge-white",
    name: "White Discharge",
    icon: "droplet",
    category: "discharge",
  },
  {
    id: "discharge-yellow",
    name: "Yellow Discharge",
    icon: "droplet",
    category: "discharge",
  },
  {
    id: "discharge-sticky",
    name: "Sticky Discharge",
    icon: "droplets",
    category: "discharge",
  },
  {
    id: "discharge-creamy",
    name: "Creamy Discharge",
    icon: "droplets",
    category: "discharge",
  },
  {
    id: "discharge-egg-white",
    name: "Egg White Discharge",
    icon: "droplets",
    category: "discharge",
  },
  
  // Energy & Sleep symptoms
  {
    id: "energy-high",
    name: "High Energy",
    icon: "zap",
    category: "energy",
  },
  {
    id: "energy-low",
    name: "Low Energy",
    icon: "battery-low",
    category: "energy",
  },
  {
    id: "sleep-insomnia",
    name: "Insomnia",
    icon: "moon",
    category: "energy",
  },
  {
    id: "sleep-restless",
    name: "Restless Sleep",
    icon: "moon",
    category: "energy",
  },
  {
    id: "sleep-vivid-dreams",
    name: "Vivid Dreams",
    icon: "cloud",
    category: "energy",
  },
  {
    id: "sleep-good-quality",
    name: "Good Sleep",
    icon: "moon",
    category: "energy",
  },
  
  // Lifestyle factors
  {
    id: "lifestyle-exercise-light",
    name: "Light Exercise",
    icon: "activity",
    category: "lifestyle",
  },
  {
    id: "lifestyle-exercise-moderate",
    name: "Moderate Exercise",
    icon: "activity",
    category: "lifestyle",
  },
  {
    id: "lifestyle-exercise-intense",
    name: "Intense Exercise",
    icon: "zap",
    category: "lifestyle",
  },
  {
    id: "lifestyle-yoga",
    name: "Yoga",
    icon: "user",
    category: "lifestyle",
  },
  {
    id: "lifestyle-meditation",
    name: "Meditation",
    icon: "circle",
    category: "lifestyle",
  },
  {
    id: "lifestyle-stress-high",
    name: "High Stress",
    icon: "alert-triangle",
    category: "lifestyle",
  },
  {
    id: "lifestyle-stress-low",
    name: "Low Stress",
    icon: "leaf",
    category: "lifestyle",
  },
  {
    id: "lifestyle-alcohol",
    name: "Alcohol",
    icon: "wine",
    category: "lifestyle",
  },
  {
    id: "lifestyle-caffeine",
    name: "Caffeine",
    icon: "coffee",
    category: "lifestyle",
  },
  {
    id: "lifestyle-water-low",
    name: "Low Water Intake",
    icon: "droplet",
    category: "lifestyle",
  },
  {
    id: "lifestyle-water-good",
    name: "Good Hydration",
    icon: "droplets",
    category: "lifestyle",
  },
  
  // Appetite & Cravings
  {
    id: "appetite-increased",
    name: "Increased Appetite",
    icon: "plus",
    category: "appetite",
  },
  {
    id: "appetite-decreased",
    name: "Decreased Appetite",
    icon: "minus",
    category: "appetite",
  },
  {
    id: "cravings-sweet",
    name: "Sweet Cravings",
    icon: "cookie",
    category: "appetite",
  },
  {
    id: "cravings-salty",
    name: "Salty Cravings",
    icon: "circle",
    category: "appetite",
  },
  {
    id: "cravings-chocolate",
    name: "Chocolate Cravings",
    icon: "heart",
    category: "appetite",
  },
  {
    id: "cravings-carbs",
    name: "Carb Cravings",
    icon: "cookie",
    category: "appetite",
  },
  
  // Intimacy & Sexual Health
  {
    id: "intimacy-high-libido",
    name: "High Libido",
    icon: "heart",
    category: "intimacy",
  },
  {
    id: "intimacy-low-libido",
    name: "Low Libido",
    icon: "heart",
    category: "intimacy",
  },
  {
    id: "intimacy-intercourse",
    name: "Intercourse",
    icon: "heart",
    category: "intimacy",
  },
  {
    id: "intimacy-protected",
    name: "Protected Intercourse",
    icon: "shield",
    category: "intimacy",
  },
  {
    id: "intimacy-orgasm",
    name: "Orgasm",
    icon: "star",
    category: "intimacy",
  },
  
  // Tests & Medications
  {
    id: "test-ovulation",
    name: "Ovulation Test",
    icon: "check-circle",
    category: "tests",
  },
  {
    id: "test-pregnancy",
    name: "Pregnancy Test",
    icon: "baby",
    category: "tests",
  },
  {
    id: "medication-pain-relief",
    name: "Pain Relief",
    icon: "pill",
    category: "tests",
  },
  {
    id: "medication-birth-control",
    name: "Birth Control",
    icon: "shield",
    category: "tests",
  },
  {
    id: "medication-supplements",
    name: "Supplements",
    icon: "plus",
    category: "tests",
  },
  
  // Pregnancy-specific symptoms
  {
    id: "pregnancy-morning-sickness",
    name: "Morning Sickness",
    icon: "alert-circle",
    category: "pregnancy",
  },
  {
    id: "pregnancy-fatigue",
    name: "Pregnancy Fatigue",
    icon: "battery-low",
    category: "pregnancy",
  },
  {
    id: "pregnancy-heartburn",
    name: "Heartburn",
    icon: "flame",
    category: "pregnancy",
  },
  {
    id: "pregnancy-back-pain",
    name: "Pregnancy Back Pain",
    icon: "user",
    category: "pregnancy",
  },
  {
    id: "pregnancy-swelling",
    name: "Swelling",
    icon: "droplets",
    category: "pregnancy",
  },
  {
    id: "pregnancy-braxton-hicks",
    name: "Braxton Hicks",
    icon: "activity",
    category: "pregnancy",
  },
  {
    id: "pregnancy-mood-swings",
    name: "Pregnancy Mood Swings",
    icon: "heart",
    category: "pregnancy",
  },
  {
    id: "pregnancy-frequent-urination",
    name: "Frequent Urination",
    icon: "droplet",
    category: "pregnancy",
  },
  {
    id: "pregnancy-constipation",
    name: "Pregnancy Constipation",
    icon: "pause",
    category: "pregnancy",
  },
  {
    id: "pregnancy-leg-cramps",
    name: "Leg Cramps",
    icon: "zap",
    category: "pregnancy",
  },
  {
    id: "pregnancy-shortness-breath",
    name: "Shortness of Breath",
    icon: "wind",
    category: "pregnancy",
  },
  {
    id: "pregnancy-round-ligament-pain",
    name: "Round Ligament Pain",
    icon: "activity",
    category: "pregnancy",
  },
];

export const getSymptomsByCategory = (category: string) => {
  return symptoms.filter(symptom => symptom.category === category);
};

export const getSymptomById = (id: string) => {
  return symptoms.find(symptom => symptom.id === id);
};

export const symptomCategories = [
  { id: 'mood', name: 'Mood', icon: 'smile' },
  { id: 'pain', name: 'Pain', icon: 'activity' },
  { id: 'body', name: 'Physical', icon: 'user' },
  { id: 'discharge', name: 'Discharge', icon: 'droplets' },
  { id: 'energy', name: 'Energy & Sleep', icon: 'battery' },
  { id: 'lifestyle', name: 'Lifestyle', icon: 'heart' },
  { id: 'appetite', name: 'Appetite', icon: 'cookie' },
  { id: 'intimacy', name: 'Intimacy', icon: 'heart' },
  { id: 'tests', name: 'Tests & Meds', icon: 'pill' },
  { id: 'pregnancy', name: 'Pregnancy', icon: 'baby' },
];