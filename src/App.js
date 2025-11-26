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
  arrayUnion,
  query,
  where,
  collectionGroup
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
  ArrowLeft,
  Library,
  Eye,
  AlignLeft,
  HelpCircle,
  Pencil,
  Image,
  Info,
  Edit3,
  TrendingUp,
  Activity,
  Calendar,
  FileJson
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
      { id: 's2', front: "Salvete", back: "Hello (Plural)", ipa: "/salˈweː.te/", type: "phrase", mastery: 3, morphology: [{ part: "Salv-", meaning: "Health", type: "root" }, { part: "-ete", meaning: "Imp. Pl.", type: "suffix" }], usage: { sentence: "Salvete, discipuli!", translation: "Hello, students!" }, grammar_tags: ["Imperative", "Greeting"] },
      { id: 's3', front: "Vale", back: "Goodbye", ipa: "/ˈwa.leː/", type: "phrase", mastery: 3, morphology: [{ part: "Val-", meaning: "Be strong", type: "root" }, { part: "-e", meaning: "Imp.", type: "suffix" }], usage: { sentence: "Vale, amice.", translation: "Goodbye, friend." }, grammar_tags: ["Valediction"] }
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
    blocks: [
      {
        type: 'text',
        title: 'The Basics',
        content: 'In Latin, we distinguish between addressing one person ("Salve") and multiple people ("Salvete").'
      },
      {
        type: 'dialogue',
        lines: [
          { speaker: "Marcus", text: "Salve, Iulia!", translation: "Hello, Julia!", side: "left" },
          { speaker: "Iulia", text: "Salve, Marce.", translation: "Hello, Marcus.", side: "right" }
        ]
      },
      {
        type: 'quiz',
        question: "How do you say 'Hello' to a group?",
        options: [{ id: 'a', text: "Salve" }, { id: 'b', text: "Salvete" }, { id: 'c', text: "Vale" }],
        correctId: 'b'
      }
    ]
  }
];

const TYPE_COLORS = {
  verb: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
  noun: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  adverb: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  phrase: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  adjective: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' }
};

// --- SHARED COMPONENTS ---

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300 border border-white/10">
      <Check size={16} className="text-emerald-400" />
      <span className="text-sm font-medium tracking-wide">{message}</span>
    </div>
  );
};

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

const CardBuilderView = ({ onSaveCard, onUpdateCard, onDeleteCard, availableDecks, initialDeckId }) => {
  const [formData, setFormData] = useState({
    front: '', back: '', type: 'noun', ipa: '', sentence: '', sentenceTrans: '', grammarTags: '', deckId: initialDeckId || 'custom'
  });
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [morphology, setMorphology] = useState([]);
  const [newMorphPart, setNewMorphPart] = useState({ part: '', meaning: '', type: 'root' });
  const [toastMsg, setToastMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (initialDeckId) setFormData(prev => ({...prev, deckId: initialDeckId}));
  }, [initialDeckId]);

  const handleChange = (e) => {
    if (e.target.name === 'deckId') {
      if (e.target.value === 'new') {
        setIsCreatingDeck(true);
        setFormData({ ...formData, deckId: 'new' });
      } else {
        setIsCreatingDeck(false);
        setFormData({ ...formData, deckId: e.target.value });
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const addMorphology = () => {
    if (newMorphPart.part && newMorphPart.meaning) {
      setMorphology([...morphology, newMorphPart]);
      setNewMorphPart({ part: '', meaning: '', type: 'root' });
    }
  };

  const removeMorphology = (index) => {
    setMorphology(morphology.filter((_, i) => i !== index));
  };

  const handleSelectCard = (card) => {
    setEditingId(card.id);
    setFormData({
      front: card.front,
      back: card.back,
      type: card.type || 'noun',
      ipa: card.ipa || '',
      sentence: card.usage?.sentence || '',
      sentenceTrans: card.usage?.translation || '',
      grammarTags: card.grammar_tags?.join(', ') || '',
      deckId: formData.deckId // Keep current deck selection
    });
    setMorphology(card.morphology || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClear = () => {
    setEditingId(null);
    setFormData(prev => ({ ...prev, front: '', back: '', type: 'noun', ipa: '', sentence: '', sentenceTrans: '', grammarTags: '' }));
    setMorphology([]);
  };

  const handleSubmit = (e) => { 
    e.preventDefault(); 
    if (!formData.front || !formData.back) return; 
    
    let finalDeckId = formData.deckId;
    let finalDeckTitle = null;

    if (formData.deckId === 'new') {
        if (!newDeckTitle) return alert("Please name your new deck.");
        finalDeckId = `custom_${Date.now()}`;
        finalDeckTitle = newDeckTitle;
    }

    const cardData = { 
      front: formData.front,
      back: formData.back,
      type: formData.type,
      deckId: finalDeckId,
      deckTitle: finalDeckTitle,
      ipa: formData.ipa || "/.../",
      mastery: 0,
      morphology: morphology.length > 0 ? morphology : [{ part: formData.front, meaning: "Root", type: "root" }],
      usage: { sentence: formData.sentence || "-", translation: formData.sentenceTrans || "-" },
      grammar_tags: formData.grammarTags ? formData.grammarTags.split(',').map(t => t.trim()) : ["Custom"]
    };

    if (editingId) {
      onUpdateCard(editingId, cardData);
      setToastMsg("Card Updated Successfully");
    } else {
      onSaveCard(cardData);
      setToastMsg("Card Created Successfully");
    }
    
    handleClear();
    if (isCreatingDeck) {
        setIsCreatingDeck(false);
        setNewDeckTitle('');
        setFormData(prev => ({ ...prev, deckId: finalDeckId })); 
    }
  };

  const deckOptions = availableDecks ? Object.entries(availableDecks).map(([key, deck]) => ({ id: key, title: deck.title })) : [];
  
  const currentDeckCards = availableDecks && availableDecks[formData.deckId] ? availableDecks[formData.deckId].cards : [];

  return (
    <div className="px-6 mt-4 space-y-6 pb-20 relative">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4 text-sm text-indigo-800 flex justify-between items-center">
        <div>
          <p className="font-bold flex items-center gap-2"><Layers size={16}/> {editingId ? 'Editing Card' : 'Card Creator'}</p>
          <p className="opacity-80 text-xs mt-1">{editingId ? 'Update details below.' : 'Define deep linguistic data (X-Ray).'}</p>
        </div>
        {editingId && <button onClick={handleClear} className="text-xs font-bold bg-white px-3 py-1 rounded-lg shadow-sm hover:text-indigo-600">Cancel Edit</button>}
      </div>

      <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Core Data</h3>
        
        {/* DECK SELECTOR */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Target Deck</label>
            <select name="deckId" value={formData.deckId} onChange={handleChange} disabled={!!editingId} className="w-full p-3 rounded-lg border border-slate-200 bg-indigo-50/50 font-bold text-indigo-900 disabled:opacity-50">
              <option value="custom">✍️ Scriptorium (My Deck)</option>
              {deckOptions.filter(d => d.id !== 'custom').map(d => (<option key={d.id} value={d.id}>{d.title}</option>))}
              <option value="new">✨ + Create New Deck</option>
            </select>
            {isCreatingDeck && (
                <input 
                    value={newDeckTitle} 
                    onChange={(e) => setNewDeckTitle(e.target.value)} 
                    placeholder="Enter New Deck Name" 
                    className="w-full p-3 rounded-lg border-2 border-indigo-500 bg-white font-bold mt-2 animate-in fade-in slide-in-from-top-2"
                    autoFocus
                />
            )}
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2"><label className="text-xs font-bold text-slate-400">Latin Word</label><input name="front" value={formData.front} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 font-bold" placeholder="e.g. Bellum" /></div>
           <div className="space-y-2"><label className="text-xs font-bold text-slate-400">English</label><input name="back" value={formData.back} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200" placeholder="e.g. War" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><label className="text-xs font-bold text-slate-400">Part of Speech</label><select name="type" value={formData.type} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 bg-white"><option value="noun">Noun</option><option value="verb">Verb</option><option value="adjective">Adjective</option><option value="adverb">Adverb</option><option value="phrase">Phrase</option></select></div>
          <div className="space-y-2"><label className="text-xs font-bold text-slate-400">IPA</label><input name="ipa" value={formData.ipa} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 font-mono text-sm" placeholder="/ˈbel.lum/" /></div>
        </div>
      </section>

      <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Morphology (X-Ray Data)</h3>
        <div className="flex gap-2 items-end">
           <div className="flex-1 space-y-1"><label className="text-[10px] font-bold text-slate-400">Part</label><input value={newMorphPart.part} onChange={(e) => setNewMorphPart({...newMorphPart, part: e.target.value})} className="w-full p-2 rounded-lg border border-slate-200 text-sm" placeholder="Bell-" /></div>
           <div className="flex-1 space-y-1"><label className="text-[10px] font-bold text-slate-400">Meaning</label><input value={newMorphPart.meaning} onChange={(e) => setNewMorphPart({...newMorphPart, meaning: e.target.value})} className="w-full p-2 rounded-lg border border-slate-200 text-sm" placeholder="War" /></div>
           <div className="w-24 space-y-1">
             <label className="text-[10px] font-bold text-slate-400">Type</label>
             <select value={newMorphPart.type} onChange={(e) => setNewMorphPart({...newMorphPart, type: e.target.value})} className="w-full p-2 rounded-lg border border-slate-200 text-sm bg-white">
               <option value="root">Root</option>
               <option value="prefix">Prefix</option>
               <option value="suffix">Suffix</option>
             </select>
           </div>
           <button type="button" onClick={addMorphology} className="bg-indigo-100 text-indigo-600 p-2 rounded-lg hover:bg-indigo-200"><Plus size={20}/></button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">{morphology.map((m, i) => (<div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full text-sm"><span className="font-bold text-indigo-700">{m.part}</span><span className="text-slate-500 text-xs">({m.meaning})</span><button type="button" onClick={() => removeMorphology(i)} className="text-slate-300 hover:text-rose-500"><X size={14}/></button></div>))}</div>
      </section>

      <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Context & Grammar</h3>
        <div className="space-y-2"><label className="text-xs font-bold text-slate-400">Example Sentence</label><input name="sentence" value={formData.sentence} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200 italic" placeholder="Si vis pacem, para bellum." /></div>
        <div className="space-y-2"><label className="text-xs font-bold text-slate-400">Translation</label><input name="sentenceTrans" value={formData.sentenceTrans} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200" placeholder="If you want peace, prepare for war." /></div>
        <div className="space-y-2"><label className="text-xs font-bold text-slate-400">Grammar Tags</label><input name="grammarTags" value={formData.grammarTags} onChange={handleChange} className="w-full p-3 rounded-lg border border-slate-200" placeholder="2nd Declension, Neuter" /></div>
      </section>

      <button onClick={handleSubmit} className={`w-full text-white p-4 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${editingId ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          {editingId ? <><Save size={20}/> Update Card</> : <><Plus size={20}/> Create Card</>}
      </button>

      {/* EXISTING CARDS LIST */}
      {currentDeckCards && currentDeckCards.length > 0 && (
        <div className="pt-6 border-t border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">Cards in this Deck ({currentDeckCards.length})</h3>
            <div className="space-y-2">
                {currentDeckCards.map((card, idx) => (
                    <div key={idx} onClick={() => handleSelectCard(card)} className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-colors ${editingId === card.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                        <div>
                            <span className="font-bold text-slate-800">{card.front}</span>
                            <span className="text-slate-400 mx-2">•</span>
                            <span className="text-sm text-slate-500">{card.back}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Edit3 size={16} className="text-indigo-400" />
                           <button onClick={(e) => { e.stopPropagation(); onDeleteCard(card.id); }} className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

const LessonBuilderView = ({ data, setData, onSave }) => {
  const [toastMsg, setToastMsg] = useState(null);
  const updateBlock = (index, field, value) => { const newBlocks = [...(data.blocks || [])]; newBlocks[index] = { ...newBlocks[index], [field]: value }; setData({ ...data, blocks: newBlocks }); };
  const updateDialogueLine = (blockIndex, lineIndex, field, value) => { const newBlocks = [...(data.blocks || [])]; newBlocks[blockIndex].lines[lineIndex][field] = value; setData({ ...data, blocks: newBlocks }); };
  const updateVocabItem = (blockIndex, itemIndex, field, value) => { const newBlocks = [...(data.blocks || [])]; newBlocks[blockIndex].items[itemIndex][field] = value; setData({ ...data, blocks: newBlocks }); };
  
  const addBlock = (type) => { 
    const baseBlock = type === 'dialogue' ? { type: 'dialogue', lines: [{ speaker: 'A', text: '', translation: '', side: 'left' }] } 
      : type === 'quiz' ? { type: 'quiz', question: '', options: [{id:'a',text:''},{id:'b',text:''}], correctId: 'a' } 
      : type === 'vocab-list' ? { type: 'vocab-list', items: [{ term: '', definition: '' }] }
      : type === 'image' ? { type: 'image', url: '', caption: '' }
      : type === 'note' ? { type: 'note', title: '', content: '' }
      : { type: 'text', title: '', content: '' }; // text
    setData({ ...data, blocks: [...(data.blocks || []), baseBlock] }); 
  };
  
  const removeBlock = (index) => { const newBlocks = [...(data.blocks || [])].filter((_, i) => i !== index); setData({ ...data, blocks: newBlocks }); };
  
  const handleSave = () => { 
    if (!data.title) return alert("Title required"); 
    const processedVocab = Array.isArray(data.vocab) ? data.vocab : (typeof data.vocab === 'string' ? data.vocab.split(',').map(s => s.trim()) : []);
    onSave({ ...data, vocab: processedVocab, xp: 100 }); 
    setToastMsg("Lesson Saved Successfully");
  };

  return (
    <div className="px-6 mt-4 space-y-8 pb-20 relative">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"><h3 className="font-bold text-slate-800 flex items-center gap-2"><FileText size={18} className="text-indigo-600"/> Lesson Metadata</h3><input className="w-full p-3 rounded-lg border border-slate-200 font-bold" placeholder="Title" value={data.title} onChange={e => setData({...data, title: e.target.value})} /><textarea className="w-full p-3 rounded-lg border border-slate-200 text-sm" placeholder="Description" value={data.description} onChange={e => setData({...data, description: e.target.value})} /><input className="w-full p-3 rounded-lg border border-slate-200 text-sm" placeholder="Vocab (comma separated)" value={data.vocab} onChange={e => setData({...data, vocab: e.target.value})} /></section>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1"><h3 className="font-bold text-slate-800 flex items-center gap-2"><Layers size={18} className="text-indigo-600"/> Content Blocks</h3><span className="text-xs text-slate-400">{(data.blocks || []).length} Blocks</span></div>
        {(data.blocks || []).map((block, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative group">
            <div className="absolute right-4 top-4 flex gap-2"><span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded">{block.type}</span><button onClick={() => removeBlock(idx)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button></div>
            
            {block.type === 'text' && (<div className="space-y-3 mt-4"><input className="w-full p-2 border-b border-slate-100 font-bold text-sm focus:outline-none" placeholder="Section Title" value={block.title} onChange={e => updateBlock(idx, 'title', e.target.value)} /><textarea className="w-full p-2 bg-slate-50 rounded-lg text-sm min-h-[80px]" placeholder="Content..." value={block.content} onChange={e => updateBlock(idx, 'content', e.target.value)} /></div>)}
            
            {block.type === 'note' && (<div className="space-y-3 mt-4"><div className="flex gap-2"><Info size={18} className="text-amber-500"/><input className="flex-1 p-2 border-b border-slate-100 font-bold text-sm focus:outline-none" placeholder="Note Title (e.g. Grammar Tip)" value={block.title} onChange={e => updateBlock(idx, 'title', e.target.value)} /></div><textarea className="w-full p-2 bg-amber-50 border border-amber-100 rounded-lg text-sm min-h-[80px] text-amber-800" placeholder="Tip content..." value={block.content} onChange={e => updateBlock(idx, 'content', e.target.value)} /></div>)}

            {block.type === 'image' && (<div className="space-y-3 mt-4"><div className="flex gap-2 items-center"><Image size={18} className="text-slate-400"/><input className="flex-1 p-2 border-b border-slate-100 text-sm" placeholder="Image URL" value={block.url} onChange={e => updateBlock(idx, 'url', e.target.value)} /></div><input className="w-full p-2 bg-slate-50 rounded-lg text-sm" placeholder="Caption" value={block.caption} onChange={e => updateBlock(idx, 'caption', e.target.value)} /></div>)}

            {block.type === 'vocab-list' && (<div className="space-y-3 mt-6"><p className="text-xs font-bold text-slate-400 uppercase">Vocabulary List</p>{block.items.map((item, i) => (<div key={i} className="flex gap-2"><input className="flex-1 p-2 bg-slate-50 rounded border border-slate-100 text-sm font-bold" placeholder="Term" value={item.term} onChange={e => updateVocabItem(idx, i, 'term', e.target.value)} /><input className="flex-1 p-2 border-b border-slate-100 text-sm" placeholder="Definition" value={item.definition} onChange={e => updateVocabItem(idx, i, 'definition', e.target.value)} /></div>))}<button onClick={() => { const newItems = [...block.items, { term: '', definition: '' }]; updateBlock(idx, 'items', newItems); }} className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Plus size={14}/> Add Term</button></div>)}

            {block.type === 'dialogue' && (<div className="space-y-3 mt-6">{block.lines.map((line, lIdx) => (<div key={lIdx} className="flex gap-2 text-sm"><input className="w-16 p-1 bg-slate-50 rounded border border-slate-100 text-xs font-bold" placeholder="Speaker" value={line.speaker} onChange={e => updateDialogueLine(idx, lIdx, 'speaker', e.target.value)} /><div className="flex-1 space-y-1"><input className="w-full p-1 border-b border-slate-100" placeholder="Latin" value={line.text} onChange={e => updateDialogueLine(idx, lIdx, 'text', e.target.value)} /><input className="w-full p-1 text-xs text-slate-500 italic" placeholder="English" value={line.translation} onChange={e => updateDialogueLine(idx, lIdx, 'translation', e.target.value)} /></div></div>))}<button onClick={() => { const newLines = [...block.lines, { speaker: 'B', text: '', translation: '', side: 'right' }]; updateBlock(idx, 'lines', newLines); }} className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Plus size={14}/> Add Line</button></div>)}
            
            {block.type === 'quiz' && (<div className="space-y-3 mt-4"><input className="w-full p-2 bg-slate-50 rounded-lg font-bold text-sm" placeholder="Question" value={block.question} onChange={e => updateBlock(idx, 'question', e.target.value)} /><div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase">Options (ID, Text)</p>{block.options.map((opt, oIdx) => (<div key={oIdx} className="flex gap-2"><input className="w-8 p-1 bg-slate-50 text-center text-xs" value={opt.id} readOnly /><input className="flex-1 p-1 border-b border-slate-100 text-sm" value={opt.text} onChange={(e) => { const newOpts = [...block.options]; newOpts[oIdx].text = e.target.value; updateBlock(idx, 'options', newOpts); }} /></div>))}</div><div className="flex items-center gap-2 text-sm mt-2"><span className="text-slate-500">Correct ID:</span><input className="w-10 p-1 bg-green-50 border border-green-200 rounded text-center font-bold text-green-700" value={block.correctId} onChange={e => updateBlock(idx, 'correctId', e.target.value)} /></div></div>)}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => addBlock('text')} className="p-3 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-500 hover:bg-slate-50"><AlignLeft size={20}/> <span className="text-[10px] font-bold">Text</span></button>
        <button onClick={() => addBlock('dialogue')} className="p-3 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-500 hover:bg-slate-50"><MessageSquare size={20}/> <span className="text-[10px] font-bold">Dialogue</span></button>
        <button onClick={() => addBlock('quiz')} className="p-3 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-500 hover:bg-slate-50"><HelpCircle size={20}/> <span className="text-[10px] font-bold">Quiz</span></button>
        <button onClick={() => addBlock('vocab-list')} className="p-3 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-500 hover:bg-slate-50"><List size={20}/> <span className="text-[10px] font-bold">Vocab List</span></button>
        <button onClick={() => addBlock('image')} className="p-3 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-500 hover:bg-slate-50"><Image size={20}/> <span className="text-[10px] font-bold">Image</span></button>
        <button onClick={() => addBlock('note')} className="p-3 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-500 hover:bg-slate-50"><Info size={20}/> <span className="text-[10px] font-bold">Note</span></button>
      </div>
      <div className="pt-4 border-t border-slate-100"><button onClick={handleSave} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"><Save size={20} /> Save Lesson to Library</button></div>
    </div>
  );
};

// --- INSTRUCTOR COMPONENTS ---

const ClassManagerView = ({ user, lessons }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'classes');
    const unsubscribe = onSnapshot(q, (snapshot) => setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    return () => unsubscribe();
  }, [user]);

  const createClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'classes'), { 
        name: newClassName, 
        code: Math.random().toString(36).substring(2, 8).toUpperCase(), 
        students: [], 
        studentEmails: [], 
        assignments: [], 
        created: Date.now() 
    });
    setNewClassName('');
    setToastMsg("Class Created Successfully");
  };

  const handleDeleteClass = async (id) => {
      if (window.confirm("Delete this class?")) {
        await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'classes', id));
        if (selectedClass?.id === id) setSelectedClass(null);
      }
    };

  const addStudent = async (e) => {
    e.preventDefault();
    if (!newStudentEmail || !selectedClass) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'classes', selectedClass.id), { 
        students: arrayUnion(newStudentEmail),
        studentEmails: arrayUnion(newStudentEmail)
    });
    setSelectedClass(prev => ({...prev, students: [...(prev.students || []), newStudentEmail]}));
    setNewStudentEmail('');
    setToastMsg(`Added ${newStudentEmail}`);
  };

  const assignLesson = async (lesson) => {
    if (!selectedClass) return;
    await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'classes', selectedClass.id), { 
        assignments: arrayUnion(lesson) 
    });
    setSelectedClass(prev => ({...prev, assignments: [...(prev.assignments || []), lesson]}));
    setAssignModalOpen(false);
    setToastMsg(`Assigned: ${lesson.title}`);
  };

  if (selectedClass) {
    return (
      <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-300 relative">
        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
        <div className="pb-6 border-b border-slate-100 mb-6">
          <button onClick={() => setSelectedClass(null)} className="flex items-center text-slate-500 hover:text-indigo-600 mb-2 text-sm font-bold"><ArrowLeft size={16} className="mr-1"/> Back to Classes</button>
          <div className="flex justify-between items-end">
            <div><h1 className="text-2xl font-bold text-slate-900">{selectedClass.name}</h1><p className="text-sm text-slate-500 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">Code: {selectedClass.code}</p></div>
            <button onClick={() => setAssignModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm"><Plus size={16}/> Assign</button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="space-y-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2"><BookOpen size={18} className="text-indigo-600"/> Assignments</h3>
             {(!selectedClass.assignments || selectedClass.assignments.length === 0) && <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm">No lessons assigned yet.</div>}
             {selectedClass.assignments?.map((l, idx) => (
                 <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center"><div><h4 className="font-bold text-slate-800">{l.title}</h4></div><span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold">Active</span></div>
             ))}
           </div>
           <div className="space-y-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={18} className="text-indigo-600"/> Roster</h3>
             <form onSubmit={addStudent} className="flex gap-2"><input value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} placeholder="Student Email" className="flex-1 p-2 rounded-lg border border-slate-200 text-sm" /><button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-lg"><Plus size={18}/></button></form>
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">{(!selectedClass.students || selectedClass.students.length === 0) && <div className="p-4 text-center text-slate-400 text-sm italic">No students joined yet.</div>}{selectedClass.students?.map((s, i) => (<div key={i} className="p-3 border-b border-slate-50 last:border-0 flex items-center gap-3"><div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">{s.charAt(0)}</div><span className="text-sm font-medium text-slate-700">{s}</span></div>))}</div>
           </div>
        </div>
        {assignModalOpen && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center"><h3 className="font-bold text-lg">Select Lesson</h3><button onClick={() => setAssignModalOpen(false)}><X size={20} className="text-slate-400"/></button></div>
              <div className="flex-1 overflow-y-auto p-2">
                {[...INITIAL_SYSTEM_LESSONS, ...lessons].map(l => (
                  <button key={l.id} onClick={() => assignLesson(l)} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors border-b border-transparent hover:border-slate-100"><h4 className="font-bold text-indigo-900">{l.title}</h4><p className="text-xs text-slate-500">{l.subtitle}</p></button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">My Classes</h2>
        <form onSubmit={createClass} className="flex gap-2"><input value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="New Class Name" className="p-2 rounded-lg border border-slate-200 text-sm w-64" /><button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Plus size={16}/> Create</button></form>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map(cls => (
          <div key={cls.id} onClick={() => setSelectedClass(cls)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer relative group">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => {e.stopPropagation(); handleDeleteClass(cls.id);}} className="text-slate-300 hover:text-rose-500"><Trash2 size={18}/></button></div>
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

const InstructorDashboard = ({ user, userData, allDecks, lessons, onSaveLesson, onSaveCard, onUpdateCard, onDeleteCard, onLogout }) => {
  const [view, setView] = useState('dashboard');
  const [builderData, setBuilderData] = useState({ title: '', subtitle: '', description: '', vocab: '', blocks: [] });
  const [builderMode, setBuilderMode] = useState('lesson');
  const [editingId, setEditingId] = useState(null); // Track editing
  const [jsonInput, setJsonInput] = useState(''); // For bulk import
  const [importMode, setImportMode] = useState('lesson'); // 'lesson' or 'deck'

  // Bulk Import handler
  const handleBulkImport = async () => {
      try {
          const data = JSON.parse(jsonInput);
          if (!Array.isArray(data)) throw new Error("Input must be an array.");
          
          const batch = writeBatch(db);
          let count = 0;
          
          data.forEach(item => {
              const id = item.id || `import_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
              
              // Case 1: It's a Deck (has 'cards' array)
              if (item.cards && Array.isArray(item.cards)) {
                  const deckId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
                  const deckTitle = item.title || "Imported Deck";
                  
                  item.cards.forEach(card => {
                      const cardRef = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_cards'));
                      batch.set(cardRef, {
                          ...card,
                          deckId: deckId,
                          deckTitle: deckTitle,
                          type: card.type || 'noun', // default
                          mastery: 0,
                          grammar_tags: card.grammar_tags || ["Imported"]
                      });
                      count++;
                  });
              } 
              // Case 2: It's a Lesson (has 'blocks' or 'dialogue')
              else if (item.blocks || item.dialogue) {
                   const ref = doc(db, 'artifacts', appId, 'users', user.uid, 'custom_lessons', id);
                   batch.set(ref, {
                       ...item,
                       vocab: Array.isArray(item.vocab) ? item.vocab : [],
                       xp: item.xp || 100
                   });
                   count++;
              }
          });
          
          await batch.commit();
          alert(`Successfully imported ${count} items.`);
          setJsonInput('');
      } catch (e) {
          alert("Import Failed: " + e.message);
      }
  };

  const handleEditLesson = (lesson) => {
      const safeLesson = {
          ...lesson,
          vocab: Array.isArray(lesson.vocab) ? lesson.vocab.join(', ') : (lesson.vocab || '')
      };
      setBuilderData(safeLesson);
      setEditingId(lesson.id);
      setBuilderMode('lesson');
      setView('builder');
  };

  const handleSaveWithEdit = (data) => {
      if (editingId) {
          onSaveLesson({ ...data }, editingId); 
      } else {
          onSaveLesson(data);
      }
      setBuilderData({ title: '', subtitle: '', description: '', vocab: '', blocks: [] });
      setEditingId(null);
  };
  
  const handleEditDeck = (deckId) => {
      setBuilderMode('deck');
      setView('builder'); 
  };


  const NavItem = ({ id, icon: Icon, label }) => (
    <button onClick={() => setView(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === id ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
      <Icon size={20} /><span>{label}</span>
    </button>
  );

  const previewLesson = { 
    ...builderData, 
    vocab: typeof builderData.vocab === 'string' ? builderData.vocab.split(',').map(s => s.trim()) : (builderData.vocab || []), 
    xp: 100,
    blocks: builderData.blocks || [] 
  };

  // Widget logic
  const activeStudents = 24; // Placeholder for now
  const recentActivity = [
     { text: "Marcus finished 'Salutationes'", time: "2m", color: "bg-emerald-500" },
     { text: "Julia joined 'Latin 101'", time: "15m", color: "bg-blue-500" },
     { text: "New deck created", time: "1h", color: "bg-amber-500" },
  ];

  // Quick Actions
  const quickAction = (label, icon, action) => (
      <button onClick={action} className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all gap-2">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full">{icon}</div>
          <span className="text-xs font-bold text-slate-700">{label}</span>
      </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-3 mb-10 px-2"><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><GraduationCap size={24} /></div><div><h1 className="font-bold text-lg leading-none">LinguistFlow</h1><span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Magister Mode</span></div></div>
        <div className="space-y-2 flex-1"><NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" /><NavItem id="classes" icon={School} label="My Classes" /><NavItem id="library" icon={Library} label="Content Library" /><NavItem id="builder" icon={PlusCircle} label="Content Creator" /></div>
        
        {/* Admin Import Zone in Sidebar for easy access */}
        <div className="pt-6 border-t border-slate-100">
           <div className="mb-4 px-2">
             <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase">AI Import</h4>
                <div className="flex bg-slate-100 rounded p-0.5">
                    <button onClick={() => setImportMode('lesson')} className={`px-2 py-0.5 text-[10px] rounded ${importMode === 'lesson' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>Lesson</button>
                    <button onClick={() => setImportMode('deck')} className={`px-2 py-0.5 text-[10px] rounded ${importMode === 'deck' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>Deck</button>
                </div>
             </div>
             <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} className="w-full p-2 text-xs border rounded bg-slate-50 mb-2 font-mono" placeholder={importMode === 'lesson' ? '[{"title": "...", "blocks": [...]}]' : '[{"title": "My Deck", "cards": [{"front": "...", "back": "..."}]}]'} rows={3}></textarea>
             <button onClick={handleBulkImport} disabled={!jsonInput} className="w-full bg-slate-800 text-white text-xs py-1 rounded disabled:opacity-50 flex items-center justify-center gap-1"><FileJson size={12}/> Import {importMode === 'lesson' ? 'Lessons' : 'Decks'}</button>
           </div>
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">{userData?.name?.charAt(0)}</div>
            <div className="flex-1 overflow-hidden"><p className="text-sm font-bold truncate">{userData?.name}</p><p className="text-xs text-slate-400 truncate">{user.email}</p></div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><LogOut size={16} /> Sign Out</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto h-full">
        {view === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
               <span className="text-sm text-slate-500">{new Date().toLocaleDateString()}</span>
            </div>
       
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div><p className="text-slate-400 text-xs font-bold uppercase">Active Students</p><h3 className="text-3xl font-bold text-slate-900 mt-1">{activeStudents}</h3></div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Users size={24}/></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div><p className="text-slate-400 text-xs font-bold uppercase">Total Classes</p><h3 className="text-3xl font-bold text-slate-900 mt-1">{lessons.length}</h3></div> 
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
       
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               
               {/* Left Column (2/3) */}
               <div className="lg:col-span-2 space-y-6">
                   
                   {/* Quick Actions */}
                   <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                       <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                           {quickAction("New Class", <Plus size={20}/>, () => setView('classes'))}
                           {quickAction("New Lesson", <FileText size={20}/>, () => { setBuilderMode('lesson'); setView('builder'); })}
                           {quickAction("New Deck", <Layers size={20}/>, () => { setBuilderMode('deck'); setView('builder'); })}
                           {quickAction("Browse Lib", <Library size={20}/>, () => setView('library'))}
                       </div>
                   </div>
       
                   {/* Class Performance (Mock/Derived) */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                       <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                           <span>Class Engagement</span>
                           <span className="text-xs font-normal text-slate-400">Students per Class</span>
                       </h3>
                       <div className="space-y-4">
                           {/* Mock classes since we don't have classes prop here directly, need to fetch inside or pass down */}
                           <div className="p-4 text-center text-slate-400 text-sm italic">No active class data available for chart.</div>
                       </div>
                    </div>
       
               </div>
       
               {/* Right Column (1/3) */}
               <div className="space-y-6">
                    {/* Recent Activity (Mock) */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
                       <h3 className="font-bold text-slate-800 mb-4">Live Feed</h3>
                       <div className="space-y-0 relative">
                           <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100"></div>
                           {recentActivity.map((item, i) => (
                               <div key={i} className="flex gap-3 mb-6 relative z-10">
                                   <div className={`w-6 h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0 ${item.color}`}></div>
                                   <div>
                                       <p className="text-sm font-medium text-slate-700 leading-none">{item.text}</p>
                                       <p className="text-xs text-slate-400 mt-1">{item.time} ago</p>
                                   </div>
                               </div>
                           ))}
                       </div>
                       <button className="w-full py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg mt-2">View All Activity</button>
                    </div>
               </div>
       
            </div>
          </div>
        )}
        {view === 'classes' && <ClassManagerView user={user} lessons={[...INITIAL_SYSTEM_LESSONS, ...lessons]} />}
        {view === 'library' && (
           <div className="space-y-8 animate-in fade-in duration-500">
             <div><h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><BookOpen size={18} className="text-indigo-600"/> Lessons</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[...INITIAL_SYSTEM_LESSONS, ...lessons].map(l => (<div key={l.id} onClick={() => handleEditLesson(l)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-300 cursor-pointer transition-colors"><div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600"><PlayCircle size={20}/></div><div><h4 className="font-bold text-slate-900">{l.title}</h4><p className="text-xs text-slate-500">{l.vocab.length} Words</p></div><div className="ml-auto"><Pencil size={16} className="text-slate-300"/></div></div>))}</div></div>
             <div><h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Layers size={18} className="text-orange-500"/> Decks</h3><div className="grid grid-cols-1 md:grid-cols-4 gap-4">{Object.entries(allDecks).map(([key, deck]) => (<div key={key} onClick={() => handleEditDeck(key)} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-orange-300 cursor-pointer transition-colors"><div className="flex justify-between"><h4 className="font-bold text-slate-900">{deck.title}</h4><PlusCircle size={16} className="text-slate-300"/></div><p className="text-xs text-slate-500">{deck.cards?.length} Cards</p></div>))}</div></div>
           </div>
        )}
        {view === 'builder' && (
          <div className="h-full flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50"><div className="flex items-center gap-3"><h3 className="font-bold text-slate-700 flex items-center gap-2"><FileText size={18} /> Creator</h3><div className="flex bg-slate-100 p-0.5 rounded-lg"><button onClick={() => setBuilderMode('lesson')} className={`px-3 py-1 text-xs font-bold rounded-md ${builderMode === 'lesson' ? 'bg-white shadow-sm' : ''}`}>Lesson</button><button onClick={() => setBuilderMode('deck')} className={`px-3 py-1 text-xs font-bold rounded-md ${builderMode === 'deck' ? 'bg-white shadow-sm' : ''}`}>Deck</button></div></div><button className="text-xs font-bold text-indigo-600 hover:underline" onClick={() => { setBuilderData({ title: '', subtitle: '', description: '', vocab: '', blocks: [] }); setEditingId(null); }}>Clear Form</button></div>
              <div className="flex-1 overflow-y-auto p-0">{builderMode === 'lesson' ? <LessonBuilderView data={builderData} setData={setBuilderData} onSave={handleSaveWithEdit} /> : <CardBuilderView onSaveCard={onSaveCard} onUpdateCard={onUpdateCard} onDeleteCard={onDeleteCard} availableDecks={allDecks} initialDeckId={editingId} />}</div>
            </div>
            {builderMode === 'lesson' && <div className="w-full md:w-[400px] bg-white rounded-[3rem] border-[8px] border-slate-900/10 shadow-xl overflow-hidden flex flex-col relative"><div className="flex-1 overflow-hidden bg-slate-50"><LessonView lesson={previewLesson} onFinish={() => alert("Preview Finished")} /></div><div className="bg-slate-100 p-2 text-center text-xs text-slate-400 font-bold uppercase tracking-wider border-t border-slate-200">Student Preview</div></div>}
          </div>
        )}
      </div>
    </div>
  );
};

// --- BUILDER HUB (STUDENT) ---
const BuilderHub = ({ onSaveCard, onUpdateCard, onDeleteCard, onSaveLesson, allDecks }) => {
  const [lessonData, setLessonData] = useState({ title: '', subtitle: '', description: '', vocab: '', blocks: [] });
  const [mode, setMode] = useState('card'); 
  return (
    <div className="pb-24 h-full bg-slate-50 overflow-y-auto custom-scrollbar">{mode === 'card' && <Header title="Scriptorium" subtitle="Card Builder" />}{mode === 'card' && (<><div className="px-6 mt-2"><div className="flex bg-slate-200 p-1 rounded-xl"><button onClick={() => setMode('card')} className="flex-1 py-2 text-sm font-bold rounded-lg bg-white shadow-sm text-indigo-700">Flashcard</button><button onClick={() => setMode('lesson')} className="flex-1 py-2 text-sm font-bold rounded-lg text-slate-500">Full Lesson</button></div></div><CardBuilderView onSaveCard={onSaveCard} onUpdateCard={onUpdateCard} onDeleteCard={onDeleteCard} availableDecks={allDecks} /></>)}{mode === 'lesson' && <LessonBuilderView data={lessonData} setData={setLessonData} onSave={onSaveLesson} />}</div>
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
  const [roleLoading, setRoleLoading] = useState(false);
  const handleLogout = () => signOut(auth);
  const deploySystemContent = async () => {
    setDeploying(true); const batch = writeBatch(db);
    Object.entries(INITIAL_SYSTEM_DECKS).forEach(([key, deck]) => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'system_decks', key), deck));
    INITIAL_SYSTEM_LESSONS.forEach((lesson) => batch.set(doc(db, 'artifacts', appId, 'public', 'data', 'system_lessons', lesson.id), lesson));
    try { await batch.commit(); alert("Deployed!"); } catch (e) { alert("Error: " + e.message); }
    setDeploying(false);
  };
  const toggleRole = async () => {
    if (!userData) return; 
    const newRole = userData.role === 'instructor' ? 'student' : 'instructor';
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), { role: newRole }, { merge: true });
  };
  return (
    <div className="h-full flex flex-col bg-slate-50"><Header title="Ego" subtitle="Profile" /><div className="flex-1 px-6 mt-4"><div className="bg-white p-6 rounded-3xl shadow-sm border flex flex-col items-center mb-6"><h2 className="text-2xl font-bold">{userData?.name}</h2><p className="text-sm text-slate-500">{user.email}</p><div className="mt-4 px-4 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase">{userData?.role}</div></div><div className="space-y-3"><button onClick={toggleRole} className="w-full bg-white p-4 rounded-xl border text-slate-700 font-bold mb-4 flex justify-between"><span>Switch Role</span><School size={20} /></button><button onClick={handleLogout} className="w-full bg-white p-4 rounded-xl border text-rose-600 font-bold mb-4 flex justify-between"><span>Sign Out</span><LogOut/></button><button onClick={deploySystemContent} disabled={deploying} className="w-full bg-slate-800 text-white p-4 rounded-xl font-bold flex justify-between">{deploying ? <Loader className="animate-spin"/> : <UploadCloud/>}<span>Deploy Content</span></button></div></div></div>
  );
};

// --- HOME VIEW ---
const HomeView = ({ setActiveTab, lessons, onSelectLesson, userData }) => (
  <div className="pb-24 animate-in fade-in duration-500 overflow-y-auto h-full">
    <Header title={`Ave, ${userData?.name || 'Discipulus'}!`} subtitle="Perge in itinere tuo." />
    <div className="px-6 space-y-6 mt-4">
      <div className="bg-gradient-to-br from-red-800 to-rose-900 rounded-3xl p-6 text-white shadow-xl"><div className="flex justify-between"><div><p className="text-rose-100 text-sm font-bold uppercase">Hebdomada</p><h3 className="text-4xl font-serif font-bold">{userData?.xp} XP</h3></div><Zap size={28} className="text-yellow-400 fill-current"/></div><div className="mt-6 bg-black/20 rounded-full h-3"><div className="bg-yellow-400 h-full w-3/4 rounded-full"/></div></div>
      
      {/* Class Assignments Section */}
      {userData?.classAssignments && userData.classAssignments.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><School size={18} className="text-indigo-600"/> Class Assignments</h3>
          <div className="space-y-3">
            {userData.classAssignments.map(l => (
               <button key={l.id} onClick={() => onSelectLesson(l)} className="w-full bg-indigo-50 border border-indigo-100 p-4 rounded-2xl shadow-sm flex items-center justify-between active:scale-[0.98] transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-indigo-600"><PlayCircle size={20} /></div>
                    <div className="text-left"><h4 className="font-bold text-indigo-900">{l.title}</h4><p className="text-xs text-indigo-600/70">Assigned Lesson</p></div>
                  </div>
                  <ChevronRight size={20} className="text-indigo-300" />
               </button>
            ))}
          </div>
        </div>
      )}

      <div><h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"><BookOpen size={18} className="text-indigo-600"/> Lessons</h3><div className="space-y-3">{lessons.map(l => (<button key={l.id} onClick={() => onSelectLesson(l)} className="w-full bg-white p-4 rounded-2xl border shadow-sm flex items-center justify-between"><div className="flex items-center gap-4"><div className="h-14 w-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700"><PlayCircle size={28}/></div><div className="text-left"><h4 className="font-bold text-slate-900">{l.title}</h4><p className="text-xs text-slate-500">{l.subtitle}</p></div></div><ChevronRight className="text-slate-300"/></button>))}</div></div>
      <div className="grid grid-cols-2 gap-4"><button onClick={() => setActiveTab('flashcards')} className="p-5 bg-orange-50 rounded-2xl border border-orange-100 text-center"><Layers className="mx-auto text-orange-500 mb-2"/><span className="block font-bold text-slate-800">Repetitio</span></button><button onClick={() => setActiveTab('create')} className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-center"><Feather className="mx-auto text-emerald-500 mb-2"/><span className="block font-bold text-slate-800">Scriptorium</span></button></div>
    </div>
  </div>
);

// --- LESSON VIEW ---
const LessonView = ({ lesson, onFinish }) => {
  const [step, setStep] = useState(0); 
  const [quizSelection, setQuizSelection] = useState(null);

  if (!lesson) return null;

  // Handle Legacy vs New Block-based Lessons
  const contentBlocks = lesson.blocks || [
    { type: 'dialogue', lines: lesson.dialogue || [] },
    { type: 'quiz', ...lesson.quiz }
  ];
  
  const totalSteps = contentBlocks.length + 2; // Intro + Blocks + Outro

  const renderContent = () => {
    // 1. INTRO
    if (step === 0) return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">🎓</div>
          <h2 className="text-xl font-bold text-indigo-900 mb-2">{lesson.title}</h2>
          <p className="text-indigo-700/80 text-sm">{lesson.description}</p>
        </div>
        {lesson.vocab && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Key Vocabulary</h3>
            {lesson.vocab.map((phrase, i) => (<div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm"><Volume2 size={18} className="text-indigo-500" /><span className="font-medium text-slate-700">{phrase}</span></div>))}
          </div>
        )}
      </div>
    );

    // 2. OUTRO
    if (step === totalSteps - 1) return (
      <div className="text-center py-10 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"><Award size={48} className="text-yellow-600" /></div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Optime!</h2>
        <p className="text-slate-500 mb-8">Lesson Complete. +{lesson.xp} XP</p>
        <button onClick={() => onFinish(lesson.xp)} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">Return Home</button>
      </div>
    );

    // 3. DYNAMIC BLOCKS
    const block = contentBlocks[step - 1];
    if (!block) return null;

    if (block.type === 'text') {
      return (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-indigo-900 mb-2">{block.title}</h3>
            <p className="text-slate-600 leading-relaxed">{block.content}</p>
          </div>
        </div>
      );
    }

    if (block.type === 'note') {
      return (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Info size={20} className="text-amber-600" />
              <h3 className="text-lg font-bold text-amber-900">{block.title || 'Note'}</h3>
            </div>
            <p className="text-amber-800 leading-relaxed">{block.content}</p>
          </div>
        </div>
      );
    }

    if (block.type === 'image') {
      return (
        <div className="space-y-4 animate-in fade-in duration-500">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <img src={block.url} alt={block.caption} className="w-full h-64 object-cover rounded-xl mb-3 bg-slate-100" />
            {block.caption && <p className="text-center text-sm text-slate-500 italic">{block.caption}</p>}
          </div>
        </div>
      );
    }

    if (block.type === 'vocab-list') {
      return (
        <div className="space-y-4 animate-in fade-in duration-500">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><List size={18} className="text-indigo-600"/> Vocabulary</h3>
          <div className="grid grid-cols-1 gap-2">
            {block.items.map((item, i) => (
              <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900">{item.term}</span>
                <span className="text-slate-500">{item.definition}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (block.type === 'dialogue') {
      return (
        <div className="space-y-4 animate-in fade-in duration-500">
          {block.lines.map((line, i) => (
            <div key={i} className={`flex ${line.side === 'right' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm ${line.side === 'right' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                <p className="font-bold text-xs opacity-70 mb-1">{line.speaker}</p>
                <p className="text-base font-medium mb-1">{line.text}</p>
                <p className={`text-xs italic ${line.side === 'right' ? 'text-indigo-200' : 'text-slate-400'}`}>{line.translation}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (block.type === 'quiz') {
      return (
        <div className="animate-in fade-in duration-500">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 text-center mb-6">
            <Brain size={40} className="mx-auto text-indigo-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Pop Quiz!</h3>
            <p className="text-slate-600">{block.question}</p>
          </div>
          <div className="space-y-3">
            {block.options.map((opt) => (
              <button key={opt.id} onClick={() => setQuizSelection(opt.id)} className={`w-full p-4 rounded-xl border-2 font-bold text-left transition-all ${quizSelection === opt.id ? opt.id === block.correctId ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-600'}`}>{opt.text}</button>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="pb-24 min-h-full flex flex-col bg-slate-50">
      <Header title="Lectio" subtitle={lesson.title} rightAction={<button onClick={() => onFinish(0)}><X size={24} className="text-slate-400" /></button>} />
      <div className="flex-1 px-6 mt-2 overflow-y-auto custom-scrollbar">
        <div className="flex gap-2 mb-8">
           {[...Array(totalSteps)].map((_, i) => (<div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= step ? 'bg-indigo-600' : 'bg-slate-200'}`} />))}
        </div>
        {renderContent()}
      </div>
      {step < totalSteps - 1 && (
        <div className="p-6 bg-white border-t border-slate-100 sticky bottom-0 z-30 pb-safe">
          {/* Disable continue only if on a quiz step and no correct answer selected (simplified logic for prototype) */}
          <button onClick={() => { setQuizSelection(null); setStep(step + 1); }} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2">Continue <ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  );
};

// --- FLASHCARD VIEW ---
const FlashcardView = ({ allDecks, selectedDeckKey, onSelectDeck, onSaveCard }) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [manageMode, setManageMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [xrayMode, setXrayMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickAddData, setQuickAddData] = useState({ front: '', back: '', type: 'noun' });
  
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
    setManageMode(false);
  };

  const filteredCards = cards.filter(c => 
    c.front.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.back.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if(!quickAddData.front || !quickAddData.back) return;
    onSaveCard({
        ...quickAddData,
        deckId: selectedDeckKey,
        ipa: "/.../",
        mastery: 0,
        morphology: [{ part: quickAddData.front, meaning: "Custom", type: "root" }],
        usage: { sentence: "-", translation: "-" },
        grammar_tags: ["Quick Add"]
    });
    setQuickAddData({ front: '', back: '', type: 'noun' });
    setSearchTerm(''); 
    // Removed basic alert, parent handles feedback or we can add toast here if needed
  };

  if (!card && !manageMode) return <div className="h-full flex flex-col bg-slate-50"><Header title={currentDeck?.title || "Empty Deck"} onClickTitle={() => setIsSelectorOpen(!isSelectorOpen)} rightAction={<button onClick={() => setManageMode(true)} className="p-2 bg-slate-100 rounded-full"><List size={20} className="text-slate-600" /></button>} /><div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400"><Layers size={48} className="mb-4 opacity-20" /><p>This deck is empty.</p><button onClick={() => setManageMode(true)} className="mt-4 text-indigo-600 font-bold text-sm">Add Cards</button></div></div>;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-50 pb-6 relative overflow-hidden">
      <Header 
        title={currentDeck?.title.split(' ')[1] || "Deck"} 
        subtitle={`${currentIndex + 1} / ${cards.length}`} 
        onClickTitle={() => setIsSelectorOpen(!isSelectorOpen)} 
        rightAction={
          <div className="flex items-center gap-2">
             <button onClick={() => setManageMode(!manageMode)} className={`p-2 rounded-full transition-colors ${manageMode ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
               {manageMode ? <X size={20} /> : <List size={20} />}
             </button>
          </div>
        }
      />
      
      {/* DECK SELECTOR */}
      {isSelectorOpen && <div className="absolute top-24 left-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-4">{Object.entries(allDecks).map(([key, deck]) => (<button key={key} onClick={() => handleDeckChange(key)} className={`w-full text-left p-3 rounded-xl font-bold text-sm mb-1 ${selectedDeckKey === key ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}>{deck.title} <span className="float-right opacity-50">{deck.cards.length}</span></button>))}</div>}
      {isSelectorOpen && <div className="absolute inset-0 z-40 bg-black/5 backdrop-blur-[1px]" onClick={() => setIsSelectorOpen(false)} />}

      {/* MANAGE MODE OVERLAY */}
      {manageMode && (
        <div className="absolute inset-0 top-[80px] bg-slate-50 z-30 flex flex-col animate-in slide-in-from-bottom-10 duration-300 p-6 overflow-y-auto pb-24">
           <h3 className="font-bold text-slate-900 mb-4">Deck Manager</h3>
           <div className="relative mb-6">
             <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
             <input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder={`Search ${cards.length} cards...`}
               className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
             />
           </div>
           {selectedDeckKey === 'custom' && (
             <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm mb-6">
               <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2"><PlusCircle size={14}/> Quick Add</h4>
               <div className="flex gap-2 mb-2">
                 <input placeholder="Latin Word" value={quickAddData.front} onChange={(e) => setQuickAddData({...quickAddData, front: e.target.value})} className="flex-1 p-2 bg-slate-50 rounded border border-slate-200 text-sm font-bold" />
                 <select value={quickAddData.type} onChange={(e) => setQuickAddData({...quickAddData, type: e.target.value})} className="p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                   <option value="noun">Noun</option><option value="verb">Verb</option><option value="phrase">Phrase</option>
                 </select>
               </div>
               <div className="flex gap-2">
                 <input placeholder="English Meaning" value={quickAddData.back} onChange={(e) => setQuickAddData({...quickAddData, back: e.target.value})} className="flex-1 p-2 bg-slate-50 rounded border border-slate-200 text-sm" />
                 <button onClick={handleQuickAdd} className="bg-indigo-600 text-white p-2 rounded-lg"><Plus size={18}/></button>
               </div>
             </div>
           )}
           <div className="space-y-2">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cards in Deck</p>
             {filteredCards.map((c, idx) => (
               <button key={idx} onClick={() => { setCurrentIndex(cards.indexOf(c)); setManageMode(false); }} className="w-full bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center hover:border-indigo-300 transition-colors text-left">
                 <div><span className="font-bold text-slate-800">{c.front}</span><span className="text-slate-400 mx-2">•</span><span className="text-sm text-slate-500">{c.back}</span></div>
                 <ArrowRight size={16} className="text-slate-300" />
               </button>
             ))}
             {filteredCards.length === 0 && <p className="text-slate-400 text-sm italic">No cards found.</p>}
           </div>
        </div>
      )}

      {/* MAIN CARD AREA */}
      {!manageMode && card && (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 perspective-1000 relative z-0">
        <div className={`relative w-full h-full max-h-[520px] transition-all duration-500 transform preserve-3d cursor-pointer shadow-2xl rounded-3xl ${isFlipped ? 'rotate-y-180' : ''}`} onClick={() => !xrayMode && setIsFlipped(!isFlipped)}>
          <div className="absolute inset-0 backface-hidden bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col">
            <div className={`h-2 w-full ${xrayMode ? theme.bg.replace('50', '500') : 'bg-slate-100'} transition-colors duration-500`} />
            <div className="flex-1 flex flex-col p-6 relative">
              <div className="flex justify-between items-start mb-8"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.bg} ${theme.text} border ${theme.border}`}>{card.type}</span></div>
              <div className="flex-1 flex flex-col items-center justify-center mt-[-40px]"><h2 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 text-center mb-4 leading-tight">{card.front}</h2><div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100"><button onClick={(e) => { e.stopPropagation(); }} className="p-2 bg-white rounded-full shadow-sm text-indigo-600 hover:scale-110 transition-transform active:scale-90"><Volume2 size={18} /></button><span className="font-mono text-slate-500 text-sm tracking-wide">{card.ipa}</span></div></div>
              <div className={`absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 transition-all duration-500 ease-in-out flex flex-col overflow-hidden z-20 ${xrayMode ? 'h-[75%] opacity-100 rounded-t-3xl shadow-[-10px_-10px_30px_rgba(0,0,0,0.05)]' : 'h-0 opacity-0'}`}><div className="p-6 overflow-y-auto custom-scrollbar space-y-6"><div><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Puzzle size={14} /> Morphologia</h4><div className="flex flex-wrap gap-2">{card.morphology && card.morphology.map((m, i) => (<div key={i} className="flex flex-col items-center bg-slate-50 border border-slate-200 rounded-lg p-2 min-w-[60px]"><span className={`font-bold text-lg ${m.type === 'root' ? 'text-indigo-600' : 'text-slate-700'}`}>{m.part}</span><span className="text-[9px] text-slate-400 font-medium uppercase mt-1 text-center max-w-[80px] leading-tight">{m.meaning}</span></div>))}</div></div><div><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MessageSquare size={14} /> Exemplum</h4><div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}><p className="text-slate-800 font-serif font-medium text-lg mb-1">"{card.usage.sentence}"</p><p className={`text-sm ${theme.text} opacity-80 italic`}>{card.usage.translation}</p></div></div></div></div>
              {!xrayMode && (<div className="mt-auto text-center"><p className="text-xs text-slate-400 font-medium animate-pulse">Tap to flip</p></div>)}
            </div>
          </div>
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-white relative overflow-hidden"><div className="relative z-10 flex flex-col items-center"><span className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-6 border-b border-indigo-500/30 pb-2">Translatio</span><h2 className="text-4xl font-bold text-center mb-8 leading-tight">{card.back}</h2></div></div>
        </div>
      </div>
      )}

      <div className="px-6 pb-4">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <button onClick={() => { setXrayMode(false); setIsFlipped(false); setTimeout(() => setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length), 200); }} className="h-14 w-14 rounded-full bg-white border border-slate-100 shadow-md text-rose-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"><X size={28} strokeWidth={2.5} /></button>
          <button onClick={(e) => { e.stopPropagation(); if(isFlipped) setIsFlipped(false); setXrayMode(!xrayMode); }} className={`h-20 w-20 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-all duration-300 border-2 ${xrayMode ? 'bg-indigo-600 border-indigo-600 text-white translate-y-[-8px] shadow-indigo-200' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200'}`}><Search size={28} strokeWidth={xrayMode ? 3 : 2} className={xrayMode ? 'animate-pulse' : ''} /><span className="text-[10px] font-black tracking-wider mt-1">X-RAY</span></button>
          <button onClick={() => { setXrayMode(false); setIsFlipped(false); setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 200); }} className="h-14 w-14 rounded-full bg-white border border-slate-100 shadow-md text-emerald-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"><Check size={28} strokeWidth={2.5} /></button>
        </div>
      </div>
    </div>
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
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [classLessons, setClassLessons] = useState([]);

  // Derived Data: MERGE custom cards into system decks if they belong there, or keep them in 'custom'
  const allDecks = { ...systemDecks, custom: { title: "✍️ Scriptorium", cards: [] } };
  
  // Ensure custom deck exists in derived state
  if (!allDecks.custom) allDecks.custom = { title: "✍️ Scriptorium", cards: [] };

  // Distribute Custom Cards
  customCards.forEach(card => {
      const target = card.deckId || 'custom';
      if (allDecks[target]) {
          if (!allDecks[target].cards) allDecks[target].cards = [];
          allDecks[target].cards.push(card);
      } else {
          // If target deck doesn't exist in system decks (e.g. new custom deck), create it on fly for view
          if (!allDecks[target] && target.startsWith('custom_')) {
             // We need title from somewhere, usually stored in card or separate deck collection. 
             // For simplicity, we use the ID or look for a title property if we saved one.
             allDecks[target] = { title: card.deckTitle || "Custom Deck", cards: [] };
          }
          if (allDecks[target]) allDecks[target].cards.push(card);
          else allDecks.custom.cards.push(card);
      }
  });

  const lessons = [...systemLessons, ...customLessons, ...classLessons];

  useEffect(() => { const unsubscribe = onAuthStateChanged(auth, (u) => { setUser(u); setAuthChecked(true); }); return () => unsubscribe(); }, []);
  
  useEffect(() => {
    if (!user) { setUserData(null); return; }
    // Always load system decks first to ensure content is available
    setSystemDecks(INITIAL_SYSTEM_DECKS);
    setSystemLessons(INITIAL_SYSTEM_LESSONS);

    const unsubProfile = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), (docSnap) => { if (docSnap.exists()) setUserData(docSnap.data()); else setUserData(DEFAULT_USER_DATA); });
    const unsubCards = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_cards'), (snap) => setCustomCards(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubLessons = onSnapshot(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_lessons'), (snap) => setCustomLessons(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSysDecks = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'system_decks'), (snap) => { const d = {}; snap.docs.forEach(doc => { d[doc.id] = doc.data(); }); if (Object.keys(d).length === 0) setSystemDecks(INITIAL_SYSTEM_DECKS); else setSystemDecks(d); });
    const unsubSysLessons = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'system_lessons'), (snap) => { const l = snap.docs.map(d => ({ id: d.id, ...d.data() })); if (l.length === 0) setSystemLessons(INITIAL_SYSTEM_LESSONS); else setSystemLessons(l); });
    
    // Enrolled Classes Listener
    const qEnrolled = query(collectionGroup(db, 'classes'), where('studentEmails', 'array-contains', user.email));
    const unsubClasses = onSnapshot(qEnrolled, (snapshot) => {
        const cls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEnrolledClasses(cls);
        // Extract assignments
        const newAssignments = [];
        cls.forEach(c => {
            if (c.assignments && Array.isArray(c.assignments)) {
                newAssignments.push(...c.assignments);
            }
        });
        // Dedup by ID if needed, but simple push is fine for now
        setClassLessons(newAssignments);
        // Update user profile local state for UI
        setUserData(prev => ({...prev, classAssignments: newAssignments}));
    });

    return () => { unsubProfile(); unsubCards(); unsubLessons(); unsubSysDecks(); unsubSysLessons(); unsubClasses(); };
  }, [user]);

  // CRUD HANDLERS
  const handleCreateCard = async (c) => { if(!user) return; await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_cards'), c); setSelectedDeckKey(c.deckId || 'custom'); setActiveTab('flashcards'); };
  
  const handleUpdateCard = async (cardId, data) => {
    if (!user) return;
    // Check if this is a custom card (system cards don't have firestore IDs in custom_cards collection usually)
    try {
       await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'custom_cards', cardId), data);
    } catch (e) {
       console.error(e);
       alert("Cannot edit system cards directly. Clone to custom deck to edit.");
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!user) return;
    try {
       await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'custom_cards', cardId));
    } catch (e) {
       console.error(e);
       alert("Cannot delete system cards.");
    }
  };

  const handleCreateLesson = async (l, id = null) => { 
      if(!user) return; 
      if (id) {
          await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'custom_lessons', id), l);
      } else {
          await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'custom_lessons'), l); 
      }
      setActiveTab('home'); 
  };
  
  const handleFinishLesson = async (xp) => { setActiveTab('home'); if (xp > 0 && user) { try { await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), { xp: increment(xp) }); } catch (e) { await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main'), { ...DEFAULT_USER_DATA, xp }, { merge: true }); } } };

  if (!authChecked) return <div className="h-full flex items-center justify-center text-indigo-500"><Loader className="animate-spin" size={32}/></div>;
  if (!user) return <AuthView />;
  if (!userData) return <div className="h-full flex items-center justify-center text-indigo-500"><Loader className="animate-spin" size={32}/></div>; 
  
  // Using the unified logic, passing handlers down
  if (userData.role === 'instructor') return <InstructorDashboard user={user} userData={userData} allDecks={allDecks} lessons={lessons} onSaveLesson={handleCreateLesson} onSaveCard={handleCreateCard} onUpdateCard={handleUpdateCard} onDeleteCard={handleDeleteCard} onLogout={() => signOut(auth)} />;

  const renderStudentView = () => {
    switch (activeTab) {
      case 'home': return <HomeView setActiveTab={setActiveTab} lessons={lessons} onSelectLesson={(l) => { setActiveLesson(l); setActiveTab('lesson'); }} userData={userData} />;
      case 'lesson': return <LessonView lesson={activeLesson} onFinish={handleFinishLesson} />;
      case 'flashcards': return <FlashcardView allDecks={allDecks} selectedDeckKey={selectedDeckKey} onSelectDeck={setSelectedDeckKey} onSaveCard={handleCreateCard} />;
      case 'create': return <BuilderHub onSaveCard={handleCreateCard} onUpdateCard={handleUpdateCard} onDeleteCard={handleDeleteCard} onSaveLesson={handleCreateLesson} allDecks={allDecks} />;
      case 'profile': return <ProfileView user={user} userData={userData} />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-900 flex justify-center items-center p-0 sm:p-4">
      <div className={`bg-slate-50 w-full h-[100dvh] shadow-2xl relative overflow-hidden border-[8px] border-slate-900/5 sm:border-slate-900/10 ${userData?.role === 'instructor' ? 'max-w-full sm:rounded-none border-0' : 'max-w-[400px] sm:rounded-[3rem] sm:h-[800px]'}`}>
        {userData?.role !== 'instructor' && <div className="absolute top-0 left-0 right-0 h-8 bg-white/0 z-50 pointer-events-none" />}
        {renderStudentView()}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <style>{` .perspective-1000 { perspective: 1000px; } .preserve-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; } `}</style>
    </div>
  );
};

export default App;
