import { useState, useEffect, useRef } from 'react';

// --- Configuration ---
const KEYWORDS = [
  "const", "let", "var", "function", "return", "if", "else", 
  "while", "for", "switch", "case", "break", "import", "export", 
  "class", "extends", "try", "catch", "throw", "finally", "async", "await", "static"
];

const TYPES = [
  "null", "true", "false", "void", "new", "typeof", "this", "super"
];

const PACKAGES = [
  "react", "vue", "angular", "node", "npm", "git", "json", "html", "css", "api"
];

const TRAPS = ["NaN", "404", "undefined", "error", "fail", "bug", "glitch"];
const MINIS = ["i", "x", "y", "e", "k", "v", "a", "b", "_"];

const CHAINS = [
  ["try", "catch"], ["async", "await"], ["if", "else"],
  ["switch", "case"], ["npm", "install"], ["git", "commit", "push"]
];

const BOSS_WORDS = [
  "SegmentationFault", "NullPointerException", "StackOverflow", 
  "SystemFailure", "FatalError", "MemoryLeak", "Deadlock", "BlueScreen"
];

const CHAOS_WORDS = [
  "CHAOS_MONKEY", "ENTROPY", "DISORDER", "ANARCHY", "INVERTED"
];

const SETTINGS = {
  initialSpawnRate: 140, 
  minSpawnRate: 35,
  fallSpeedMin: 0.3, 
  fallSpeedMax: 0.9,
  bossThreshold: 2000, 
  maxWordsOnScreen: 8,
  comboDecayTime: 120,
  nukeCost: 1500,
  freezeDuration: 300,
  levelUpScore: 2000,
  flowMax: 40
};

const UPGRADES = [
    { id: 'startup_script', name: 'Startup Script', desc: 'Start with FIREWALL active', cost: 500 },
    { id: 'ram_upgrade', name: 'RAM Upgrade', desc: 'Nuke charges 20% faster', cost: 1000 },
    { id: 'cache_boost', name: 'L2 Cache', desc: 'Combo decays 50% slower', cost: 1500 },
    { id: 'gpu_overclock', name: 'GPU Overclock', desc: 'Flow State lasts longer', cost: 2000 },
];

const ACHIEVEMENT_DATA = [
    { id: 'first_blood', name: 'Hello World', desc: 'Destroy your first bug', condition: (stats) => stats.totalKills >= 1 },
    { id: 'novice', name: 'Script Kiddie', desc: 'Reach 1,000 Score', condition: (stats) => stats.highScore >= 1000 },
    { id: 'pro', name: 'Senior Dev', desc: 'Reach 10,000 Score', condition: (stats) => stats.highScore >= 10000 },
    { id: 'combo_king', name: '10x Developer', desc: 'Reach an 8x Combo', condition: (stats) => stats.maxCombo >= 8 },
    { id: 'hunter', name: 'Bug Hunter', desc: 'Destroy 500 bugs lifetime', condition: (stats) => stats.lifetimeKills >= 500 },
    { id: 'survivor', name: 'Legacy Code', desc: 'Play 10 games', condition: (stats) => stats.gamesPlayed >= 10 },
    { id: 'cleaner', name: 'Refactor', desc: 'Use Garbage Collection (Nuke)', condition: (stats) => stats.nukesUsed >= 1 },
    { id: 'flow', name: 'In The Zone', desc: 'Activate Flow State', condition: (stats) => stats.flowActivated >= 1 },
    { id: 'overclocker', name: 'Overclocker', desc: 'Destroy 50 bugs while Overclocked', condition: (stats) => stats.overclockKills >= 50 },
    { id: 'rich', name: 'Venture Capital', desc: 'Earn 1,000 Bits total', condition: (stats) => stats.totalBits >= 1000 },
];

const THEMES = {
  1: { // Dracula
    name: "DRACULA",
    bg: '#0d1117', text: '#c9d1d9', keyword: '#ff7b72', storage: '#79c0ff', 
    type: '#d2a8ff', boss: '#ff0000', gold: '#f1e05a', shield: '#3fb950', 
    freeze: '#58a6ff', chain: '#ffa657', leak: '#00ff00', trap: '#ff0055', chaos: '#ff00ff',
    mini: '#cccccc', nuke: '#d2a8ff', success: '#238636', highlight: '#7ee787', flow: '#00f2ff'
  },
  2: { // Matrix
    name: "THE MATRIX",
    bg: '#000000', text: '#00ff00', keyword: '#008f11', storage: '#00ff41', 
    type: '#003b00', boss: '#ccff00', gold: '#ffffff', shield: '#00fa9a', 
    freeze: '#aaff00', chain: '#55ff55', leak: '#adff2f', trap: '#ff0000', chaos: '#ffffff',
    mini: '#00ff00', nuke: '#ffffff', success: '#00ff00', highlight: '#ccffcc', flow: '#ffffff'
  },
  3: { // Cyberpunk
    name: "CYBERPUNK",
    bg: '#2b213a', text: '#ff0090', keyword: '#00f0ff', storage: '#f5d300', 
    type: '#9400d3', boss: '#ff0000', gold: '#f5d300', shield: '#00f0ff', 
    freeze: '#ffffff', chain: '#ff0090', leak: '#39ff14', trap: '#ff4500', chaos: '#f5d300',
    mini: '#00f0ff', nuke: '#f5d300', success: '#ff0090', highlight: '#00f0ff', flow: '#f5d300'
  }
};

// --- AUDIO ENGINE ---
const AudioEngine = {
  ctx: null,
  drone: null,
  init: () => {
    if (!AudioEngine.ctx) {
      AudioEngine.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (AudioEngine.ctx.state === 'suspended') {
      AudioEngine.ctx.resume();
    }
  },
  startDrone: () => {
      if (!AudioEngine.ctx) return;
      if (AudioEngine.drone) AudioEngine.drone.stop();
      const osc = AudioEngine.ctx.createOscillator();
      const gain = AudioEngine.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, AudioEngine.ctx.currentTime); 
      const filter = AudioEngine.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, AudioEngine.ctx.currentTime);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(AudioEngine.ctx.destination);
      gain.gain.setValueAtTime(0, AudioEngine.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, AudioEngine.ctx.currentTime + 2);
      osc.start();
      AudioEngine.drone = { osc, gain, filter };
  },
  updateDrone: (intensity) => { 
      if (!AudioEngine.drone) return;
      const { filter } = AudioEngine.drone;
      filter.frequency.setTargetAtTime(200 + (intensity * 800), AudioEngine.ctx.currentTime, 0.5);
  },
  stopDrone: () => {
      if (AudioEngine.drone) {
          AudioEngine.drone.gain.gain.setTargetAtTime(0, AudioEngine.ctx.currentTime, 0.5);
          setTimeout(() => { if(AudioEngine.drone) AudioEngine.drone.osc.stop(); AudioEngine.drone = null; }, 600);
      }
  },
  playTone: (freq, type, duration, vol = 0.1) => {
    if (!AudioEngine.ctx) return;
    const osc = AudioEngine.ctx.createOscillator();
    const gain = AudioEngine.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, AudioEngine.ctx.currentTime);
    gain.gain.setValueAtTime(vol, AudioEngine.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, AudioEngine.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(AudioEngine.ctx.destination);
    osc.start();
    osc.stop(AudioEngine.ctx.currentTime + duration);
  },
  click: () => AudioEngine.playTone(800, 'square', 0.05, 0.05),
  error: () => AudioEngine.playTone(150, 'sawtooth', 0.2, 0.1),
  shoot: () => {
    if (!AudioEngine.ctx) return;
    const osc = AudioEngine.ctx.createOscillator();
    const gain = AudioEngine.ctx.createGain();
    osc.frequency.setValueAtTime(600, AudioEngine.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, AudioEngine.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, AudioEngine.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, AudioEngine.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(AudioEngine.ctx.destination);
    osc.start();
    osc.stop(AudioEngine.ctx.currentTime + 0.2);
  },
  powerup: () => {
    AudioEngine.playTone(440, 'sine', 0.5, 0.1);
    setTimeout(() => AudioEngine.playTone(554, 'sine', 0.5, 0.1), 100);
    setTimeout(() => AudioEngine.playTone(659, 'sine', 0.5, 0.1), 200);
  },
  levelup: () => {
    if (!AudioEngine.ctx) return;
    const now = AudioEngine.ctx.currentTime;
    [523, 659, 783, 1046].forEach((freq, i) => {
        const osc = AudioEngine.ctx.createOscillator();
        const gain = AudioEngine.ctx.createGain();
        osc.frequency.setValueAtTime(freq, now + i*0.1);
        gain.gain.setValueAtTime(0.1, now + i*0.1);
        gain.gain.linearRampToValueAtTime(0, now + i*0.1 + 0.3);
        osc.connect(gain);
        gain.connect(AudioEngine.ctx.destination);
        osc.start(now + i*0.1);
        osc.stop(now + i*0.1 + 0.3);
    });
  },
  nuke: () => {
     if (!AudioEngine.ctx) return;
     const bufferSize = AudioEngine.ctx.sampleRate * 0.5;
     const buffer = AudioEngine.ctx.createBuffer(1, bufferSize, AudioEngine.ctx.sampleRate);
     const data = buffer.getChannelData(0);
     for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
     const noise = AudioEngine.ctx.createBufferSource();
     noise.buffer = buffer;
     const gain = AudioEngine.ctx.createGain();
     gain.gain.setValueAtTime(0.5, AudioEngine.ctx.currentTime);
     gain.gain.exponentialRampToValueAtTime(0.01, AudioEngine.ctx.currentTime + 0.5);
     noise.connect(gain);
     gain.connect(AudioEngine.ctx.destination);
     noise.start();
  },
  achievement: () => {
      AudioEngine.playTone(1200, 'sine', 0.1, 0.1);
      setTimeout(() => AudioEngine.playTone(1800, 'sine', 0.3, 0.1), 100);
  },
  buy: () => {
      AudioEngine.playTone(880, 'triangle', 0.1, 0.1);
      setTimeout(() => AudioEngine.playTone(1760, 'triangle', 0.1, 0.1), 100);
  }
};

const SyntaxSurvivor = () => {
  const [gameState, setGameState] = useState('START'); 
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [combo, setCombo] = useState(1);
  const [currentInput, setCurrentInput] = useState('');
  const [nukeCharge, setNukeCharge] = useState(100);
  const [shieldActive, setShieldActive] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [shake, setShake] = useState(0);
  const [level, setLevel] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameStats, setGameStats] = useState({ wpm: 0, accuracy: 0 });
  const [flow, setFlow] = useState(0); 
  const [isFlowState, setIsFlowState] = useState(false);
  const [themeId, setThemeId] = useState(1);
  const [weather, setWeather] = useState('CLEAR');
  const [showAchievements, setShowAchievements] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [isOverclocked, setIsOverclocked] = useState(false);
  const [chaosMode, setChaosMode] = useState(false);
  
  // Persistence State
  const [bits, setBits] = useState(0);
  const [inventory, setInventory] = useState([]);

  // --- REFS ---
  const scoreRef = useRef(0);
  const shieldRef = useRef(false); 
  const statsRef = useRef({ totalKeys: 0, correctKeys: 0, startTime: 0 });
  const lifetimeStatsRef = useRef({ totalKills: 0, gamesPlayed: 0, maxCombo: 0, lifetimeKills: 0, nukesUsed: 0, flowActivated: 0, highScore: 0, overclockKills: 0, totalBits: 0 });
  
  const enemiesRef = useRef([]); 
  const particlesRef = useRef([]); 
  const floatersRef = useRef([]); 
  const backgroundRef = useRef(null); 
  const requestRef = useRef();
  const spawnTimer = useRef(0);
  const comboTimer = useRef(0);
  const freezeTimer = useRef(0);
  const leakTimer = useRef(0);
  const weatherTimer = useRef(0);
  const scoreSinceNuke = useRef(0);
  const difficultyMultiplier = useRef(1.0);
  const nextLevelThreshold = useRef(SETTINGS.levelUpScore);

  const colors = THEMES[themeId];

  // --- INIT & LOADING ---
  useEffect(() => {
    // 1. Leaderboard
    const savedLb = localStorage.getItem('syntaxSurvivorLeaderboard');
    if (savedLb) { try { setLeaderboard(JSON.parse(savedLb)); } catch (e) {} }
    
    // 2. Stats
    const savedStats = localStorage.getItem('syntaxSurvivorStats');
    if (savedStats) { try { lifetimeStatsRef.current = JSON.parse(savedStats); } catch(e){} }
    
    // 3. Achievements
    const savedAch = localStorage.getItem('syntaxSurvivorAchievements');
    if (savedAch) { try { setUnlockedAchievements(JSON.parse(savedAch)); } catch(e){} }

    // 4. Bits
    const savedBits = localStorage.getItem('syntaxSurvivorBits');
    if (savedBits) { setBits(parseInt(savedBits, 10)); }

    // 5. Inventory
    const savedInv = localStorage.getItem('syntaxSurvivorInventory');
    if (savedInv) { try { setInventory(JSON.parse(savedInv)); } catch(e){} }

    // 6. Theme (New)
    const savedTheme = localStorage.getItem('syntaxSurvivorTheme');
    if (savedTheme) { setThemeId(parseInt(savedTheme, 10)); }
  }, []);

  // --- RESET FUNCTION ---
  const resetData = () => {
      if (confirm("Are you sure? This will wipe your High Scores, Bits, Upgrades, and Achievements.")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  // --- Saving Functions ---
  const changeTheme = (id) => {
      setThemeId(id);
      localStorage.setItem('syntaxSurvivorTheme', id);
  };

  const saveStats = (runScore) => {
      const ls = lifetimeStatsRef.current;
      ls.gamesPlayed++;
      ls.highScore = Math.max(ls.highScore, runScore);
      
      const earnedBits = Math.floor(runScore / 100);
      ls.totalBits += earnedBits;
      
      const newBits = bits + earnedBits;
      setBits(newBits);
      localStorage.setItem('syntaxSurvivorBits', newBits); // Save Bits
      
      if (earnedBits > 0) {
          spawnFloater(window.innerWidth/2, window.innerHeight/2 + 50, `+${earnedBits} BITS`, colors.gold);
      }

      localStorage.setItem('syntaxSurvivorStats', JSON.stringify(ls)); // Save Stats
      
      const newUnlocks = [];
      ACHIEVEMENT_DATA.forEach(ach => {
          if (!unlockedAchievements.includes(ach.id) && ach.condition(ls)) {
              newUnlocks.push(ach.id);
              spawnFloater(window.innerWidth/2, 100, `ACHIEVEMENT UNLOCKED: ${ach.name}`, colors.gold);
              AudioEngine.achievement();
          }
      });
      
      if (newUnlocks.length > 0) {
          const updated = [...unlockedAchievements, ...newUnlocks];
          setUnlockedAchievements(updated);
          localStorage.setItem('syntaxSurvivorAchievements', JSON.stringify(updated)); // Save Achievements
      }
  };

  const buyUpgrade = (upgrade) => {
      if (bits >= upgrade.cost && !inventory.includes(upgrade.id)) {
          AudioEngine.buy();
          const newBits = bits - upgrade.cost;
          setBits(newBits);
          const newInv = [...inventory, upgrade.id];
          setInventory(newInv);
          localStorage.setItem('syntaxSurvivorBits', newBits); // Save Bits (Spent)
          localStorage.setItem('syntaxSurvivorInventory', JSON.stringify(newInv)); // Save Inventory
      } else {
          AudioEngine.error();
      }
  };

  const updateLeaderboard = (finalScore) => {
    const newEntry = { 
        score: finalScore, 
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updated = [...leaderboard, newEntry].sort((a, b) => b.score - a.score).slice(0, 50); 
    setLeaderboard(updated);
    localStorage.setItem('syntaxSurvivorLeaderboard', JSON.stringify(updated)); // Save Leaderboard
  };

  const calculateFinalStats = () => {
      const durationMin = (Date.now() - statsRef.current.startTime) / 60000;
      const wpm = durationMin > 0 ? Math.round((statsRef.current.correctKeys / 5) / durationMin) : 0;
      const accuracy = statsRef.current.totalKeys > 0 ? Math.round((statsRef.current.correctKeys / statsRef.current.totalKeys) * 100) : 0;
      setGameStats({ wpm, accuracy });
  };

  // --- Visual FX ---
  const triggerShake = (intensity) => {
    setShake(intensity);
    setTimeout(() => setShake(0), 300);
  };

  const spawnExplosion = (x, y, color, scale = 1.0) => {
    for (let i = 0; i < 8 * scale; i++) {
      particlesRef.current.push({
        id: Math.random(), x, y,
        vx: (Math.random() - 0.5) * (6 * scale),
        vy: (Math.random() - 0.5) * (6 * scale),
        life: 1.0, color
      });
    }
  };

  const spawnFloater = (x, y, text, color) => {
    floatersRef.current.push({
      id: Math.random(), x, y, text, color, life: 1.0, vy: -1
    });
  };

  const triggerGarbageCollection = () => {
    const hasRam = inventory.includes('ram_upgrade');
    const cost = hasRam ? SETTINGS.nukeCost * 0.8 : SETTINGS.nukeCost;

    if (scoreSinceNuke.current < cost && scoreRef.current > 0) return; 
    AudioEngine.nuke();
    triggerShake(20);
    lifetimeStatsRef.current.nukesUsed++;
    enemiesRef.current.forEach(e => {
        spawnExplosion(e.x + 20, e.y + 10, colors.nuke);
    });
    enemiesRef.current = []; 
    setCurrentInput('');
    scoreSinceNuke.current = 0; 
    setNukeCharge(0);
    spawnFloater(window.innerWidth / 2, window.innerHeight / 2, "GARBAGE COLLECTED!", colors.nuke);
  };

  const drawBackground = () => {
      if (!backgroundRef.current) return;
      const canvas = backgroundRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (!canvas.particles) {
          canvas.particles = [];
          for(let i=0; i<50; i++) {
              canvas.particles.push({
                  x: Math.random() * canvas.width,
                  y: Math.random() * canvas.height,
                  speed: Math.random() * 2 + 1,
                  char: String.fromCharCode(0x30A0 + Math.random() * 96),
                  opacity: Math.random()
              });
          }
      }

      ctx.clearRect(0,0, canvas.width, canvas.height);
      ctx.fillStyle = colors.text;
      ctx.font = '16px monospace';
      
      canvas.particles.forEach(p => {
          ctx.globalAlpha = p.opacity * 0.2;
          ctx.fillText(p.char, p.x, p.y);
          p.y += p.speed;
          if (p.y > canvas.height) {
              p.y = 0;
              p.x = Math.random() * canvas.width;
          }
      });
      ctx.globalAlpha = 1.0;
  };

  // --- GAME LOOP ---
  const update = () => {
    if (gameState !== 'PLAYING') return;

    drawBackground(); 

    difficultyMultiplier.current += 0.0002;
    AudioEngine.updateDrone(Math.min(combo / 10, 1));

    // Weather
    weatherTimer.current++;
    if (weatherTimer.current > 600) { 
        if (weather === 'CLEAR' && Math.random() < 0.3) {
            setWeather('STORM');
            spawnFloater(window.innerWidth/2, window.innerHeight/4, "⚠ SYNTAX STORM INCOMING ⚠", colors.trap);
            weatherTimer.current = -300; 
        } else if (weather === 'STORM') {
            setWeather('CLEAR');
            weatherTimer.current = 0;
        } else {
            weatherTimer.current = 0;
        }
    }

    const chaosAlive = enemiesRef.current.some(e => e.type === 'CHAOS');
    if (chaosAlive !== chaosMode) setChaosMode(chaosAlive);

    if (scoreRef.current >= nextLevelThreshold.current) {
        setLevel(prev => prev + 1);
        nextLevelThreshold.current += SETTINGS.levelUpScore;
        setHealth(h => Math.min(h + 30, 100)); 
        AudioEngine.levelup();
        spawnFloater(window.innerWidth / 2, window.innerHeight / 3, "SYSTEM UPGRADE!", colors.highlight);
        spawnFloater(window.innerWidth / 2, window.innerHeight / 3 + 30, "+30 HP", colors.success);
    }

    let timeScale = 1.0;
    if (freezeTimer.current > 0) {
        freezeTimer.current--;
        timeScale = 0.1; 
        if (freezeTimer.current === 0) setIsFrozen(false);
    }
    
    if (isFlowState) timeScale *= 0.8;

    spawnTimer.current++;
    
    let currentSpawnRate = Math.max(
        SETTINGS.minSpawnRate, 
        SETTINGS.initialSpawnRate / difficultyMultiplier.current
    );
    if (isOverclocked) currentSpawnRate /= 2; 

    if (spawnTimer.current > currentSpawnRate) {
      if (enemiesRef.current.length < SETTINGS.maxWordsOnScreen * (isOverclocked ? 1.5 : 1)) {
        let type = 'NORMAL';
        let word = '';
        let chain = [];

        const rand = Math.random();
        
        if (scoreRef.current > SETTINGS.bossThreshold && rand < 0.05) {
            type = 'BOSS'; word = BOSS_WORDS[Math.floor(Math.random() * BOSS_WORDS.length)];
        } else if (scoreRef.current > 3000 && rand < 0.06) {
            type = 'CHAOS'; word = CHAOS_WORDS[Math.floor(Math.random() * CHAOS_WORDS.length)];
        } else if (rand < 0.08) {
            type = 'CHAIN'; 
            const chainData = CHAINS[Math.floor(Math.random() * CHAINS.length)];
            chain = [...chainData]; word = chain.shift(); 
        } else if (rand < 0.10) {
            type = 'LEAK'; word = "leak";
        } else if (rand < 0.12) {
            type = 'TRAP'; word = TRAPS[Math.floor(Math.random() * TRAPS.length)];
        } else if (rand < 0.15) {
             for(let i=0; i<3; i++) {
                 enemiesRef.current.push({
                     id: Math.random(), word: MINIS[Math.floor(Math.random()*MINIS.length)],
                     x: Math.random() * (window.innerWidth - 100) + 50, y: -50 - (i*30),
                     speed: 1.5 * difficultyMultiplier.current, type: 'MINI'
                 });
             }
             spawnTimer.current = 0;
             return; 
        } else if (rand < 0.18) {
            type = 'GOLD'; word = PACKAGES[Math.floor(Math.random() * PACKAGES.length)];
        } else if (rand < 0.20) {
            type = 'SHIELD'; word = "firewall";
        } else if (rand < 0.22) {
            type = 'FREEZE'; word = "lag";
        } else {
            const pool = [...KEYWORDS, ...TYPES, ...PACKAGES];
            word = pool[Math.floor(Math.random() * pool.length)];
        }

        enemiesRef.current.push({
          id: Math.random().toString(36).substr(2, 9),
          word, chain, 
          x: Math.random() * (window.innerWidth - (type==='BOSS' ? 400 : 200)) + 50,
          y: -50,
          speed: (type==='BOSS' || type==='CHAOS' ? 0.4 : (Math.random() * (SETTINGS.fallSpeedMax - SETTINGS.fallSpeedMin) + SETTINGS.fallSpeedMin)) * difficultyMultiplier.current,
          type
        });
      }
      spawnTimer.current = 0;
    }

    const decaySpeed = inventory.includes('cache_boost') ? 0.5 : 1;
    if (combo > 1) {
      comboTimer.current += decaySpeed;
      if (comboTimer.current > SETTINGS.comboDecayTime) {
        setCombo(1); 
        comboTimer.current = 0;
      }
    }

    const hasLeak = enemiesRef.current.some(e => e.type === 'LEAK');
    if (hasLeak) {
        leakTimer.current++;
        if (leakTimer.current > 60) { 
            setHealth(h => {
                const next = h - 1;
                if (next <= 0) endGame();
                return next;
            });
            leakTimer.current = 0;
        }
    }

    const enemies = enemiesRef.current;
    let hitBottom = false;
    let damageTaken = 0;

    for (let i = enemies.length - 1; i >= 0; i--) {
      let dx = 0;
      if (weather === 'STORM') {
          dx = Math.sin(Date.now() / 200) * 2;
      }

      enemies[i].y += enemies[i].speed * timeScale; 
      enemies[i].x += dx;

      if (enemies[i].x < 0) enemies[i].x = window.innerWidth;
      if (enemies[i].x > window.innerWidth) enemies[i].x = 0;
      
      if (enemies[i].y > window.innerHeight - 50) {
        if (enemies[i].type !== 'TRAP') {
            const dmg = (enemies[i].type === 'BOSS' || enemies[i].type === 'CHAOS') ? 50 : (enemies[i].type === 'MINI' ? 5 : 20);
            damageTaken += dmg;
            hitBottom = true;
        }
        enemies.splice(i, 1);
        setCurrentInput(''); 
      }
    }

    if (hitBottom) {
      setIsFlowState(false);
      setFlow(0);

      if (shieldRef.current) {
          shieldRef.current = false; 
          setShieldActive(false);    
          spawnFloater(window.innerWidth/2, window.innerHeight - 100, "BLOCKED!", colors.shield);
          AudioEngine.error();
      } else {
          AudioEngine.error();
          triggerShake(damageTaken / 2);
          setHealth(h => {
            const next = h - damageTaken;
            if (next <= 0) endGame();
            return next;
          });
          setCombo(1); 
      }
    }

    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].x += particles[i].vx * timeScale;
      particles[i].y += particles[i].vy * timeScale;
      particles[i].life -= 0.05 * timeScale;
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    const floaters = floatersRef.current;
    for (let i = floaters.length - 1; i >= 0; i--) {
        floaters[i].y += floaters[i].vy; 
        floaters[i].life -= 0.02;
        if (floaters[i].life <= 0) floaters.splice(i, 1);
    }

    setTick(Date.now());
    requestRef.current = requestAnimationFrame(update);
  };

  const [tick, setTick] = useState(0);

  // --- Input Handler ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
          e.preventDefault();
          if (gameState === 'PLAYING') {
              setIsOverclocked(prev => !prev);
              spawnFloater(window.innerWidth/2, window.innerHeight/2, isOverclocked ? "OVERCLOCK OFF" : "OVERCLOCK ON", colors.highlight);
          }
          return;
      }

      if (['1','2','3'].includes(e.key)) { changeTheme(parseInt(e.key)); return; } // SAVE THEME
      if (e.key === 'Escape') { setGameState(prev => (prev === 'PLAYING' ? 'PAUSED' : (prev === 'PAUSED' ? 'PLAYING' : prev))); return; }
      if (gameState !== 'PLAYING') return;
      if (e.key === 'Enter') { triggerGarbageCollection(); return; }
      
      if (e.key === 'Backspace') { 
          setCurrentInput(''); setIsFlowState(false); setFlow(0); return; 
      }

      if (e.key.length === 1 && e.key.match(/[a-z0-9_]/i)) { 
        AudioEngine.click();
        const char = e.key.toLowerCase();
        statsRef.current.totalKeys++;
        
        const nextInput = currentInput + char;
        const match = enemiesRef.current.find(enemy => enemy.word.toLowerCase().startsWith(nextInput));

        if (match) {
          statsRef.current.correctKeys++;
          setCurrentInput(nextInput);
          
          if (!isFlowState) {
              setFlow(prev => {
                  const next = prev + 1;
                  if (next >= SETTINGS.flowMax) {
                      setIsFlowState(true);
                      lifetimeStatsRef.current.flowActivated++;
                      AudioEngine.powerup();
                      spawnFloater(window.innerWidth/2, window.innerHeight/4, "FLOW STATE ACTIVATED", colors.flow);
                      return SETTINGS.flowMax;
                  }
                  return next;
              });
          }

          if (nextInput === match.word.toLowerCase()) {
            
            if (match.type === 'TRAP') {
                AudioEngine.error();
                triggerShake(20);
                setHealth(h => { const next = h - 20; if (next <= 0) endGame(); return next; });
                spawnExplosion(match.x + 50, match.y + 10, colors.trap);
                spawnFloater(match.x, match.y, "TRAP TRIGGERED!", colors.trap);
                enemiesRef.current = enemiesRef.current.filter(e => e.id !== match.id);
                setCurrentInput(''); setIsFlowState(false); setFlow(0);
                return;
            }

            const targetWord = match.word;
            const targets = enemiesRef.current.filter(e => e.word === targetWord);

            let totalPoints = 0;
            let currentCombo = combo;

            targets.forEach(target => {
                let color = getWordColor(target.word, target.type);

                if (target.type === 'CHAIN' && target.chain.length > 0) {
                    spawnExplosion(target.x + 50, target.y + 10, colors.chain, 0.5);
                    AudioEngine.click();
                    target.word = target.chain.shift(); 
                    spawnFloater(target.x, target.y, "CHAIN!", colors.chain);
                    return; 
                }

                spawnExplosion(target.x + 50, target.y + 10, color, (target.type === 'BOSS'||target.type === 'CHAOS') ? 3.0 : 1.0);
                AudioEngine.shoot();

                let basePoints = 100;
                if (target.type === 'BOSS') basePoints = 500;
                if (target.type === 'CHAOS') basePoints = 1000; 
                if (target.type === 'MINI') basePoints = 50;
                if (target.type === 'LEAK') basePoints = 200;
                
                let multiplier = 1;
                if (isFlowState) multiplier *= 2;
                if (isOverclocked) multiplier *= 2; 
                
                totalPoints += basePoints * currentCombo * multiplier;
                spawnFloater(target.x, target.y, `+${basePoints*currentCombo*multiplier}`, color);

                if (target.type === 'GOLD') {
                    setHealth(h => Math.min(h + 20, 100));
                    AudioEngine.powerup();
                    spawnFloater(target.x, target.y - 30, "HEALED!", colors.success);
                }
                if (target.type === 'SHIELD') {
                    shieldRef.current = true; setShieldActive(true);    
                    AudioEngine.powerup();
                    spawnFloater(target.x, target.y - 30, "FIREWALL", colors.shield);
                }
                if (target.type === 'FREEZE') {
                    freezeTimer.current = SETTINGS.freezeDuration;
                    setIsFrozen(true);
                    AudioEngine.powerup();
                    spawnFloater(window.innerWidth/2, window.innerHeight/2, "LAG SPIKE", colors.freeze);
                }

                currentCombo = Math.min(currentCombo + 1, 8);
                target.dead = true; 
                lifetimeStatsRef.current.totalKills++;
                lifetimeStatsRef.current.lifetimeKills++;
                if(isOverclocked) lifetimeStatsRef.current.overclockKills++;
            });

            lifetimeStatsRef.current.maxCombo = Math.max(lifetimeStatsRef.current.maxCombo, currentCombo);
            setScore(s => s + totalPoints);
            scoreRef.current += totalPoints;
            setCombo(currentCombo);
            comboTimer.current = 0;
            
            const hasRam = inventory.includes('ram_upgrade');
            const cost = hasRam ? SETTINGS.nukeCost * 0.8 : SETTINGS.nukeCost;
            scoreSinceNuke.current += totalPoints;
            setNukeCharge(Math.min((scoreSinceNuke.current / cost) * 100, 100));
            
            enemiesRef.current = enemiesRef.current.filter(e => !e.dead);
            setCurrentInput(''); 
          }
        } else {
            setIsFlowState(false);
            setFlow(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentInput, combo, isFlowState, themeId, isOverclocked, inventory]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, isFlowState, themeId, weather, isOverclocked, chaosMode, inventory]);

  const startGame = () => {
    AudioEngine.init();
    AudioEngine.startDrone();
    enemiesRef.current = [];
    particlesRef.current = [];
    floatersRef.current = [];
    setScore(0);
    scoreRef.current = 0; 
    setHealth(100);
    setCombo(1);
    setLevel(1);
    setCurrentInput('');
    setFlow(0);
    setIsFlowState(false);
    setWeather('CLEAR');
    setChaosMode(false);
    setIsOverclocked(false);
    
    // STARTUP UPGRADE
    const hasStartup = inventory.includes('startup_script');
    shieldRef.current = hasStartup; 
    setShieldActive(hasStartup);    
    
    setIsFrozen(false);
    scoreSinceNuke.current = 1500;
    setNukeCharge(100);
    difficultyMultiplier.current = 1.0;
    nextLevelThreshold.current = SETTINGS.levelUpScore;
    statsRef.current = { totalKeys: 0, correctKeys: 0, startTime: Date.now() }; 
    lifetimeStatsRef.current.totalKills = 0;
    setGameState('PLAYING');
  };

  const endGame = () => {
    setGameState('GAMEOVER');
    AudioEngine.stopDrone();
    calculateFinalStats(); 
    updateLeaderboard(scoreRef.current);
    saveStats(scoreRef.current);
    AudioEngine.error();
    triggerShake(10);
    cancelAnimationFrame(requestRef.current);
  };

  // --- UI Components ---
  const AchievementsPanel = () => (
      <div style={{
          position:'absolute', top:0, left:0, width:'100%', height:'100%',
          background: 'rgba(0,0,0,0.9)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex: 300
      }}>
          <h2 style={{color: colors.gold}}>ACHIEVEMENTS</h2>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10, maxHeight:'60vh', overflowY:'auto'}}>
              {ACHIEVEMENT_DATA.map(ach => {
                  const unlocked = unlockedAchievements.includes(ach.id);
                  return (
                      <div key={ach.id} style={{
                          padding: 10, border: `1px solid ${unlocked ? colors.success : '#333'}`,
                          background: unlocked ? 'rgba(0,255,0,0.1)' : 'transparent',
                          width: 250
                      }}>
                          <div style={{color: unlocked ? colors.highlight : '#666', fontWeight:'bold'}}>{ach.name}</div>
                          <div style={{fontSize: 12, color: '#888'}}>{ach.desc}</div>
                      </div>
                  );
              })}
          </div>
          <button onClick={()=>setShowAchievements(false)} style={{marginTop:20, padding:'10px 30px', background: colors.storage, border:'none', cursor:'pointer'}}>CLOSE</button>
      </div>
  );

  const ShopPanel = () => (
      <div style={{
          position:'absolute', top:0, left:0, width:'100%', height:'100%',
          background: 'rgba(0,0,0,0.95)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex: 300
      }}>
          <h2 style={{color: colors.trap}}>THE BLACK MARKET</h2>
          <div style={{fontSize: 20, color: colors.gold, marginBottom: 20}}>BALANCE: {bits} BITS</div>
          <div style={{display:'grid', gridTemplateColumns:'1fr', gap: 10, maxHeight:'60vh', overflowY:'auto'}}>
              {UPGRADES.map(u => {
                  const owned = inventory.includes(u.id);
                  const canAfford = bits >= u.cost;
                  return (
                      <div key={u.id} style={{
                          padding: 15, border: `1px solid ${owned ? colors.success : '#333'}`,
                          background: owned ? 'rgba(0,255,0,0.1)' : 'rgba(255,255,255,0.05)',
                          width: 400, display: 'flex', justifyContent:'space-between', alignItems:'center'
                      }}>
                          <div>
                              <div style={{color: colors.highlight, fontWeight:'bold'}}>{u.name}</div>
                              <div style={{fontSize: 12, color: '#888'}}>{u.desc}</div>
                          </div>
                          {owned ? (
                              <span style={{color: colors.success}}>OWNED</span>
                          ) : (
                              <button 
                                  onClick={() => buyUpgrade(u)}
                                  disabled={!canAfford}
                                  style={{
                                      background: canAfford ? colors.storage : '#333', color: canAfford ? 'black' : '#666',
                                      border: 'none', padding: '5px 15px', cursor: canAfford ? 'pointer' : 'not-allowed'
                                  }}>
                                  BUY {u.cost}
                              </button>
                          )}
                      </div>
                  );
              })}
          </div>
          <button onClick={()=>setShowShop(false)} style={{marginTop:20, padding:'10px 30px', background: colors.storage, border:'none', cursor:'pointer'}}>LEAVE</button>
      </div>
  );

  const getWordColor = (word, type) => {
      if (type === 'BOSS') return colors.boss;
      if (type === 'CHAOS') return colors.chaos;
      if (type === 'GOLD') return colors.gold;
      if (type === 'SHIELD') return colors.shield;
      if (type === 'FREEZE') return colors.freeze;
      if (type === 'CHAIN') return colors.chain;
      if (type === 'LEAK') return colors.leak;
      if (type === 'TRAP') return colors.trap;
      if (type === 'MINI') return colors.mini;
      if (KEYWORDS.includes(word)) return colors.keyword;
      if (TYPES.includes(word)) return colors.type;
      if (PACKAGES.includes(word)) return colors.storage;
      return colors.text;
  };

  const renderWord = (enemy) => {
    const { word, type } = enemy;
    const isMatched = word.toLowerCase().startsWith(currentInput);
    const baseColor = getWordColor(word, type);

    if (isMatched) {
      const matchLen = currentInput.length;
      return (
        <>
          <span style={{ color: colors.highlight, textShadow: `0 0 10px ${colors.highlight}` }}>
            {word.slice(0, matchLen)}
          </span>
          <span style={{ color: baseColor }}>{word.slice(matchLen)}</span>
        </>
      );
    }
    return <span style={{ color: baseColor }}>{word}</span>;
  };

  const shakeStyle = shake > 0 ? { transform: `translate(${(Math.random()-0.5)*shake}px, ${(Math.random()-0.5)*shake}px)` } : {};
  const freezeStyle = isFrozen ? { filter: 'hue-rotate(180deg) contrast(1.2)' } : {};
  const panicStyle = (health < 30 && gameState === 'PLAYING') ? { boxShadow: 'inset 0 0 100px rgba(255,0,0,0.2)', animation: 'panic 1s infinite' } : {};
  const flowStyle = isFlowState ? { boxShadow: `inset 0 0 50px ${colors.flow}` } : {};
  const stormStyle = weather === 'STORM' ? { backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent)', backgroundSize: '40px 40px', animation: 'wind 1s linear infinite' } : {};
  const chaosStyle = chaosMode ? { transform: 'scaleY(-1)', filter: 'invert(1)' } : {};
  const overclockStyle = isOverclocked ? { animation: 'jitter 0.1s infinite', border: `4px solid ${colors.trap}`, boxShadow: `inset 0 0 30px ${colors.trap}` } : {};

  return (
    <div style={{
      width: '100vw', height: '100vh', backgroundColor: colors.bg, 
      fontFamily: '"Fira Code", monospace', overflow: 'hidden', position: 'relative', userSelect: 'none',
      transition: 'filter 0.5s', 
      ...shakeStyle, ...freezeStyle, ...panicStyle, ...flowStyle, ...chaosStyle, ...overclockStyle
    }}>
      <canvas ref={backgroundRef} width={window.innerWidth} height={window.innerHeight} style={{position:'absolute', top:0, left:0, opacity: 0.2}} />

      <div style={{
          position:'absolute', top:0, left:0, width:'100%', height:'100%', pointerEvents:'none', zIndex: 99,
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 2px, 3px 100%', ...stormStyle
      }} />
      
      {showAchievements && <AchievementsPanel />}
      {showShop && <ShopPanel />}

      <div style={{width:'100%', height:'100%'}}>
          <div style={{ position: 'absolute', top: 20, left: 20, fontSize: 24, color: colors.text, zIndex: 10 }}>
            <div>SCORE: <span style={{color: colors.storage}}>{score}</span></div>
            <div style={{fontSize: 18, color: colors.chain}}>LEVEL {level}</div>
            <div>HEALTH: <span style={{color: health < 30 ? colors.boss : colors.success}}>{health}%</span></div>
            
            <div style={{display:'flex', gap: 10, marginTop: 10}}>
                {shieldActive && <div style={{background: colors.shield, padding: '2px 8px', borderRadius: 4, color: 'black', fontSize: 16, fontWeight: 'bold'}}>FIREWALL</div>}
                {isFrozen && <div style={{background: colors.freeze, padding: '2px 8px', borderRadius: 4, color: 'black', fontSize: 16, fontWeight: 'bold'}}>LAG SPIKE</div>}
                {isFlowState && <div style={{background: colors.flow, padding: '2px 8px', borderRadius: 4, color: 'black', fontSize: 16, fontWeight: 'bold'}}>FLOW STATE</div>}
                {isOverclocked && <div style={{background: colors.trap, padding: '2px 8px', borderRadius: 4, color: 'white', fontSize: 16, fontWeight: 'bold'}}>OVERCLOCKED</div>}
            </div>

            <div style={{marginTop: 15, fontSize: 16}}>
                GC [ENTER]
                <div style={{ width: 200, height: 10, background: '#333', marginTop: 5, borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${nukeCharge}%`, height: '100%', background: colors.nuke, transition: 'width 0.2s' }} />
                </div>
            </div>

            <div style={{marginTop: 15, fontSize: 16}}>
                FLOW
                <div style={{ width: 200, height: 5, background: '#333', marginTop: 5, borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${(flow/SETTINGS.flowMax)*100}%`, height: '100%', background: colors.flow, transition: 'width 0.1s' }} />
                </div>
            </div>
            
            {combo > 1 && (
                <div style={{ marginTop: 10, fontSize: 30, color: colors.gold, fontWeight: 'bold', animation: 'pulse 0.2s' }}>
                    {combo}x
                </div>
            )}
          </div>

          {enemiesRef.current.map(e => (
            <div key={e.id} style={{
              position: 'absolute', left: e.x, top: e.y, 
              fontSize: (e.type === 'BOSS' || e.type === 'CHAOS') ? '40px' : (e.type === 'MINI' ? '18px' : '24px'), 
              fontWeight: 'bold', padding: '5px 10px',
              background: e.word.toLowerCase().startsWith(currentInput) && currentInput.length > 0 ? 'rgba(88, 166, 255, 0.15)' : 'transparent',
              borderRadius: '4px',
              textShadow: e.type === 'LEAK' ? `0 0 10px ${colors.leak}` : (e.type === 'TRAP' ? `0 0 10px ${colors.trap}` : 'none'),
              border: e.type === 'SHIELD' ? `2px solid ${colors.shield}` : (e.type === 'CHAIN' ? `2px dashed ${colors.chain}` : 'none'),
              color: getWordColor(e.word, e.type)
            }}>
              {renderWord(e)}
            </div>
          ))}

          {particlesRef.current.map(p => (
              <div key={p.id} style={{
                  position: 'absolute', left: p.x, top: p.y, width: 8, height: 8, 
                  backgroundColor: p.color, opacity: p.life, transform: `scale(${p.life})`
              }} />
          ))}
          {floatersRef.current.map(f => (
              <div key={f.id} style={{
                  position: 'absolute', left: f.x, top: f.y, color: f.color,
                  fontSize: 20, fontWeight: 'bold', opacity: f.life, pointerEvents: 'none',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)', width: 300, textAlign: 'center', transform: 'translateX(-50%)'
              }}>
                  {f.text}
              </div>
          ))}
      </div>

      <div style={{
        position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-50%)',
        fontSize: 30, color: colors.storage, border: `1px solid #30363d`, 
        padding: '10px 30px', borderRadius: 8, background: '#161b22', minWidth: '200px', textAlign: 'center', zIndex: 101
      }}>
        {currentInput || "..."}<span className="blink">|</span>
      </div>

      {gameState === 'PAUSED' && (
          <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 102
          }}>
              <h1 style={{color:'white', fontSize: 60}}>PAUSED</h1>
          </div>
      )}

      {shieldActive && (
          <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              border: `4px solid ${colors.shield}`, pointerEvents: 'none',
              boxShadow: `inset 0 0 50px ${colors.shield}`, zIndex: 90
          }} />
      )}

      {gameState !== 'PLAYING' && gameState !== 'PAUSED' && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(13, 17, 23, 0.95)', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', zIndex: 200
        }}>
          <h1 style={{ color: 'white', fontSize: 50, marginBottom: 10 }}>
            {gameState === 'START' ? 'SYNTAX SURVIVOR' : 'FATAL ERROR'}
          </h1>
          
          {gameState === 'START' && (
            <div style={{ color: colors.text, fontSize: 18, marginBottom: 20, textAlign: 'center', lineHeight: '1.6' }}>
                <p>Type keywords. <span style={{color:colors.trap}}>AVOID RED TRAPS.</span> Kill <span style={{color:colors.leak}}>LEAKS</span> fast.</p>
                <div style={{marginTop: 20, fontSize: 14, color:'#888'}}>Use [1-3] to change Theme. [TAB] to Overclock.</div>
                <div style={{display:'flex', gap:20, justifyContent:'center'}}>
                    <button onClick={()=>setShowAchievements(true)} style={{marginTop:10, padding:'5px 15px', background:'transparent', border:`1px solid ${colors.gold}`, color:colors.gold, cursor:'pointer'}}>🏆 ACHIEVEMENTS</button>
                    <button onClick={()=>setShowShop(true)} style={{marginTop:10, padding:'5px 15px', background:'transparent', border:`1px solid ${colors.trap}`, color:colors.trap, cursor:'pointer'}}>🛒 MARKET</button>
                </div>
            </div>
          )}

          {gameState === 'GAMEOVER' && (
              <div style={{marginBottom: 20, display: 'flex', gap: 20, textAlign: 'center'}}>
                  <div>
                      <div style={{fontSize: 14, color: '#666'}}>WPM</div>
                      <div style={{fontSize: 30, color: colors.highlight}}>{gameStats.wpm}</div>
                  </div>
                  <div>
                      <div style={{fontSize: 14, color: '#666'}}>SCORE</div>
                      <div style={{fontSize: 30, color: colors.gold}}>{score}</div>
                  </div>
                  <div>
                      <div style={{fontSize: 14, color: '#666'}}>BITS EARNED</div>
                      <div style={{fontSize: 30, color: colors.storage}}>+{Math.floor(score/100)}</div>
                  </div>
              </div>
          )}

          {/* LEADERBOARD */}
          <div style={{
              padding: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 10, 
              width: '350px', maxHeight: '300px', overflowY: 'auto', marginBottom: 20
          }}>
              <h3 style={{color: colors.gold, marginTop: 0, borderBottom: '1px solid #444', paddingBottom: 10, position: 'sticky', top: 0, background: '#161b22'}}>TOP 50 RUNS</h3>
              {leaderboard.map((entry, i) => (
                  <div key={i} style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 4}}>
                      <span style={{color: '#888'}}>#{i+1} {entry.date}</span>
                      <span style={{color: colors.highlight, fontWeight: 'bold'}}>{entry.score}</span>
                  </div>
              ))}
          </div>

          <div style={{display: 'flex', gap: '20px'}}>
            <button onClick={startGame} style={{padding: '15px 40px', fontSize: 24, background: colors.success, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'}}>{gameState === 'START' ? 'npm start' : 'Retry'}</button>
            {gameState === 'GAMEOVER' && (
                <button onClick={() => setGameState('START')} style={{padding: '15px 40px', fontSize: 24, background: '#30363d', color: 'white', border: '1px solid #8b949e', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold'}}>Menu</button>
            )}
          </div>
          
          <button onClick={resetData} style={{marginTop: 30, background:'transparent', border:'none', color:'#444', fontSize: 12, cursor:'pointer'}}>RESET DATA</button>
        </div>
      )}

      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        .blink { animation: blink 1s step-end infinite; }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
        @keyframes panic { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        @keyframes wind { 0% { background-position: 0 0; } 100% { background-position: 100px 100px; } }
        @keyframes jitter { 0% { transform: translate(0,0); } 25% { transform: translate(1px, 1px); } 50% { transform: translate(-1px, -1px); } 75% { transform: translate(1px, -1px); } 100% { transform: translate(0,0); } }
      `}</style>
    </div>
  );
};

export default SyntaxSurvivor;