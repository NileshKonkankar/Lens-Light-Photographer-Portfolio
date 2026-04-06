import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Camera, Menu, X, Instagram, Twitter, Mail, Plus, LogOut, Loader2, Trash2 } from 'lucide-react';
import React, { useState, useEffect, createContext, useContext, ReactNode, Component, ErrorInfo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, 
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, 
  handleFirestoreError, OperationType, User 
} from './firebase';
import { deleteDoc, doc } from 'firebase/firestore';

// --- Error Boundary ---
interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let message = "Something went wrong.";
      try {
        const parsed = JSON.parse((this.state.error as any)?.message || "");
        if (parsed.error) message = `Firebase Error: ${parsed.error}`;
      } catch {
        message = (this.state.error as any)?.message || message;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 text-center">
          <div className="space-y-4 max-w-md">
            <h1 className="text-2xl font-light text-red-500">Application Error</h1>
            <p className="text-gray-400 text-sm">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white text-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      // Simple admin check: check if email matches the photographer's email
      setIsAdmin(u?.email === "KonkankarNilesh@gmail.com");
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// --- Components ---

const Home = () => (
  <div className="space-y-20 pb-20">
    <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&q=80&w=2000" 
          alt="Hero" 
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/60" />
      </div>
      
      <div className="relative z-10 text-center space-y-6 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-light tracking-tighter text-white"
        >
          LENS & LIGHT
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-gray-300 font-light tracking-widest uppercase"
        >
          Capturing the essence of the moment
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link 
            to="/gallery" 
            className="inline-block px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-colors duration-300 tracking-widest text-sm uppercase"
          >
            View Portfolio
          </Link>
        </motion.div>
      </div>
    </section>

    <section className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-4xl font-light tracking-tight">The Art of Seeing</h2>
          <p className="text-gray-400 leading-relaxed">
            Photography is more than just clicking a button. It's about finding the story in the shadows, 
            the emotion in the light, and the soul in the subject. Every frame is a testament to a 
            moment that will never happen again.
          </p>
          <Link to="/about" className="text-sm uppercase tracking-widest border-b border-white pb-1 inline-block hover:opacity-70 transition-opacity">
            Learn More
          </Link>
        </div>
        <div className="aspect-square overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=1000" 
            alt="About" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </section>
  </div>
);

interface Photo {
  id: string;
  url: string;
  title: string;
  description?: string;
  category?: string;
  createdAt: any;
}

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];
      setPhotos(photoData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'photos');
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
      <h1 className="text-5xl font-light mb-12 tracking-tight">Portfolio</h1>
      {photos.length === 0 ? (
        <p className="text-gray-500 text-center py-20">No photos in the gallery yet.</p>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {photos.map((photo) => (
            <motion.div 
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="break-inside-avoid overflow-hidden group relative"
            >
              <img 
                src={photo.url}
                alt={photo.title}
                className="w-full h-auto grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <h3 className="text-lg font-light">{photo.title}</h3>
                {photo.category && <p className="text-xs uppercase tracking-widest text-gray-400">{photo.category}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const About = () => (
  <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 space-y-12">
    <div className="aspect-video overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&q=80&w=1500" 
        alt="Photographer" 
        className="w-full h-full object-cover grayscale"
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="space-y-6">
      <h1 className="text-5xl font-light tracking-tight">Nilesh Konkankar</h1>
      <p className="text-xl text-gray-400 font-light leading-relaxed">
        Based in the heart of the city, I specialize in street, portrait, and architectural photography. 
        My work explores the intersection of human emotion and urban landscapes.
      </p>
      <div className="prose prose-invert max-w-none text-gray-400">
        <p>
          With over a decade of experience behind the lens, I've learned that the best shots are often 
          the ones you didn't plan for. My approach is minimalist and observational, seeking to capture 
          the raw, unscripted beauty of everyday life.
        </p>
      </div>
    </div>
  </div>
);

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];
      setPhotos(photoData);
    });
    return unsubscribe;
  }, [user, isAdmin]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleAddPhoto = async (e: FormEvent) => {
    e.preventDefault();
    if (!url || !title || !user) return;
    setIsUploading(true);
    try {
      await addDoc(collection(db, 'photos'), {
        url,
        title,
        category,
        createdAt: serverTimestamp(),
        authorId: user.uid
      });
      setUrl('');
      setTitle('');
      setCategory('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'photos');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
      await deleteDoc(doc(db, 'photos', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `photos/${id}`);
    }
  };

  if (loading) return <div className="pt-32 flex justify-center"><Loader2 className="animate-spin" /></div>;

  if (!user) {
    return (
      <div className="pt-32 pb-20 max-w-md mx-auto px-4 text-center space-y-6">
        <h1 className="text-3xl font-light">Admin Access</h1>
        <p className="text-gray-400">Please sign in with your Google account to manage your portfolio.</p>
        <button 
          onClick={handleLogin}
          className="w-full bg-white text-black py-3 text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-32 pb-20 max-w-md mx-auto px-4 text-center space-y-6">
        <h1 className="text-3xl font-light text-red-500">Access Denied</h1>
        <p className="text-gray-400">You do not have permission to access the admin panel.</p>
        <button onClick={() => signOut(auth)} className="text-sm underline">Sign Out</button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 max-w-5xl mx-auto px-4 space-y-12">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-light">Dashboard</h1>
        <button onClick={() => signOut(auth)} className="flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Upload Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900 p-6 border border-zinc-800 space-y-6">
            <h2 className="text-xl font-light flex items-center gap-2"><Plus className="w-5 h-5" /> Add New Work</h2>
            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Image URL</label>
                <input 
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-black border border-zinc-800 p-3 text-sm focus:border-white outline-hidden transition-colors" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Title</label>
                <input 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="The Silent Street"
                  className="w-full bg-black border border-zinc-800 p-3 text-sm focus:border-white outline-hidden transition-colors" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Category</label>
                <input 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Street / Portrait / Architecture"
                  className="w-full bg-black border border-zinc-800 p-3 text-sm focus:border-white outline-hidden transition-colors" 
                />
              </div>
              <button 
                disabled={isUploading}
                className="w-full bg-white text-black py-3 text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add to Portfolio'}
              </button>
            </form>
          </div>
        </div>

        {/* Manage List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-light">Manage Photos ({photos.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="bg-zinc-900 border border-zinc-800 p-4 flex gap-4 items-center">
                <img src={photo.url} className="w-16 h-16 object-cover grayscale" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{photo.title}</h3>
                  <p className="text-xs text-gray-500">{photo.category || 'No category'}</p>
                </div>
                <button 
                  onClick={() => handleDelete(photo.id)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
          {/* Navigation */}
          <nav className="fixed top-0 w-full z-50 px-6 py-8 flex justify-between items-center mix-blend-difference">
            <Link to="/" className="flex items-center gap-2 group">
              <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="text-xl font-light tracking-tighter">L&L</span>
            </Link>
            
            <div className="hidden md:flex gap-12 text-xs uppercase tracking-[0.2em] font-light">
              <Link to="/" className="hover:opacity-50 transition-opacity">Home</Link>
              <Link to="/gallery" className="hover:opacity-50 transition-opacity">Portfolio</Link>
              <Link to="/about" className="hover:opacity-50 transition-opacity">About</Link>
              <Link to="/admin" className="hover:opacity-50 transition-opacity">Admin</Link>
            </div>

            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </nav>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-8 text-2xl font-light uppercase tracking-widest"
              >
                <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link to="/gallery" onClick={() => setIsMenuOpen(false)}>Portfolio</Link>
                <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
                <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin</Link>
              </motion.div>
            )}
          </AnimatePresence>

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-zinc-900 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left space-y-2">
                <h3 className="text-xl font-light tracking-tighter">LENS & LIGHT</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest">© 2026 Nilesh Konkankar. All rights reserved.</p>
              </div>
              <div className="flex gap-6">
                <Instagram className="w-5 h-5 cursor-pointer hover:text-gray-400 transition-colors" />
                <Twitter className="w-5 h-5 cursor-pointer hover:text-gray-400 transition-colors" />
                <Mail className="w-5 h-5 cursor-pointer hover:text-gray-400 transition-colors" />
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}
