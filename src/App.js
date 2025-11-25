import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  collection, 
  addDoc, 
  updateDoc, 
  increment,
  writeBatch,
  deleteDoc
} from "firebase/firestore";
import { 
  BookOpen, 
  Layers, 
  User, 
  Home, 
  Check, 
  X, 
  Zap, 
  ChevronRight, 
  Search, 
  Volume2, 
  Puzzle, 
  MessageSquare, 
  GraduationCap, 
  PlusCircle, 
  Save, 
  Feather, 
  ChevronDown, 
  PlayCircle, 
  Award, 
  Trash2, 
  Plus, 
  FileText, 
  Brain,
  Loader,
  LogOut,
  Mail,
  Lock,
  UploadCloud,
  Database,
  School,
  Users,
  Copy
} from 'lucide-react';

// --- FIREBASE CONFIGURATION (EPIC LATIN) ---
const firebaseConfig = {
  apiKey: "AIzaSyAjK79x_N5pSWzWluFUg25mqEc_HeraRPk",
  authDomain: "epic-latin.firebaseapp.com",
  projectId: "epic-latin",
  storageBucket: "epic-latin.firebasestorage.app",
  messagingSenderId: "321050459278",
  appId: "1:321050459278:web:df00b3cf5b8befb0d55ddf",
  measurementId: "G-KEWLZ67Z61"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'epic-latin-prod'; 

// --- CONSTANTS & DEFAULTS ---

const DEFAULT_USER_DATA = {
  name: "Discipulus",
  targetLanguage: "Latin",
  level: "Novice",
  streak: 1,
  xp: 0,
  role: 'student' 
};

// --- INITIAL SEED DATA ---
const INITIAL_SYSTEM_DECKS = {
  salutationes: {
    title: "👋 Salutationes",
    cards: [
      { id: 's1', front: "Salve", back: "Hello (Singular)", ipa: "/ˈsal.weː/", type: "phrase", mastery: 4, morphology: [{ part: "Salv-", meaning: "Health", type: "root" }, { part: "-e", meaning: "Imp. Sing.", type: "suffix" }], usage: { sentence: "Salve, Marce!", translation: "Hello, Marcus!" }, grammar_tags: ["Imperative", "Greeting"] },
      { id: 's2', front: "Salvete", back: "Hello (Plural)", ipa: "/salˈweː.te/", type: "phrase", mastery: 3, morphology: [{ part: "Salv-", meaning: "Health", type: "root" }, { part: "-ete", meaning: "Imp. Pl.", type: "suffix" }], usage: { sentence: "Salvete, discipuli!", translation: "Hello, students!" }, grammar_tags: ["Imperative", "Greeting"] },
      { id: 's3', front: "Vale", back: "Goodbye", ipa: "/ˈwa.leː/", type: "phrase", mastery: 3, morphology: [{ part: "Val-", meaning: "Be strong", type: "root" }, { part: "-e", meaning: "Imp.", type: "suffix" }], usage: { sentence: "Vale, amice.", translation: "Goodbye, friend." }, grammar_tags: ["Valediction"] }
    ]
  },
  medicina: {
    title: "⚕️ Medicina",
    cards: [
      { id: 'm1', front: "Vulnus", back: "Wound", ipa: "/ˈwul.nus/", type: "noun", mastery: 1, morphology: [{ part: "Vuln-", meaning: "Wound", type: "root" }, { part: "-us", meaning: "Nom.", type: "suffix" }], usage: { sentence: "Vulnus grave est.", translation: "The wound is serious." }, grammar_tags: ["3rd Declension"] },
      { id: 'm2', front: "Curare", back: "To cure", ipa: "/kuˈraː.re/", type: "verb", mastery: 2, morphology: [{ part: "Cur-", meaning: "Care", type: "root" }, { part: "-are", meaning: "Inf.", type: "suffix" }], usage: { sentence: "Medicus curat.", translation: "The doctor cures." }, grammar_tags: ["1st Conjugation"] }
    ]
  },
  bellum: {
    title: "⚔️ Bellum",
    cards: [
      { id: 'b1', front: "Bellum", back: "War", ipa: "/ˈbel.lum/", type: "noun", mastery: 4, morphology: [{ part: "Bell-", meaning: "War", type: "root" }, { part: "-um", meaning: "Neut.", type: "suffix" }], usage: { sentence: "Para bellum.", translation: "Prepare for war." }, grammar_tags: ["2nd Declension"] },
      { id: 'b2', front: "Gladius", back: "Sword", ipa: "/ˈɡla.di.us/", type: "noun", mastery: 2, morphology: [{ part: "Gladi-", meaning: "Sword", type: "root" }, { part: "-us", meaning: "Masc.", type: "suffix" }], usage: { sentence: "Gladius ferreus.", translation: "Iron sword." }, grammar_tags: ["2nd Declension"] }
    ]
  },
  mare: {
    title: "🌊 Mare",
    cards: [
      { id: 'sea1', front: "Navis", back: "Ship", ipa: "/ˈnaː.wis/", type: "noun", mastery: 2, morphology: [{ part: "Nav-", meaning: "Ship", type: "root" }, { part: "-is", meaning: "Fem.", type: "suffix" }], usage: { sentence: "Navis navigat.", translation: "The ship sails." }, grammar_tags: ["3rd Declension"] }
    ]
  },
  iter: {
    title: "🗺️ Iter",
    cards: [
      { id: 'i1', front: "Iter", back: "Journey", ipa: "/ˈi.ter/", type: "noun", mastery: 2, morphology: [{ part: "I-", meaning: "Go", type: "root" }, { part: "-ter", meaning: "Suffix", type: "suffix" }], usage: { sentence: "Iter longum.", translation: "Long journey." }, grammar_tags: ["3rd Declension"] }
    ]
  }
};

const INITIAL_SYSTEM_LESSONS = [
  {
    id: 'l1',
    title: "Salutationes",
    subtitle: "Greetings in the Forum",
    description: "Learn how to greet friends and elders in the Roman Forum.",
    xp: 50,
    vocab: ['Salve', 'Vale', 'Quid agis?'],
    dialogue: [
      { speaker: "Marcus", text: "Salve, Iulia!", translation: "Hello, Julia!", side: "left" },
      { speaker: "Iulia", text: "Salve, Marce. Quid agis?", translation: "Hello, Marcus. How are you?", side: "right" },
      { speaker: "Marcus", text: "Bene sum.", translation: "I am well.", side: "left" }
    ],
    quiz: {
      question: "How do you say 'Hello' to a group?",
      options: [{ id: 'a', text: "Salve" }, { id: 'b', text: "Salvete" }, { id: 'c', text: "Vale" }],
      correctId: 'b'
    }
  }
];

const TYPE_COLORS = {
  verb: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
  noun: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  adverb: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  phrase: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
};

// --- COMPONENTS ---

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Domus' },
    { id: 'flashcards', icon: Layers, label: 'Chartae' },
    { id: 'teach', icon: School, label: 'Magister' }, 
    { id: 'profile', icon: User, label: 'Ego' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center space-y-1 transition-all duration-200 ${
            activeTab === tab.id ? 'text-indigo-600 scale-105' : 'text-slate-400'
          }`}
        >
          <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-wide uppercase">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const Header = ({ title, subtitle, rightAction, onClickTitle }) => (
  <div className="px-6 pt-12 pb-6 bg-white sticky top-0 z-40 border-b border-slate-100 flex justify-between items-end">
    <div onClick={onClickTitle} className={onClickTitle ? "cursor-pointer active:opacity-60 transition-opacity" : ""}>
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
        {title} {onClickTitle && <ChevronDown size={20} className="text-slate-400" />}
      </h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>}
    </div>
    {rightAction}
  </div>
);

// --- INSTRUCTOR (MAGISTER) VIEW ---
const InstructorView = ({ user, allDecks, onSaveLesson, onSaveCard }) => {
  const [subTab, setSubTab] = useState('classes');
  const [classes, setClasses] = useState([]);
  const [newClassName, setNewClassName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'classes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'classes'), {
      name: newClassName, code: joinCode, students: 0, created: Date.now()
    });
    setNewClassName('');
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm("Delete this class?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'classes', id));
    }
  };

  const allCards = Object.values(allDecks).flatMap(deck => deck.cards || []);
  const filteredCards = allCards.filter(c => 
    c.front.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.back.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <Header title="Magister" subtitle="Instructor Dashboard" />
      <div className="px-6 mt-2">
        <div className="flex bg-slate-200 p-1 rounded-xl">
           <button onClick={() => setSubTab('classes')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${subTab === 'classes' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}>Classes</button>
           <button onClick={() => setSubTab('library')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${subTab === 'library' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}>Library</button>
           <button onClick={() => setSubTab('builder')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${subTab === 'builder' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500'}`}>Builder</button>
        </div>
      </div>
      <div className="flex-1 px-6 mt-4 overflow-y-auto custom-scrollbar pb-24">
        {subTab === 'classes' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <form onSubmit={handleCreateClass} className="flex gap-2">
              <input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="New Class Name" className="flex-1 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500" />
              <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl"><Plus /></button>
            </form>
            <div className="space-y-3">
              {classes.map(cls => (
                <div key={cls.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">{cls.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono tracking-wider flex items-center gap-1">
                                {cls.code} <Copy size={10} className="cursor-pointer" onClick={() => navigator.clipboard.writeText(cls.code)}/>
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Users size={12} /> {cls.students} Students
                            </span>
                        </div>
                    </div>
                    <button onClick={() => handleDeleteClass(cls.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {subTab === 'library' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={20} /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search cards..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              {filteredCards.slice(0, 10).map((card, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm"><p className="font-bold text-slate-800">{card.front}</p><p className="text-xs text-slate-500">{card.back}</p></div>
              ))}
            </div>
          </div>
        )}
        {subTab === 'builder' && (
          <div className="animate-in fade-in duration-300">
             <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4 text-sm text-indigo-800"><p className="font-bold flex items-center gap-2"><Brain size={16}/> Instructor Mode</p></div>
             <LessonBuilderView onSave={(l) => { onSaveLesson(l); alert("Lesson Saved"); }} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- AUTH VIEW ---
const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), {
          ...DEFAULT_USER_DATA, name: name || "Discipulus", email: user.email
        });
      }
    } catch (err) { setError(err.message.replace('Firebase: ', '')); } 
    finally { setLoading(false); }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-slate-50">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8"><div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-200"><GraduationCap size={40} /></div><h1 className="text-3xl font-bold text-slate-900">LinguistFlow</h1><p className="text-slate-500 mt-2">Master Latin with depth & context.</p></div>
        <form onSubmit={handleAuth} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!isLogin && <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Name</label><div className="relative"><User className="absolute left-3 top-3.5 text-slate-400" size={20} /><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="Marcus Aurelius" required={!isLogin} /></div></div>}
          <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label><div className="relative"><Mail className="absolute left-3 top-3.5 text-slate-400" size={20} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="marcus@rome.com" required /></div></div>
          <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label><div className="relative"><Lock className="absolute left-3 top-3.5 text-slate-400" size={20} /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="••••••••" required /></div></div>
          {error && <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">{loading ? <Loader className="animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}</button>
        </form>
        <div className="mt-6 text-center"><button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-indigo-600 font-bold text-sm hover:underline">{isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}</button></div>
      </div>
    </div>
  );
};

// --- PROFILE VIEW ---
const ProfileView = ({ user, userData }) => {
  const [deploying, setDeploying] = useState(false);
  const handleLogout = () => signOut(auth);

  const deploySystemContent = async () => {
    setDeploying(true);
    const batch = writeBatch(db);
    Object.entries(INITIAL_SYSTEM_DECKS).forEach(([key, deck]) => { batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'system_decks', key), deck); });
    INITIAL_SYSTEM_LESSONS.forEach((lesson) => { batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'system_lessons', lesson.id), lesson); });
    try { await batch.commit(); alert("System Content Deployed!"); } catch (e) { alert("Error: " + e.message); }
    setDeploying(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <Header title="Ego" subtitle="Profile & Settings" />
      <div className="flex-1 px-6 mt-4 overflow-y-auto">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center mb-6"><div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-4 text-3xl font-bold">{userData?.name?.charAt(0) || "D"}</div><h2 className="text-2xl font-bold text-slate-900">{userData?.name}</h2><p className="text-slate-500 text-sm flex items-center gap-1 mt-1"><Mail size={14} /> {user.email}</p><div className="mt-4 px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">{userData?.level || "Novice"}</div></div>
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm ml-1">Account</h3>
          <button onClick={handleLogout} className="w-full bg-white p-4 rounded-xl border border-slate-200 text-rose-600 font-bold flex items-center justify-between active:bg-rose-50 transition-colors"><span>Sign Out</span><LogOut size={20} /></button>
          <h3 className="font-bold text-slate-900 text-sm ml-1 mt-4">Admin Zone</h3>
          <button onClick={deploySystemContent} disabled={deploying} className="w-full bg-slate-800 text-white p-4 rounded-xl font-bold flex items-center justify-between active:scale-95 transition-all shadow-lg"><div className="flex items-center gap-2">{deploying ? <Loader className="animate-spin" size={20} /> : <UploadCloud size={20} />}<span>Deploy System Content</span></div><Database size={20} className="opacity-50" /></button>
        </div>
      </div>
    </div>
  );
};

// --- HOME VIEW (RESTORED) ---
const HomeView = ({ setActiveTab, lessons, onSelectLesson, userData }) => (
  <div className="pb-24 animate-in fade-in duration-500 overflow-y-auto h-full">
    <Header title={`Ave, ${userData?.name || 'Discipulus'}!`} subtitle="Perge in itinere tuo." />
    
    <div className="px-6 space-y-6 mt-4">
      <div className="bg-gradient-to-br from-red-800 to-rose-900 rounded-3xl p-6 text-white shadow-xl shadow-rose-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700" />
        <div className="flex justify-between items-start relative z-10">
          <div><p className="text-rose-100 font-medium mb-1 text-sm uppercase tracking-wider">Hebdomada</p><h3 className="text-4xl font-serif font-bold">{userData?.xp || 0} <span className="text-lg font-sans font-normal text-rose-200">XP</span></h3></div>
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20"><Zap size={28} className="text-yellow-400" fill="currentColor" /></div>
        </div>
        <div className="mt-6 bg-black/20 rounded-full h-3 w-full overflow-hidden"><div className="bg-gradient-to-r from-yellow-300 to-amber-500 h-full w-[75%] rounded-full" /></div>
        <div className="flex justify-between mt-3 text-xs font-medium text-rose-100"><span>Rank: Centurion</span><span>{userData?.streak || 1} Dies Igne 🔥</span></div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><BookOpen size={18} className="text-indigo-600" /> Available Lessons</h3>
        <div className="space-y-3">
          {lessons.map(lesson => (
            <button key={lesson.id} onClick={() => onSelectLesson(lesson)} className="w-full bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all hover:shadow-md group">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 group-hover:bg-amber-200 transition-colors"><PlayCircle size={28} /></div>
                <div className="text-left"><h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{lesson.title}</h4><p className="text-xs text-slate-500">{lesson.subtitle || 'Custom Lesson'}</p></div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setActiveTab('flashcards')} className="p-5 bg-orange-50 rounded-2xl border border-orange-100 flex flex-col items-center justify-center text-center space-y-3 hover:bg-orange-100 active:scale-95 transition-all">
          <div className="bg-white p-3 rounded-full shadow-sm"><Layers className="text-orange-500" size={24} /></div>
          <div><span className="block font-bold text-slate-800">Repetitio</span><span className="text-xs text-slate-500">Smart Deck</span></div>
        </button>
        <button onClick={() => setActiveTab('create')} className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center space-y-3 hover:bg-emerald-100 active:scale-95 transition-all">
          <div className="bg-white p-3 rounded-full shadow-sm"><Feather className="text-emerald-500" size={24} /></div>
          <div><span className="block font-bold text-slate-800">Scriptorium</span><span className="text-xs text-slate-500">Build Content</span></div>
        </button>
      </div>
    </div>
  </div>
);

// --- LESSON VIEW ---
const LessonView = ({ lesson, onFinish }) => {
  const [step, setStep] = useState(0); 
  const [quizSelection, setQuizSelection] = useState(null);
  if (!lesson) return null;

  const renderContent = () => {
    if (step === 0) return <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"><div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-center"><div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">🎓</div><h2 className="text-xl font-bold text-indigo-900 mb-2">{lesson.title}</h2><p className="text-indigo-700/80 text-sm">{lesson.description}</p></div><div className="space-y-3"><h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Key Vocabulary</h3>{lesson.vocab.map((phrase, i) => (<div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm"><Volume2 size={18} className="text-indigo-500" /><span className="font-medium text-slate-700">{phrase}</span></div>))}</div></div>;
    if (step === 1) return <div className="space-y-4 animate-in fade-in duration-500">{lesson.dialogue.map((line, i) => (<div key={i} className={`flex ${line.side === 'right' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${line.side === 'right' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}><p className="font-bold text-xs opacity-70 mb-1">{line.speaker}</p><p className="text-base font-medium mb-1">{line.text}</p><p className={`text-xs italic ${line.side === 'right' ? 'text-indigo-200' : 'text-slate-400'}`}>{line.translation}</p></div></div>))}</div>;
    if (step === 2) return <div className="animate-in fade-in duration-500"><div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 text-center mb-6"><Brain size={40} className="mx-auto text-indigo-500 mb-4" /><h3 className="text-lg font-bold text-slate-800 mb-2">Pop Quiz!</h3><p className="text-slate-600">{lesson.quiz.question}</p></div><div className="space-y-3">{lesson.quiz.options.map((opt) => (<button key={opt.id} onClick={() => setQuizSelection(opt.id)} className={`w-full p-4 rounded-xl border-2 font-bold text-left transition-all ${quizSelection === opt.id ? opt.id === lesson.quiz.correctId ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600'}`}>{opt.text}</button>))}</div></div>;
    if (step === 3) return <div className="text-center py-10 animate-in zoom-in duration-500"><div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"><Award size={48} className="text-yellow-600" /></div><h2 className="text-3xl font-bold text-slate-900 mb-2">Optime!</h2><p className="text-slate-500 mb-8">Lesson Complete. +{lesson.xp} XP</p><button onClick={() => onFinish(lesson.xp)} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">Return Home</button></div>;
  };
  return (
    <div className="pb-24 min-h-full flex flex-col bg-slate-50">
      <Header title="Lectio" subtitle={lesson.title} rightAction={<button onClick={() => onFinish(0)}><X size={24} className="text-slate-400" /></button>} />
      <div className="flex-1 px-6 mt-2 overflow-y-auto custom-scrollbar"><div className="flex gap-2 mb-8">{[0, 1, 2, 3].map(s => (<div key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${s <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />))}</div>{renderContent()}</div>
      {step < 3 && <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0 z-30 pb-safe"><button disabled={step === 2 && quizSelection !== lesson.quiz.correctId} onClick={() => setStep(step + 1)} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2">{step === 2 ? 'Finish Lesson' : 'Continue'} <ChevronRight size={20} /></button></div>}
    </div>
  );
};

// --- FLASHCARD VIEW ---
const FlashcardView = ({ allDecks, selectedDeckKey, onSelectDeck }) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [xrayMode, setXrayMode] = useState(false);
  
  const currentDeck = allDecks[selectedDeckKey];
  const cards = currentDeck?.cards || [];
  const card = cards[currentIndex];
  const theme = card ? (TYPE_COLORS[card.type] || TYPE_COLORS.noun) : TYPE_COLORS.noun;

  const handleDeckChange = (key) => {
    onSelectDeck(key);
    setIsSelectorOpen(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setXrayMode(false);
  };

  if (!card) return <div className="h-full flex flex-col bg-slate-50"><Header title={currentDeck?.title || "Empty Deck"} onClickTitle={() => setIsSelectorOpen(!isSelectorOpen)} /><div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400"><Layers size={48} className="mb-4 opacity-20" /><p>This deck is empty.</p></div></div>;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-50 pb-6 relative overflow-hidden">
      <Header title={currentDeck.title.split(' ')[1] || "Deck"} subtitle={`${currentIndex + 1} / ${cards.length} • ${currentDeck.title.split(' ')[0]}`} onClickTitle={() => setIsSelectorOpen(!isSelectorOpen)} rightAction={<div className="flex gap-1">{[...Array(Math.min(5, cards.length))].map((_, i) => (<div key={i} className={`h-1.5 w-4 rounded-full transition-colors ${i <= currentIndex ? 'bg-indigo-600' : 'bg-slate-200'}`} />))}</div>} />
      {isSelectorOpen && <div className="absolute top-24 left-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-4">{Object.entries(allDecks).map(([key, deck]) => (<button key={key} onClick={() => handleDeckChange(key)} className={`w-full text-left p-3 rounded-xl font-bold text-sm mb-1 ${selectedDeckKey === key ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}>{deck.title} <span className="float-right opacity-50">{deck.cards.length}</span></button>))}</div>}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 perspective-1000 relative z-0"><div className={`relative w-full h-full max-h-[520px] transition-all duration-500 transform preserve-3d cursor-pointer shadow-2xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`} onClick={() => !xrayMode && setIsFlipped(!isFlipped)}><div className="absolute inset-0 backface-hidden bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col"><div className={`h-2 w-full ${xrayMode ? theme.bg.replace('50', '500') : 'bg-slate-100'} transition-colors duration-500`} /><div className="flex-1 flex flex-col p-6 relative"><div className="flex justify-between items-start mb-8"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.bg} ${theme.text} border ${theme.border}`}>{card.type}</span></div><div className="flex-1 flex flex-col items-center justify-center mt-[-40px]"><h2 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 text-center mb-4 leading-tight">{card.front}</h2><div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100"><button onClick={(e) => { e.stopPropagation(); }} className="p-2 bg-white rounded-full shadow-sm text-indigo-600 hover:scale-110 transition-transform active:scale-90"><Volume2 size={18} /></button><span className="font-mono text-slate-500 text-sm tracking-wide">{card.ipa}</span></div></div><div className={`absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 transition-all duration-500 ease-in-out flex flex-col overflow-hidden z-20 ${xrayMode ? 'h-[75%] opacity-100 rounded-t-3xl shadow-[-10px_-10px_30px_rgba(0,0,0,0.05)]' : 'h-0 opacity-0'}`}><div className="p-6 overflow-y-auto custom-scrollbar space-y-6"><div><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Puzzle size={14} /> Morphologia</h4><div className="flex flex-wrap gap-2">{card.morphology && card.morphology.map((m, i) => (<div key={i} className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-lg p-2 min-w-[60px]"><span className={`font-bold text-lg ${m.type === 'root' ? 'text-indigo-600' : 'text-slate-700'}`}>{m.part}</span><span className="text-[9px] text-slate-400 font-medium uppercase mt-1 text-center max-w-[80px] leading-tight">{m.meaning}</span></div>))}</div></div><div><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MessageSquare size={14} /> Exemplum</h4><div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}><p className="text-slate-800 font-serif font-medium text-lg mb-1">"{card.usage.sentence}"</p><p className={`text-sm ${theme.text} opacity-80 italic`}>{card.usage.translation}</p></div></div></div></div>{!xrayMode && (<div className="mt-auto text-center"><p className="text-xs text-slate-400 font-medium animate-pulse">Tap to flip</p></div>)}</div></div><div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-white relative overflow-hidden"><div className="relative z-10 flex flex-col items-center"><span className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 border-b border-indigo-500/30 pb-2">Translatio</span><h2 className="text-4xl font-bold text-center mb-8 leading-tight">{card.back}</h2></div></div></div></div><div className="px-6 pb-4"><div className="flex items-center justify-between max-w-sm mx-auto"><button onClick={() => { setXrayMode(false); setIsFlipped(false); setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 200); }} className="h-14 w-14 rounded-full bg-white border border-slate-100 shadow-md text-rose-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"><X size={28} strokeWidth={2.5} /></button><button onClick={(e) => { e.stopPropagation(); if(isFlipped) setIsFlipped(false); setXrayMode(!xrayMode); }} className={`h-20 w-20 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all duration-300 border-2 ${xrayMode ? 'bg-indigo-600 border-indigo-600 text-white translate-y-[-8px] shadow-indigo-200' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'}`}><Search size={28} strokeWidth={xrayMode ? 3 : 2} className={xrayMode ? 'animate-pulse' : ''} /><span className="text-[10px] font-black tracking-wider mt-1">X-RAY</span></button><button onClick={() => { setXrayMode(false); setIsFlipped(false); setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 200); }} className="h-14 w-14 rounded-full bg-white border border-slate-100 shadow-md text-emerald-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"><Check size={28} strokeWidth={2.5} /></button></div></div></div>
  );
};

// --- BUILDER HUB (GENERIC) ---
const LessonBuilderView = ({ onSave }) => {
  const [data, setData] = useState({ title: '', subtitle: '', description: '', vocab: '', dialogue: [{ speaker: '', text: '', translation: '', side: 'left' }], quiz: { question: '', correctId: 'a', options: [{id:'a', text:''}, {id:'b', text:''}, {id:'c', text:''}] } });
  const updateDialogue = (idx, field, val) => { const newD = [...data.dialogue]; newD[idx][field] = val; setData({ ...data, dialogue: newD }); };
  const addLine = () => setData({ ...data, dialogue: [...data.dialogue, { speaker: '', text: '', translation: '', side: 'left' }] });
  const removeLine = (idx) => setData({ ...data, dialogue: data.dialogue.filter((_, i) => i !== idx) });
  const updateOption = (idx, val) => { const newOpts = [...data.quiz.options]; newOpts[idx].text = val; setData({ ...data, quiz: { ...data.quiz, options: newOpts } }); };
  const handleSave = () => { if (!data.title) return alert("Title is required"); onSave({ ...data, vocab: data.vocab.split(',').map(s => s.trim()), xp: 100 }); };

  return (
    <div className="px-6 mt-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"><h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-indigo-600"/> Basics</h3><input className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm font-bold" placeholder="Lesson Title" value={data.title} onChange={e => setData({...data, title: e.target.value})} /><input className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm" placeholder="Subtitle" value={data.subtitle} onChange={e => setData({...data, subtitle: e.target.value})} /><textarea className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm" rows={2} placeholder="Description" value={data.description} onChange={e => setData({...data, description: e.target.value})} /><input className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm" placeholder="Vocab list (comma separated)" value={data.vocab} onChange={e => setData({...data, vocab: e.target.value})} /></section>
      <section className="space-y-4"><h3 className="font-bold text-slate-800 flex items-center gap-2 px-1"><MessageSquare size={18} className="text-indigo-600"/> Dialogue</h3>{data.dialogue.map((line, i) => (<div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group"><button onClick={() => removeLine(i)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button><div className="flex gap-2 mb-2"><input className="flex-1 p-2 bg-slate-50 rounded border border-slate-100 text-xs font-bold" placeholder="Speaker" value={line.speaker} onChange={e => updateDialogue(i, 'speaker', e.target.value)} /><select className="p-2 bg-slate-50 rounded border border-slate-100 text-xs" value={line.side} onChange={e => updateDialogue(i, 'side', e.target.value)}><option value="left">Left (You)</option><option value="right">Right (Other)</option></select></div><input className="w-full mb-2 p-2 bg-slate-50 rounded border border-slate-100 text-sm" placeholder="Latin text" value={line.text} onChange={e => updateDialogue(i, 'text', e.target.value)} /><input className="w-full p-2 bg-slate-50 rounded border border-slate-100 text-xs italic text-slate-500" placeholder="English translation" value={line.translation} onChange={e => updateDialogue(i, 'translation', e.target.value)} /></div>))}<button onClick={addLine} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-500 transition-all"><Plus size={18} /> Add Line</button></section>
      <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Brain size={18} className="text-indigo-600"/> Quiz</h3><input className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm font-bold" placeholder="Question text" value={data.quiz.question} onChange={e => setData({...data, quiz: {...data.quiz, question: e.target.value}})} /><div className="space-y-2">{data.quiz.options.map((opt, i) => (<div key={opt.id} className="flex gap-2 items-center"><input type="radio" name="correct" checked={data.quiz.correctId === opt.id} onChange={() => setData({...data, quiz: {...data.quiz, correctId: opt.id}})} /><input className="flex-1 p-2 bg-slate-50 rounded border border-slate-100 text-sm" placeholder={`Option ${opt.id.toUpperCase()}`} value={opt.text} onChange={e => updateOption(i, e.target.value)} /></div>))}</div></section>
      <button onClick={handleSave} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"><Save size={20} /> Save Lesson</button>
    </div>
  );
};

// --- BUILDER HUB (STUDENT) ---
const BuilderHub = ({ onSaveCard, onSaveLesson }) => {
  const [mode, setMode] = useState('card'); 
  const CardForm = () => {
    const [formData, setFormData] = useState({ front: '', back: '', type: 'noun', sentence: '', translation: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => { e.preventDefault(); if (!formData.front) return; onSaveCard({ front: formData.front, back: formData.back, type: formData.type, ipa: "/.../", mastery: 0, morphology: [{ part: formData.front, meaning: "Custom", type: "root" }], usage: { sentence: formData.sentence || "N/A", translation: formData.translation || "-" }, grammar_tags: ["Custom"] }); setFormData({ front: '', back: '', type: 'noun', sentence: '', translation: '' }); };
    return (
      <form onSubmit={handleSubmit} className="px-6 mt-4 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500"><div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verbum (Latin)</label><input name="front" value={formData.front} onChange={handleChange} placeholder="e.g., Bellum" className="w-full p-4 rounded-xl border border-slate-200 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" /></div><div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Translatio (English)</label><input name="back" value={formData.back} onChange={handleChange} placeholder="e.g., War" className="w-full p-4 rounded-xl border border-slate-200 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" /></div><div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Genus (Type)</label><div className="grid grid-cols-2 gap-2">{['noun', 'verb', 'adverb', 'phrase'].map(type => (<button type="button" key={type} onClick={() => setFormData({ ...formData, type })} className={`p-3 rounded-lg text-sm font-bold capitalize transition-all border ${formData.type === type ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{type}</button>))}</div></div><button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"><Save size={20} /> Create Card</button></form>
    );
  };
  return (
    <div className="pb-24 h-full bg-slate-50 overflow-y-auto custom-scrollbar">{mode === 'card' && <Header title="Scriptorium" subtitle="Card Builder" />}{mode === 'card' && (<><div className="px-6 mt-2"><div className="flex bg-slate-200 p-1 rounded-xl"><button onClick={() => setMode('card')} className="flex-1 py-2 text-sm font-bold rounded-lg bg-white shadow-sm text-indigo-700">Flashcard</button><button onClick={() => setMode('lesson')} className="flex-1 py-2 text-sm font-bold rounded-lg text-slate-500">Full Lesson</button></div></div><CardForm /></>)}{mode === 'lesson' && <LessonBuilderView onSave={onSaveLesson} />}</div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Data State
  const [systemDecks, setSystemDecks] = useState({});
  const [systemLessons, setSystemLessons] = useState([]);
  const [customCards, setCustomCards] = useState([]);
  const [customLessons, setCustomLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedDeckKey, setSelectedDeckKey] = useState('salutationes');

  const allDecks = {
    ...systemDecks,
    custom: { title: "✍️ Scriptorium", cards: customCards }
  };
  const lessons = [...systemLessons, ...customLessons];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setCustomCards([]);
      setCustomLessons([]);
      return;
    }

    const unsubProfile = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), (docSnap) => {
      if (docSnap.exists()) setUserData(docSnap.data());
      else setUserData(DEFAULT_USER_DATA);
    });

    const unsubCards = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_cards'), (snap) => {
      setCustomCards(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubLessons = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_lessons'), (snap) => {
      setCustomLessons(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubSysDecks = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'system_decks'), (snap) => {
      const decks = {};
      snap.docs.forEach(doc => { decks[doc.id] = doc.data(); });
      if (Object.keys(decks).length === 0) setSystemDecks(INITIAL_SYSTEM_DECKS);
      else setSystemDecks(decks);
    });

    const unsubSysLessons = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'system_lessons'), (snap) => {
      const ls = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (ls.length === 0) setSystemLessons(INITIAL_SYSTEM_LESSONS);
      else setSystemLessons(ls);
    });

    return () => {
      unsubProfile(); unsubCards(); unsubLessons(); unsubSysDecks(); unsubSysLessons();
    };
  }, [user]);

  const handleCreateCard = async (newCard) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_cards'), newCard);
      setSelectedDeckKey('custom');
      setActiveTab('flashcards');
    } catch (e) { console.error(e); }
  };

  const handleCreateLesson = async (newLesson) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_lessons'), newLesson);
      setActiveTab('home');
    } catch (e) { console.error(e); }
  };

  const handleFinishLesson = async (xpEarned) => {
    setActiveTab('home');
    if (xpEarned > 0 && user) {
       try {
         await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), {
           xp: increment(xpEarned)
         });
       } catch (e) {
         await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), { ...DEFAULT_USER_DATA, xp: xpEarned }, { merge: true });
       }
    }
  };

  const renderView = () => {
    if (!authChecked) return <div className="h-full flex items-center justify-center text-indigo-500"><Loader className="animate-spin" size={32}/></div>;
    
    if (!user) return <AuthView />;

    switch (activeTab) {
      case 'home': return <HomeView setActiveTab={setActiveTab} lessons={lessons} onSelectLesson={(l) => { setActiveLesson(l); setActiveTab('lesson'); }} userData={userData} />;
      case 'lesson': return <LessonView lesson={activeLesson} onFinish={handleFinishLesson} />;
      case 'flashcards': return <FlashcardView allDecks={allDecks} selectedDeckKey={selectedDeckKey} onSelectDeck={setSelectedDeckKey} />;
      case 'create': return <BuilderHub onSaveCard={handleCreateCard} onSaveLesson={handleCreateLesson} />;
      case 'teach': return <InstructorView user={user} allDecks={allDecks} onSaveLesson={handleCreateLesson} onSaveCard={handleCreateCard} />;
      case 'profile': return <ProfileView user={user} userData={userData} />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-900 flex justify-center items-center p-0 sm:p-4">
      <div className="bg-slate-50 w-full max-w-[400px] h-[100dvh] sm:h-[800px] sm:rounded-[3rem] shadow-2xl relative overflow-hidden border-[8px] border-slate-900/5 sm:border-slate-900/10">
        <div className="absolute top-0 left-0 right-0 h-8 bg-white/0 z-50 pointer-events-none" />
        {renderView()}
        {user && <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />}
      </div>
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default App;
