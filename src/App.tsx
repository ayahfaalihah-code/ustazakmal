import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, Star, Play, BookOpen, Volume2, VolumeX, 
  ChevronRight, Lock, CheckCircle2, XCircle, 
  RotateCcw, Home, Info, Award, Heart,
  Sparkles, Check, ArrowLeft, KeyRound,
  GraduationCap, Calendar, User,
  ShieldCheck, Trash2, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// --- TYPES & INTERFACES ---
interface Question {
  id: number;
  text: string;
  arabicText?: string;
  options?: string[];
  answer: string | boolean;
  explanation: string;
  type: 'mcq' | 'boolean';
  category: string;
}

interface UserData {
  name: string;
  currentLevel: number;
  totalScore: number;
  stars: number[];
  answers: Record<number, { isCorrect: boolean; selected: any }>;
  isFinished: boolean;
  completedAt?: string;
}

interface ScoreRecord {
  id: string;
  name: string;
  score: number;
  totalQuestions: number;
  starsCount: number;
  date: string;
  timestamp: number;
}

// --- 25 SOALAN LENGKAP SUKATAN IBADAT DARJAH 3 ---
const QUESTIONS: Question[] = [
  // LEVEL 1: GERBANG ILMU (Kenali Hadas) [1 - 5]
  { 
    id: 1, 
    type: 'mcq', 
    category: 'Konsep Hadas',
    text: 'Apakah pengertian hadas dari segi syarak?', 
    options: ['Kekotoran hukum yang menghalang sahnya ibadah tertentu', 'Pakaian yang terkena najis ayam', 'Badan yang berpeluh selepas bermain'], 
    answer: 'Kekotoran hukum yang menghalang sahnya ibadah tertentu', 
    explanation: 'Hadas ialah keadaan tidak suci pada diri seseorang menurut hukum syarak yang menegah daripada menunaikan ibadah seperti solat dan tawaf.' 
  },
  { 
    id: 2, 
    type: 'mcq', 
    category: 'Hadas Kecil',
    text: 'Antara berikut, yang manakah menyebabkan seseorang berhadas kecil?', 
    options: ['Melahirkan anak', 'Hilang akal (seperti tidur lena atau pengsan)', 'Keluar darah haid'], 
    answer: 'Hilang akal (seperti tidur lena atau pengsan)', 
    explanation: 'Perkara yang membatalkan wuduk seperti hilang akal, buang air kecil/besar, dan bersentuh kulit bukan mahram menyebabkan hadas kecil.' 
  },
  { 
    id: 3, 
    type: 'mcq', 
    category: 'Bersuci',
    text: 'Bagaimanakah cara bersuci yang wajib dilakukan selepas tamat darah haid?', 
    options: ['Mandi sunat Jumaat', 'Mengambil wuduk sahaja', 'Mandi wajib (mengalirkan air ke seluruh anggota badan)'], 
    answer: 'Mandi wajib (mengalirkan air ke seluruh anggota badan)', 
    explanation: 'Haid ialah hadas besar. Menyucikan hadas besar wajib dilakukan dengan mandi wajib berserta niat.' 
  },
  { 
    id: 4, 
    type: 'mcq', 
    category: 'Darah Haid',
    text: 'Berapakah tempoh paling lama (maksimum) bagi darah haid mengikut hukum syarak?', 
    options: ['1 hari 1 malam', '6 atau 7 hari', '15 hari 15 malam'], 
    answer: '15 hari 15 malam', 
    explanation: 'Tempoh paling singkat haid ialah 1 hari 1 malam (24 jam), kebiasaan 6-7 hari, dan paling lama 15 hari 15 malam.' 
  },
  { 
    id: 5, 
    type: 'mcq', 
    category: 'Istilah Bahasa Arab',
    text: 'Apakah maksud perkataan "لحظة" (lahzah) yang digunakan dalam tempoh nifas?', 
    arabicText: 'لَحْظَة',
    options: ['Sedetik atau seketika sahaja', 'Satu minggu penuh', 'Satu bulan'], 
    answer: 'Sedetik atau seketika sahaja', 
    explanation: 'Lahzah bermaksud seketika atau sedetik, iaitu tempoh paling singkat bagi darah nifas yang keluar selepas melahirkan anak.' 
  },
  
  // LEVEL 2: PAHLAWAN BENAR (Betul atau Salah) [6 - 10]
  { 
    id: 6, 
    type: 'boolean', 
    category: 'Syarat Ibadah',
    text: 'Hadas menyebabkan ibadah solat tidak sah sekiranya seseorang belum bersuci sama ada dengan wuduk atau mandi wajib.', 
    answer: true, 
    explanation: 'Benar! Suci daripada hadas kecil dan hadas besar merupakan salah satu syarat sah solat.' 
  },
  { 
    id: 7, 
    type: 'boolean', 
    category: 'Ciri Hadas',
    text: 'Hadas ialah benda kotor fizikal yang boleh dilihat dengan mata kasar dan ada warna serta bau.', 
    answer: false, 
    explanation: 'Salah! Najis ialah kotoran fizikal (ain) yang boleh dilihat atau dibau. Hadas pula ialah kekotoran maknawi (hukum).' 
  },
  { 
    id: 8, 
    type: 'boolean', 
    category: 'Hadas Kecil',
    text: 'Wajib berwuduk semula selepas berhadas kecil (seperti terkentut) apabila hendak menunaikan solat fardu.', 
    answer: true, 
    explanation: 'Benar! Terkeluar angin (kentut) membatalkan wuduk dan mewajibkan seseorang mengambil wuduk semula.' 
  },
  { 
    id: 9, 
    type: 'boolean', 
    category: 'Hadas Besar',
    text: 'Wiladah bermaksud wanita melahirkan anak atau bersalin dan ia mewajibkan mandi wajib.', 
    answer: true, 
    explanation: 'Benar! Wiladah (bersalin) merupakan salah satu sebab yang mewajibkan mandi wajib bagi wanita.' 
  },
  { 
    id: 10, 
    type: 'boolean', 
    category: 'Larangan Hadas Besar',
    text: 'Orang yang sedang berhadas besar dibolehkan membaca ayat al-Quran dengan niat membaca al-Quran.', 
    answer: false, 
    explanation: 'Salah! Diharamkan bagi orang yang berhadas besar membaca al-Quran dengan niat tilawah (bacaan Quran).' 
  },

  // LEVEL 3: MISI PADANAN (Padankan Konsep & Hukum) [11 - 15]
  { 
    id: 11, 
    type: 'mcq', 
    category: 'Gantian Bersuci',
    text: 'Apakah cara menyucikan hadas kecil jika tiada air atau uzur mengikut syarat sah?', 
    options: ['Bertayamum menggunakan debu tanah yang suci', 'Menyapu air liur ke muka', 'Solat tanpa bersuci langsung'], 
    answer: 'Bertayamum menggunakan debu tanah yang suci', 
    explanation: 'Tayamum dengan debu tanah suci ialah rukhsah (keringanan) pengganti wuduk atau mandi wajib jika ketiadaan air.' 
  },
  { 
    id: 12, 
    type: 'mcq', 
    category: 'Sebab Hadas Besar',
    text: 'Antara berikut, perkara manakah yang menyebabkan berlakunya hadas besar bagi lelaki dan perempuan?', 
    options: ['Tidur mengiring beralas bantal', 'Keluar air mani', 'Makan makanan yang banyak'], 
    answer: 'Keluar air mani', 
    explanation: 'Keluar air mani (sama ada mimpi atau sedar) menyebabkan hadas besar dan mewajibkan mandi wajib.' 
  },
  { 
    id: 13, 
    type: 'mcq', 
    category: 'Tempoh Haid',
    text: 'Berapakah tempoh paling singkat bagi keluarnya darah haid?', 
    options: ['Sehari semalam (24 jam)', 'Seminggu genap', '15 hari 15 malam'], 
    answer: 'Sehari semalam (24 jam)', 
    explanation: 'Kadar minima darah haid ialah sekurang-kurangnya sehari semalam (24 jam secara berterusan atau terkumpul).' 
  },
  { 
    id: 14, 
    type: 'mcq', 
    category: 'Darah Nifas',
    text: 'Apakah nama darah yang keluar dari rahim wanita selepas selesai melahirkan anak?', 
    options: ['Darah Nifas', 'Darah Haid', 'Darah Istihadah'], 
    answer: 'Darah Nifas', 
    explanation: 'Darah nifas ialah darah yang keluar mengiringi atau selepas selesai proses kelahiran anak.' 
  },
  { 
    id: 15, 
    type: 'mcq', 
    category: 'Darah Istihadah',
    text: 'Apakah istilah bagi darah penyakit yang keluar di luar ketetapan tempoh haid dan nifas?', 
    options: ['Darah Istihadah', 'Darah Wadi', 'Darah Mazi'], 
    answer: 'Darah Istihadah', 
    explanation: 'Istihadah ialah darah penyakit yang keluar melebihi tempoh maksimum haid (15 hari) atau nifas (60 hari).' 
  },

  // LEVEL 4: TEKA PERKATAAN (Lengkapkan Kenyataan) [16 - 20]
  { 
    id: 16, 
    type: 'mcq', 
    category: 'Kaedah Mandi Wajib',
    text: 'Menyucikan hadas besar dilakukan dengan cara ______ yang meratakan air ke seluruh tubuh serta rambut.', 
    options: ['Mandi wajib berserta niat', 'Membasuh kedua-dua tangan sahaja', 'Mengelap badan dengan tuala basah'], 
    answer: 'Mandi wajib berserta niat', 
    explanation: 'Rukun mandi wajib ada dua: Niat mengangkat hadas besar dan meratakan air mutlak ke seluruh badan termasuk celah-celah kulit.' 
  },
  { 
    id: 17, 
    type: 'mcq', 
    category: 'Lafaz Niat',
    text: 'Niat: "نَوَيْتُ الْغُسْلَ عَنِ الْحَيْضِ لِلَّهِ تَعَالَى" adalah niat khusus untuk?', 
    arabicText: 'نَوَيْتُ الْغُسْلَ عَنِ الْحَيْضِ لِلَّهِ تَعَالَى',
    options: ['Mandi wajib selepas suci daripada haid', 'Berwuduk sebelum solat zohor', 'Bertayamum ketika bermusafir'], 
    answer: 'Mandi wajib selepas suci daripada haid', 
    explanation: 'Maksudnya: Sahaja aku mandi wajib daripada haid kerana Allah Taala.' 
  },
  { 
    id: 18, 
    type: 'mcq', 
    category: 'Perkara Ditegah',
    text: 'Antara perkara penting yang dilarang dan haram dilakukan semasa wanita sedang nifas ialah ______.', 
    options: ['Menunaikan solat dan tawaf', 'Makan dan minum makanan berkhasiat', 'Tidur di atas katil'], 
    answer: 'Menunaikan solat dan tawaf', 
    explanation: 'Wanita dalam nifas dan haid diharamkan bersolat, berpuasa, memegang mashaf al-Quran, tawaf, dan beriktikaf di masjid.' 
  },
  { 
    id: 19, 
    type: 'mcq', 
    category: 'Bersuci Istihadah',
    text: 'Cara bersuci bagi wanita yang mengalami darah istihadah untuk solat ialah ______.', 
    options: ['Membersihkan darah, memakai pelindung, lalu berwuduk setiap kali masuk waktu solat', 'Mandi wajib lima kali sehari', 'Menangguhkan solat hingga darah berhenti berbulan-bulan'], 
    answer: 'Membersihkan darah, memakai pelindung, lalu berwuduk setiap kali masuk waktu solat', 
    explanation: 'Wanita istihadah wajib bersihkan darah, balut kemas, dan ambil satu wuduk bagi setiap satu solat fardu selepas masuk waktu.' 
  },
  { 
    id: 20, 
    type: 'mcq', 
    category: 'Hukum Istihadah',
    text: 'Apakah hukum menunaikan solat fardu bagi wanita yang mengalami darah istihadah?', 
    options: ['Wajib menunaikan solat', 'Haram dan berdosa', 'Makruh bertahap'], 
    answer: 'Wajib menunaikan solat', 
    explanation: 'Istihadah adalah darah penyakit, bukan hadas besar. Oleh itu, wanita istihadah tetap WAJIB bersolat dan berpuasa seperti biasa.' 
  },

  // LEVEL 5: CABARAN JUARA (Ujian Akhir Ibadat) [21 - 25]
  { 
    id: 21, 
    type: 'mcq', 
    category: 'Perbandingan Hadas & Najis',
    text: 'Apakah perbezaan utama yang paling tepat antara hadas dan najis?', 
    options: [
      'Hadas ialah status hukum diri, manakala najis ialah kekotoran ain/fizikal',
      'Hadas hanya ada pada kasut, najis hanya ada pada baju',
      'Kedua-duanya boleh disucikan dengan sabun wangi sahaja tanpa air'
    ], 
    answer: 'Hadas ialah status hukum diri, manakala najis ialah kekotoran ain/fizikal', 
    explanation: 'Najis ialah benda kotor yang ada zat (fizikal) seperti tahi dan darah. Hadas ialah keadaan hukum tidak suci yang disucikan dengan wuduk/mandi.' 
  },
  { 
    id: 22, 
    type: 'mcq', 
    category: 'Definisi Hadas Kecil',
    text: 'Apakah maksud hadas kecil dalam amalan seharian?', 
    options: ['Keadaan tidak suci yang mewajibkan wuduk untuk membolehkan solat', 'Rasa letih dan dahaga selepas beriadah', 'Pakaian koyak di bahagian lutut'], 
    answer: 'Keadaan tidak suci yang mewajibkan wuduk untuk membolehkan solat', 
    explanation: 'Hadas kecil terangkat dengan mengangkat wuduk atau tayamum (sekiranya ada keuzuran syar\'i).' 
  },
  { 
    id: 23, 
    type: 'mcq', 
    category: 'Larangan Hadas Kecil',
    text: 'Antara berikut, apakah perkara yang dilarang bagi seseorang yang sedang berhadas kecil?', 
    options: ['Solat, tawaf, dan menyentuh mashaf al-Quran', 'Membaca buku teks sekolah', 'Minum air sirap'], 
    answer: 'Solat, tawaf, dan menyentuh mashaf al-Quran', 
    explanation: 'Orang berhadas kecil dilarang solat, tawaf, menyentuh atau membawa mashaf al-Quran sehingga dia berwuduk.' 
  },
  { 
    id: 24, 
    type: 'mcq', 
    category: 'Amalan Dibolehkan',
    text: 'Antara amalan berikut, yang manakah DIBOLEHKAN dan DIGALAKKAN bagi wanita yang sedang haid?', 
    options: ['Berzikir, berselawat, dan berdoa kepada Allah', 'Mendirikan solat fardu lima waktu', 'Berpuasa di bulan Ramadan'], 
    answer: 'Berzikir, berselawat, dan berdoa kepada Allah', 
    explanation: 'Walaupun tidak boleh solat dan puasa, amalan zikir, doa, istighfar, dan selawat sentiasa digalakkan untuk meraih pahala.' 
  },
  { 
    id: 25, 
    type: 'mcq', 
    category: 'Tempoh Nifas',
    text: 'Berapakah tempoh paling singkat bagi keluarnya darah nifas?', 
    options: ['Seketika / Sedetik (Lahzah)', 'Sehari semalam', '15 hari genap'], 
    answer: 'Seketika / Sedetik (Lahzah)', 
    explanation: 'Tempoh paling singkat nifas ialah seketika (lahzah), tempoh kebiasaan 40 hari, dan tempoh paling panjang 60 hari.' 
  },
];

const LEVELS = [
  { id: 1, title: 'GERBANG ILMU', subtitle: 'Kenali Hadas', range: [1, 5], icon: '🏛️' },
  { id: 2, title: 'PAHLAWAN BENAR', subtitle: 'Betul atau Salah', range: [6, 10], icon: '⚔️' },
  { id: 3, title: 'MISI PADANAN', subtitle: 'Padankan Konsep', range: [11, 15], icon: '🧩' },
  { id: 4, title: 'TEKA PERKATAAN', subtitle: 'Lengkapkan Ayat', range: [16, 20], icon: '📜' },
  { id: 5, title: 'CABARAN JUARA', subtitle: 'Ujian Akhir Ibadat', range: [21, 25], icon: '👑' },
];

// Contoh rekod awal jika belum ada murid lain
const INITIAL_SCOREBOARD_SEEDS: ScoreRecord[] = [
  { id: 'sb-1', name: 'Aisyah Humaira', score: 50, totalQuestions: 25, starsCount: 5, date: '10/10/2026', timestamp: 1728560000000 },
  { id: 'sb-2', name: 'Muhammad Adam', score: 48, totalQuestions: 25, starsCount: 5, date: '11/10/2026', timestamp: 1728640000000 },
  { id: 'sb-3', name: 'Faris Danial', score: 46, totalQuestions: 25, starsCount: 5, date: '11/10/2026', timestamp: 1728645000000 },
];

// PIN Guru Rasmi yang ditetapkan
const DEFAULT_TEACHER_PIN = '5543';

// --- SOUND UTILITIES (Web Audio API) ---
const playSound = (type: 'correct' | 'wrong' | 'click' | 'win' | 'unlock') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const playTone = (freq: number, start: number, duration: number, typeWave: OscillatorType = 'sine') => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = typeWave;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.12, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = audioCtx.currentTime;

    if (type === 'click') {
      playTone(520, now, 0.08, 'triangle');
    } else if (type === 'correct') {
      playTone(523.25, now, 0.15); // C5
      playTone(659.25, now + 0.1, 0.18); // E5
      playTone(783.99, now + 0.2, 0.25); // G5
    } else if (type === 'wrong') {
      playTone(260, now, 0.18, 'sawtooth');
      playTone(220, now + 0.12, 0.25, 'sawtooth');
    } else if (type === 'unlock') {
      playTone(440, now, 0.1);
      playTone(554.37, now + 0.08, 0.1);
      playTone(659.25, now + 0.16, 0.25);
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
        playTone(f, now + i * 0.12, 0.35);
      });
    }
  } catch {
    // Audio optional
  }
};

export default function App() {
  const [screen, setScreen] = useState<'splash' | 'home' | 'map' | 'game' | 'result' | 'review' | 'scoreboard'>('splash');
  const [userData, setUserData] = useState<UserData>({
    name: '',
    currentLevel: 1,
    totalScore: 0,
    stars: [0, 0, 0, 0, 0],
    answers: {},
    isFinished: false
  });
  
  // Scoreboard list
  const [scoreboard, setScoreboard] = useState<ScoreRecord[]>([]);

  // Active game session state
  const [activeLevel, setActiveLevel] = useState(1);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [feedback, setFeedback] = useState<{ show: boolean; correct: boolean; explanation?: string; arabicText?: string } | null>(null);

  // Teacher PIN & Modal state (tetapkan "5543")
  const [teacherPin, setTeacherPin] = useState<string>(DEFAULT_TEACHER_PIN);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isTeacherAuthenticated, setIsTeacherAuthenticated] = useState(false);
  const [teacherNotice, setTeacherNotice] = useState<string | null>(null);

  // Initial Load from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('misi_ibadat_user_v4');
      if (savedUser) {
        setUserData(JSON.parse(savedUser));
      }

      const savedScoreboard = localStorage.getItem('misi_ibadat_scoreboard_v4');
      if (savedScoreboard) {
        setScoreboard(JSON.parse(savedScoreboard));
      } else {
        setScoreboard(INITIAL_SCOREBOARD_SEEDS);
        localStorage.setItem('misi_ibadat_scoreboard_v4', JSON.stringify(INITIAL_SCOREBOARD_SEEDS));
      }

      const savedPin = localStorage.getItem('misi_ibadat_teacher_pin_v4');
      if (savedPin) {
        setTeacherPin(savedPin);
      } else {
        setTeacherPin(DEFAULT_TEACHER_PIN);
      }
    } catch {
      // Ignored
    }

    const timer = setTimeout(() => {
      setScreen('home');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Save user progress
  useEffect(() => {
    try {
      localStorage.setItem('misi_ibadat_user_v4', JSON.stringify(userData));
    } catch {
      // Ignored
    }
  }, [userData]);

  // Save scoreboard
  useEffect(() => {
    try {
      localStorage.setItem('misi_ibadat_scoreboard_v4', JSON.stringify(scoreboard));
    } catch {
      // Ignored
    }
  }, [scoreboard]);

  const triggerSound = useCallback((type: 'correct' | 'wrong' | 'click' | 'win' | 'unlock') => {
    if (isSoundEnabled) {
      playSound(type);
    }
  }, [isSoundEnabled]);

  const handleStartGame = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    triggerSound('click');
    setUserData(prev => ({
      ...prev,
      name: trimmedName
    }));
    setScreen('map');
  };

  const handleLevelSelect = (lvlId: number) => {
    if (lvlId > userData.currentLevel) {
      triggerSound('wrong');
      return;
    }
    triggerSound('click');
    setActiveLevel(lvlId);
    setCurrentQuestionIdx(0);
    setScreen('game');
  };

  const saveScoreToScoreboard = (finalScore: number, finalStars: number[]) => {
    const starsCount = finalStars.filter(s => s === 1).length;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('ms-MY');

    const newRecord: ScoreRecord = {
      id: 'sb-' + Date.now(),
      name: userData.name || 'Pengembara Cilik',
      score: finalScore,
      totalQuestions: 25,
      starsCount,
      date: dateFormatted,
      timestamp: Date.now()
    };

    setScoreboard(prev => {
      // Periksa jika murid dengan nama yang sama sudah ada, kemaskini jika markah baharu lebih tinggi
      const existingIdx = prev.findIndex(item => item.name.toLowerCase() === newRecord.name.toLowerCase());
      if (existingIdx !== -1) {
        if (finalScore >= prev[existingIdx].score) {
          const updated = [...prev];
          updated[existingIdx] = newRecord;
          return updated.sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);
        }
        return prev;
      }
      const updated = [newRecord, ...prev];
      return updated.sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);
    });
  };

  const handleAnswer = (answer: any) => {
    const levelConfig = LEVELS.find(l => l.id === activeLevel);
    if (!levelConfig) return;
    const levelQuestions = QUESTIONS.filter(q => q.id >= levelConfig.range[0] && q.id <= levelConfig.range[1]);
    const currentQ = levelQuestions[currentQuestionIdx];
    const isCorrect = answer === currentQ.answer;

    triggerSound(isCorrect ? 'correct' : 'wrong');

    // Mod Latihan: Papar maklum balas serta-merta dengan ulasan ilmu
    setFeedback({
      show: true,
      correct: isCorrect,
      explanation: currentQ.explanation,
      arabicText: currentQ.arabicText
    });

    setTimeout(() => {
      processNextStep(isCorrect, currentQ.id, answer, levelQuestions.length);
      setFeedback(null);
    }, 2400);
  };

  const processNextStep = (isCorrect: boolean, qId: number, selectedAnswer: any, totalLvlQ: number) => {
    const earnedMarks = isCorrect ? 2 : 0;
    const newAnswers = {
      ...userData.answers,
      [qId]: { isCorrect, selected: selectedAnswer }
    };
    const newScore = userData.totalScore + earnedMarks;

    if (currentQuestionIdx < totalLvlQ - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setUserData(prev => ({
        ...prev,
        totalScore: newScore,
        answers: newAnswers
      }));
    } else {
      // Selesai satu peringkat
      const newStars = [...userData.stars];
      newStars[activeLevel - 1] = 1;
      const nextLvl = Math.max(userData.currentLevel, activeLevel + 1);
      const isFinal = activeLevel === 5;
      const todayDate = new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });

      setUserData(prev => ({
        ...prev,
        totalScore: newScore,
        answers: newAnswers,
        currentLevel: nextLvl,
        stars: newStars,
        isFinished: isFinal ? true : prev.isFinished,
        completedAt: isFinal ? todayDate : prev.completedAt
      }));

      triggerSound('win');
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 }
      });

      if (isFinal) {
        saveScoreToScoreboard(newScore, newStars);
        setScreen('result');
      } else {
        setScreen('map');
      }
    }
  };

  // --- TEACHER PIN & RESET LOGIC ---
  const handleTeacherPinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (enteredPin.trim() === teacherPin.trim()) {
      triggerSound('unlock');
      setIsTeacherAuthenticated(true);
      setPinError('');
      setTeacherNotice(null);
    } else {
      triggerSound('wrong');
      setPinError('PIN salah! Akses ditolak.');
    }
  };

  const handleTeacherResetStudent = () => {
    triggerSound('click');
    const freshUser: UserData = {
      name: '',
      currentLevel: 1,
      totalScore: 0,
      stars: [0, 0, 0, 0, 0],
      answers: {},
      isFinished: false
    };
    setUserData(freshUser);
    setTeacherNotice('Kemajuan murid telah diset semula! Pemain baharu boleh bermula.');
  };

  const handleTeacherClearScoreboard = () => {
    triggerSound('click');
    setScoreboard([]);
    localStorage.removeItem('misi_ibadat_scoreboard_v4');
    setTeacherNotice('Semua rekod Papan Skor telah dikosongkan!');
  };

  const closeTeacherModal = () => {
    setShowTeacherModal(false);
    setEnteredPin('');
    setPinError('');
    setIsTeacherAuthenticated(false);
    setTeacherNotice(null);
  };

  // --- SUB-COMPONENTS ---

  // 1. Splash Screen
  const SplashScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white p-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      <motion.div 
        initial={{ scale: 0, rotate: -20 }} 
        animate={{ scale: 1, rotate: 0 }} 
        transition={{ type: 'spring', damping: 12 }}
        className="relative z-10"
      >
        <div className="w-24 h-24 bg-emerald-600/60 backdrop-blur rounded-3xl p-4 shadow-2xl border-4 border-amber-300 flex items-center justify-center mx-auto mb-5">
          <Trophy size={56} className="text-amber-300 drop-shadow-md" />
        </div>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative z-10">
        <span className="inline-block px-4 py-1 rounded-full bg-emerald-600/80 border border-emerald-400 text-amber-200 text-xs font-black tracking-widest uppercase mb-3">
          Ibadat Darjah 3 • Mod Latihan Interaktif
        </span>
        <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tight">
          MISI IBADAT
        </h1>
        <p className="text-xl text-emerald-100 font-bold">
          PENGEMBARA SUCI
        </p>
      </motion.div>

      <div className="mt-10 flex items-center gap-2 text-emerald-200 text-xs font-bold animate-pulse z-10">
        <Sparkles size={16} className="text-amber-300" />
        <span>Memuatkan kembara ilmu bersuci...</span>
      </div>
    </div>
  );

  // 2. Home Menu Screen (Tanpa pilihan nama kelas)
  const HomeMenu = () => {
    const [nameInput, setNameInput] = useState(userData.name);
    const [showInfo, setShowInfo] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const onStart = () => {
      if (!nameInput.trim()) {
        setErrorMsg('Sila masukkan Nama Pengembara untuk memulakan!');
        return;
      }
      setErrorMsg('');
      handleStartGame(nameInput);
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50/40 to-sky-50 flex flex-col items-center justify-center p-4 sm:p-6 relative">
        {/* Top Header Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <button 
            onClick={() => {
              triggerSound('click');
              setScreen('scoreboard');
            }}
            className="px-3.5 py-2.5 bg-white hover:bg-amber-50 rounded-2xl shadow-sm border border-amber-200 text-amber-800 font-black text-xs flex items-center gap-1.5 transition"
          >
            <Trophy size={16} className="text-amber-500" />
            <span>Papan Skor</span>
          </button>

          <button 
            onClick={() => {
              triggerSound('click');
              setShowTeacherModal(true);
            }}
            className="p-2.5 bg-white hover:bg-rose-50 rounded-2xl shadow-sm border border-rose-200 text-rose-700 font-black text-xs flex items-center gap-1.5 transition"
            title="Akses Guru (Reset)"
          >
            <Lock size={16} />
            <span className="hidden sm:inline">Khas Guru</span>
          </button>

          <button 
            onClick={() => setShowInfo(true)}
            className="p-2.5 bg-white hover:bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 text-emerald-700 transition"
            title="Panduan"
          >
            <Info size={18} />
          </button>

          <button 
            onClick={() => {
              triggerSound('click');
              setIsSoundEnabled(!isSoundEnabled);
            }} 
            className="p-2.5 bg-white hover:bg-emerald-50 rounded-2xl shadow-sm border border-emerald-100 text-emerald-700 transition"
            title="Bunyi"
          >
            {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        {/* Title Header */}
        <motion.div initial={{ y: -25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-6 max-w-md">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-amber-400 to-amber-500 rounded-3xl shadow-xl mb-3 border-4 border-white">
            <GraduationCap size={38} className="text-emerald-950" />
          </div>
          <span className="block text-emerald-700 font-extrabold tracking-widest text-[11px] uppercase mb-1">
            Modul Pembelajaran Interaktif Darjah 3
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-emerald-900 tracking-tight">
            MISI IBADAT
          </h1>
          <p className="text-sm sm:text-base font-bold text-teal-700">
            PENGEMBARA SUCI • MOD LATIHAN
          </p>
        </motion.div>

        {/* Form Card (Nama sahaja, tiada kelas) */}
        <motion.div 
          initial={{ scale: 0.96, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-md border-b-8 border-emerald-600 border border-emerald-100"
        >
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2">
              <XCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <User size={15} className="text-emerald-600" />
              Nama Murid / Pengembara:
            </label>
            <input 
              type="text" 
              value={nameInput} 
              autoFocus
              onChange={e => {
                setNameInput(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white outline-none transition text-base font-bold text-slate-800"
              placeholder="Masukkan nama anda..."
            />
          </div>

          <div className="mb-6 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0">
              📖
            </div>
            <div>
              <p className="text-xs font-black text-emerald-950">MOD LATIHAN AKTIF</p>
              <p className="text-[11px] text-emerald-800 leading-tight">
                25 soalan disusun mengikut 5 peringkat. Ulasan ilmu diberikan serta-merta selepas menjawab.
              </p>
            </div>
          </div>

          <button 
            onClick={onStart}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            MULA PENGEMBARAAN
            <Play fill="white" size={20} />
          </button>
        </motion.div>

        {/* Info Guide Modal */}
        {showInfo && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-6 rounded-3xl max-w-md w-full shadow-2xl border-t-8 border-emerald-600">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-emerald-900 flex items-center gap-2">
                  <BookOpen className="text-emerald-600" size={22} />
                  Panduan Misi Pengembara
                </h2>
                <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={22} />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="font-black text-emerald-900 mb-1">🎯 5 Peringkat Kembara</p>
                  <p>Mempunyai 25 soalan kesemuanya. Setiap soalan yang betul menyumbang 2 markah (Jumlah 50 markah).</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="font-black text-amber-900 mb-1">💡 Ulasan Jawapan Pantas</p>
                  <p>Murid akan terus menerima panduan dan ulasan hukum jika jawapan yang dipilih kurang tepat.</p>
                </div>
                <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100">
                  <p className="font-black text-sky-900 mb-1">🏆 Papan Skor Murid</p>
                  <p>Nama dan markah setiap pemain akan direkodkan dalam Papan Skor untuk memupuk semangat belajar.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowInfo(false)} 
                className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-black text-xs shadow-md transition"
              >
                Faham & Sedia Mula
              </button>
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  // 3. Map View Screen
  const MapView = () => (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-emerald-100 p-4 sm:p-6 flex flex-col items-center">
      {/* Player Header Card (Nama sahaja) */}
      <div className="w-full max-w-lg bg-white p-4 rounded-3xl shadow-md border-b-4 border-emerald-400 flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
            {userData.name ? userData.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <div>
            <p className="text-[10px] font-black tracking-wider text-emerald-600 uppercase">PENGEMBARA</p>
            <p className="font-black text-slate-800 text-sm sm:text-base truncate max-w-[170px] sm:max-w-[220px]">
              {userData.name || 'Pengembara Cilik'}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 mb-1">
            {userData.stars.map((s, i) => (
              <Star 
                key={i} 
                size={18} 
                className={s ? "fill-amber-400 text-amber-500 drop-shadow-sm" : "text-slate-300"} 
              />
            ))}
          </div>
          <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            Skor: {userData.totalScore}/50
          </div>
        </div>
      </div>

      {/* Levels Journey List */}
      <div className="w-full max-w-lg relative bg-white/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black tracking-wider uppercase mb-1">
              Peta Kembara
            </span>
            <h2 className="text-2xl font-black text-slate-800">5 Gerbang Ibadat</h2>
          </div>

          <button
            onClick={() => {
              triggerSound('click');
              setScreen('scoreboard');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl text-xs font-black border border-amber-300 transition shadow-sm"
          >
            <Trophy size={16} className="text-amber-600" />
            <span>Papan Skor</span>
          </button>
        </div>

        <div className="space-y-3.5">
          {LEVELS.map((lvl, index) => {
            const isLocked = lvl.id > userData.currentLevel;
            const isDone = userData.stars[lvl.id - 1] === 1;
            const isCurrent = lvl.id === userData.currentLevel;

            return (
              <motion.div
                key={lvl.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.06 }}
              >
                <button
                  disabled={isLocked}
                  onClick={() => handleLevelSelect(lvl.id)}
                  className={`w-full p-4 rounded-3xl text-left transition-all relative flex items-center justify-between border-2 ${
                    isLocked
                      ? 'bg-slate-100/80 border-slate-200 opacity-60 cursor-not-allowed'
                      : isCurrent
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-700 shadow-xl ring-4 ring-emerald-300/50 scale-[1.02]'
                      : isDone
                      ? 'bg-white hover:bg-emerald-50/50 border-emerald-200 text-slate-800 shadow-md'
                      : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shadow-inner shrink-0 ${
                      isLocked 
                        ? 'bg-slate-300 text-slate-500' 
                        : isCurrent
                        ? 'bg-white text-emerald-700'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isLocked ? (
                        <Lock size={20} />
                      ) : isDone ? (
                        <CheckCircle2 size={24} className="text-emerald-600" />
                      ) : (
                        <span>{lvl.icon}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-lg ${
                          isCurrent ? 'bg-emerald-800/50 text-emerald-100' : 'bg-slate-100 text-slate-600'
                        }`}>
                          LEVEL {lvl.id}
                        </span>
                        <span className={`text-[11px] font-bold ${isCurrent ? 'text-emerald-100' : 'text-slate-500'}`}>
                          (Soalan {lvl.range[0]} - {lvl.range[1]})
                        </span>
                      </div>
                      <h3 className={`font-black text-base leading-tight ${isCurrent ? 'text-white' : 'text-slate-800'}`}>
                        {lvl.title}
                      </h3>
                      <p className={`text-xs font-semibold ${isCurrent ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {lvl.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2 shrink-0">
                    {isDone && (
                      <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 rounded-xl text-xs font-black border border-amber-300">
                        <Star size={13} className="fill-amber-400 text-amber-500" />
                        <span>Selesai</span>
                      </div>
                    )}
                    {!isLocked && (
                      <div className={`p-1.5 rounded-xl ${isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <ChevronRight size={18} />
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Action Row */}
        <div className="mt-8 pt-4 border-t border-slate-200/80 flex items-center justify-between">
          <button
            onClick={() => {
              triggerSound('click');
              setScreen('home');
            }}
            className="flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-3.5 py-2 rounded-2xl transition"
          >
            <Home size={15} />
            <span>Menu Utama</span>
          </button>

          {userData.isFinished && (
            <button
              onClick={() => {
                triggerSound('click');
                setScreen('result');
              }}
              className="flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3.5 py-2 rounded-2xl transition"
            >
              <Trophy size={15} className="text-amber-600" />
              <span>Keputusan</span>
            </button>
          )}

          {/* Button Reset yang hanya boleh diakses melalui PIN GURU */}
          <button
            onClick={() => {
              triggerSound('click');
              setShowTeacherModal(true);
            }}
            className="flex items-center gap-1.5 text-xs font-black text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-2xl border border-rose-200 transition"
            title="Reset Game (Hanya Guru dengan PIN)"
          >
            <Lock size={14} />
            <span>Reset (Guru)</span>
          </button>
        </div>
      </div>
    </div>
  );

  // 4. Game Screen (Mod Latihan)
  const GameView = () => {
    const levelConfig = LEVELS.find(l => l.id === activeLevel);
    if (!levelConfig) return null;
    const levelQuestions = QUESTIONS.filter(q => q.id >= levelConfig.range[0] && q.id <= levelConfig.range[1]);
    const currentQ = levelQuestions[currentQuestionIdx];

    const progressPercent = ((currentQuestionIdx + 1) / levelQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-emerald-50/40 to-teal-50 flex flex-col p-4 sm:p-6 select-none">
        {/* Game Top Bar */}
        <div className="max-w-2xl w-full mx-auto flex items-center justify-between mb-4">
          <button 
            onClick={() => {
              triggerSound('click');
              setScreen('map');
            }} 
            className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Peta</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-2xl font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5">
              <span>LEVEL {activeLevel}:</span>
              <span className="font-bold opacity-90">{levelConfig.title}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1 shadow-sm">
              <Award size={16} className="text-amber-500" />
              <span>{userData.totalScore} Markah</span>
            </div>
            
            <button 
              onClick={() => setIsSoundEnabled(!isSoundEnabled)} 
              className="p-2 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Bunyi"
            >
              {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="max-w-2xl w-full mx-auto mb-6">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1.5">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Kategori: {currentQ.category}
            </span>
            <span>Soalan {currentQuestionIdx + 1} daripada {levelQuestions.length}</span>
          </div>
          <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            />
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 max-w-2xl w-full mx-auto flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              {/* Question Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border-b-8 border-emerald-500/80 border border-emerald-100 text-center relative overflow-hidden mb-6">
                <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-black mb-3">
                  Soalan No. {currentQ.id}
                </div>

                {currentQ.arabicText && (
                  <div className="mb-4 py-3 px-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                    <p className="text-2xl sm:text-3xl font-serif font-black text-emerald-950 tracking-wide dir-rtl" dir="rtl">
                      {currentQ.arabicText}
                    </p>
                  </div>
                )}

                <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                  {currentQ.text}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.type === 'mcq' && currentQ.options?.map((opt, idx) => {
                  const letters = ['A', 'B', 'C'];
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(opt)}
                      className="w-full bg-white hover:bg-emerald-50/70 p-4 sm:p-5 rounded-2xl shadow-md border-2 border-slate-100 hover:border-emerald-500 transition text-left flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3.5">
                        <span className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 flex items-center justify-center font-black text-sm shrink-0 transition">
                          {letters[idx] || (idx + 1)}
                        </span>
                        <span className="font-bold text-slate-800 text-sm sm:text-base leading-snug">
                          {opt}
                        </span>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-emerald-600 shrink-0 transition" size={20} />
                    </motion.button>
                  );
                })}

                {currentQ.type === 'boolean' && (
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(true)} 
                      className="bg-white hover:bg-emerald-50 p-6 sm:p-8 rounded-3xl shadow-lg border-b-6 border-emerald-500 text-emerald-700 font-black text-xl sm:text-2xl flex flex-col items-center justify-center gap-2 group transition"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center text-emerald-700 transition">
                        <Check size={32} />
                      </div>
                      <span>BETUL</span>
                    </motion.button>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(false)} 
                      className="bg-white hover:bg-rose-50 p-6 sm:p-8 rounded-3xl shadow-lg border-b-6 border-rose-500 text-rose-600 font-black text-xl sm:text-2xl flex flex-col items-center justify-center gap-2 group transition"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center text-rose-600 transition">
                        <XCircle size={32} />
                      </div>
                      <span>SALAH</span>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Feedback Modal */}
        {feedback?.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-6 sm:p-7 rounded-3xl shadow-2xl max-w-sm w-full text-center border-t-8 border-emerald-500"
            >
              {feedback.correct ? (
                <>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-700 mb-1">Alhamdulillah, Tepat!</h3>
                  <p className="text-slate-600 text-sm font-bold mb-2">Jawapan anda betul sekali!</p>
                  <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-black rounded-xl">
                    +2 Markah Ditambah
                  </span>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <XCircle size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-rose-600 mb-1">Kurang Tepat!</h3>
                  <p className="text-xs text-slate-500 font-semibold mb-3">Mari pelajari perkara ini bersama:</p>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left text-xs text-slate-700 leading-relaxed font-medium">
                    💡 <span className="font-bold">Info: </span>{feedback.explanation}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    );
  };

  // 5. Result View Screen
  const ResultView = () => {
    const totalQuestions = QUESTIONS.length;
    const correctCount = Object.values(userData.answers).filter(v => v.isCorrect === true).length;
    const score = userData.totalScore;
    const percentage = Math.round((score / 50) * 100);

    let rankTitle = "PEJUANG ILMU";
    let badgeColor = "from-emerald-600 to-teal-700";
    let IconComponent = Heart;

    if (score >= 45) {
      rankTitle = "JUARA IBADAT";
      badgeColor = "from-amber-400 to-amber-600";
      IconComponent = Trophy;
    } else if (score >= 35) {
      rankTitle = "PAHLAWAN IBADAT";
      badgeColor = "from-emerald-500 to-teal-600";
      IconComponent = Award;
    } else if (score >= 25) {
      rankTitle = "PENEROKA ILMU";
      badgeColor = "from-sky-500 to-blue-600";
      IconComponent = Star;
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50 to-sky-50 p-4 sm:p-6 flex flex-col items-center">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl w-full max-w-lg border-b-8 border-emerald-600 border border-emerald-100 text-center my-4">
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            TAHNIAH! KEMBARA SELESAI
          </span>

          {/* Trophy badge */}
          <div className="flex justify-center my-5">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${badgeColor} p-4 shadow-xl flex items-center justify-center text-white`}>
              <IconComponent size={56} className="drop-shadow-md" />
            </div>
          </div>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pangkat Diraih</p>
          <h1 className="text-3xl font-black text-emerald-800 tracking-tight mb-4">
            🏆 {rankTitle}
          </h1>

          {/* Score Stats */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">MARKAH</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-900">{score}/50</p>
            </div>
            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">BETUL</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-900">{correctCount}/{totalQuestions}</p>
            </div>
            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">PERATUS</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-900">{percentage}%</p>
            </div>
          </div>

          {/* Player details (Nama sahaja) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs font-bold text-slate-700 mb-6">
            <div className="flex justify-between items-center py-1 border-b border-slate-200">
              <span className="text-slate-500">NAMA PEMAIN:</span>
              <span className="text-emerald-900 uppercase font-black">{userData.name || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">STATUS PAPAN SKOR:</span>
              <span className="text-emerald-700 font-black flex items-center gap-1">
                <CheckCircle2 size={14} /> Berjaya Direkodkan
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={() => {
                triggerSound('click');
                setScreen('scoreboard');
              }} 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Trophy size={18} />
              <span>LIHAT PAPAN SKOR KEDUDUKAN</span>
            </button>

            <button 
              onClick={() => {
                triggerSound('click');
                setScreen('review');
              }} 
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <BookOpen size={18} />
              <span>ULANG KAJI 25 SOALAN</span>
            </button>

            <div className="pt-2 flex gap-3">
              <button 
                onClick={() => {
                  triggerSound('click');
                  setScreen('map');
                }} 
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-2xl font-black text-xs transition"
              >
                Peta Kembara
              </button>

              <button 
                onClick={() => {
                  triggerSound('click');
                  setShowTeacherModal(true);
                }} 
                className="flex items-center justify-center gap-1.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 py-3 rounded-2xl font-black text-xs border border-rose-200 transition"
              >
                <Lock size={14} />
                <span>Reset Guru</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 6. Scoreboard Screen (Papan Skor Tanpa Pilihan Kelas)
  const ScoreboardView = () => {
    const [searchName, setSearchName] = useState<string>('');

    // Filter by search name & sort by score
    const filteredRecords = scoreboard
      .filter(item => item.name.toLowerCase().includes(searchName.toLowerCase().trim()))
      .sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);

    const topThree = scoreboard.slice(0, 3);

    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/60 via-emerald-50/40 to-teal-50 p-4 sm:p-6 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                triggerSound('click');
                setScreen('map');
              }}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-700 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} />
              <span>Kembali</span>
            </button>

            <div className="text-center">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">KEDUDUKAN PEMAIN</span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center justify-center gap-2">
                <Trophy size={26} className="text-amber-500" />
                Papan Skor Ibadat
              </h1>
            </div>

            <button
              onClick={() => {
                triggerSound('click');
                setShowTeacherModal(true);
              }}
              className="p-2.5 bg-rose-50 hover:bg-rose-100 rounded-2xl text-rose-700 border border-rose-200 transition text-xs font-black flex items-center gap-1"
              title="Akses Reset Guru"
            >
              <Lock size={15} />
              <span className="hidden sm:inline">Guru</span>
            </button>
          </div>

          {/* Podium for Top 3 */}
          {scoreboard.length > 0 && !searchName && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8 pt-4 items-end">
              {/* Rank 2 (Silver) */}
              {topThree[1] ? (
                <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-3 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-black text-base flex items-center justify-center mb-1">
                    🥈 2
                  </div>
                  <p className="font-black text-xs text-slate-800 truncate w-full">{topThree[1].name}</p>
                  <span className="mt-1 font-black text-sm text-slate-700">{topThree[1].score}/50</span>
                </div>
              ) : <div className="invisible"></div>}

              {/* Rank 1 (Gold) */}
              {topThree[0] ? (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-3xl p-4 text-center flex flex-col items-center shadow-md scale-105">
                  <div className="w-12 h-12 rounded-full bg-amber-400 text-amber-950 font-black text-lg flex items-center justify-center mb-1 shadow-sm">
                    🥇 1
                  </div>
                  <p className="font-black text-xs sm:text-sm text-slate-800 truncate w-full">{topThree[0].name}</p>
                  <span className="mt-1 font-black text-base text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-xl">
                    {topThree[0].score}/50
                  </span>
                </div>
              ) : <div className="invisible"></div>}

              {/* Rank 3 (Bronze) */}
              {topThree[2] ? (
                <div className="bg-amber-50/50 border-2 border-amber-300 rounded-2xl p-3 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-800 font-black text-base flex items-center justify-center mb-1">
                    🥉 3
                  </div>
                  <p className="font-black text-xs text-slate-800 truncate w-full">{topThree[2].name}</p>
                  <span className="mt-1 font-black text-sm text-amber-800">{topThree[2].score}/50</span>
                </div>
              ) : <div className="invisible"></div>}
            </div>
          )}

          {/* Search Row */}
          <div className="mb-5">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input 
                type="text" 
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
                placeholder="Cari nama murid..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Table / List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="font-bold text-slate-500 text-xs">Tiada rekod pemain dijumpai.</p>
              </div>
            ) : (
              filteredRecords.map((item, index) => {
                const isTop3 = index < 3 && !searchName;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                      isTop3 
                        ? 'bg-amber-50/40 border-amber-200' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        index === 0 ? 'bg-amber-400 text-amber-950 font-black' :
                        index === 1 ? 'bg-slate-300 text-slate-800' :
                        index === 2 ? 'bg-amber-200 text-amber-900' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        #{index + 1}
                      </div>

                      <div>
                        <p className="font-black text-slate-800 text-sm leading-tight">{item.name}</p>
                        <p className="text-[11px] font-semibold text-slate-400">
                          {item.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: item.starsCount }).map((_, i) => (
                          <Star key={i} size={13} className="fill-amber-400 text-amber-500" />
                        ))}
                      </div>

                      <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 font-black text-xs px-2.5 py-1 rounded-xl shrink-0">
                        {item.score}/50
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
            <button
              onClick={() => {
                triggerSound('click');
                setScreen('home');
              }}
              className="text-xs font-black text-slate-600 hover:text-emerald-700 flex items-center gap-1.5"
            >
              <Home size={15} />
              <span>Menu Utama</span>
            </button>

            <button
              onClick={() => {
                triggerSound('click');
                setScreen('map');
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-2xl text-xs font-black shadow-md transition"
            >
              Teruskan Kembara
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 7. Review View Screen (Ulang Kaji 25 Soalan)
  const ReviewView = () => (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Mod Latihan</span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">Ulang Kaji 25 Soalan Ibadat</h1>
        </div>
        <button 
          onClick={() => {
            triggerSound('click');
            setScreen('result');
          }} 
          className="bg-slate-100 hover:bg-slate-200 p-2.5 rounded-2xl text-slate-600 transition"
          aria-label="Kembali"
        >
          <XCircle size={22} />
        </button>
      </div>

      <div className="space-y-4">
        {QUESTIONS.map((q, idx) => {
          const userAns = userData.answers[q.id];
          const isCorrect = userAns ? userAns.isCorrect : false;
          const wasAnswered = userAns !== undefined;

          return (
            <div 
              key={q.id} 
              className={`p-5 rounded-3xl border-2 transition ${
                !wasAnswered
                  ? 'bg-slate-100/70 border-slate-200'
                  : isCorrect 
                  ? 'border-emerald-200 bg-emerald-50/40' 
                  : 'border-rose-200 bg-rose-50/40'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-sm text-white ${
                  !wasAnswered ? 'bg-slate-400' : isCorrect ? 'bg-emerald-600' : 'bg-rose-500'
                }`}>
                  {idx + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {q.category}
                    </span>
                    {wasAnswered && (
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isCorrect ? '✓ Betul (+2)' : '✗ Kurang Tepat (0)'}
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-slate-800 text-sm sm:text-base mb-2">{q.text}</p>

                  {q.arabicText && (
                    <div className="mb-2 p-2 bg-white rounded-xl border border-slate-200 text-center">
                      <p className="text-xl font-serif font-black text-emerald-900" dir="rtl">{q.arabicText}</p>
                    </div>
                  )}

                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                    <p className="text-slate-600">
                      <span className="font-bold">Jawapan Tepat: </span> 
                      <span className="text-emerald-700 font-black">
                        {typeof q.answer === 'boolean' ? (q.answer ? 'BETUL' : 'SALAH') : q.answer}
                      </span>
                    </p>
                    {wasAnswered && !isCorrect && (
                      <p className="text-rose-600">
                        <span className="font-bold">Jawapan Dipilih: </span> 
                        <span className="font-semibold">
                          {typeof userAns.selected === 'boolean' ? (userAns.selected ? 'BETUL' : 'SALAH') : String(userAns.selected)}
                        </span>
                      </p>
                    )}
                  </div>

                  {q.explanation && (
                    <div className="mt-2.5 text-xs bg-emerald-100/40 p-3 rounded-2xl border border-emerald-200/60 text-slate-700 leading-relaxed">
                      💡 <span className="font-bold text-emerald-900">Ulasan Ilmu: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 mt-6">
        <button 
          onClick={() => {
            triggerSound('click');
            setScreen('result');
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-3xl font-black text-base shadow-xl active:scale-98 transition flex items-center justify-center gap-2"
        >
          <span>KEMBALI KE KEPUTUSAN</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="font-sans text-slate-900 bg-emerald-50 min-h-screen select-none overflow-x-hidden antialiased">
      {screen === 'splash' && <SplashScreen />}
      {screen === 'home' && <HomeMenu />}
      {screen === 'map' && <MapView />}
      {screen === 'game' && <GameView />}
      {screen === 'result' && <ResultView />}
      {screen === 'scoreboard' && <ScoreboardView />}
      {screen === 'review' && <ReviewView />}

      {/* --- TEACHER PIN & RESET MODAL --- */}
      {showTeacherModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 sm:p-7 rounded-3xl max-w-sm w-full shadow-2xl border-t-8 border-rose-500"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">Akses Khas Guru</h3>
                  <p className="text-[10px] text-slate-500">Kawalan Reset & Papan Skor</p>
                </div>
              </div>

              <button onClick={closeTeacherModal} className="text-slate-400 hover:text-slate-600 p-1">
                <XCircle size={22} />
              </button>
            </div>

            {/* If NOT Authenticated: Show PIN Form (Tanpa sebarang teks PIN lalai) */}
            {!isTeacherAuthenticated ? (
              <form onSubmit={handleTeacherPinSubmit} className="space-y-4">
                <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-200 text-xs text-rose-800">
                  <p className="font-bold flex items-center gap-1 mb-0.5">
                    <KeyRound size={13} />
                    Masukkan PIN Keselamatan Guru:
                  </p>
                  <p className="text-[11px] text-rose-600">
                    Sila masukkan PIN 4-angka untuk mengakses kawalan guru.
                  </p>
                </div>

                <div>
                  <input
                    type="password"
                    maxLength={8}
                    autoFocus
                    value={enteredPin}
                    onChange={e => {
                      setEnteredPin(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    placeholder="••••"
                    className="w-full text-center tracking-widest text-2xl font-mono px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-rose-500 focus:bg-white rounded-2xl outline-none"
                  />
                  {pinError && (
                    <p className="text-xs text-rose-600 font-bold mt-1 text-center">{pinError}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeTeacherModal}
                    className="py-3 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="py-3 rounded-2xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-md transition"
                  >
                    Sahkan PIN
                  </button>
                </div>
              </form>
            ) : (
              /* If Authenticated: Teacher Reset Actions Panel */
              <div className="space-y-4">
                {teacherNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                    <span>{teacherNotice}</span>
                  </div>
                )}

                <div className="space-y-2.5">
                  {/* Action 1: Reset Current Player */}
                  <button
                    onClick={handleTeacherResetStudent}
                    className="w-full p-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl text-left flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-200/80 text-rose-800 flex items-center justify-center shrink-0">
                        <RotateCcw size={18} />
                      </div>
                      <div>
                        <p className="font-black text-xs text-rose-900">Reset Kemajuan Murid Semasa</p>
                        <p className="text-[10px] text-rose-700">Kembalikan ke Level 1 untuk murid baharu</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-rose-400 group-hover:text-rose-700" />
                  </button>

                  {/* Action 2: Reset Scoreboard */}
                  <button
                    onClick={handleTeacherClearScoreboard}
                    className="w-full p-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-left flex items-center justify-between group transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                        <Trash2 size={18} />
                      </div>
                      <div>
                        <p className="font-black text-xs text-amber-950">Kosongkan Papan Skor</p>
                        <p className="text-[10px] text-amber-800">Padam semua rekod senarai markah</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-amber-400 group-hover:text-amber-700" />
                  </button>
                </div>

                <button
                  onClick={closeTeacherModal}
                  className="w-full mt-2 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-black shadow-md transition"
                >
                  Selesai & Tutup
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
