import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. CONFIGURATION & DATA MODELS
// ==========================================

// VISUAL ASSETS CONFIG
const HOME_VISUALS = {
  heroBg: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop",
  videoCover: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=2070&auto=format&fit=crop",
  heroFallback: "linear-gradient(135deg, #1a1a1a 0%, #2d3436 100%)",
};

// VALUE PROPS CONFIG
const HOME_VALUE_PROPS = [
  { id: 1, icon: 'layers', title: 'Showcase beautifully', desc: 'Turn collections into a curated space.' },
  { id: 2, icon: 'sliders', title: 'Configure in seconds', desc: 'Pick sizes, layouts, and modules easily.' },
  { id: 3, icon: 'box', title: 'Preview before you buy', desc: 'See it in 3D, then refine with confidence.' }
];

// SERIES DATA (Preserved)
const SERIES_DATA = [
  { id: 'minimal', name: 'Minimal Clean', description: 'Less is more. Pure geometry.' },
  { id: 'wood', name: 'Warm Wood', description: 'Natural textures and cozy lighting.' },
  { id: 'museum', name: 'Museum Gallery', description: 'High contrast, spotlight focused.' },
  { id: 'cyber', name: 'Cyber LED', description: 'Neon lights and acrylics.' },
  { id: 'luxury', name: 'Luxury Dark', description: 'Velvet, gold accents, deep shadows.' },
  { id: 'pop', name: 'Pop Color', description: 'Vibrant, energetic arrangements.' },
  { id: 'industrial', name: 'Industrial Metal', description: 'Raw steel and concrete.' },
  { id: 'wabi', name: 'Japanese Wabi-Sabi', description: 'Imperfect beauty, earthenware.' },
  { id: 'collector', name: 'Collector Dense', description: 'Maximizing space for collections.' },
  { id: 'store', name: 'Storefront Display', description: 'Retail-focused, high visibility.' }
];

// INITIAL DATA SEEDING
const INITIAL_POSTS = [
  { id: 1, title: "Floating Oak Shelf System", author: "demo_user", seriesId: "wood", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80", tags: ["Wood", "DIY"], likes: 124 },
  { id: 2, title: "Neon Gundam Hangar", author: "MechaFan", seriesId: "cyber", image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80", tags: ["Anime", "RGB"], likes: 89 },
  { id: 3, title: "Gallery Wall for Ceramics", author: "CuratorJane", seriesId: "museum", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80", tags: ["Art", "Ceramics"], likes: 210 },
  { id: 4, title: "Minimalist Sneaker Wall", author: "HypeBeast", seriesId: "minimal", image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80", tags: ["Sneakers", "Fashion"], likes: 45 },
  { id: 5, title: "Industrial Pipe Display", author: "MakerTom", seriesId: "industrial", image: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800&q=80", tags: ["Industrial", "Retail"], likes: 156 }
];

const INITIAL_USERS = [
  { id: 'u1', username: 'demo_user', password: 'user123', role: 'user', status: 'active', avatar: 'https://ui-avatars.com/api/?name=User&background=0071e3&color=fff' },
  { id: 'u2', username: 'demo_admin', password: 'admin123', role: 'admin', status: 'active', avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=fff' },
];

const BUILD_STEPS = [
  { id: 1, label: 'Prepare', icon: 'play-circle' },
  { id: 2, label: 'Collect', icon: 'package' },
  { id: 3, label: 'Size', icon: 'maximize' },
  { id: 4, label: 'Display', icon: 'layout' }
];

const ADDONS_DATA = [
  { id: 'led', name: 'LED Lighting Kit', price: '$45' },
  { id: 'acrylic', name: 'Acrylic Dust Cover', price: '$30' },
  { id: 'mount', name: 'Wall Mount Brackets', price: '$15' },
  { id: 'lock', name: 'Security Lock', price: '$10' }
];

// Helper Icon Component
const Icon = ({ name, size = 20, className = "" }) => {
  return <i data-lucide={name} className={className} style={{ width: size, height: size }}></i>;
};

// Default build params (avoid setBuildParams({}) breaking UI)
const DEFAULT_BUILD_PARAMS = {
  collectType: null,
  countTier: null,
  displayMode: null,
  style: null,
  selectedOption: null,
  selectedAddons: []
};

// ==========================================
// 2. MAIN APP COMPONENT
// ==========================================

export default function App() {
  // --- Global State ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // home | build | explore | order | login | admin
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [users, setUsers] = useState([]);

  // --- Build State ---
  const [buildParams, setBuildParams] = useState(DEFAULT_BUILD_PARAMS);
  const [buildStep, setBuildStep] = useState(0);

  // --- Home State ---
  const [homeChatOpen, setHomeChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // --- Effects ---
  useEffect(() => {
    // Load currentUser
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) setUser(JSON.parse(savedUser));

    // Load posts
    const savedPosts = localStorage.getItem('posts');
    setPosts(savedPosts ? JSON.parse(savedPosts) : INITIAL_POSTS);

    // Load comments
    const savedComments = localStorage.getItem('comments');
    if (savedComments) setComments(JSON.parse(savedComments));

    // ✅ Users migration / seeding (fix “Invalid credentials” + old localStorage pollution)
    const savedUsersRaw = localStorage.getItem('users');
    let nextUsers = INITIAL_USERS;

    if (savedUsersRaw) {
      try {
        const parsed = JSON.parse(savedUsersRaw);
        const hasPasswordField =
          Array.isArray(parsed) && parsed.length > 0
            ? parsed.every(u => u && typeof u === 'object' && ('password' in u))
            : false;

        const hasDemoAdmin =
          Array.isArray(parsed) && parsed.some(u => u?.username === 'demo_admin');

        if (Array.isArray(parsed) && hasPasswordField && hasDemoAdmin) {
          nextUsers = parsed;
        } else {
          const migrated = (Array.isArray(parsed) ? parsed : []).map(u => ({
            ...u,
            password: u?.password || 'user123'
          }));

          const mergedMap = new Map();
          [...INITIAL_USERS, ...migrated].forEach(u => {
            if (u?.username) mergedMap.set(u.username, u);
          });
          nextUsers = Array.from(mergedMap.values());
          localStorage.setItem('users', JSON.stringify(nextUsers));
        }
      } catch (e) {
        nextUsers = INITIAL_USERS;
        localStorage.setItem('users', JSON.stringify(nextUsers));
      }
    } else {
      localStorage.setItem('users', JSON.stringify(INITIAL_USERS));
    }

    setUsers(nextUsers);
  }, []);

  useEffect(() => {
    if (window.lucide) window.lucide.createIcons();
  }, [view, buildStep, homeChatOpen, chatHistory]);

  // --- Actions ---
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    setView('home');
  };

  const handleLogin = (username, password) => {
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      if (foundUser.status === 'banned') {
        alert("Account banned. Contact support.");
        return false;
      }
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      setView('home');
      return true;
    }
    alert("Invalid credentials.");
    return false;
  };

  const handleRegister = (username, password) => {
    if (!username || !password) return alert("Please fill in all fields.");
    if (users.find(u => u.username === username)) return alert("Username taken.");

    const newUser = {
      id: 'u' + Date.now(),
      username,
      password,
      role: 'user',
      status: 'active',
      avatar: `https://ui-avatars.com/api/?name=${username}&background=random&color=fff`
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setView('home');
  };

  // Home Chat Logic
  const handleHomeChatSelection = (type) => {
    setChatHistory(prev => [...prev, { type: 'user', text: type }]);

    setTimeout(() => {
      setChatHistory(prev => [...prev, { type: 'system', text: `Got it — we’ll tailor sizing and modules for ${type}.` }]);
      setTimeout(() => {
        setBuildParams(prev => ({ ...DEFAULT_BUILD_PARAMS, ...prev, collectType: type }));
        setBuildStep(2);
        setView('build');
      }, 800);
    }, 300);
  };

  // Admin Actions
  const toggleUserStatus = (userId) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId && u.role !== 'admin') {
        return { ...u, status: u.status === 'active' ? 'banned' : 'active' };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const deletePost = (postId) => {
    if (!confirm("Delete this post?")) return;
    const updatedPosts = posts.filter(p => p.id !== postId);
    setPosts(updatedPosts);
    localStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  // ==========================================
  // 3. COMPONENT VIEWS
  // ==========================================

  // --- A. HOME VIEW ---
  const HomeView = () => {
    const chatRef = useRef(null);
    const scrollToChat = () => {
      setHomeChatOpen(true);
      setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    return (
      <div className="animate-fade-in pb-20">
        {/* 1. HERO ZONE */}
        <section className="relative min-h-[90vh] flex items-center justify-center text-center overflow-hidden bg-apple-dark">
          <div className="absolute inset-0 z-0">
            <img
              src={HOME_VISUALS.heroBg}
              className="w-full h-full object-cover opacity-60"
              onError={(e) => (e.target.style.display = 'none')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div className="absolute inset-0 -z-10" style={{ background: HOME_VISUALS.heroFallback }}></div>
          </div>

          <div className="relative z-10 px-6 max-w-4xl mx-auto mt-[-5vh]">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-6 drop-shadow-lg">
              Display your passion.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 font-light mb-10 max-w-2xl mx-auto leading-relaxed">
              Give your collection a home. Professional grade displays for what you love.
            </p>
            <button
              onClick={scrollToChat}
              className="bg-apple-blue hover:bg-apple-blueHover text-white px-8 py-4 rounded-full font-medium text-lg transition-all shadow-glow hover:scale-105"
            >
              Get started
            </button>
          </div>
        </section>

        {/* 2. VALUE PROPS */}
        <section className="py-24 bg-white border-b border-apple-border/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {HOME_VALUE_PROPS.map((prop) => (
                <div key={prop.id} className="flex flex-col items-center text-center md:items-start md:text-left group">
                  <div className="w-16 h-16 bg-apple-bg rounded-2xl flex items-center justify-center text-apple-text mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Icon name={prop.icon} size={32} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{prop.title}</h3>
                  <p className="text-apple-subtext leading-relaxed">{prop.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. VIDEO ZONE */}
        <section className="py-20 bg-apple-bg">
          <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-[2.5rem] overflow-hidden bg-gray-900 aspect-video md:aspect-[21/9] relative group cursor-pointer shadow-medium">
              <img src={HOME_VISUALS.videoCover} className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition duration-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-110 transition">
                  <Icon name="play" size={32} className="ml-1 text-white fill-white" />
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white/90 font-medium text-lg">From clutter to curated, in minutes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CHAT ONBOARDING */}
        <section ref={chatRef} className="py-24 px-6 bg-white min-h-[60vh] flex flex-col items-center justify-center">
          <div className="max-w-2xl w-full">
            {!homeChatOpen ? (
              <div className="text-center opacity-50 animate-pulse">Initializing concierge...</div>
            ) : (
              <div className="space-y-6 animate-slide-up">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
                    <Icon name="bot" size={16} />
                  </div>
                  <div className="bg-apple-bg p-4 rounded-2xl rounded-tl-none text-apple-text max-w-sm shadow-sm">
                    Let's find the perfect setup for you. <br /><strong>What do you collect?</strong>
                  </div>
                </div>

                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    {msg.type === 'system' && (
                      <div className="w-8 h-8 rounded-full bg-black flex-shrink-0 flex items-center justify-center text-white mr-3">
                        <Icon name="bot" size={16} />
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl max-w-[80%] shadow-sm ${msg.type === 'system' ? 'bg-apple-bg text-apple-text rounded-tl-none' : 'bg-apple-blue text-white rounded-tr-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}

                {chatHistory.length === 0 && (
                  <div className="flex flex-wrap gap-3 pl-11">
                    {['LEGO', 'Mini Figures', 'HotWheels', 'Other'].map(type => (
                      <button
                        key={type}
                        onClick={() => handleHomeChatSelection(type)}
                        className="bg-white border border-apple-border hover:border-apple-blue hover:text-apple-blue px-6 py-3 rounded-full text-sm font-medium transition-colors shadow-sm"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  };

  // --- B. BUILD VIEW ---
  const BuildView = () => {
    const nextStep = () => setBuildStep(s => s + 1);

    const toggleAddon = (id) => {
      setBuildParams(prev => {
        const selected = prev.selectedAddons.includes(id)
          ? prev.selectedAddons.filter(x => x !== id)
          : [...prev.selectedAddons, id];
        return { ...prev, selectedAddons: selected };
      });
    };

    const ChatBubble = ({ isSystem, children }) => (
      <div className={`flex w-full ${isSystem ? 'justify-start' : 'justify-end'} mb-6 animate-slide-up`}>
        {isSystem && <div className="w-8 h-8 rounded-full bg-black flex-shrink-0 flex items-center justify-center text-white mr-3"><Icon name="bot" size={16} /></div>}
        <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${isSystem ? 'bg-white border border-apple-border text-apple-text rounded-tl-none' : 'bg-apple-blue text-white rounded-tr-none'}`}>
          {children}
        </div>
      </div>
    );

    // ✅ Fullscreen helper for iframe
    const requestStageFullscreen = () => {
      const el = document.getElementById('modeler-iframe');
      if (!el) return;
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    };

    return (
      <div className="min-h-screen bg-apple-bg pt-16 pb-20">
        {/* Intent Header */}
        <div className="bg-white/80 backdrop-blur border-b border-apple-border px-6 py-3 flex justify-between items-center sticky top-16 z-30">
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-apple-subtext">Intent:</span>
            <span className="font-semibold">{buildParams.collectType || 'New Build'}</span>
            {buildStep < 5 && (
              <button
                onClick={() => { setBuildParams(DEFAULT_BUILD_PARAMS); setBuildStep(1); }}
                className="text-apple-blue text-xs ml-2 hover:underline"
              >
                Restart
              </button>
            )}
          </div>
          <div className="text-xs font-mono text-apple-subtext bg-gray-100 px-2 py-1 rounded">Step {Math.min(buildStep, 4)}/4</div>
        </div>

        {/* Tutorial Strip */}
        <div className="px-6 py-6 border-b border-apple-border bg-white overflow-x-auto">
          <div className="flex space-x-12 min-w-max mx-auto max-w-4xl justify-center">
            {BUILD_STEPS.map((s, i) => {
              const isActive = s.id === buildStep;
              const isDone = s.id < buildStep;
              return (
                <div key={s.id} className={`flex items-center space-x-3 ${isActive ? 'text-apple-blue' : isDone ? 'text-black' : 'text-gray-300'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isActive ? 'bg-apple-blue text-white shadow-glow' : isDone ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {isDone ? <Icon name="check" size={14} /> : s.id}
                  </div>
                  <span className="text-sm font-medium tracking-wide">{s.label}</span>
                  {i < 3 && <div className="w-12 h-[1px] bg-gray-200 ml-6"></div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="max-w-3xl mx-auto px-6 py-12 min-h-[400px]">
          {buildStep >= 1 && (
            <>
              <ChatBubble isSystem>I'll guide you through 4 simple choices to generate your display solution.</ChatBubble>
              {buildStep === 1 && (
                <div className="pl-11">
                  <button onClick={nextStep} className="bg-black text-white px-8 py-3 rounded-full font-medium hover:scale-105 transition shadow-lg">
                    Start Building
                  </button>
                </div>
              )}
            </>
          )}

          {buildStep >= 2 && (
            <>
              <ChatBubble isSystem>What are you collecting?</ChatBubble>
              <ChatBubble isSystem={false}>I'm building for <strong>{buildParams.collectType || 'Custom'}</strong>.</ChatBubble>
              {buildStep === 2 && (
                <div className="pl-11 flex gap-3">
                  <button onClick={nextStep} className="bg-apple-blue text-white px-5 py-2 rounded-full text-sm font-medium shadow-md">Confirm {buildParams.collectType}</button>
                  <button onClick={() => setBuildParams(p => ({ ...p, collectType: null }))} className="text-apple-subtext text-sm hover:text-black px-3">Change</button>
                </div>
              )}
            </>
          )}

          {buildStep >= 3 && (
            <>
              <ChatBubble isSystem>How many items do you want to display?</ChatBubble>
              {buildStep === 3 ? (
                <div className="pl-11 flex flex-wrap gap-3 animate-fade-in">
                  {['1-10 (Small)', '10-30 (Medium)', '30-60 (Large)', '60+ (Gallery)'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setBuildParams(p => ({ ...p, countTier: opt })); nextStep(); }}
                      className="bg-white border border-apple-border hover:border-apple-blue px-6 py-3 rounded-xl text-sm font-medium transition shadow-sm text-left hover:shadow-md"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <ChatBubble isSystem={false}>About <strong>{buildParams.countTier}</strong> items.</ChatBubble>
              )}
            </>
          )}

          {buildStep >= 4 && (
            <>
              <ChatBubble isSystem>Got it. How do you want to place it?</ChatBubble>
              {buildStep === 4 ? (
                <div className="pl-11 grid grid-cols-2 gap-4 max-w-md animate-fade-in">
                  <button onClick={() => { setBuildParams(p => ({ ...p, displayMode: 'Floor' })); setBuildStep(5); }} className="bg-white p-5 rounded-xl border border-apple-border hover:border-apple-blue hover:shadow-md transition text-left group">
                    <div className="bg-gray-50 w-full h-24 rounded-lg mb-4 flex items-center justify-center group-hover:bg-blue-50 transition">
                      <Icon name="box" size={32} className="text-gray-400 group-hover:text-apple-blue" />
                    </div>
                    <div className="font-semibold text-lg">Floor Standing</div>
                    <div className="text-xs text-apple-subtext mt-1">Cabinets & Shelves</div>
                  </button>
                  <button onClick={() => { setBuildParams(p => ({ ...p, displayMode: 'Wall' })); setBuildStep(5); }} className="bg-white p-5 rounded-xl border border-apple-border hover:border-apple-blue hover:shadow-md transition text-left group">
                    <div className="bg-gray-50 w-full h-24 rounded-lg mb-4 flex items-center justify-center group-hover:bg-blue-50 transition">
                      <Icon name="layout" size={32} className="text-gray-400 group-hover:text-apple-blue" />
                    </div>
                    <div className="font-semibold text-lg">Wall Mounted</div>
                    <div className="text-xs text-apple-subtext mt-1">Floating Frames</div>
                  </button>
                </div>
              ) : (
                <ChatBubble isSystem={false}>Prefer <strong>{buildParams.displayMode}</strong> mounting.</ChatBubble>
              )}
            </>
          )}

          {buildStep >= 5 && <ChatBubble isSystem>I've generated 3 optimal configurations for your collection.</ChatBubble>}
        </div>

        {/* Recommendation Strip */}
        {buildStep >= 5 && (
          <div className="border-t border-apple-border bg-white py-12 px-6 animate-slide-up">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-xl font-semibold mb-8">Recommended Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Modular Tower', 'Gallery Grid', 'Showcase Cabinet'].map((name) => (
                  <div
                    key={name}
                    onClick={() => setBuildParams(p => ({ ...p, selectedOption: name }))}
                    className={`border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-medium ${buildParams.selectedOption === name ? 'ring-2 ring-apple-blue border-transparent bg-blue-50/10' : 'border-apple-border bg-white'}`}
                  >
                    <div className="aspect-square bg-gray-50 rounded-xl mb-6 flex items-center justify-center text-gray-300">
                      <Icon name="image" size={48} strokeWidth={1} />
                    </div>
                    <h4 className="font-bold text-xl">{name}</h4>
                    <div className="text-sm text-apple-subtext mt-2">{buildParams.countTier} Capacity • {buildParams.displayMode}</div>
                    {buildParams.selectedOption === name && (
                      <div className="mt-4 text-xs font-bold text-apple-blue uppercase tracking-wide flex items-center">
                        <Icon name="check" size={12} className="mr-1" />Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ✅ Stage (iframe) + Add-ons */}
        <div className="bg-apple-bg border-t border-apple-border py-16 px-6 flex justify-center">
          <div className="max-w-7xl w-full flex flex-col md:flex-row gap-8">
            {/* Stage */}
            <div className="flex-1 bg-white rounded-[2rem] border border-apple-border shadow-sm relative overflow-hidden">
              {/* top-right fullscreen */}
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <button
                  type="button"
                  className="bg-white/90 backdrop-blur border border-apple-border px-4 py-2 rounded-full text-sm font-medium hover:bg-white"
                  onClick={requestStageFullscreen}
                >
                  Fullscreen
                </button>
              </div>

              {/* optional config label */}
              {buildParams.selectedOption ? (
                <div className="absolute top-4 left-4 z-20 text-left">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Configuration</div>
                  <div className="text-xs font-mono text-apple-text bg-gray-100 px-3 py-2 rounded-lg">
                    {buildParams.collectType} / {buildParams.countTier} / {buildParams.displayMode}
                  </div>
                </div>
              ) : (
                <div className="absolute top-4 left-4 z-20 text-left">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Locked</div>
                  <div className="text-xs font-mono text-apple-text bg-gray-100 px-3 py-2 rounded-lg">
                    Select a template above
                  </div>
                </div>
              )}

              <iframe
                id="modeler-iframe"
                title="3D Modeler"
                src="/modeler-v8.html"
                className="w-full h-[70vh] md:h-[650px] rounded-[2rem]"
                style={{ border: "none" }}
              />
            </div>

            {/* Add-ons Panel */}
            <div className="w-full md:w-80 flex flex-col space-y-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-apple-border flex-1">
                <h4 className="font-bold mb-6 flex items-center"><Icon name="plus-circle" size={18} className="mr-2" /> Accessories</h4>
                <div className="space-y-3">
                  {ADDONS_DATA.map(addon => {
                    const isSelected = buildParams.selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${isSelected ? 'border-apple-blue bg-blue-50/20' : 'border-gray-100 hover:border-gray-300'}`}
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1 ml-3">
                          <div className="text-xs font-semibold">{addon.name}</div>
                          <div className="text-[10px] text-gray-500">{addon.price}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-apple-blue border-apple-blue' : 'border-gray-300'}`}>
                          {isSelected && <Icon name="check" size={12} className="text-white" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={() => setView('order')}
                className="bg-apple-dark text-white w-full py-4 rounded-2xl font-bold shadow-lg hover:bg-black hover:scale-[1.02] transition flex items-center justify-center"
              >
                Order & Pay <Icon name="arrow-right" size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- C. EXPLORE VIEW ---
  const ExploreView = () => {
    const [showDiscussionModal, setShowDiscussionModal] = useState(false);

    return (
      <div className="pt-20 min-h-screen bg-white">
        {showDiscussionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowDiscussionModal(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-bold mb-4">Community Discussions</h3>
              <p className="text-gray-500 mb-6">This would open the full forum interface.</p>
              <button onClick={() => setShowDiscussionModal(false)} className="bg-black text-white px-6 py-2 rounded-full">Close Demo</button>
            </div>
          </div>
        )}

        <div className="sticky top-16 bg-white/95 backdrop-blur z-20 border-b border-apple-border px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="font-bold text-lg flex items-center space-x-2">
              <span>Explore</span> <span className="text-gray-300">/</span> <span className="text-apple-blue">All</span>
            </div>
            <div className="hidden md:flex space-x-2">
              {['All', 'LEGO', 'Figures', 'Sneakers', 'Trending'].map(tag => (
                <button key={tag} className="px-4 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium transition">{tag}</button>
              ))}
            </div>
            <div className="flex items-center space-x-2 text-sm text-apple-subtext cursor-pointer hover:text-black">
              <span>Sort by: Trending</span> <Icon name="chevron-down" size={14} />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map(p => (
              <div key={p.id} className="group cursor-pointer">
                <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden mb-4 relative shadow-sm transition-all duration-500 group-hover:shadow-medium">
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm">{p.seriesId}</div>
                </div>
                <h3 className="font-semibold text-base">{p.title}</h3>
                <p className="text-xs text-gray-500 mt-1">by {p.author}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-apple-bg py-16 px-6 border-y border-apple-border/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-xl flex items-center"><Icon name="message-circle" className="mr-3" /> Community Highlights</h3>
              <button onClick={() => setShowDiscussionModal(true)} className="text-sm text-apple-blue font-medium hover:underline">See all discussions</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Best way to mount heavy LEGO sets?', 'Looking for 4000K LED strips', 'Showcase: Star Wars Collection'].map((topic, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-medium transition cursor-pointer" onClick={() => setShowDiscussionModal(true)}>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded mb-3 inline-block">QUESTION</span>
                  <h4 className="font-semibold text-sm mb-3">{topic}</h4>
                  <div className="flex items-center text-xs text-gray-400 space-x-3">
                    <span>12 replies</span>
                    <span>2h ago</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-apple-dark text-white rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-medium">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Complete your setup.</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Lighting kits, acrylic covers, and mounting hardware designed for your collection.</p>
              <button onClick={() => setView('order')} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition shadow-glow">Shop Add-ons</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- D. AUTH VIEW ---
  const AuthView = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });

    const submit = (e) => {
      e.preventDefault();
      if (isRegister) handleRegister(formData.username, formData.password);
      else handleLogin(formData.username, formData.password);
    };

    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-medium max-w-sm w-full border border-white">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-apple-text">{isRegister ? 'Create Account' : 'Sign In'}</h1>
            <p className="text-apple-subtext text-sm">Welcome to Display.</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-apple-blue transition"
                placeholder="Username"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div>
              <input
                type="password"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-apple-blue transition"
                placeholder="Password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <button className="w-full bg-apple-blue text-white font-bold py-4 rounded-xl shadow-glow hover:opacity-90 transition">
              {isRegister ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-apple-subtext">{isRegister ? 'Already have an account?' : 'New to Display?'}</span>
            <button onClick={() => setIsRegister(!isRegister)} className="text-apple-blue font-medium ml-2 hover:underline">
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 mb-2">Demo Credentials:</p>
            <p className="text-xs font-mono text-gray-500">demo_user / user123</p>
            <p className="text-xs font-mono text-gray-500">demo_admin / admin123</p>
          </div>
        </div>
      </div>
    );
  };

  // --- E. ADMIN VIEW ---
  const AdminView = () => {
    return (
      <div className="pt-24 px-6 max-w-5xl mx-auto animate-fade-in pb-20">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button onClick={() => setView('home')} className="text-apple-blue font-medium hover:underline">Exit Panel</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-soft border border-gray-100">
            <h3 className="font-bold text-lg mb-6 flex items-center"><Icon name="users" className="mr-2" /> Users Management</h3>
            <div className="space-y-4">
              {users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium text-sm">{u.username}</span>
                    <span className="text-xs text-gray-400 uppercase">{u.role}</span>
                  </div>
                  {u.role !== 'admin' && (
                    <button onClick={() => toggleUserStatus(u.id)} className={`text-xs font-bold px-3 py-1 rounded-full ${u.status === 'active' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {u.status === 'active' ? 'Ban' : 'Unban'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-soft border border-gray-100">
            <h3 className="font-bold text-lg mb-6 flex items-center"><Icon name="file-text" className="mr-2" /> Content Moderation</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {posts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium truncate max-w-[200px]">{p.title}</span>
                  <button onClick={() => deletePost(p.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- F. ORDER PLACEHOLDER ---
  const OrderView = () => (
    <div className="min-h-screen bg-apple-bg flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
          <Icon name="check" size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4">Order Initiated</h1>
        <p className="text-apple-subtext mb-8">This is a placeholder for the checkout flow. In a real app, this would process your configured build.</p>
        <button onClick={() => setView('home')} className="bg-black text-white px-8 py-3 rounded-full font-bold">Return Home</button>
      </div>
    </div>
  );

  // ==========================================
  // 4. NAVIGATION COMPONENT
  // ==========================================
  const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-apple-border/50 h-16 px-6 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center space-x-8">
          <button onClick={() => setView('home')} className="text-xl font-bold tracking-tight text-black">Display.</button>
          <div className="hidden md:flex space-x-1">
            {['Display', 'Build', 'Explore', 'Order'].map((item) => {
              const key = item.toLowerCase();
              const viewKey = key === 'display' ? 'home' : key;
              const isActive = view === viewKey;
              return (
                <button
                  key={key}
                  onClick={() => setView(viewKey)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${isActive ? 'text-black' : 'text-gray-500 hover:text-black'}`}
                >
                  {item}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="relative" ref={menuRef}>
              <div className="flex items-center space-x-3 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition" onClick={() => setMenuOpen(!menuOpen)}>
                <img src={user.avatar} className="w-8 h-8 rounded-full border border-gray-200" />
                <Icon name="chevron-down" size={14} className="text-gray-400 mr-1" />
              </div>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-medium border border-gray-100 p-2 animate-fade-in origin-top-right overflow-hidden">
                  <div className="px-3 py-2 border-b border-gray-50 mb-1">
                    <p className="text-xs text-gray-400 uppercase font-bold">Signed in as</p>
                    <p className="text-sm font-medium truncate">{user.username}</p>
                  </div>
                  {user.role === 'admin' && (
                    <button onClick={() => { setView('admin'); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg flex items-center mb-1">
                      <Icon name="shield" size={14} className="mr-2 text-apple-blue" /> Admin Panel
                    </button>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg flex items-center">
                    <Icon name="log-out" size={14} className="mr-2" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setView('login')}
              className="text-sm font-medium bg-apple-dark text-white px-5 py-2 rounded-full hover:bg-black transition shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>
    );
  };

  // ==========================================
  // 5. RENDER ROOT
  // ==========================================
  return (
    <div className="font-sans text-apple-text selection:bg-apple-blue selection:text-white">
      {view !== 'login' && <Navbar />}
      <main>
        {view === 'home' && <HomeView />}
        {view === 'build' && <BuildView />}
        {view === 'explore' && <ExploreView />}
        {view === 'order' && <OrderView />}
        {view === 'login' && <AuthView />}
        {view === 'admin' && <AdminView />}
      </main>
    </div>
  );
}
