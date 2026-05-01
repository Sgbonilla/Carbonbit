import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot } from 'firebase/firestore';

// --- CONFIGURACIÓN DE FIREBASE (Tus credenciales reales) ---
const firebaseConfig = {
  apiKey: "AIzaSyAmrKcmKR1aFdv9b4Ud2wam7TLFTL6d6zU",
  authDomain: "carbonbit-994ac.firebaseapp.com",
  projectId: "carbonbit-994ac",
  storageBucket: "carbonbit-994ac.firebasestorage.app",
  messagingSenderId: "1060699721623",
  appId: "1:1060699721623:web:9b1b2ad57d1c15a0563ed2",
  measurementId: "G-RGBJJMH7W8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'carbonbit-app';

const T = {
  es: {
    appStatus: "Sincronización en la Nube Activa ☁️",
    tabTracker: "Mi Impacto",
    tabHistory: "Mi Historia",
    tabCommunity: "Comunidad",
    emittedDaily: "Emitido Hoy",
    savedDaily: "Ahorrado Hoy",
    registerTitle: "Registrar Actividad",
    searchTitle: "🔍 Buscador Inteligente ✨",
    searchPlaceholder: "Ej. laptop, jeans, beer, flight...",
    searchBtn: "Buscar",
    searching: "IA analizando...",
    apiTip: "💡 Tip: Escribe en inglés (ej. 'meat') para resultados exactos.",
    apiResults: "Sugerencias de la IA para ti:",
    frequent: "🌟 Tus Favoritos",
    quantityLabel: "Multiplicador de uso",
    privateLeagues: "Ligas Privadas",
    createLeague: "Crear Liga",
    join: "Unirse",
    globalLeague: "Liga Global",
    public: "PÚBLICO",
    loading: "Cargando CarbonBit...",
    you: "(Tú)",
    aboutTitle: "Sobre CarbonBit",
    aboutText: "• CONCIENCIA: Entiende el impacto real de tus decisiones diarias sobre el medio ambiente.\n\n• DATOS REALES: Usamos cálculos científicos de Análisis de Ciclo de Vida (LCA) procesados por IA Gemini.\n\n• CLIMA SCORE: Es tu nivel de experiencia acumulado. Refleja tu compromiso a largo plazo.\n\n• COMUNIDAD: Reta a tus amigos y compite por tener el estilo de vida más sostenible.",
    close: "¡Vamos allá!",
    scoreLabel: "CLIMA SCORE TOTAL",
    transport: "Transporte",
    food: "Alimentación",
    energy: "Hogar y Energía",
    shopping: "Compras y Objetos",
    lifestyle: "Estilo de Vida",
    lvl: ["COLAPSO", "CRÍTICO", "ÁRIDO", "SECO", "ALERTA", "ESTABLE", "SALUDABLE", "PRÓSPERO", "EDÉN", "UTOPÍA"],
    historyEmpty: "Aún no tienes registros guardados.",
    confirmDelete: "¿Borrar este registro?",
    dayClean: "Día limpio. ¡Sigue así!",
    addGreen: "Añade una acción verde 👆"
  },
  en: {
    appStatus: "Cloud Synced ☁️",
    tabTracker: "My Impact",
    tabHistory: "My History",
    tabCommunity: "Community",
    emittedDaily: "Emitted Today",
    savedDaily: "Saved Today",
    registerTitle: "Log Activity",
    searchTitle: "🔍 Smart Search ✨",
    searchPlaceholder: "E.g. laptop, jeans, beer, flight...",
    searchBtn: "Search",
    searching: "AI thinking...",
    apiTip: "💡 Tip: Search in English for scientific precision.",
    apiResults: "AI suggestions for you:",
    frequent: "🌟 Your Favorites",
    quantityLabel: "Multiplier",
    privateLeagues: "Private Leagues",
    createLeague: "Create League",
    join: "Join",
    globalLeague: "Global League",
    public: "PUBLIC",
    loading: "Loading CarbonBit...",
    you: "(You)",
    aboutTitle: "About CarbonBit",
    aboutText: "• AWARENESS: Real environmental impact of daily choices.\n\n• REAL DATA: LCA scientific data processed by Gemini AI.\n\n• CLIMATE SCORE: Your total experience level.\n\n• COMMUNITY: Challenge friends and compete for sustainability.",
    close: "Got it!",
    scoreLabel: "TOTAL CLIMATE SCORE",
    transport: "Transport",
    food: "Food",
    energy: "Home & Energy",
    shopping: "Shopping & Items",
    lifestyle: "Lifestyle",
    lvl: ["COLLAPSE", "CRITICAL", "ARID", "DRY", "ALERT", "STABLE", "HEALTHY", "THRIVING", "EDEN", "UTOPIA"],
    historyEmpty: "No records yet.",
    confirmDelete: "Delete this record?",
    dayClean: "Clean day! Keep it up.",
    addGreen: "Add a green action 👆"
  }
};

const getActivities = (lang) => {
  const isEs = lang === 'es';
  return {
    transport: [
      { id: 'car_10k', name: isEs ? 'Coche (10km)' : 'Car (10km)', co2: 1.4, scoreImpact: -15, icon: '🚗', baseUnit: '10 km' },
      { id: 'bus_10k', name: isEs ? 'Autobús (10km)' : 'Bus (10km)', co2: 0.8, savedCo2: 0.6, scoreImpact: +10, icon: '🚌', baseUnit: '10 km' },
      { id: 'bike_10k', name: isEs ? 'Bici (10km)' : 'Bike (10km)', co2: 0, savedCo2: 1.4, scoreImpact: +25, icon: '🚲', baseUnit: '10 km' },
      { id: 'train_50k', name: isEs ? 'Tren (50km)' : 'Train (50km)', co2: 1.2, savedCo2: 5.8, scoreImpact: +15, icon: '🚆', baseUnit: '50 km' },
      { id: 'flight_short', name: isEs ? 'Vuelo corto (<600km)' : 'Short Flight', co2: 120, scoreImpact: -120, icon: '✈️', baseUnit: '1 vuelo' },
      { id: 'flight_long', name: isEs ? 'Vuelo largo (>2000km)' : 'Long Flight', co2: 650, scoreImpact: -600, icon: '🌎', baseUnit: '1 vuelo' },
    ],
    food: [
      { id: 'beef_steak', name: isEs ? 'Ternera (250g)' : 'Beef (250g)', co2: 6.75, scoreImpact: -68, icon: '🥩', baseUnit: '250g' },
      { id: 'pork_chop', name: isEs ? 'Cerdo (250g)' : 'Pork (250g)', co2: 2.1, scoreImpact: -20, icon: '🍖', baseUnit: '250g' },
      { id: 'chicken_breast', name: isEs ? 'Pollo (250g)' : 'Chicken (250g)', co2: 1.4, scoreImpact: -14, icon: '🍗', baseUnit: '250g' },
      { id: 'coffee_milk', name: isEs ? 'Café con Leche' : 'Latte', co2: 0.55, scoreImpact: -5, icon: '☕', baseUnit: '1 taza' },
      { id: 'coffee_oat', name: isEs ? 'Café Avena' : 'Oat Latte', co2: 0.18, savedCo2: 0.37, scoreImpact: +5, icon: '🌾', baseUnit: '1 taza' },
      { id: 'avocado', name: isEs ? 'Aguacate (1 ud)' : 'Avocado', co2: 0.2, scoreImpact: -2, icon: '🥑', baseUnit: '1 ud' },
      { id: 'beer', name: isEs ? 'Cerveza (caña)' : 'Beer', co2: 0.45, scoreImpact: -4, icon: '🍺', baseUnit: '330ml' },
      { id: 'chocolate', name: isEs ? 'Chocolate (100g)' : 'Chocolate', co2: 1.9, scoreImpact: -15, icon: '🍫', baseUnit: '1 tableta' },
    ],
    energy: [
      { id: 'heater_1h', name: isEs ? 'Calefacción (1h)' : 'Heat (1h)', co2: 1.1, scoreImpact: -10, icon: '🔥', baseUnit: '1 hora' },
      { id: 'cold_wash', name: isEs ? 'Lavadora Fría' : 'Cold Wash', co2: 0.25, savedCo2: 0.45, scoreImpact: +5, icon: '👕', baseUnit: '1 uso' },
      { id: 'hot_wash', name: isEs ? 'Lavadora 60º' : 'Hot Wash 60C', co2: 0.9, scoreImpact: -10, icon: '👔', baseUnit: '1 uso' },
      { id: 'dishwasher', name: isEs ? 'Lavavajillas' : 'Dishwasher', co2: 0.7, scoreImpact: -7, icon: '🍽️', baseUnit: '1 ciclo' },
      { id: 'laptop_8h', name: isEs ? 'Laptop (Día 8h)' : 'Laptop (8h)', co2: 0.3, scoreImpact: -3, icon: '💻', baseUnit: '8 horas' },
      { id: 'led_5h', name: isEs ? 'Luz LED (5h)' : 'LED Light (5h)', co2: 0.05, scoreImpact: -1, icon: '💡', baseUnit: '5 horas' },
    ],
    shopping: [
      { id: 'tshirt_cotton', name: isEs ? 'Camiseta Algodón' : 'Cotton T-Shirt', co2: 4.3, scoreImpact: -40, icon: '👕', baseUnit: '1 ud' },
      { id: 'jeans', name: isEs ? 'Pantalones Vaqueros' : 'Jeans', co2: 33.4, scoreImpact: -200, icon: '👖', baseUnit: '1 ud' },
      { id: 'soda_can', name: isEs ? 'Lata Refresco' : 'Soda Can', co2: 0.17, scoreImpact: -2, icon: '🥤', baseUnit: '1 ud' },
      { id: 'smartphone', name: isEs ? 'Móvil Nuevo' : 'Smartphone', co2: 80, scoreImpact: -500, icon: '📱', baseUnit: 'Producción' },
      { id: 'paper_book', name: isEs ? 'Libro Papel' : 'Paper Book', co2: 1.2, scoreImpact: -10, icon: '📚', baseUnit: '1 ud' },
      { id: 'plastic_bag', name: isEs ? 'Bolsa Plástico' : 'Plastic Bag', co2: 1.5, scoreImpact: -15, icon: '🛍️', baseUnit: '1 ud' },
    ],
    lifestyle: [
      { id: 'recycle_plastic', name: isEs ? 'Reciclar Plástico' : 'Recycle Plastic', co2: 0, savedCo2: 1.5, scoreImpact: +20, icon: '♻️', baseUnit: '1 kg' },
      { id: 'plant_tree', name: isEs ? 'Plantar Árbol' : 'Plant Tree', co2: -10.0, savedCo2: 10.0, scoreImpact: +100, icon: '🌳', baseUnit: '1 año' },
    ]
  };
};

const InfoModal = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const t = T[lang] || T.es;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full relative z-10 shadow-2xl space-y-6">
        <div className="text-left space-y-4">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-4xl mb-4">🌱</div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center">{t.aboutTitle}</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
            {t.aboutText}
          </p>
        </div>
        <button onClick={onClose} className="w-full py-5 bg-slate-900 text-white font-black text-lg rounded-2xl shadow-xl active:scale-95 transition-all">
          {t.close}
        </button>
      </div>
    </div>
  );
};

const RetroPixelScreen = ({ score, lang }) => {
  const level = Math.max(0, Math.min(9, Math.floor(score / 100)));
  const t = T[lang] || T.es;
  const palettes = [
    { bg: 'bg-red-950', sky: '#3f0f0f', ground: '#2e0a0a', text: 'text-red-500' },
    { bg: 'bg-orange-950', sky: '#52200a', ground: '#3e1400', text: 'text-orange-600' },
    { bg: 'bg-amber-950', sky: '#663100', ground: '#522a00', text: 'text-amber-500' },
    { bg: 'bg-yellow-950', sky: '#7c4a03', ground: '#713f12', text: 'text-yellow-500' },
    { bg: 'bg-lime-950', sky: '#2d6a4f', ground: '#166534', text: 'text-lime-400' },
    { bg: 'bg-green-950', sky: '#1b4332', ground: '#15803d', text: 'text-emerald-400' },
    { bg: 'bg-emerald-950', sky: '#081c15', ground: '#059669', text: 'text-emerald-300' },
    { bg: 'bg-teal-950', sky: '#0d3b66', ground: '#0f766e', text: 'text-teal-300' },
    { bg: 'bg-cyan-950', sky: '#003049', ground: '#0891b2', text: 'text-cyan-300' },
    { bg: 'bg-sky-950', sky: '#012a4a', ground: '#0284c7', text: 'text-sky-300' },
  ];
  const p = palettes[level];

  return (
    <div className="w-full bg-zinc-900 rounded-3xl p-2 border-b-4 border-zinc-950 shadow-2xl relative overflow-hidden transition-all duration-1000">
      <div className={`w-full h-32 md:h-40 ${p.bg} rounded-2xl flex items-center justify-between relative overflow-hidden px-4 md:px-8`}>
        <div className="h-full w-40 md:w-56 opacity-95 transition-all relative flex-shrink-0">
          <svg viewBox="0 0 240 80" className="w-full h-full" shapeRendering="crispEdges">
            <rect x="0" y="0" width="240" height="64" fill={p.sky} />
            <g fill="#fde047"><rect x="196" y="12" width="16" height="16" /></g>
            <rect x="0" y="64" width="240" height="16" fill={p.ground} />
            <rect x="62" y={level < 2 ? 48 : 24} width={10} height={level < 2 ? 16 : 40} fill="#451a03" />
            {level >= 2 && <rect x="36" y="12" width="60" height="24" fill="#22c55e" />}
            <g><rect x="160" y="52" width="6" height="10" fill="#1e3a8a" /><rect x="170" y="52" width="6" height="10" fill="#1e3a8a" /><rect x="160" y={level < 3 ? 48 : 36} width="16" height="16" fill={level < 3 ? '#4b5563' : '#3b82f6'} /><rect x="162" y={level < 3 ? 36 : 24} width="12" height="12" fill="#fca5a5" /></g>
          </svg>
        </div>
        <div className="text-right z-30 flex-1 ml-4">
          <p className="font-mono text-[8px] opacity-60 text-white tracking-[0.3em] mb-0.5">{t.scoreLabel}</p>
          <p className={`font-mono text-[9px] font-bold ${p.text} tracking-[0.2em] mb-1 uppercase`}>{t.lvl[level]}</p>
          <div className="text-white text-6xl md:text-8xl font-black font-mono tracking-tighter leading-none">{score}</div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState('es');
  const t = T[lang] || T.es;
  const [user, setUser] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState('tracker');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({ joinedLeagues: [], frequentItems: {}, history: [], score: 500 });
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  
  // ¡AQUÍ ESTÁ LA VARIABLE DE LA GRÁFICA RESTAURADA!
  const [chartPeriod, setChartPeriod] = useState('W'); 
  const [equivIndex, setEquivIndex] = useState(0);

  const ACTIVITIES = getActivities(lang);

  const ACTION_TIPS = {
    es: [
      (co2) => `💡 Equivale a ${(co2 * 122).toFixed(0)} cargas de móvil.`,
      (co2) => `🌳 Un árbol tarda ${(co2 * 10).toFixed(0)} días en absorber esto.`,
      (co2) => `♻️ Compensa reciclando ${(co2 * 30).toFixed(0)} botellas.`,
      (co2) => `🦸‍♂️ ¡Cada gramo cuenta para el futuro!`
    ],
    en: [
      (co2) => `💡 Equal to ${(co2 * 122).toFixed(0)} phone charges.`,
      (co2) => `🌳 A tree needs ${(co2 * 10).toFixed(0)} days to absorb this.`,
      (co2) => `♻️ Offset this by recycling ${(co2 * 30).toFixed(0)} bottles.`,
      (co2) => `🦸‍♂️ Every gram counts for the future!`
    ]
  };

  useEffect(() => {
    const timer = setInterval(() => setEquivIndex(p => (p + 1) % 4), 6000);
    return () => clearInterval(timer);
  }, []);

  const getButtonClass = (impact) => {
    if (impact > 0) return "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100";
    if (impact < 0 && impact >= -20) return "bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100";
    return "bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100";
  };

  const dailyStats = useMemo(() => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      let gen = 0, saved = 0;
      (userProfile.history || []).forEach(h => {
        if (h.timestamp && h.timestamp.startsWith(todayStr)) {
          gen += h.co2; saved += (h.savedCo2 || 0);
        }
      });
      return { gen, saved };
    } catch(e) { return { gen: 0, saved: 0 }; }
  }, [userProfile.history]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { 
          await signInWithCustomToken(auth, __initial_auth_token); 
        } else { 
          await signInAnonymously(auth); 
        }
      } catch (e) {
        setIsDataLoaded(true);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setIsDataLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main');
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const d = snap.data();
          setUserProfile({ joinedLeagues: d.joinedLeagues || [], frequentItems: d.frequentItems || {}, history: d.history || [], score: d.score ?? 500 });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsDataLoaded(true);
      }
    };
    loadData();
    try {
      const lbRef = collection(db, 'artifacts', appId, 'public', 'data', 'leaderboard');
      return onSnapshot(lbRef, (s) => {
        const p = []; s.forEach(d => p.push({ id: d.id, ...d.data() }));
        setLeaderboard(p.sort((a, b) => b.score - a.score).slice(0, 50));
      }, () => {});
    } catch(e) {}
  }, [user]);

  const saveToCloud = async (newProfile) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main');
      await setDoc(userRef, newProfile, { merge: true });
      const lbRef = doc(db, 'artifacts', appId, 'public', 'data', 'leaderboard', user.uid);
      await setDoc(lbRef, { name: `EcoSanti_${user.uid.slice(0,4)}`, score: newProfile.score }, { merge: true });
    } catch(e) {}
  };

  const handleAdd = async (act) => {
    const iM = act.scoreImpact * quantity, cM = act.co2 * quantity, sM = (act.savedCo2 || 0) * quantity;
    const newScore = Math.max(0, userProfile.score + iM);
    let uF = { ...(userProfile.frequentItems || {}) };
    if (act.id.startsWith('api_')) { uF[act.id] = { ...act, count: (uF[act.id]?.count || 0) + 1 }; }
    const entry = { ...act, id: `${act.id}_${Date.now()}`, recordedQty: quantity, scoreImpact: iM, co2: cM, savedCo2: sM, timestamp: new Date().toISOString() };
    const newHistory = [entry, ...(userProfile.history || [])];
    const updatedProfile = { ...userProfile, score: newScore, history: newHistory, frequentItems: uF };
    setUserProfile(updatedProfile); setQuantity(1); saveToCloud(updatedProfile);
  };

  const handleDelete = async (entryId) => {
    if (!confirm(t.confirmDelete)) return;
    const entry = userProfile.history.find(h => h.id === entryId);
    if (!entry) return;
    const newHistory = userProfile.history.filter(h => h.id !== entryId);
    const newScore = Math.max(0, userProfile.score - entry.scoreImpact);
    const updatedProfile = { ...userProfile, score: newScore, history: newHistory };
    setUserProfile(updatedProfile); saveToCloud(updatedProfile);
  };

  const rethinkWithGemini = async (query, rawData) => {
    // Tu API de Gemini real inyectada:
    const apiKey = "AIzaSyDJJpBFL18Xxn3461D-ysmP8Gx7K_a-fvE"; 
    
    if(!apiKey) return null;
    const prompt = `Search: "${query}". API Data: ${JSON.stringify(rawData.map(r => ({ name: r.name, factor: r.factor })))}. TASK: Suggest 3-4 specific user actions. E.g., if "washing", suggest: "Cold Wash", "40C Wash", "60C Wash". Return RAW JSON ARRAY: [{ id, name (in ${lang}), baseUnit, co2 (number), scoreImpact (co2*-10), emoji }].`;
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
      });
      const d = await res.json();
      return JSON.parse(d.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch (e) { return null; }
  };

  const searchDB = async (e) => {
    e.preventDefault();
    const term = searchQuery.trim().toLowerCase();
    if (!term) return;
    setIsSearching(true);
    try {
      const cacheRef = doc(db, 'artifacts', appId, 'public', 'data', 'searchCache', 'global');
      const snap = await getDoc(cacheRef);
      if (snap.exists() && snap.data()[term]) { setSearchResults(snap.data()[term]); setIsSearching(false); return; }
      const res = await fetch(`https://beta4.api.climatiq.io/search?query=${encodeURIComponent(searchQuery)}&data_version=^5`, { headers: { 'Authorization': 'Bearer Y3BKEC5RA93CK2P41N5YA4TBCW' } });
      const data = await res.json();
      if (data.results?.length > 0) {
        const enhancedResults = await rethinkWithGemini(searchQuery, data.results.slice(0, 3));
        if (enhancedResults) {
          const final = enhancedResults.map(r => ({ ...r, id: `api_${r.id}_${Date.now()}` }));
          await setDoc(cacheRef, { [term]: final }, { merge: true });
          setSearchResults(final);
        } else {
           setSearchResults(data.results.slice(0, 3).map(r => ({ id: `api_${r.id}`, name: r.name.split(',')[0], baseUnit: "1 ud", co2: r.factor || 1.5, scoreImpact: -Math.round((r.factor || 1.5) * 10), icon: '🌍' })));
        }
      }
    } catch (e) {} finally { setIsSearching(false); }
  };

  // CÁLCULO DE GRÁFICA RESTAURADO PARA 7 O 30 DÍAS
  const chartData = useMemo(() => {
    const days = chartPeriod === 'W' ? 7 : 30;
    const data = Array(days).fill(0);
    const now = new Date();
    (userProfile.history || []).forEach(h => {
      const d = new Date(h.timestamp);
      const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
      if (diff < days && diff >= 0) data[days - 1 - diff] += h.co2;
    });
    return data;
  }, [userProfile.history, chartPeriod]);

  if (!isDataLoaded) return <div className="min-h-screen flex items-center justify-center font-mono font-bold text-slate-400 bg-slate-50">{t.loading}</div>;
  const currentTips = ACTION_TIPS[lang] || ACTION_TIPS.es;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-40 selection:bg-emerald-100">
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} lang={lang} />
      
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <header className="relative flex flex-col items-center gap-4 pt-4">
          <div className="w-full flex justify-between items-start">
            <button onClick={() => setIsInfoOpen(true)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 shadow-sm hover:bg-slate-50 transition-all">ⓘ</button>
            <div className="flex gap-2">
              {['es','en'].map(l => (
                <button key={l} onClick={() => setLang(l)} className={`w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-xs ${lang===l?'ring-2 ring-emerald-400 opacity-100 font-bold':'opacity-40'}`}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 italic uppercase">CARBON<span className="text-emerald-500">BIT</span></h1>
            <p className="text-[10px] opacity-40 font-mono uppercase tracking-[0.3em] mt-1">{t.appStatus}</p>
          </div>
          <RetroPixelScreen score={userProfile.score} lang={lang} />
        </header>

        {currentTab === 'tracker' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute -right-2 -top-2 opacity-5 text-7xl">🏭</div>
                <p className="text-xs opacity-50 uppercase font-black mb-1">{t.emittedDaily}</p>
                <p className="text-4xl font-black">{dailyStats.gen.toFixed(1)}<span className="text-base opacity-40 ml-1">kg</span></p>
                <p className="text-[12px] mt-4 font-bold text-slate-300 h-10 transition-all italic leading-tight">
                   {dailyStats.gen > 0 ? currentTips[equivIndex](dailyStats.gen) : t.dayClean}
                </p>
              </div>
              <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-xl shadow-emerald-200 relative overflow-hidden">
                <div className="absolute -right-2 -bottom-2 opacity-15 text-7xl">🌳</div>
                <p className="text-xs opacity-50 uppercase font-black mb-1">{t.savedDaily}</p>
                <p className="text-4xl font-black">{dailyStats.saved.toFixed(1)}<span className="text-base opacity-40 ml-1">kg</span></p>
                <p className="text-[12px] mt-4 font-bold text-white h-10 transition-all italic leading-tight">
                   {dailyStats.saved > 0 ? (lang === 'es' ? "¡El planeta respira mejor! 🌍" : "The planet breathes better!") : t.addGreen}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between bg-slate-50 p-6 rounded-[2rem]">
                <span className="text-xs font-black opacity-40 uppercase tracking-widest">{t.quantityLabel}</span>
                <div className="flex items-center gap-7">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center font-black text-2xl hover:bg-slate-100 transition-all">-</button>
                  <span className="text-4xl font-black font-mono text-slate-800">{quantity}</span>
                  <button onClick={() => setQuantity(q => q+1)} className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center font-black text-2xl hover:bg-slate-100 transition-all">+</button>
                </div>
              </div>

              {Object.entries(ACTIVITIES).map(([cat, acts]) => (
                <div key={cat} className="space-y-4">
                  <h3 className="text-[11px] font-black opacity-30 uppercase tracking-widest ml-1">{t[cat] || cat}</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {acts.map(act => (
                      <button key={act.id} onClick={() => handleAdd(act)} className={`px-5 py-4 border rounded-3xl text-sm font-bold flex flex-col items-start gap-1.5 transition-all hover:-translate-y-1 active:scale-95 ${getButtonClass(act.scoreImpact)} shadow-sm`}>
                        <div className="flex items-center gap-2.5"><span>{act.icon}</span>{act.name}</div>
                        <span className="text-[10px] opacity-60 font-mono font-black">{(act.co2 * quantity).toFixed(2)}kg</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-8 border-t border-slate-100 space-y-5">
                <div className="text-center">
                  <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">{t.searchTitle}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{t.apiTip}</p>
                </div>
                <form onSubmit={searchDB} className="relative flex gap-3">
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-12 pr-4 py-4 bg-slate-100 rounded-3xl outline-none focus:ring-2 focus:ring-emerald-500 text-base font-medium transition-all" />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 text-xl">🔍</span>
                  <button type="submit" disabled={isSearching} className="px-10 py-4 bg-slate-900 text-white rounded-3xl font-black text-sm disabled:opacity-50 min-w-[120px] shadow-lg active:scale-95">{isSearching ? "..." : t.searchBtn}</button>
                </form>
                {searchResults.length > 0 && (
                  <div className="p-5 bg-indigo-950 rounded-[2rem] space-y-3 shadow-2xl animate-fade-in border border-indigo-400/20">
                    <p className="text-[11px] text-indigo-300 font-black uppercase tracking-[0.2em] mb-4 ml-1">{t.apiResults}</p>
                    {searchResults.map(act => (
                      <button key={act.id} onClick={() => {handleAdd(act); setSearchResults([]); setSearchQuery('');}} className="w-full flex justify-between items-center p-5 bg-white/5 hover:bg-white/10 rounded-2xl text-white text-sm transition-all border border-white/5 group">
                        <span className="flex flex-col items-start text-left">
                           <span className="flex items-center gap-3 font-bold text-emerald-300 text-lg group-hover:scale-105 transition-transform"><span>{act.icon}</span>{act.name}</span>
                           <span className="text-[11px] opacity-40 font-mono italic mt-1">{act.baseUnit}</span>
                        </span>
                        <span className="font-mono text-base font-black bg-white/10 px-3 py-1.5 rounded-xl text-emerald-400">{(act.co2 * quantity).toFixed(2)}kg</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'history' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black flex items-center gap-2">📊 {t.tabHistory}</h2>
                {/* BOTONES DE 7D / 30D RESTAURADOS */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button onClick={() => setChartPeriod('W')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${chartPeriod === 'W' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>7D</button>
                  <button onClick={() => setChartPeriod('M')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${chartPeriod === 'M' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>30D</button>
                </div>
              </div>
              
              <div className="h-44 w-full flex items-end justify-between px-2 gap-2">
                {chartData.map((val, i) => {
                  const max = Math.max(...chartData, 1);
                  const h = (val / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-full bg-slate-100 rounded-t-xl relative overflow-hidden h-32">
                        <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-300 transition-all duration-1000 rounded-t-lg"></div>
                      </div>
                      <span className="text-[9px] font-black opacity-30">D{i+1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-4">
              {userProfile.history.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-300">
                  <p className="text-slate-400 italic font-medium">{t.historyEmpty}</p>
                </div>
              ) : (
                userProfile.history.map(h => (
                  <div key={h.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-emerald-200 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="text-4xl p-4 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors">{h.icon}</div>
                      <div>
                        <p className="font-black text-slate-800 text-lg">{h.name}</p>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{new Date(h.timestamp).toLocaleDateString()} · {h.recordedQty} uds.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                       <div className="text-right">
                         <p className={`font-black text-lg ${h.scoreImpact > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{h.scoreImpact > 0 ? '+' : ''}{h.scoreImpact} pts</p>
                         <p className="text-sm font-mono font-black opacity-30 tracking-tighter">{h.co2.toFixed(2)}kg</p>
                       </div>
                       <button onClick={() => handleDelete(h.id)} className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all active:scale-90 font-black text-xl">✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {currentTab === 'community' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-black">{t.privateLeagues}</h2>
              <div className="flex gap-2">
                <button onClick={() => alert("Función de crear ligas pronto disponible")} className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg">➕ {t.createLeague}</button>
                <button onClick={() => alert("Código de prueba: MALAGA-2026")} className="bg-slate-800 text-white font-bold px-6 rounded-2xl">{t.join}</button>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-10 rounded-[3rem] space-y-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl">🏆</div>
               <div className="flex justify-between items-center relative z-10 border-b border-white/10 pb-6">
                  <h2 className="text-3xl font-black italic tracking-tighter">{t.globalLeague}</h2>
                  <span className="bg-emerald-500 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">PÚBLICO</span>
               </div>
               <div className="space-y-4 relative z-10">
                 {leaderboard.length === 0 ? (
                    <p className="text-slate-400 italic">No hay jugadores aún...</p>
                 ) : leaderboard.map((p, i) => (
                   <div key={p.id} className={`flex justify-between items-center p-6 rounded-[2rem] transition-all ${p.id===user?.uid?'bg-emerald-500 shadow-xl shadow-emerald-500/40 scale-105':'bg-white/5 hover:bg-white/10'}`}>
                     <div className="flex items-center gap-6">
                        <span className="font-mono text-xl font-black opacity-30">{i+1}</span>
                        <span className="font-black text-lg tracking-tight">{p.name}</span>
                     </div>
                     <span className="font-black font-mono text-2xl text-emerald-400">{p.score}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[94%] max-w-md bg-white/95 backdrop-blur-xl border border-slate-200 p-3 flex justify-around shadow-[0_25px_60px_rgba(0,0,0,0.2)] rounded-[2.5rem] z-50">
        {[{ id: 'tracker', label: t.tabTracker, icon: '📍' }, { id: 'history', label: t.tabHistory, icon: '📈' }, { id: 'community', label: t.tabCommunity, icon: '🏆' }].map(tab => (
          <button key={tab.id} onClick={() => setCurrentTab(tab.id)} className={`flex flex-col items-center flex-1 p-4 rounded-[2rem] transition-all duration-300 ${currentTab===tab.id?'bg-emerald-50 text-emerald-600 scale-95 font-black shadow-inner':'opacity-30 hover:opacity-100'}`}>
            <span className="text-3xl mb-1.5">{tab.icon}</span><span className="text-[10px] uppercase font-black tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        body { background-color: #F8FAFC; -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
