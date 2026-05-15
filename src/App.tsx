import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Camera, Menu, X, Instagram, Twitter, Mail, Plus, LogOut, Loader2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState, useEffect, createContext, useContext, ReactNode, Component, ErrorInfo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Masonry from 'react-masonry-css';
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
  <div className="space-y-0">
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 0.6 }}
          transition={{ 
            opacity: { duration: 3 },
            scale: { duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }
          }}
          src="https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&q=80&w=2000" 
          alt="Hero" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black pointer-events-none" />
      </div>
      
      <div className="relative z-10 text-center space-y-6 px-4 mt-16 max-w-5xl mx-auto flex flex-col items-center">
        
        <motion.h1 
          initial={{ opacity: 0, filter: "blur(12px)", y: 20 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl sm:text-8xl md:text-[9rem] font-serif italic tracking-tight text-white drop-shadow-2xl leading-none"
        >
          Lens & Light
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.2, ease: "easeOut" }}
          className="text-xs md:text-sm text-gray-300 font-light tracking-[0.4em] uppercase drop-shadow-md"
        >
          Capturing the essence of the moment
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.8, ease: "easeOut" }}
          className="pt-12"
        >
          <Link 
            to="/gallery" 
            className="inline-block px-10 py-4 border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-500 tracking-[0.2em] text-xs uppercase backdrop-blur-sm"
          >
            View Portfolio
          </Link>
        </motion.div>
      </div>


    </section>

    <section className="max-w-7xl mx-auto px-4 py-24 md:py-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-6"
        >
          <h2 className="text-4xl font-serif tracking-tight">The Art of Seeing</h2>
          <p className="text-gray-400 leading-relaxed font-light">
            Photography is more than just clicking a button. It's about finding the story in the shadows, 
            the emotion in the light, and the soul in the subject. Every frame is a testament to a 
            moment that will never happen again.
          </p>
          <Link to="/about" className="text-sm uppercase tracking-widest border-b border-white/50 pb-1 inline-block hover:text-gray-300 transition-colors mt-4">
            Learn More
          </Link>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: 'easeOut' }}
          viewport={{ once: true, margin: "-100px" }}
          className="aspect-square overflow-hidden"
        >
          <motion.img 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.7 }}
            src="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=1000" 
            alt="About" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            referrerPolicy="no-referrer"
          />
        </motion.div>
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

const ImageCarousel = ({ photos }: { photos: Photo[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  // Show max 5 photos in the carousel
  const carouselPhotos = photos.slice(0, 5);

  const next = () => setCurrentIndex((prev) => (prev + 1) % carouselPhotos.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + carouselPhotos.length) % carouselPhotos.length);

  useEffect(() => {
    if (carouselPhotos.length <= 1) return;
    const interval = setInterval(next, 5000); // Auto change every 5 seconds
    return () => clearInterval(interval);
  }, [carouselPhotos.length]);

  return (
    <div className="relative w-full h-[60vh] overflow-hidden mb-16 bg-zinc-900 group">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <img
            src={carouselPhotos[currentIndex].url}
            alt={carouselPhotos[currentIndex].title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 z-10 pointer-events-none">
        <motion.div
          key={`text-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-5xl font-serif tracking-tight">{carouselPhotos[currentIndex].title}</h2>
          {carouselPhotos[currentIndex].category && (
            <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-gray-300 mt-4">
              {carouselPhotos[currentIndex].category}
            </p>
          )}
        </motion.div>
      </div>

      {carouselPhotos.length > 1 && (
        <>
          <button 
            onClick={prev} 
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-white hover:text-black transition-colors rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-300"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={next} 
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-black/40 hover:bg-white hover:text-black transition-colors rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 duration-300"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-8 right-8 z-20 flex gap-3">
            {carouselPhotos.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-white w-6' : 'bg-white/30 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const PhotoModal = ({ photo, onClose }: { photo: Photo; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="max-w-6xl w-full bg-zinc-900 overflow-hidden relative shadow-2xl flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-white hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="md:w-2/3 h-[50vh] md:h-[80vh] bg-black">
          <img 
            src={photo.url} 
            alt={photo.title}
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="md:w-1/3 p-8 md:p-12 space-y-8 overflow-y-auto">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-serif italic tracking-tight">{photo.title}</h2>
            {photo.category && (
              <span className="inline-block px-3 py-1 border border-white/20 text-[10px] uppercase tracking-[0.3em] font-light">
                {photo.category}
              </span>
            )}
          </div>

          <div className="prose prose-invert">
            <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base">
              {photo.description || "No description provided for this artwork."}
            </p>
          </div>

          <div className="pt-8 border-t border-white/10 space-y-4">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500">
              <span>Medium</span>
              <span className="text-white">Digital Photography</span>
            </div>
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-500">
              <span>Photographer</span>
              <span className="text-white">Nilesh Konkankar</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

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

  const dummyPhotos: Photo[] = [
    { id: 'dummy-1', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1000', title: 'Urban Elegance', category: 'Street', description: 'A study of architectural symmetry in the modern urban landscape. Capturing the interplay of glass and concrete under soft morning light.', createdAt: new Date() },
    { id: 'dummy-2', url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1000', title: 'City Shadows', category: 'Architecture', description: 'Exploring the hidden corners of the metropolis where shadows tell stories more compelling than the light itself.', createdAt: new Date() },
    { id: 'dummy-3', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000', title: 'Portrait in Black', category: 'Portrait', description: 'A minimalist portrait focusing on the depth of human expression, stripped of all distractions.', createdAt: new Date() },
    { id: 'dummy-4', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1000', title: 'Neon Nights', category: 'Street', description: 'The vibrant pulse of the city after dark, where neon lights create a cinematic palette across rainy streets.', createdAt: new Date() },
    { id: 'dummy-5', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000', title: 'Minimalist Spaces', category: 'Architecture', description: 'Clean lines and negative space define this architectural study of modern dwelling.', createdAt: new Date() },
    { id: 'dummy-6', url: 'https://images.unsplash.com/photo-1506744626753-1fa44df31c7f?auto=format&fit=crop&q=80&w=1000', title: 'Morning Light', category: 'Landscape', description: 'The first rays of sun breaking through the mist, illuminating the natural world in a golden hue.', createdAt: new Date() },
    { id: 'dummy-7', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000', title: 'Code & Coffee', category: 'Lifestyle', description: 'The quiet moments of creativity and focus that define the modern work culture.', createdAt: new Date() },
    { id: 'dummy-8', url: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&q=80&w=1000', title: 'Abstract Elements', category: 'Abstract', description: 'Focusing on textures and patterns found in everyday objects, re-contextualized through macro photography.', createdAt: new Date() }
  ];

  if (loading) {
    return (
      <div className="pt-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const displayPhotos = photos.length > 0 ? photos : dummyPhotos;

  return (
    <div className="pt-32 pb-20 max-w-7xl mx-auto px-4">
      <h1 className="text-5xl font-light mb-12 tracking-tight">Portfolio</h1>
      {displayPhotos.length === 0 ? (
        <p className="text-gray-500 text-center py-20">No photos in the gallery yet.</p>
      ) : (
        <>
          <ImageCarousel photos={displayPhotos} />
          <Masonry
            breakpointCols={{
              default: 4,
              1024: 3,
              768: 2,
              640: 1
            }}
            className="flex w-auto -ml-4 sm:-ml-6 lg:-ml-8"
            columnClassName="pl-4 sm:pl-6 lg:pl-8 bg-clip-padding"
          >
          {displayPhotos.map((photo) => (
            <motion.div 
              key={photo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="overflow-hidden group relative mb-4 sm:mb-6 lg:mb-8 cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img 
                src={photo.url}
                alt={photo.title}
                className="w-full h-auto grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 block"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <h3 className="text-lg font-light">{photo.title}</h3>
                {photo.category && <p className="text-xs uppercase tracking-widest text-gray-400">{photo.category}</p>}
                <p className="text-[10px] uppercase tracking-widest text-white/50 mt-2">View Details</p>
              </div>
            </motion.div>
          ))}
          </Masonry>
        </>
      )}

      <AnimatePresence>
        {selectedPhoto && (
          <PhotoModal 
            photo={selectedPhoto} 
            onClose={() => setSelectedPhoto(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const About = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await addDoc(collection(db, 'inquiries'), {
        name,
        email,
        message,
        createdAt: serverTimestamp(),
      });
      setSubmitStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error("Error submitting inquiry", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 space-y-16">
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

      <div className="border-t border-white/10 pt-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-light tracking-tight mb-8">Get in Touch</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs uppercase tracking-widest text-gray-400">Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/10 p-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/50 transition-colors"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs uppercase tracking-widest text-gray-400">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/10 p-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/50 transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-xs uppercase tracking-widest text-gray-400">Message</label>
              <textarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 p-4 text-white placeholder-gray-600 focus:outline-none focus:border-white/50 transition-colors resize-none"
                placeholder="What's on your mind?"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-white text-black text-xs uppercase tracking-[0.2em] font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Send Message
            </button>

            {submitStatus === 'success' && (
              <p className="text-sm text-green-400 tracking-wide">Thank you for your message. I'll get back to you soon.</p>
            )}
            {submitStatus === 'error' && (
              <p className="text-sm text-red-500 tracking-wide">There was an error sending your message. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoggingIn(false);
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
        description,
        createdAt: serverTimestamp(),
        authorId: user.uid
      });
      setUrl('');
      setTitle('');
      setCategory('');
      setDescription('');
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
          disabled={isLoggingIn}
          className="w-full bg-white text-black py-3 text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In with Google'}
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
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-400">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of the artwork..."
                  rows={4}
                  className="w-full bg-black border border-zinc-800 p-3 text-sm focus:border-white outline-hidden transition-colors resize-none" 
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
