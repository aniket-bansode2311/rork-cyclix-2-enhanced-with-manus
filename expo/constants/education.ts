export interface EducationArticle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  content: string;
  category: 'cycle' | 'health' | 'fertility' | 'pregnancy';
}

export const educationArticles: EducationArticle[] = [
  {
    id: '1',
    title: 'Understanding Your Menstrual Cycle',
    description: 'Learn about the four phases of your menstrual cycle and how they affect your body.',
    imageUrl: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bWVuc3RydWFsJTIwY3ljbGV8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60',
    content: 'The menstrual cycle is typically a 28-day cycle, but can range from 21 to 35 days. It consists of four main phases: menstruation, the follicular phase, ovulation, and the luteal phase.\n\nMenstruation is the phase when the uterine lining sheds, resulting in your period. This typically lasts 3-7 days.\n\nThe follicular phase starts on the first day of your period and ends with ovulation. During this time, follicles in your ovaries develop and estrogen levels rise.\n\nOvulation occurs when a mature egg is released from the ovary, usually around day 14 of a 28-day cycle. The egg travels down the fallopian tube where it may be fertilized by sperm.\n\nThe luteal phase follows ovulation and lasts until your next period begins. If the egg isn\'t fertilized, hormone levels drop, triggering your period to begin again.',
    category: 'cycle',
  },
  {
    id: '2',
    title: 'Signs of Ovulation',
    description: 'Recognize the physical signs that indicate you\'re ovulating.',
    imageUrl: 'https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8b3Z1bGF0aW9ufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    content: 'Ovulation typically occurs around the middle of your cycle, about 14 days before your next period starts. Recognizing the signs of ovulation can help you better understand your fertility window.\n\nCommon signs of ovulation include:\n\n- Changes in cervical mucus: It becomes clearer, slippery, and stretchy, similar to egg whites\n- Slight increase in basal body temperature\n- Mild pelvic or lower abdominal pain (mittelschmerz)\n- Increased sex drive\n- Heightened sense of smell, taste, or vision\n- Light spotting\n- Breast tenderness\n- Bloating\n\nTracking these symptoms over several cycles can help you identify patterns and predict when you\'re most likely to ovulate.',
    category: 'fertility',
  },
  {
    id: '3',
    title: 'Managing PMS Symptoms',
    description: 'Effective strategies to reduce premenstrual syndrome symptoms.',
    imageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cG1zfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    content: 'Premenstrual Syndrome (PMS) affects many women in the days leading up to their period. Symptoms can include mood swings, irritability, fatigue, bloating, breast tenderness, food cravings, and more.\n\nHere are some strategies that may help manage PMS symptoms:\n\n- Regular exercise: Even light activities like walking can help reduce symptoms\n- Balanced diet: Reduce salt, sugar, caffeine, and alcohol intake\n- Stress management: Try yoga, meditation, or deep breathing exercises\n- Adequate sleep: Aim for 7-8 hours per night\n- Supplements: Some women find relief with calcium, magnesium, vitamin B6, or evening primrose oil\n- Over-the-counter pain relievers: For cramps and headaches\n- Heat therapy: A warm bath or heating pad can help with cramps\n\nIf your PMS symptoms are severe and interfere with daily life, consult a healthcare provider about treatment options like hormonal birth control or antidepressants.',
    category: 'health',
  },
  {
    id: '4',
    title: 'Early Pregnancy Signs',
    description: 'Common symptoms that might indicate pregnancy in the early weeks.',
    imageUrl: 'https://images.unsplash.com/photo-1584582396689-d9329ea106cc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8cHJlZ25hbmN5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60',
    content: 'Early signs of pregnancy can appear before you miss your period, though many are similar to premenstrual symptoms. The most common early pregnancy symptoms include:\n\n- Missed period: Often the first sign that prompts women to take a pregnancy test\n- Fatigue: Increased progesterone levels can make you feel unusually tired\n- Nausea or vomiting: "Morning sickness" can occur at any time of day\n- Breast changes: Tenderness, swelling, darkening of areolas\n- Frequent urination: Due to increased blood flow to the kidneys\n- Food aversions or cravings: Sensitivity to certain smells or tastes\n- Mild cramping or spotting: Implantation bleeding can occur when the fertilized egg attaches to the uterine lining\n- Mood swings: Hormonal changes can affect your emotions\n\nIf you experience these symptoms and suspect you might be pregnant, take a home pregnancy test or consult with a healthcare provider.',
    category: 'pregnancy',
  },
  {
    id: '5',
    title: 'Nutrition for Hormonal Balance',
    description: 'Foods that support hormonal health throughout your cycle.',
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fG51dHJpdGlvbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60',
    content: 'What you eat can significantly impact your hormonal balance and help manage cycle-related symptoms. Here\'s how to support your body throughout your cycle:\n\nDuring menstruation:\n- Iron-rich foods: Red meat, spinach, beans, and lentils to replenish iron lost during bleeding\n- Anti-inflammatory foods: Berries, fatty fish, and turmeric to reduce cramping\n- Magnesium-rich foods: Dark chocolate, nuts, and seeds to ease muscle tension\n\nDuring the follicular phase:\n- Zinc-rich foods: Oysters, pumpkin seeds, and beef to support estrogen production\n- Fermented foods: Yogurt, kimchi, and sauerkraut for gut health and hormone metabolism\n\nDuring ovulation:\n- Antioxidant-rich foods: Colorful fruits and vegetables to support egg health\n- Healthy fats: Avocados, olive oil, and nuts for hormone production\n\nDuring the luteal phase:\n- Complex carbohydrates: Whole grains, sweet potatoes, and oats to stabilize blood sugar\n- Calcium-rich foods: Dairy products, fortified plant milks, and leafy greens to reduce PMS symptoms\n- B-vitamin foods: Eggs, poultry, and nutritional yeast to support mood regulation\n\nGeneral tips:\n- Stay hydrated\n- Limit caffeine, alcohol, and processed foods\n- Consider seed cycling (eating specific seeds during different phases of your cycle)',
    category: 'health',
  },
];

export const getArticlesByCategory = (category: string) => {
  return educationArticles.filter(article => article.category === category);
};

export const getArticleById = (id: string) => {
  return educationArticles.find(article => article.id === id);
};