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
  deleteDoc,
  arrayUnion
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
  Copy,
  List,
  ArrowRight,
  LayoutDashboard,
  Settings,
  MoreVertical,
  Library,
  Eye,
  ArrowLeft
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
  adjective: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
};

// --- COMPONENTS ---

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Domus' },
    { id: 'flashcards', icon: Layers, label: 'Chartae' },
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

// --- HELPER COMPONENT: CARD BUILDER ---
const CardBuilderView = ({ onSaveCard }) => {
  const [formData, setFormData] = useState({ front: '', back: '', type: 'noun', sentence: '', translation: '' });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { 
    e.preventDefault(); 
    if (!formData.front) return; 
    onSaveCard({ 
      front: formData.front, 
      back: formData.back, 
      type: formData.type, 
      ipa: "/.../", 
      mastery: 0, 
      morphology: [{ part: formData.front, meaning: "Custom", type: "root" }], 
      usage: { sentence: formData.sentence || "N/A", translation: formData.translation || "-" }, 
      grammar_tags: ["Custom"] 
    }); 
    setFormData({ front: '', back: '', type: 'noun', sentence: '', translation: '' }); 
    alert("Card Created!");
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 mt-4 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4 text-sm text-indigo-800">
        <p className="font-bold flex items-center gap-2"><Layers size={16}/> Flashcard Deck Creator</p>
        <p className="opacity-80 text-xs mt-1">Add cards one by one to build your custom deck.</p>
      </div>
      <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verbum (Latin)</label><input name="front" value={formData.front} onChange={handleChange} placeholder="e.g., Bellum" className="w-full p-4 rounded-xl border border-slate-200 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" /></div>
      <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Translatio (English)</label><input name="back" value={formData.back} onChange={handleChange} placeholder="e.g., War" className="w-full p-4 rounded-xl border border-slate-200 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" /></div>
      <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Genus (Type)</label><div className="grid grid-cols-2 gap-2">{['noun', 'verb', 'adverb', 'phrase'].map(type => (<button type="button" key={type} onClick={() => setFormData({ ...formData, type })} className={`p-3 rounded-lg text-sm font-bold capitalize transition-all border ${formData.type === type ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>{type}</button>))}</div></div>
      <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"><Save size={20} /> Create Card</button>
    </form>
  );
};

// --- HELPER COMPONENT: LESSON BUILDER ---
const LessonBuilderView = ({ data, setData, onSave }) => {
  const updateDialogue = (idx, field, val) => { 
    const newD = [...data.dialogue]; 
    newD[idx][field] = val; 
    setData({ ...data, dialogue: newD }); 
  };
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

// --- INSTRUCTOR DASHBOARD (TABLET/PC OPTIMIZED) ---
const InstructorDashboard = ({ user, userData, allDecks, lessons, onSaveLesson, onSaveCard, onLogout }) => {
  const [view, setView] = useState('dashboard'); // dashboard, classes, library, builder
  const [classes, setClasses] = useState([]);
  // Builder state
  const [builderData, setBuilderData] = useState({ title: '', subtitle: '', description: '', vocab: '', dialogue: [{ speaker: '', text: '', translation: '', side: 'left' }], quiz: { question: 'Test Question', correctId: 'a', options: [{id:'a',text:'A'},{id:'b',text:'B'},{id:'c',text:'C'}] } });
  const [builderMode, setBuilderMode] = useState('lesson'); // 'lesson' or 'deck'
  
  // Class Management States
  const [selectedClass, setSelectedClass] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Listen for classes
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
      name: newClassName, code: joinCode, students: [], assignments: [], created: Date.now()
    });
    setNewClassName('');
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm("Delete this class?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'classes', id));
      if (selectedClass?.id === id) setSelectedClass(null);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName || !selectedClass) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'classes', selectedClass.id), {
      students: arrayUnion(newStudentName)
    });
    setSelectedClass(prev => ({...prev, students: [...(prev.students || []), newStudentName]}));
    setNewStudentName('');
  };

  const handleAssignLesson = async (lessonId) => {
    if (!selectedClass) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'classes', selectedClass.id), {
      assignments: arrayUnion(lessonId)
    });
    setSelectedClass(prev => ({...prev, assignments: [...(prev.assignments || []), lessonId]}));
    setAssignModalOpen(false);
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => { setView(id); setSelectedClass(null); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === id && !selectedClass ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  const previewLesson = {
    ...builderData,
    vocab: builderData.vocab ? builderData.vocab.split(',').map(s => s.trim()) : [],
    xp: 100
  };

  const allCards = Object.values(allDecks).flatMap(deck => deck.cards || []);
  const filteredCards = allCards.filter(c => 
    c.front.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.back.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">LinguistFlow</h1>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Magister Mode</span>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="classes" icon={School} label="My Classes" />
          <NavItem id="library" icon={Library} label="Content Library" />
          <NavItem id="builder" icon={PlusCircle} label="Content Creator" />
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
              {userData?.name?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{userData?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Bar (Mobile only) */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-20">
          <div className="font-bold text-indigo-700 flex items-center gap-2"><GraduationCap/> Magister</div>
          <button onClick={onLogout}><LogOut size={20} className="text-slate-400"/></button>
        </div>

        <div className="p-6 max-w-6xl mx-auto h-full">
          
          {/* DASHBOARD VIEW */}
          {view === 'dashboard' && !selectedClass && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-slate-800">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div><p className="text-slate-400 text-xs font-bold uppercase">Active Students</p><h3 className="text-3xl font-bold text-slate-900 mt-1">{classes.reduce((acc, c) => acc + (c.students?.length || 0), 0)}</h3></div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={24}/></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div><p className="text-slate-400 text-xs font-bold uppercase">Total Classes</p><h3 className="text-3xl font-bold text-slate-900 mt-1">{classes.length}</h3></div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><School size={24}/></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div><p className="text-slate-400 text-xs font-bold uppercase">Content Items</p><h3 className="text-3xl font-bold text-slate-900 mt-1">{Object.values(allDecks).reduce((acc, d) => acc + (d.cards?.length || 0), 0) + lessons.length}</h3></div>
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Layers size={24}/></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CLASSES VIEW */}
          {view === 'classes' && !selectedClass && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">My Classes</h2>
                <form onSubmit={handleCreateClass} className="flex gap-2">
                  <input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="New Class Name" className="p-2 rounded-lg border border-slate-200 text-sm w-64" />
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={16}/> Create</button>
                </form>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.length === 0 && <div className="col-span-full p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">No classes created yet.</div>}
                {classes.map(cls => (
                  <div key={cls.id} onClick={() => setSelectedClass(cls)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative cursor-pointer">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => {e.stopPropagation(); handleDeleteClass(cls.id);}} className="text-slate-300 hover:text-rose-500"><Trash2 size={18}/></button></div>
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 font-bold text-lg">{cls.name.charAt(0)}</div>
                    <h3 className="font-bold text-lg text-slate-900">{cls.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{(cls.students || []).length} Students Enrolled</p>
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                      <span className="text-xs font-mono font-bold text-slate-600 tracking-wider">{cls.code}</span>
                      <button className="text-indigo-600 text-xs font-bold flex items-center gap-1" onClick={(e) => {e.stopPropagation(); navigator.clipboard.writeText(cls.code);}}><Copy size={12}/> Copy Code</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLASS DETAIL VIEW */}
          {selectedClass && (
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
               <div className="pb-6 border-b border-slate-100 mb-6">
                 <button onClick={() => setSelectedClass(null)} className="flex items-center text-slate-500 hover:text-indigo-600 mb-2 text-sm font-bold"><ArrowLeft size={16} className="mr-1"/> Back to Classes</button>
                 <div className="flex justify-between items-end">
                   <div>
                     <h1 className="text-2xl font-bold text-slate-900">{selectedClass.name}</h1>
                     <p className="text-sm text-slate-500 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">Code: {selectedClass.code}</p>
                   </div>
                   <button onClick={() => setAssignModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm"><Plus size={16}/> Assign</button>
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Assignments Column */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><BookOpen size={18} className="text-indigo-600"/> Assignments</h3>
                    {(!selectedClass.assignments || selectedClass.assignments.length === 0) && <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">No lessons assigned yet.</div>}
                    {selectedClass.assignments?.map((lid, idx) => {
                       const l = lessons.find(ls => ls.id === lid) || INITIAL_SYSTEM_LESSONS.find(sl => sl.id === lid);
                       return l ? (
                         <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                            <div><h4 className="font-bold text-slate-800">{l.title}</h4><p className="text-xs text-slate-500">{l.subtitle}</p></div>
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold">Active</span>
                         </div>
                       ) : null;
                    })}
                  </div>

                  {/* Roster Column */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={18} className="text-indigo-600"/> Student Roster</h3>
                    <form onSubmit={handleAddStudent} className="flex gap-2">
                      <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Add Student Name" className="flex-1 p-2 rounded-lg border border-slate-200 text-sm" />
                      <button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg"><Plus size={18}/></button>
                    </form>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      {(!selectedClass.students || selectedClass.students.length === 0) && <div className="p-4 text-center text-slate-400 text-sm italic">No students joined yet.</div>}
                      {selectedClass.students?.map((s, i) => (
                        <div key={i} className="p-3 border-b border-slate-50 last:border-0 flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">{s.charAt(0)}</div>
                          <span className="text-sm font-medium text-slate-700">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>

               {/* Assignment Modal */}
               {assignModalOpen && (
                 <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                   <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                     <div className="p-4 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-lg">Select Lesson</h3><button onClick={() => setAssignModalOpen(false)}><X size={20} className="text-slate-400"/></button></div>
                     <div className="flex-1 overflow-y-auto p-2">
                       {[...INITIAL_SYSTEM_LESSONS, ...lessons].map(l => (
                         <button key={l.id} onClick={() => handleAssignLesson(l.id)} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors border-b border-transparent hover:border-slate-100">
                           <h4 className="font-bold text-indigo-900">{l.title}</h4><p className="text-xs text-slate-500">{l.subtitle}</p>
                         </button>
                       ))}
                     </div>
                   </div>
                 </div>
               )}
            </div>
          )}

          {/* LIBRARY VIEW */}
          {view === 'library' && !selectedClass && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Content Library</h2>
                <div className="relative">
                   <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                   <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search content..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><BookOpen size={18} className="text-indigo-600"/> Interactive Lessons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...INITIAL_SYSTEM_LESSONS, ...lessons].filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase())).map(l => (
                    <div key={l.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-300 transition-colors cursor-pointer">
                      <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600"><PlayCircle size={20}/></div>
                      <div><h4 className="font-bold text-slate-900">{l.title}</h4><p className="text-xs text-slate-500">{l.vocab.length} Words • {l.xp} XP</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Layers size={18} className="text-orange-500"/> Flashcard Decks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(allDecks).map(([key, deck]) => (
                    <div key={key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-300 transition-colors cursor-pointer">
                       <h4 className="font-bold text-slate-900">{deck.title}</h4>
                       <p className="text-xs text-slate-500">{deck.cards?.length} Cards</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Card Search Result */}
              {searchTerm && (
                  <div>
                      <h3 className="font-bold text-slate-800 mb-3 mt-8 flex items-center gap-2"><Search size={18} className="text-slate-500"/> Card Results</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {filteredCards.map((c, i) => (
                              <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm">
                                  <span className="font-bold">{c.front}</span> - <span className="text-slate-500">{c.back}</span>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
            </div>
          )}

          {/* BUILDER VIEW WITH PREVIEW */}
          {view === 'builder' && !selectedClass && (
            <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
              {/* Editor Side */}
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2"><FileText size={18} /> Content Creator</h3>
                    <div className="flex bg-slate-100 p-0.5 rounded-lg">
                      <button onClick={() => setBuilderMode('lesson')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${builderMode === 'lesson' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Lesson</button>
                      <button onClick={() => setBuilderMode('deck')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${builderMode === 'deck' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Deck</button>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-indigo-600 hover:underline" onClick={() => setBuilderData({ title: '', subtitle: '', description: '', vocab: '', dialogue: [{ speaker: '', text: '', translation: '', side: 'left' }], quiz: { question: '', correctId: 'a', options: [{id:'a', text:''}, {id:'b', text:''}, {id:'c', text:''}] } })}>Clear Form</button>
                </div>
                <div className="flex-1 overflow-y-auto p-0">
                  {builderMode === 'lesson' ? (
                    <LessonBuilderView 
                      data={builderData} 
                      setData={setBuilderData} 
                      onSave={(l) => { onSaveLesson(l); alert("Lesson Saved to Library"); }} 
                    />
                  ) : (
                    <CardBuilderView 
                      onSaveCard={onSaveCard}
                    />
                  )}
                </div>
              </div>

              {/* Preview Side */}
              {builderMode === 'lesson' && (
                <div className="w-full md:w-[400px] bg-white rounded-[3rem] border-[8px] border-slate-900/10 shadow-xl overflow-hidden flex flex-col relative">
                  {/* Simulated Notch */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-white/0 z-50 pointer-events-none" />
                  {/* Reusing LessonView for Live Preview */}
                  <div className="flex-1 overflow-hidden bg-slate-50">
                     <LessonView lesson={previewLesson} onFinish={() => alert("Preview Finished!")} />
                  </div>
                  <div className="bg-slate-100 p-2 text-center text-xs text-slate-400 font-bold uppercase tracking-wider border-t border-slate-200">
                    Student Preview
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- BUILDER HUB (STUDENT) ---
const BuilderHub = ({ onSaveCard, onSaveLesson }) => {
  // Local state for the student's lesson builder
  const [lessonData, setLessonData] = useState({ title: '', subtitle: '', description: '', vocab: '', dialogue: [{ speaker: '', text: '', translation: '', side: 'left' }], quiz: { question: '', correctId: 'a', options: [{id:'a',text:''},{id:'b',text:''},{id:'c',text:''}] } });
  const [mode, setMode] = useState('card'); 
  return (
    <div className="pb-24 h-full bg-slate-50 overflow-y-auto custom-scrollbar">{mode === 'card' && <Header title="Scriptorium" subtitle="Card Builder" />}{mode === 'card' && (<><div className="px-6 mt-2"><div className="flex bg-slate-200 p-1 rounded-xl"><button onClick={() => setMode('card')} className="flex-1 py-2 text-sm font-bold rounded-lg bg-white shadow-sm text-indigo-700">Flashcard</button><button onClick={() => setMode('lesson')} className="flex-1 py-2 text-sm font-bold rounded-lg text-slate-500">Full Lesson</button></div></div><CardBuilderView onSaveCard={onSaveCard} /></>)}{mode === 'lesson' && <LessonBuilderView data={lessonData} setData={setLessonData} onSave={onSaveLesson} />}</div>
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

  const allDecks = { ...systemDecks, custom: { title: "✍️ Scriptorium", cards: customCards } };
  const lessons = [...systemLessons, ...customLessons];

  useEffect(() => { const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setAuthChecked(true); }); return () => unsubscribe(); }, []);
  useEffect(() => {
    if (!user) { setUserData(null); return; }
    const unsubProfile = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), (docSnap) => { if (docSnap.exists()) setUserData(docSnap.data()); else setUserData(DEFAULT_USER_DATA); });
    const unsubCards = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_cards'), (snap) => setCustomCards(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubLessons = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_lessons'), (snap) => setCustomLessons(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSysDecks = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'system_decks'), (snap) => { const d = {}; snap.docs.forEach(doc => { d[doc.id] = doc.data(); }); if (Object.keys(d).length === 0) setSystemDecks(INITIAL_SYSTEM_DECKS); else setSystemDecks(d); });
    const unsubSysLessons = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'system_lessons'), (snap) => { const l = snap.docs.map(d => ({ id: d.id, ...d.data() })); if (l.length === 0) setSystemLessons(INITIAL_SYSTEM_LESSONS); else setSystemLessons(l); });
    return () => { unsubProfile(); unsubCards(); unsubLessons(); unsubSysDecks(); unsubSysLessons(); };
  }, [user]);

  const handleCreateCard = async (c) => { if(!user) return; await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_cards'), c); setSelectedDeckKey('custom'); setActiveTab('flashcards'); };
  const handleCreateLesson = async (l) => { if(!user) return; await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_lessons'), l); setActiveTab('home'); };
  const handleFinishLesson = async (xp) => { setActiveTab('home'); if (xp > 0 && user) { try { await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), { xp: increment(xp) }); } catch (e) { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), { ...DEFAULT_USER_DATA, xp }, { merge: true }); } } };

  if (!authChecked) return <div className="h-full flex items-center justify-center text-indigo-500"><Loader className="animate-spin" size={32}/></div>;
  if (!user) return <AuthView />;
  if (userData?.role === 'instructor') return <InstructorDashboard user={user} userData={userData} allDecks={allDecks} lessons={lessons} onSaveLesson={handleCreateLesson} onSaveCard={handleCreateCard} onLogout={() => signOut(auth)} />;

  const renderStudentView = () => {
    switch (activeTab) {
      case 'home': return <HomeView setActiveTab={setActiveTab} lessons={lessons} onSelectLesson={(l) => { setActiveLesson(l); setActiveTab('lesson'); }} userData={userData} />;
      case 'lesson': return <LessonView lesson={activeLesson} onFinish={handleFinishLesson} />;
      case 'flashcards': return <FlashcardView allDecks={allDecks} selectedDeckKey={selectedDeckKey} onSelectDeck={setSelectedDeckKey} onSaveCard={handleCreateCard} />;
      case 'create': return <BuilderHub onSaveCard={handleCreateCard} onSaveLesson={handleCreateLesson} />;
      case 'profile': return <ProfileView user={user} userData={userData} />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-900 flex justify-center items-center p-0 sm:p-4">
      <div className="bg-slate-50 w-full max-w-[400px] h-[100dvh] sm:h-[800px] sm:rounded-[3rem] shadow-2xl relative overflow-hidden border-[8px] border-slate-900/5 sm:border-slate-900/10">
        <div className="absolute top-0 left-0 right-0 h-8 bg-white/0 z-50 pointer-events-none" />
        {renderStudentView()}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <style>{` .perspective-1000 { perspective: 1000px; } .preserve-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; } `}</style>
    </div>
  );
};

export default App;
