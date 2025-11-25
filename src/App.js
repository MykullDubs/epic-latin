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
  ArrowLeft
} from 'lucide-react';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAjK79x_N5pSWzWluFUg25mqEc_HeraRPk",
  authDomain: "epic-latin.firebaseapp.com",
  projectId: "epic-latin",
  storageBucket: "epic-latin.firebasestorage.app",
  messagingSenderId: "321050459278",
  appId: "1:321050459278:web:df00b3cf5b8befb0d55ddf",
  measurementId: "G-KEWLZ67Z61"
};

const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'epic-latin-prod'; 

// --- DEFAULTS ---
const DEFAULT_USER_DATA = {
  name: "Discipulus",
  targetLanguage: "Latin",
  level: "Novice",
  streak: 1,
  xp: 0,
  role: 'student'
};

// --- SEED DATA ---
const INITIAL_SYSTEM_DECKS = {
  salutationes: {
    title: "👋 Salutationes",
    cards: [
      { id: 's1', front: "Salve", back: "Hello (Singular)", ipa: "/ˈsal.weː/", type: "phrase", mastery: 4, morphology: [{ part: "Salv-", meaning: "Health", type: "root" }, { part: "-e", meaning: "Imp. Sing.", type: "suffix" }], usage: { sentence: "Salve, Marce!", translation: "Hello, Marcus!" }, grammar_tags: ["Imperative", "Greeting"] },
      { id: 's2', front: "Salvete", back: "Hello (Plural)", ipa: "/salˈweː.te/", type: "phrase", mastery: 3, morphology: [{ part: "Salv-", meaning: "Health", type: "root" }, { part: "-ete", meaning: "Imp. Pl.", type: "suffix" }], usage: { sentence: "Salvete, discipuli!", translation: "Hello, students!" }, grammar_tags: ["Imperative", "Greeting"] }
    ]
  },
  medicina: {
    title: "⚕️ Medicina",
    cards: [
      { id: 'm1', front: "Vulnus", back: "Wound", ipa: "/ˈwul.nus/", type: "noun", mastery: 1, morphology: [{ part: "Vuln-", meaning: "Wound", type: "root" }, { part: "-us", meaning: "Nom.", type: "suffix" }], usage: { sentence: "Vulnus grave est.", translation: "The wound is serious." }, grammar_tags: ["3rd Declension"] }
    ]
  }
};

const INITIAL_SYSTEM_LESSONS = [
  {
    id: 'l1',
    title: "Salutationes",
    subtitle: "Greetings in the Forum",
    description: "Learn how to greet friends and elders.",
    xp: 50,
    vocab: ['Salve', 'Vale', 'Quid agis?'],
    dialogue: [
      { speaker: "Marcus", text: "Salve, Iulia!", translation: "Hello, Julia!", side: "left" },
      { speaker: "Iulia", text: "Salve, Marce.", translation: "Hello, Marcus.", side: "right" }
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

// --- SHARED COMPONENTS ---

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Domus' },
    { id: 'flashcards', icon: Layers, label: 'Chartae' },
    { id: 'profile', icon: User, label: 'Ego' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center space-y-1 transition-all duration-200 ${activeTab === tab.id ? 'text-indigo-600 scale-105' : 'text-slate-400'}`}>
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
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">{title} {onClickTitle && <ChevronDown size={20} className="text-slate-400" />}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1 font-medium">{subtitle}</p>}
    </div>
    {rightAction}
  </div>
);

// --- BUILDER COMPONENTS ---

const CardBuilderView = ({ onSaveCard }) => {
  const [formData, setFormData] = useState({ front: '', back: '', type: 'noun' });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { 
    e.preventDefault(); 
    if (!formData.front) return; 
    onSaveCard({ ...formData, ipa: "/.../", mastery: 0, morphology: [{ part: formData.front, meaning: "Custom", type: "root" }], usage: { sentence: "-", translation: "-" }, grammar_tags: ["Custom"] }); 
    setFormData({ front: '', back: '', type: 'noun' }); 
    alert("Card Created!");
  };
  return (
    <form onSubmit={handleSubmit} className="px-6 mt-4 space-y-5">
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4 text-sm text-indigo-800 font-bold">Add cards to your custom deck.</div>
      <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase">Latin</label><input name="front" value={formData.front} onChange={handleChange} className="w-full p-4 rounded-xl border border-slate-200 font-bold" /></div>
      <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase">English</label><input name="back" value={formData.back} onChange={handleChange} className="w-full p-4 rounded-xl border border-slate-200" /></div>
      <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg"><Save size={20} className="inline mr-2"/>Create Card</button>
    </form>
  );
};

const LessonBuilderView = ({ data, setData, onSave }) => {
  const updateDialogue = (idx, field, val) => { const newD = [...data.dialogue]; newD[idx][field] = val; setData({ ...data, dialogue: newD }); };
  const addLine = () => setData({ ...data, dialogue: [...data.dialogue, { speaker: '', text: '', translation: '', side: 'left' }] });
  const handleSave = () => { if (!data.title) return alert("Title required"); onSave({ ...data, vocab: data.vocab.split(',').map(s => s.trim()), xp: 100 }); };
  return (
    <div className="px-6 mt-4 space-y-6">
      <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"><h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-indigo-600"/> Basics</h3><input className="w-full p-3 rounded-lg border border-slate-200 font-bold" placeholder="Title" value={data.title} onChange={e => setData({...data, title: e.target.value})} /><textarea className="w-full p-3 rounded-lg border border-slate-200" placeholder="Description" value={data.description} onChange={e => setData({...data, description: e.target.value})} /><input className="w-full p-3 rounded-lg border border-slate-200" placeholder="Vocab (comma separated)" value={data.vocab} onChange={e => setData({...data, vocab: e.target.value})} /></section>
      <section className="space-y-4"><h3 className="font-bold text-slate-800 flex items-center gap-2"><MessageSquare size={18} className="text-indigo-600"/> Dialogue</h3>{data.dialogue.map((line, i) => (<div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-2"><div className="flex gap-2 mb-2"><input className="flex-1 p-2 rounded border border-slate-100 text-xs font-bold" placeholder="Speaker" value={line.speaker} onChange={e => updateDialogue(i, 'speaker', e.target.value)} /><select className="p-2 rounded border border-slate-100 text-xs" value={line.side} onChange={e => updateDialogue(i, 'side', e.target.value)}><option value="left">Left</option><option value="right">Right</option></select></div><input className="w-full mb-2 p-2 rounded border border-slate-100 text-sm" placeholder="Latin" value={line.text} onChange={e => updateDialogue(i, 'text', e.target.value)} /></div>))}<button onClick={addLine} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold flex items-center justify-center gap-2"><Plus size={18} /> Add Line</button></section>
      <button onClick={handleSave} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg"><Save size={20} className="inline mr-2"/> Save Lesson</button>
    </div>
  );
};

// --- INSTRUCTOR COMPONENTS ---

const ClassManagerView = ({ user, lessons }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'classes');
    const unsubscribe = onSnapshot(q, (snapshot) => setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    return () => unsubscribe();
  }, [user]);

  const createClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'classes'), { name: newClassName, code: Math.random().toString(36).substring(2, 8).toUpperCase(), students: [], assignments: [], created: Date.now() });
    setNewClassName('');
  };

  const addStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName || !selectedClass) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'classes', selectedClass.id), { students: arrayUnion(newStudentName) });
    setSelectedClass(prev => ({...prev, students: [...(prev.students || []), newStudentName]}));
    setNewStudentName('');
  };

  const assignLesson = async (lessonId) => {
    if (!selectedClass) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'classes', selectedClass.id), { assignments: arrayUnion(lessonId) });
    setSelectedClass(prev => ({...prev, assignments: [...(prev.assignments || []), lessonId]}));
    setAssignModalOpen(false);
  };

  if (selectedClass) {
    return (
      <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
        <div className="pb-6 border-b border-slate-100 mb-6">
          <button onClick={() => setSelectedClass(null)} className="flex items-center text-slate-500 hover:text-indigo-600 mb-2 text-sm font-bold"><ArrowLeft size={16} className="mr-1"/> Back</button>
          <div className="flex justify-between items-end">
            <div><h1 className="text-2xl font-bold text-slate-900">{selectedClass.name}</h1><p className="text-sm text-slate-500 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">Code: {selectedClass.code}</p></div>
            <button onClick={() => setAssignModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm"><Plus size={16}/> Assign</button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="space-y-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2"><BookOpen size={18} className="text-indigo-600"/> Assignments</h3>
             {(!selectedClass.assignments || selectedClass.assignments.length === 0) && <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">No lessons assigned yet.</div>}
             {selectedClass.assignments?.map((lid, idx) => {
                const l = lessons.find(ls => ls.id === lid) || INITIAL_SYSTEM_LESSONS.find(sl => sl.id === lid);
                return l ? (<div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><div><h4 className="font-bold text-slate-800">{l.title}</h4></div><span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold">Active</span></div>) : null;
             })}
           </div>
           <div className="space-y-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={18} className="text-indigo-600"/> Roster</h3>
             <form onSubmit={addStudent} className="flex gap-2"><input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Student Name" className="flex-1 p-2 rounded-lg border border-slate-200 text-sm" /><button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg"><Plus size={18}/></button></form>
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">{(!selectedClass.students || selectedClass.students.length === 0) && <div className="p-4 text-center text-slate-400 text-sm italic">No students joined yet.</div>}{selectedClass.students?.map((s, i) => (<div key={i} className="p-3 border-b border-slate-50 last:border-0 flex items-center gap-3"><div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">{s.charAt(0)}</div><span className="text-sm font-medium text-slate-700">{s}</span></div>))}</div>
           </div>
        </div>
        {assignModalOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-lg">Select Lesson</h3><button onClick={() => setAssignModalOpen(false)}><X size={20} className="text-slate-400"/></button></div>
              <div className="flex-1 overflow-y-auto p-2">
                {[...INITIAL_SYSTEM_LESSONS, ...lessons].map(l => (
                  <button key={l.id} onClick={() => assignLesson(l.id)} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors border-b border-transparent hover:border-slate-100"><h4 className="font-bold text-indigo-900">{l.title}</h4><p className="text-xs text-slate-500">{l.subtitle}</p></button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">My Classes</h2>
        <form onSubmit={createClass} className="flex gap-2"><input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="New Class Name" className="p-2 rounded-lg border border-slate-200 text-sm w-64" /><button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={16}/> Create</button></form>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(cls => (
          <div key={cls.id} onClick={() => setSelectedClass(cls)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 font-bold text-lg">{cls.name.charAt(0)}</div>
            <h3 className="font-bold text-lg text-slate-900">{cls.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{(cls.students || []).length} Students</p>
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg"><span className="text-xs font-mono font-bold text-slate-600 tracking-wider">{cls.code}</span><button className="text-indigo-600 text-xs font-bold flex items-center gap-1" onClick={(e) => {e.stopPropagation(); navigator.clipboard.writeText(cls.code);}}><Copy size={12}/> Copy</button></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InstructorDashboard = ({ user, userData, allDecks, lessons, onSaveLesson, onSaveCard, onLogout }) => {
  const [view, setView] = useState('dashboard');
  const [builderData, setBuilderData] = useState({ title: '', subtitle: '', description: '', vocab: '', dialogue: [{ speaker: '', text: '', translation: '', side: 'left' }], quiz: { question: 'Test Question', correctId: 'a', options: [{id:'a',text:'A'},{id:'b',text:'B'},{id:'c',text:'C'}] } });
  const [builderMode, setBuilderMode] = useState('lesson');

  const NavItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => setView(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === id ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
      <Icon size={20} /><span>{label}</span>
    </button>
  );

  const previewLesson = { ...builderData, vocab: builderData.vocab ? builderData.vocab.split(',').map(s => s.trim()) : [], xp: 100 };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-3 mb-10 px-2"><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><GraduationCap size={24} /></div><div><h1 className="font-bold text-lg leading-none">LinguistFlow</h1><span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Magister Mode</span></div></div>
        <div className="space-y-2 flex-1"><NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" /><NavItem id="classes" icon={School} label="My Classes" /><NavItem id="library" icon={Library} label="Content Library" /><NavItem id="builder" icon={PlusCircle} label="Content Creator" /></div>
        <div className="pt-6 border-t border-slate-100"><button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><LogOut size={16} /> Sign Out</button></div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto h-full">
        {view === 'dashboard' && (
           <div className="space-y-6 animate-in fade-in duration-500"><h2 className="text-2xl font-bold text-slate-800">Overview</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold">Welcome Back</h3><p className="text-slate-400 text-xs font-bold uppercase">{userData.name}</p></div></div></div>
        )}
        {view === 'classes' && <ClassManagerView user={user} lessons={[...INITIAL_SYSTEM_LESSONS, ...lessons]} />}
        {view === 'library' && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <div><h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><BookOpen size={18} className="text-indigo-600"/> Lessons</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[...INITIAL_SYSTEM_LESSONS, ...lessons].map(l => (<div key={l.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4"><div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600"><PlayCircle size={20}/></div><div><h4 className="font-bold text-slate-900">{l.title}</h4><p className="text-xs text-slate-500">{l.vocab.length} Words</p></div></div>))}</div></div>
             <div><h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Layers size={18} className="text-orange-500"/> Decks</h3><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{Object.entries(allDecks).map(([key, deck]) => (<div key={key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"><h4 className="font-bold text-slate-900">{deck.title}</h4><p className="text-xs text-slate-500">{deck.cards?.length} Cards</p></div>))}</div></div>
           </div>
        )}
        {view === 'builder' && (
          <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"><div className="flex items-center gap-3"><h3 className="font-bold text-slate-700 flex items-center gap-2"><FileText size={18} /> Creator</h3><div className="flex bg-slate-100 p-0.5 rounded-lg"><button onClick={() => setBuilderMode('lesson')} className={`px-3 py-1 text-xs font-bold rounded-md ${builderMode === 'lesson' ? 'bg-white shadow-sm' : ''}`}>Lesson</button><button onClick={() => setBuilderMode('deck')} className={`px-3 py-1 text-xs font-bold rounded-md ${builderMode === 'deck' ? 'bg-white shadow-sm' : ''}`}>Deck</button></div></div><button className="text-xs font-bold text-indigo-600 hover:underline" onClick={() => setBuilderData({ title: '', subtitle: '', description: '', vocab: '', dialogue: [{ speaker: '', text: '', translation: '', side: 'left' }], quiz: { question: '', correctId: 'a', options: [{id:'a',text:''},{id:'b',text:''},{id:'c',text:''}] } })}>Clear Form</button></div>
              <div className="flex-1 overflow-y-auto p-0">{builderMode === 'lesson' ? <LessonBuilderView data={builderData} setData={setBuilderData} onSave={(l) => { onSaveLesson(l); alert("Saved!"); }} /> : <CardBuilderView onSaveCard={onSaveCard} />}</div>
            </div>
            {builderMode === 'lesson' && <div className="w-full md:w-[400px] bg-white rounded-[3rem] border-[8px] border-slate-900/10 shadow-xl overflow-hidden flex flex-col relative"><div className="flex-1 overflow-hidden bg-slate-50"><LessonView lesson={previewLesson} onFinish={() => alert("Preview")} /></div><div className="bg-slate-100 p-2 text-center text-xs text-slate-400 font-bold uppercase tracking-wider border-t border-slate-200">Student Preview</div></div>}
          </div>
        )}
      </div>
    </div>
  );
};

// --- BUILDER HUB (STUDENT) ---
const BuilderHub = ({ onSaveCard, onSaveLesson }) => {
  const [lessonData, setLessonData] = useState({ title: '', subtitle: '', description: '', vocab: '', dialogue: [{ speaker: '', text: '', translation: '', side: 'left' }], quiz: { question: '', correctId: 'a', options: [{id:'a',text:''},{id:'b',text:''},{id:'c',text:''}] } });
  const [mode, setMode] = useState('card'); 
  return (
    <div className="pb-24 h-full bg-slate-50 overflow-y-auto custom-scrollbar">{mode === 'card' && <Header title="Scriptorium" subtitle="Card Builder" />}{mode === 'card' && (<><div className="px-6 mt-2"><div className="flex bg-slate-200 p-1 rounded-xl"><button onClick={() => setMode('card')} className="flex-1 py-2 text-sm font-bold rounded-lg bg-white shadow-sm text-indigo-700">Flashcard</button><button onClick={() => setMode('lesson')} className="flex-1 py-2 text-sm font-bold rounded-lg text-slate-500">Full Lesson</button></div></div><CardBuilderView onSaveCard={onSaveCard} /></>)}{mode === 'lesson' && <LessonBuilderView data={lessonData} setData={setLessonData} onSave={onSaveLesson} />}</div>
  );
};

// --- AUTH VIEW ---
const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else { const uc = await createUserWithEmailAndPassword(auth, email, password); await setDoc(doc(db, 'artifacts', appId, 'users', uc.user.uid, 'profile', 'main'), { ...DEFAULT_USER_DATA, name: name || "User", email: email, role: role }); }
    } catch (err) { setError(err.message.replace('Firebase: ', '')); } finally { setLoading(false); }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-slate-50">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8"><div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white mb-4 shadow-xl"><GraduationCap size={40} /></div><h1 className="text-3xl font-bold text-slate-900">LinguistFlow</h1></div>
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && <><div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl" required={!isLogin} /></div><div className="flex gap-3"><button type="button" onClick={() => setRole('student')} className={`flex-1 p-3 rounded-xl border font-bold text-sm ${role === 'student' ? 'bg-indigo-600 text-white' : 'bg-white'}`}>Student</button><button type="button" onClick={() => setRole('instructor')} className={`flex-1 p-3 rounded-xl border font-bold text-sm ${role === 'instructor' ? 'bg-indigo-600 text-white' : 'bg-white'}`}>Instructor</button></div></>}
          <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl" required /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl" required /></div>
          {error && <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg">{loading ? <Loader className="animate-spin" /> : (isLogin ? "Sign In" : "Create Account")}</button>
        </form>
        <div className="mt-6 text-center"><button onClick={() => setIsLogin(!isLogin)} className="text-indigo-600 font-bold text-sm hover:underline">{isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}</button></div>
      </div>
    </div>
  );
};

// --- PROFILE VIEW ---
const ProfileView = ({ user, userData }) => {
  const [deploying, setDeploying] = useState(false);
  const handleLogout = () => signOut(auth);
  const deploySystemContent = async () => {
    setDeploying(true); const batch = writeBatch(db);
    Object.entries(INITIAL_SYSTEM_DECKS).forEach(([key, deck]) => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'system_decks', key), deck));
    INITIAL_SYSTEM_LESSONS.forEach((lesson) => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'system_lessons', lesson.id), lesson));
    try { await batch.commit(); alert("Deployed!"); } catch (e) { alert("Error: " + e.message); }
    setDeploying(false);
  };
  return (
    <div className="h-full flex flex-col bg-slate-50"><Header title="Ego" subtitle="Profile" /><div className="flex-1 px-6 mt-4"><div className="bg-white p-6 rounded-3xl shadow-sm border flex flex-col items-center mb-6"><h2 className="text-2xl font-bold">{userData?.name}</h2><p className="text-sm text-slate-500">{user.email}</p><div className="mt-4 px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase">{userData?.role}</div></div><button onClick={handleLogout} className="w-full bg-white p-4 rounded-xl border text-rose-600 font-bold mb-4 flex justify-between"><span>Sign Out</span><LogOut/></button><button onClick={deploySystemContent} disabled={deploying} className="w-full bg-slate-800 text-white p-4 rounded-xl font-bold flex justify-between">{deploying ? <Loader className="animate-spin"/> : <UploadCloud/>}<span>Deploy Content</span></button></div></div>
  );
};

// --- HOME VIEW ---
const HomeView = ({ setActiveTab, lessons, onSelectLesson, userData }) => (
  <div className="pb-24 animate-in fade-in duration-500 overflow-y-auto h-full">
    <Header title={`Ave, ${userData?.name}!`} subtitle="Perge in itinere tuo." />
    <div className="px-6 space-y-6 mt-4">
      <div className="bg-gradient-to-br from-red-800 to-rose-900 rounded-3xl p-6 text-white shadow-xl"><div className="flex justify-between"><div><p className="text-rose-100 text-sm font-bold uppercase">Hebdomada</p><h3 className="text-4xl font-serif font-bold">{userData?.xp} XP</h3></div><Zap size={28} className="text-yellow-400 fill-current"/></div><div className="mt-6 bg-black/20 rounded-full h-3"><div className="bg-yellow-400 h-full w-3/4 rounded-full"/></div></div>
      <div><h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><BookOpen size={18} className="text-indigo-600"/> Lessons</h3><div className="space-y-3">{lessons.map(l => (<button key={l.id} onClick={() => onSelectLesson(l)} className="w-full bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between"><div className="flex items-center gap-4"><div className="h-14 w-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700"><PlayCircle size={28}/></div><div className="text-left"><h4 className="font-bold text-slate-900">{l.title}</h4><p className="text-xs text-slate-500">{l.subtitle}</p></div></div><ChevronRight className="text-slate-300"/></button>))}</div></div>
      <div className="grid grid-cols-2 gap-4"><button onClick={() => setActiveTab('flashcards')} className="p-5 bg-orange-50 rounded-2xl border border-orange-100 text-center"><Layers className="mx-auto text-orange-500 mb-2"/><span className="block font-bold text-slate-800">Repetitio</span></button><button onClick={() => setActiveTab('create')} className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center"><Feather className="mx-auto text-emerald-500 mb-2"/><span className="block font-bold text-slate-800">Scriptorium</span></button></div>
    </div>
  </div>
);

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
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
