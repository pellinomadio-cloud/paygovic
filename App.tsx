
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Input from './components/Input';
import Select from './components/Select';
import { COUNTRIES, PayGoBanner, BANKS } from './constants';

// --- Lists for Live Notifications ---
const NIGERIAN_NAMES = ['Joseph', 'Aisha', 'Emeka', 'Funke', 'Ibrahim', 'Chioma', 'Abubakar', 'Ngozi', 'Tunde', 'Zainab', 'Chidi', 'Bisi', 'Umar', 'Ify', 'Sani', 'Yemi'];
const NIGERIAN_STATES = ['Lagos', 'Kogi', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Enugu', 'Kaduna', 'Delta', 'Anambra', 'Edo', 'Ogun', 'Plateau', 'Benue', 'Akwa Ibom', 'Imo'];
const WITHDRAWAL_AMOUNTS = ['180,000', '150,000', '250,000', '120,000', '300,000', '200,000', '180,000'];

// --- Types for Wallet Management ---
interface Transaction {
  id: string;
  type: 'Credit' | 'Debit';
  label: string;
  amount: number;
  date: string;
}

interface UserWallet {
  balance: number;
  transactions: Transaction[];
}

// --- Live Notification Component ---
const LiveWithdrawalFeed: React.FC = () => {
  const [notification, setNotification] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showNext = () => {
      const name = NIGERIAN_NAMES[Math.floor(Math.random() * NIGERIAN_NAMES.length)];
      const state = NIGERIAN_STATES[Math.floor(Math.random() * NIGERIAN_STATES.length)];
      const amount = WITHDRAWAL_AMOUNTS[Math.floor(Math.random() * WITHDRAWAL_AMOUNTS.length)];
      
      setNotification(`${name} just withdrew ₦${amount} from ${state}`);
      setVisible(true);

      // Hide after 2 seconds
      setTimeout(() => {
        setVisible(false);
      }, 2000);
    };

    // Initial delay
    const initialTimeout = setTimeout(showNext, 1000);
    const interval = setInterval(showNext, 3000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!notification) return null;

  return (
    <div 
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] transition-all duration-500 transform ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl flex items-center space-x-2 border border-white/10">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        <p className="text-[9px] font-bold uppercase tracking-tight whitespace-nowrap">
          {notification}
        </p>
      </div>
    </div>
  );
};

// --- Helper for Local Storage Wallet ---
const getWallet = (email: string): UserWallet => {
  const data = localStorage.getItem(`paygo_wallet_${email}`);
  if (data) return JSON.parse(data);
  const initial: UserWallet = {
    balance: 180000,
    transactions: [
      {
        id: 'init-1',
        type: 'Credit',
        label: 'Welcome Bonus',
        amount: 180000,
        date: new Date().toLocaleDateString()
      }
    ]
  };
  localStorage.setItem(`paygo_wallet_${email}`, JSON.stringify(initial));
  return initial;
};

const updateWallet = (email: string, wallet: UserWallet) => {
  localStorage.setItem(`paygo_wallet_${email}`, JSON.stringify(wallet));
};

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      try {
        const existingUsers = JSON.parse(localStorage.getItem('paygo_users') || '[]');
        const userExists = existingUsers.some((u: any) => u.email.toLowerCase() === formData.email.toLowerCase());

        if (userExists) {
          setError('An account with this email already exists on this device.');
          setLoading(false);
          return;
        }

        const newUser = { ...formData, profilePic: null, level: 'Basic' };
        existingUsers.push(newUser);
        localStorage.setItem('paygo_users', JSON.stringify(existingUsers));
        
        // Initialize wallet for new user
        getWallet(formData.email);

        setLoading(false);
        navigate('/welcome', { state: { name: formData.name, email: formData.email } });
      } catch (err) {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <h1 className="text-xl font-bold text-[#1a1b3a] mb-6 text-center dark:text-white">
        Register to continue
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="w-full space-y-3">
        <Input 
          placeholder="Enter Name" 
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          className="border-[#ebe8e5]"
        />
        <Input 
          type="email" 
          placeholder="Enter Email" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <Select 
          options={COUNTRIES} 
          value={formData.country}
          onChange={(e) => setFormData({...formData, country: e.target.value})}
          required
        />
        <Input 
          type="password" 
          placeholder="Enter Password" 
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />

        <button 
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-black text-white rounded-2xl text-base font-medium mt-6 hover:bg-gray-900 transition-colors shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center dark:bg-purple-600 dark:hover:bg-purple-700"
        >
          {loading ? (
            <i className="fas fa-circle-notch animate-spin"></i>
          ) : (
            'Register'
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link to="/login" className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors dark:text-purple-400">
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
};

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name || "User";
  const email = location.state?.email || "";

  return (
    <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-500">
      <PayGoBanner />
      
      <h1 className="text-2xl font-bold text-purple-900 mb-6 text-center leading-tight dark:text-purple-300">
        Welcome to<br />PayGo!
      </h1>

      <div className="w-full bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm mb-8 text-center dark:bg-gray-800 dark:border-gray-700">
        <p className="text-gray-600 text-sm leading-relaxed dark:text-gray-400">
          As a new user, you'll receive a generous welcome bonus of
        </p>
        <p className="text-xl font-bold text-purple-600 my-1">
          ₦180,000
        </p>
        <p className="text-gray-600 text-sm leading-relaxed dark:text-gray-400">
          which can be withdrawn at any time. Yes, you read that right - it's yours to keep!
        </p>
      </div>

      <button 
        onClick={() => navigate('/onboarding', { state: { name, email } })}
        className="w-full h-14 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-2xl text-base font-semibold shadow-xl hover:opacity-90 transition-all active:scale-[0.98]"
      >
        Continue to Dashboard
      </button>
    </div>
  );
};

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const name = location.state?.name || "User";
  const email = location.state?.email || "";

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      navigate('/dashboard', { state: { name, email } });
    }
  };

  const onboardingSteps = [
    {
      title: "Welcome Bonus",
      text: "You've received a welcome bonus of ₦180,000! This amount is already in your account and can be withdrawn after purchasing a PAY ID.",
      icon: <i className="fas fa-gift text-purple-600 text-xl"></i>,
    },
    {
      title: "Get Your PAY ID",
      text: "To withdraw funds, you'll need to purchase a PAY ID for ₦6,500. This is a one-time purchase that unlocks all features of the app.",
      icon: <i className="fas fa-id-card text-blue-600 text-xl"></i>,
    },
    {
      title: "Zero Fees",
      text: "Enjoy zero transaction fees on your first 10 transfers every month. PayGo makes it easy and affordable to move your money.",
      icon: <i className="fas fa-percentage text-green-600 text-xl"></i>,
    },
    {
      title: "Secure Payments",
      text: "Our platform uses bank-grade encryption to ensure your funds and data are always safe. Your security is our top priority.",
      icon: <i className="fas fa-shield-alt text-indigo-600 text-xl"></i>,
    },
    {
      title: "Refer and Earn",
      text: "Invite your friends to PayGo and earn ₦2,000 for every successful referral. There's no limit to how much you can earn!",
      icon: <i className="fas fa-users text-orange-600 text-xl"></i>,
    }
  ];

  const currentStepData = onboardingSteps[step - 1];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="w-full max-sm:max-w-xs max-w-sm bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 dark:bg-gray-900">
        <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 p-6 pb-8 text-white">
          <button 
            onClick={() => navigate('/dashboard', { state: { name, email } })}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
          
          <h2 className="text-xl font-bold leading-tight mb-2">
            Welcome to PayGo,<br />{name}!
          </h2>
          <p className="text-white/80 text-xs mb-4">Step {step} of {totalSteps}</p>
          
          <div className="flex space-x-2">
            {[...Array(totalSteps)].map((_, i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-5 shadow-inner dark:bg-gray-800">
            {currentStepData.icon}
          </div>
          
          <h3 className="text-lg font-bold text-gray-800 mb-3 dark:text-gray-100">
            {currentStepData.title}
          </h3>
          
          <p className="text-gray-500 text-sm leading-relaxed mb-8 px-2 dark:text-gray-400">
            {currentStepData.text}
          </p>

          <button 
            onClick={handleNext}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-2xl text-base font-semibold shadow-xl hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center"
          >
            {step === totalSteps ? 'Get Started' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

const EarnMoneyPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const name = location.state?.name || "User";
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [wallet, setWallet] = useState<UserWallet>(() => getWallet(email));
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const checkTimer = () => {
      const nextClaim = localStorage.getItem(`paygo_next_claim_${email}`);
      if (nextClaim) {
        const diff = Math.ceil((parseInt(nextClaim) - Date.now()) / 1000);
        if (diff > 0) {
          setTimeLeft(diff);
        } else {
          setTimeLeft(0);
        }
      }
    };

    checkTimer();
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [email, claiming]);

  const handleClaim = () => {
    if (timeLeft > 0 || claiming) return;

    setClaiming(true);
    
    // Simulate slight delay for effect
    setTimeout(() => {
      const amount = 1000;
      const newWallet: UserWallet = {
        balance: wallet.balance + amount,
        transactions: [
          {
            id: `earn-${Date.now()}`,
            type: 'Credit',
            label: 'Minute Reward',
            amount: amount,
            date: new Date().toLocaleDateString()
          },
          ...wallet.transactions
        ]
      };
      
      updateWallet(email, newWallet);
      setWallet(newWallet);
      
      // Set next claim time to 1 minute from now
      const nextClaimTime = Date.now() + 60000;
      localStorage.setItem(`paygo_next_claim_${email}`, nextClaimTime.toString());
      
      setClaiming(false);
      alert("₦1,000 credited to your wallet!");
    }, 800);
  };

  return (
    <div className="w-full animate-in fade-in duration-500 dark:text-white">
      <div className="flex items-center bg-gradient-to-r from-orange-500 to-amber-600 text-white p-3 -mx-8 -mt-8 mb-6 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-3">
          <i className="fas fa-arrow-left text-lg"></i>
        </button>
        <h1 className="text-lg font-bold">Earn More</h1>
      </div>

      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-amber-900/20">
          <i className="fas fa-money-bill-trend-up text-amber-600 text-3xl animate-bounce"></i>
        </div>
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2 leading-tight">Claim Free Naira</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available every 1 minute</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-50 dark:bg-gray-800 dark:border-gray-700 text-center mb-8">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Time Remaining</p>
        <div className="text-6xl font-black text-purple-600 tabular-nums mb-8 drop-shadow-sm">
          {timeLeft > 0 ? `00:${timeLeft.toString().padStart(2, '0')}` : '00:00'}
        </div>
        
        <button 
          onClick={handleClaim}
          disabled={timeLeft > 0 || claiming}
          className={`w-full h-16 rounded-2xl text-lg font-black shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-3 ${
            timeLeft > 0 || claiming 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90'
          }`}
        >
          {claiming ? (
             <i className="fas fa-circle-notch animate-spin"></i>
          ) : (
            <>
              <i className="fas fa-gift"></i>
              <span>{timeLeft > 0 ? 'Wait...' : 'Claim ₦1,000'}</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-purple-50 rounded-3xl p-6 border border-purple-100 dark:bg-purple-900/20 dark:border-purple-900/30">
        <h3 className="text-sm font-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center">
          <i className="fas fa-info-circle mr-2"></i>
          How it works
        </h3>
        <p className="text-[11px] text-purple-700/70 dark:text-purple-400 font-medium leading-relaxed">
          Stay on this page or come back every minute to claim your loyalty reward. The funds are instantly added to your balance and available for all transactions.
        </p>
      </div>

      <div className="mt-10 text-center">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">PayGo Rewards Program</p>
      </div>
    </div>
  );
};

const BuyAirtimePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [network, setNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<UserWallet>(() => getWallet(email));

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    const airtimeAmount = Number(amount);
    if (airtimeAmount > wallet.balance) {
      alert("Insufficient balance.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newWallet: UserWallet = {
        balance: wallet.balance - airtimeAmount,
        transactions: [
          {
            id: `airtime-${Date.now()}`,
            type: 'Debit',
            label: `${network} Airtime to ${phoneNumber}`,
            amount: airtimeAmount,
            date: new Date().toLocaleDateString()
          },
          ...wallet.transactions
        ]
      };
      updateWallet(email, newWallet);
      setWallet(newWallet);
      setLoading(false);
      alert(`Success! ₦${airtimeAmount} Airtime sent to ${phoneNumber}`);
      navigate('/dashboard', { state: location.state });
    }, 1500);
  };

  return (
    <div className="w-full animate-in fade-in duration-500 dark:text-white">
      <div className="flex items-center bg-purple-600 text-white p-3 -mx-8 -mt-8 mb-6 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-3"><i className="fas fa-arrow-left"></i></button>
        <h1 className="text-lg font-bold">Buy Airtime</h1>
      </div>
      <form onSubmit={handleBuy} className="space-y-4">
        <select value={network} onChange={(e) => setNetwork(e.target.value)} required className="w-full h-14 px-6 rounded-2xl border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-purple-600 outline-none">
          <option value="">Select Network</option>
          <option value="MTN">MTN</option>
          <option value="Airtel">Airtel</option>
          <option value="Glo">Glo</option>
          <option value="9mobile">9mobile</option>
        </select>
        <Input placeholder="Phone Number" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        <Input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <button type="submit" disabled={loading} className="w-full h-14 bg-purple-600 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center">
          {loading ? <i className="fas fa-circle-notch animate-spin"></i> : `Buy Airtime`}
        </button>
      </form>
    </div>
  );
};

const BuyDataPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [network, setNetwork] = useState('');
  const [plan, setPlan] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<UserWallet>(() => getWallet(email));

  const plans = [
    { label: '1GB - ₦300', value: '300' },
    { label: '2GB - ₦600', value: '600' },
    { label: '5GB - ₦1500', value: '1500' },
    { label: '10GB - ₦3000', value: '3000' },
  ];

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    const dataAmount = Number(plan);
    if (dataAmount > wallet.balance) {
      alert("Insufficient balance.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newWallet: UserWallet = {
        balance: wallet.balance - dataAmount,
        transactions: [
          {
            id: `data-${Date.now()}`,
            type: 'Debit',
            label: `${network} Data to ${phoneNumber}`,
            amount: dataAmount,
            date: new Date().toLocaleDateString()
          },
          ...wallet.transactions
        ]
      };
      updateWallet(email, newWallet);
      setWallet(newWallet);
      setLoading(false);
      alert(`Success! Data plan credited to ${phoneNumber}`);
      navigate('/dashboard', { state: location.state });
    }, 1500);
  };

  return (
    <div className="w-full animate-in fade-in duration-500 dark:text-white">
      <div className="flex items-center bg-purple-600 text-white p-3 -mx-8 -mt-8 mb-6 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-3"><i className="fas fa-arrow-left"></i></button>
        <h1 className="text-lg font-bold">Buy Data</h1>
      </div>
      <form onSubmit={handleBuy} className="space-y-4">
        <select value={network} onChange={(e) => setNetwork(e.target.value)} required className="w-full h-14 px-6 rounded-2xl border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-purple-600 outline-none">
          <option value="">Select Network</option>
          <option value="MTN">MTN</option>
          <option value="Airtel">Airtel</option>
          <option value="Glo">Glo</option>
          <option value="9mobile">9mobile</option>
        </select>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} required className="w-full h-14 px-6 rounded-2xl border border-gray-100 bg-white dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-purple-600 outline-none">
          <option value="">Select Data Plan</option>
          {plans.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <Input placeholder="Phone Number" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
        <button type="submit" disabled={loading} className="w-full h-14 bg-purple-600 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center">
          {loading ? <i className="fas fa-circle-notch animate-spin"></i> : `Buy Data`}
        </button>
      </form>
    </div>
  );
};

const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const wallet = useMemo(() => getWallet(email), [email]);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20 dark:text-white">
      <div className="flex items-center bg-purple-600 text-white p-3 -mx-8 -mt-8 mb-6 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-3">
          <i className="fas fa-arrow-left text-lg"></i>
        </button>
        <h1 className="text-lg font-bold">All Transactions</h1>
      </div>

      <div className="space-y-2.5 px-1">
        {wallet.transactions.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-10">No transactions yet.</p>
        ) : (
          wallet.transactions.map((tx) => (
            <div key={tx.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  tx.type === 'Credit' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  <i className={`fas ${tx.type === 'Credit' ? 'fa-arrow-down' : 'fa-arrow-up'} text-sm`}></i>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{tx.label}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">{tx.date}</p>
                </div>
              </div>
              <div className={`text-sm font-black ${
                tx.type === 'Credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {tx.type === 'Credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [userData, setUserData] = useState<any>(null);
  const [name, setName] = useState('');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('paygo_users') || '[]');
    const user = users.find((u: any) => u.email === email);
    if (user) {
      setUserData(user);
      setName(user.name);
      setProfilePic(user.profilePic);
    }
  }, [email]);

  const handleToggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePic(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    const users = JSON.parse(localStorage.getItem('paygo_users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.email === email ? { ...u, name, profilePic } : u
    );
    localStorage.setItem('paygo_users', JSON.stringify(updatedUsers));
    alert('Profile updated successfully!');
    navigate('/dashboard', { state: { name, email } });
  };

  return (
    <div className="w-full animate-in fade-in duration-500 dark:text-white">
      <div className="flex items-center bg-purple-600 text-white p-3 -mx-8 -mt-8 mb-6 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-3">
          <i className="fas fa-arrow-left text-lg"></i>
        </button>
        <h1 className="text-lg font-bold">Profile Settings</h1>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full border-4 border-purple-100 bg-purple-50 flex items-center justify-center overflow-hidden shadow-inner dark:border-gray-700 dark:bg-gray-800">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-purple-600">{name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white border-2 border-white cursor-pointer hover:scale-110 transition-transform">
            <i className="fas fa-camera text-xs"></i>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>
        <p className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{email}</p>
        <p className="mt-1 text-[10px] font-black text-purple-600 uppercase">Account Level: {userData?.level || 'Basic'}</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-2">Display Name</label>
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-[2rem] p-5 flex items-center justify-between shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 dark:bg-gray-700 dark:text-purple-400">
              <i className="fas fa-moon"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Dark Mode</p>
              <p className="text-[10px] text-gray-400 font-medium">Switch app theme</p>
            </div>
          </div>
          <button 
            onClick={handleToggleDarkMode}
            className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-purple-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        <button 
          onClick={handleSave}
          className="w-full h-14 bg-black text-white rounded-2xl text-base font-bold shadow-xl active:scale-95 transition-all mt-4 dark:bg-purple-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

const UpgradeAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const name = location.state?.name || "User";

  const [view, setView] = useState<'selection' | 'details' | 'loading' | 'success' | 'bonus_info'>('selection');
  const [selectedLevel, setSelectedLevel] = useState<{name: string, price: string} | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  const levels = [
    { name: 'Silver', price: '₦5,500', icon: <i className="fas fa-square text-orange-400 rotate-45 text-xl"></i> },
    { name: 'Gold', price: '₦7,500', icon: <i className="fas fa-trophy text-yellow-500 text-xl"></i> },
    { name: 'Platinum', price: '₦10,000', icon: <i className="fas fa-bolt text-yellow-400 text-xl"></i> },
    { name: 'Emerald', price: '₦15,000', icon: <i className="fas fa-gem text-blue-300 text-xl"></i> },
    { name: 'Ruby', price: '₦20,000', icon: <i className="fas fa-star text-yellow-400 text-xl"></i> },
    { name: 'Diamond', price: '₦25,000', icon: <i className="fas fa-crown text-yellow-500 text-xl"></i> },
  ];

  const handleLevelSelect = (level: {name: string, price: string}) => {
    setSelectedLevel(level);
    setView('bonus_info');
  };

  const handleProceedToPayment = () => {
    setView('details');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleConfirm = () => {
    if (!selectedFile) {
      setConfirmError('Please upload your payment receipt first.');
      return;
    }
    setConfirmLoading(true);
    setConfirmError('');
    setTimeout(() => {
      setConfirmLoading(false);
      setConfirmError('System on Maintenance. Please try again later.');
    }, 3000);
  };

  if (view === 'loading') {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in">
        <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin mb-6"></div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Verifying Upgrade Payment</h2>
        <div className="w-40 h-1 bg-gray-100 rounded-full mt-3 overflow-hidden">
          <div className="h-full bg-purple-600 transition-all duration-300" style={{width: `${progress}%`}}></div>
        </div>
      </div>
    );
  }

  if (view === 'success') {
    return (
      <div className="w-full py-10 flex flex-col items-center text-center animate-in zoom-in-95">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-check text-3xl"></i>
        </div>
        <h1 className="text-xl font-black text-gray-800 mb-3 uppercase dark:text-white">Upgrade Successful!</h1>
        <p className="text-gray-500 text-sm px-6 mb-8 font-medium dark:text-gray-400">
          Your account has been upgraded to <b>{selectedLevel?.name}</b>. You now have full access to Buy Airtime and Data services.
        </p>
        <button 
          onClick={() => navigate('/dashboard', { state: location.state })}
          className="w-full h-14 bg-purple-600 text-white rounded-2xl text-base font-bold shadow-xl active:scale-95 transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (view === 'bonus_info') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
        <div className="w-full max-sm:max-w-xs max-w-sm bg-white rounded-[2rem] p-8 text-center animate-in zoom-in-95 duration-300 shadow-2xl dark:bg-gray-900">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-gift text-2xl"></i>
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-3 leading-tight dark:text-white">Upgrade Bonus!</h2>
          <p className="text-gray-600 text-sm font-medium mb-8 leading-relaxed dark:text-gray-400">
            You also get a free pay ID after each upgrades.
          </p>
          <button 
            onClick={handleProceedToPayment}
            className="w-full h-14 bg-purple-600 text-white rounded-2xl text-lg font-bold shadow-xl active:scale-95 transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (view === 'details') {
    return (
      <div className="w-full animate-in fade-in duration-500 pb-10">
        <div className="flex items-center bg-purple-600 text-white p-3 -mx-8 -mt-8 mb-6 sticky top-0 z-10">
          <button onClick={() => setView('selection')} className="mr-3">
            <i className="fas fa-arrow-left text-lg"></i>
          </button>
          <h1 className="text-lg font-bold">Upgrade Confirmation</h1>
        </div>

          <div className="space-y-6">
            <div className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 mb-2 dark:bg-gray-800/50 dark:border-purple-900/30">
              <p className="text-[10px] font-bold text-purple-600 mb-4 uppercase tracking-widest dark:text-purple-400">Transfer to the details below:</p>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">Account Number</p>
                  <p className="text-2xl font-black text-purple-900 tracking-tight flex items-center justify-between dark:text-white">
                    8074801162
                    <button onClick={() => {navigator.clipboard.writeText('8074801162'); alert('Copied!');}} className="text-[10px] bg-purple-200 text-purple-700 px-3 py-1 rounded-lg font-bold dark:bg-purple-900 dark:text-purple-200">COPY</button>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">Account Name</p>
                  <p className="text-lg font-bold text-purple-900 uppercase dark:text-white">Victor Obinna Uche</p>
                </div>
                <div>
                  <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">Bank Name</p>
                  <p className="text-lg font-bold text-purple-900 uppercase dark:text-white">Moniepoint MFB</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-800 mb-4 dark:text-white flex items-center">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px] mr-2">1</span>
                Upload Payment Receipt
              </h3>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  onChange={handleFileChange}
                />
                <div className={`w-full h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${
                  selectedFile ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600'
                }`}>
                  {selectedFile ? (
                    <>
                      <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                      <p className="text-xs font-bold text-green-700 uppercase px-4 truncate max-w-full dark:text-green-400">
                        {selectedFile.name} Attached
                      </p>
                      <button onClick={(e) => {e.preventDefault(); setSelectedFile(null);}} className="text-[10px] mt-2 text-red-500 font-bold uppercase hover:underline">Remove</button>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-cloud-upload-alt text-gray-300 text-3xl mb-2"></i>
                      <p className="text-xs font-bold text-gray-400 uppercase">Click to browse file</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-sm font-bold text-gray-800 mb-4 dark:text-white flex items-center">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px] mr-2">2</span>
                Confirm Payment
              </h3>
              <p className="text-xs text-gray-500 mb-6 dark:text-gray-400">
                After completing your payment and uploading the receipt, click the button below to verify and activate your upgrade.
              </p>
              
              {confirmError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[10px] font-bold animate-shake">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {confirmError}
                </div>
              )}

              <button 
                onClick={handleConfirm}
                disabled={confirmLoading}
                className="w-full h-14 bg-black text-white rounded-2xl text-base font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center disabled:opacity-70"
              >
                {confirmLoading ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  'Confirm Payment'
                )}
              </button>
            </div>
          </div>

        <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-10">PayGo Financial Services LTD</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex items-center bg-purple-600 text-white p-3 -mx-8 -mt-8 mb-6 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-3">
          <i className="fas fa-arrow-left text-lg"></i>
        </button>
        <h1 className="text-lg font-bold">Upgrade Account</h1>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1 dark:text-white">Choose Your Level</h2>
        <p className="text-gray-400 text-xs font-medium dark:text-gray-400">Select a level to view benefits and upgrade</p>
      </div>

      <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex items-center space-x-4 mb-8 dark:bg-gray-800 dark:border-gray-700">
        <div className="w-11 h-11 bg-purple-50 rounded-full flex items-center justify-center dark:bg-gray-700">
          <i className="fas fa-medal text-yellow-500 text-base"></i>
        </div>
        <div>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Current Level</p>
          <p className="text-xl font-black text-gray-800 dark:text-white">Basic</p>
        </div>
      </div>

      <h3 className="font-bold text-gray-800 text-base mb-5 ml-2 dark:text-gray-200">Select Level to Upgrade</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-8">
        {levels.map((level) => (
          <button 
            key={level.name}
            onClick={() => handleLevelSelect(level)}
            className="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-50 flex flex-col items-center hover:border-purple-200 hover:shadow-md transition-all active:scale-95 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-purple-600"
          >
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 dark:bg-gray-700">
              {level.icon}
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase mb-0.5 tracking-tight">{level.name}</p>
            <p className="text-lg font-black text-purple-600 mb-2">{level.price}</p>
            <p className="text-[9px] font-bold text-gray-300 uppercase">Pay this amount</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const BuyPayIdPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name || "User";
  const email = location.state?.email || "";
  
  const [view, setView] = useState<'form' | 'loading' | 'details'>('form');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setView('loading');
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => setView('details'), 500);
      }
    }, 200);
  };

  const handleConfirm = () => {
    if (!selectedFile) {
      setConfirmError('Please upload your payment receipt first.');
      return;
    }
    setConfirmLoading(true);
    setConfirmError('');
    setTimeout(() => {
      setConfirmLoading(false);
      setConfirmError('Payment Failed.');
    }, 3000);
  };

  if (view === 'loading') {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="flex justify-start w-full absolute top-0 left-0 p-4">
          <button onClick={() => setView('form')} className="text-purple-600">
             <i className="fas fa-arrow-left text-lg"></i>
          </button>
        </div>

        <div className="relative w-24 h-24 mb-10">
            <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-3 text-center dark:text-white">Preparing Payment Account</h2>
        <p className="text-gray-500 text-xs mb-10 text-center px-6">Please wait while we set up your payment...</p>

        <div className="w-full max-w-[240px] h-1.5 bg-gray-100 rounded-full overflow-hidden mb-20">
            <div 
                className="h-full bg-slate-900 transition-all duration-300" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>

        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-auto">PayGo Financial Services LTD</p>
      </div>
    );
  }

  if (view === 'details') {
    return (
      <div className="w-full animate-in fade-in duration-500 pb-10">
        <div className="flex items-center bg-purple-600 text-white p-3 -mx-8 -mt-8 mb-6 sticky top-0 z-10">
          <button onClick={() => setView('form')} className="mr-3">
            <i className="fas fa-arrow-left text-lg"></i>
          </button>
          <h1 className="text-lg font-bold">Payment Confirmation</h1>
        </div>

        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 mb-2 dark:bg-gray-800/50 dark:border-purple-900/30">
            <p className="text-[10px] font-bold text-purple-600 mb-4 uppercase tracking-widest dark:text-purple-400">Transfer to the details below:</p>
            
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">Account Number</p>
                <p className="text-2xl font-black text-purple-900 tracking-tight flex items-center justify-between dark:text-white">
                  8074801162
                  <button onClick={() => {navigator.clipboard.writeText('8074801162'); alert('Copied!');}} className="text-[10px] bg-purple-200 text-purple-700 px-3 py-1 rounded-lg font-bold dark:bg-purple-900 dark:text-purple-200">COPY</button>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">Account Name</p>
                <p className="text-lg font-bold text-purple-900 uppercase dark:text-white">Victor Obinna Uche</p>
              </div>
              <div>
                <p className="text-[10px] text-purple-400 font-bold uppercase mb-1">Bank Name</p>
                <p className="text-lg font-bold text-purple-900 uppercase dark:text-white">Moniepoint MFB</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-800 mb-4 dark:text-white flex items-center">
              <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px] mr-2">1</span>
              Upload Payment Receipt
            </h3>
            <div className="relative group">
              <input 
                type="file" 
                accept="image/*,.pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={handleFileChange}
              />
              <div className={`w-full h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${
                selectedFile ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600'
              }`}>
                {selectedFile ? (
                  <>
                    <i className="fas fa-check-circle text-green-500 text-3xl mb-2"></i>
                    <p className="text-xs font-bold text-green-700 uppercase px-4 truncate max-w-full dark:text-green-400">
                      {selectedFile.name} Attached
                    </p>
                    <button onClick={(e) => {e.preventDefault(); setSelectedFile(null);}} className="text-[10px] mt-2 text-red-500 font-bold uppercase hover:underline">Remove</button>
                  </>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt text-gray-300 text-3xl mb-2"></i>
                    <p className="text-xs font-bold text-gray-400 uppercase">Click to browse file</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-sm font-bold text-gray-800 mb-4 dark:text-white flex items-center">
              <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-[10px] mr-2">2</span>
              Confirm Payment
            </h3>
            <p className="text-xs text-gray-500 mb-6 dark:text-gray-400">
              After completing your payment and uploading the receipt, click the button below to verify and activate your PAY ID.
            </p>
            
            {confirmError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[10px] font-bold animate-shake">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {confirmError}
              </div>
            )}

            <button 
              onClick={handleConfirm}
              disabled={confirmLoading}
              className="w-full h-14 bg-black text-white rounded-2xl text-base font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center disabled:opacity-70"
            >
              {confirmLoading ? (
                <i className="fas fa-circle-notch animate-spin"></i>
              ) : (
                'Confirm Payment'
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-10">PayGo Financial Services LTD</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex items-center bg-purple-600 text-white p-3 -mx-8 -mt-8 mb-6">
        <button onClick={() => navigate(-1)} className="mr-3">
          <i className="fas fa-arrow-left text-lg"></i>
        </button>
        <h1 className="text-lg font-bold">Buy PAY ID</h1>
      </div>

      <form onSubmit={handlePay} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2 ml-2 dark:text-gray-200">Amount</label>
          <div className="relative">
            <input 
              readOnly 
              value="₦6,500" 
              className="w-full h-14 px-6 bg-white rounded-2xl border border-gray-100 text-gray-500 text-sm font-medium shadow-sm outline-none dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2 ml-2 dark:text-gray-200">Full Name</label>
          <input 
            readOnly 
            value={name} 
            className="w-full h-14 px-6 bg-white rounded-2xl border border-gray-100 text-gray-500 text-sm font-medium shadow-sm outline-none dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 mb-2 ml-2 dark:text-gray-200">Your Email Address</label>
          <input 
            readOnly 
            value={email || 'user@example.com'} 
            className="w-full h-14 px-6 bg-white rounded-2xl border border-gray-100 text-gray-500 text-sm font-medium shadow-sm outline-none dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <button 
          type="submit"
          className="w-full h-14 bg-purple-600 text-white rounded-2xl text-base font-bold shadow-xl active:scale-95 transition-all mt-6"
        >
          Pay
        </button>
      </form>

      <div className="mt-10 text-center space-y-4">
        <p className="text-[10px] font-bold text-gray-400 px-6 leading-relaxed">
          Your PAY ID will be displayed on the app once your payment is confirmed.
        </p>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">PayGo Financial Services LTD</p>
      </div>
    </div>
  );
};

const TransferPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const name = location.state?.name || "User";
  const email = location.state?.email || "";
  
  const [view, setView] = useState<'form' | 'loading' | 'pin' | 'success'>('form');
  const [formData, setFormData] = useState({
    accountNumber: '',
    accountName: '',
    bank: '',
    amount: ''
  });
  const [payId, setPayId] = useState('');
  const [error, setError] = useState('');
  
  const [wallet, setWallet] = useState<UserWallet>(() => getWallet(email));

  const handleStartTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Number(formData.amount) > wallet.balance) {
      alert("Insufficient balance for this transfer.");
      return;
    }
    
    setView('loading');
    
    // Simulate processing for 5 seconds
    setTimeout(() => {
      setView('pin');
    }, 5000);
  };

  const handleVerifyPayId = (e: React.FormEvent) => {
    e.preventDefault();
    if (payId === 'ID999') {
      const amount = Number(formData.amount);
      const newWallet: UserWallet = {
        balance: wallet.balance - amount,
        transactions: [
          {
            id: `tx-${Date.now()}`,
            type: 'Debit',
            label: `Withdrawal to ${formData.bank}`,
            amount: amount,
            date: new Date().toLocaleDateString()
          },
          ...wallet.transactions
        ]
      };
      
      updateWallet(email, newWallet);
      setWallet(newWallet);
      setView('success');
    } else {
      setError('Invalid PAY ID. Please contact support if you haven\'t purchased one.');
      const el = document.getElementById('pin-input');
      el?.classList.add('animate-shake');
      setTimeout(() => el?.classList.remove('animate-shake'), 400);
    }
  };

  if (view === 'loading') {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-sync-alt text-purple-600 text-2xl animate-spin"></i>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1 dark:text-white">Processing Transfer</h2>
        <p className="text-gray-500 text-xs text-center px-8 dark:text-gray-400">Securing connection to {formData.bank || 'bank'} central servers...</p>
      </div>
    );
  }

  if (view === 'pin') {
    return (
      <div className="w-full animate-in zoom-in-95 duration-300">
        <div className="flex items-center mb-8">
          <button onClick={() => setView('form')} className="mr-3 text-purple-600">
            <i className="fas fa-arrow-left text-lg"></i>
          </button>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white">Verification Required</h1>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl mb-6 dark:bg-amber-900/20 dark:border-amber-900/30">
          <div className="flex items-start space-x-3">
            <i className="fas fa-lock text-amber-600 mt-0.5"></i>
            <div>
              <p className="text-xs font-bold text-amber-900 mb-0.5 dark:text-amber-300">Enter PAY ID</p>
              <p className="text-[10px] text-amber-700 leading-relaxed dark:text-amber-400">
                To complete this withdrawal of ₦{Number(formData.amount).toLocaleString()}, please enter your unique 6-character PAY ID.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-bold animate-shake text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyPayId} id="pin-input">
          <input 
            type="password"
            placeholder="Enter PAY ID"
            value={payId}
            onChange={(e) => setPayId(e.target.value.toUpperCase())}
            className="w-full h-14 px-6 bg-white rounded-2xl border border-gray-200 text-center text-xl font-black tracking-[0.5em] focus:ring-2 focus:ring-purple-600 outline-none mb-6 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            required
          />
          <button 
            type="submit"
            className="w-full h-14 bg-purple-600 text-white rounded-2xl text-base font-bold shadow-xl active:scale-95 transition-all"
          >
            Confirm Withdrawal
          </button>
        </form>
        
        <p className="mt-6 text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">PayGo Secure Payment Gateway</p>
      </div>
    );
  }

  if (view === 'success') {
    return (
      <div className="w-full flex flex-col items-center justify-center py-10 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-check text-green-500 text-3xl"></i>
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-3 text-center dark:text-white">Transfer Successful!</h2>
        <div className="bg-gray-50 rounded-3xl p-6 w-full mb-8 border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex justify-between mb-3 border-b border-gray-100 pb-3 dark:border-gray-700">
            <span className="text-gray-400 font-bold text-[10px] uppercase">Amount</span>
            <span className="text-gray-800 font-black text-sm dark:text-white">₦{Number(formData.amount).toLocaleString()}.00</span>
          </div>
          <div className="flex justify-between mb-3 border-b border-gray-100 pb-3 dark:border-gray-700">
            <span className="text-gray-400 font-bold text-[10px] uppercase">Recipient</span>
            <span className="text-gray-800 font-bold text-xs uppercase dark:text-white">{formData.accountName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400 font-bold text-[10px] uppercase">Bank</span>
            <span className="text-gray-800 font-bold text-xs uppercase dark:text-white">{formData.bank}</span>
          </div>
        </div>
        <button 
          onClick={() => navigate('/dashboard', { state: { name, email } })}
          className="w-full h-14 bg-black text-white rounded-2xl text-base font-bold shadow-xl"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex items-center bg-purple-600 text-white p-3 -mx-8 -mt-8 mb-6">
        <button onClick={() => navigate(-1)} className="mr-3">
          <i className="fas fa-arrow-left text-lg"></i>
        </button>
        <h1 className="text-lg font-bold">Transfer Money</h1>
      </div>

      <form onSubmit={handleStartTransfer} className="space-y-4">
        <div className="bg-purple-50 p-5 rounded-3xl mb-3 border border-purple-100 text-center dark:bg-purple-900/20 dark:border-purple-900/30">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-0.5">Available Balance</p>
            <h2 className="text-2xl font-black text-purple-900 tracking-tight dark:text-purple-300">
              ₦{wallet.balance.toLocaleString()}.00
            </h2>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-2 dark:text-gray-300">Bank</label>
          <div className="relative">
            <select
              required
              value={formData.bank}
              onChange={(e) => setFormData({...formData, bank: e.target.value})}
              className="w-full h-14 px-6 bg-white rounded-2xl border border-gray-100 text-gray-800 text-sm font-medium shadow-sm outline-none appearance-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="" disabled>Select Bank</option>
              {BANKS.map(bank => (
                <option key={bank.code} value={bank.name}>{bank.name}</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <i className="fas fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-2 dark:text-gray-300">Account Number</label>
          <input 
            type="number"
            placeholder="0000000000"
            value={formData.accountNumber}
            onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
            className="w-full h-14 px-6 bg-white rounded-2xl border border-gray-100 text-gray-800 text-sm font-medium shadow-sm outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-2 dark:text-gray-300">Account Name</label>
          <input 
            placeholder="Enter Recipient Name"
            value={formData.accountName}
            onChange={(e) => setFormData({...formData, accountName: e.target.value})}
            className="w-full h-14 px-6 bg-white rounded-2xl border border-gray-100 text-gray-800 text-sm font-medium shadow-sm outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-2 dark:text-gray-300">Amount (₦)</label>
          <input 
            type="number"
            placeholder="5,000"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            className="w-full h-14 px-6 bg-white rounded-2xl border border-gray-100 text-gray-800 text-base font-black shadow-sm outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full h-14 bg-black text-white rounded-2xl text-base font-bold shadow-xl active:scale-95 transition-all mt-6 dark:bg-purple-600"
        >
          Proceed to Transfer
        </button>
      </form>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [userData, setUserData] = useState<any>(null);
  const [showBalance, setShowBalance] = useState(true);
  
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('paygo_users') || '[]');
    const user = users.find((u: any) => u.email === email);
    if (user) {
      setUserData(user);
    }
  }, [email, location.key]);

  const name = userData?.name || location.state?.name || "User";
  const profilePic = userData?.profilePic;
  const userLevel = userData?.level || 'Basic';
  
  const wallet = useMemo(() => getWallet(email), [email]);

  const quickActions = [
    { id: 'payid', label: 'Buy PAY ID', icon: 'fa-credit-card', color: 'text-yellow-600', bg: 'bg-white' },
    { id: 'watch', label: 'Watch', icon: 'fa-tv', color: 'text-blue-500', bg: 'bg-white' },
    { id: 'airtime', label: 'Airtime', icon: 'fa-signal', color: 'text-green-500', bg: 'bg-white' },
    { id: 'data', label: 'Data', icon: 'fa-server', color: 'text-slate-600', bg: 'bg-white' },
    { id: 'support', label: 'Support', icon: 'fa-headset', color: 'text-gray-800', bg: 'bg-white' },
    { id: 'group', label: 'Group', icon: 'fa-globe', color: 'text-cyan-500', bg: 'bg-white' },
    { id: 'earn', label: 'Earn More', icon: 'fa-sack-dollar', color: 'text-yellow-500', bg: 'bg-white' },
    { id: 'profile', label: 'Profile', icon: 'fa-user-circle', color: 'text-blue-600', bg: 'bg-white' },
  ];

  const handleAction = (id: string) => {
    if (id === 'payid') {
      navigate('/buy-pay-id', { state: { name, email } });
    } else if (id === 'profile') {
      navigate('/profile', { state: { name, email } });
    } else if (id === 'earn') {
      navigate('/earn', { state: { name, email } });
    } else if (id === 'airtime' || id === 'data') {
      if (userLevel !== 'Basic') {
        navigate(id === 'airtime' ? '/buy-airtime' : '/buy-data', { state: { name, email } });
      } else {
        alert("Upgrade required to access Airtime/Data services.");
        navigate('/upgrade', { state: { name, email } });
      }
    } else if (id === 'group') {
      window.open("https://t.me/chix9ja", "_blank");
    } else if (id === 'support') {
      window.open("https://t.me/gopaycom154", "_blank");
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20 dark:text-white">
      <div className="fixed top-0 left-0 w-full bg-[#e14a3f] text-white py-1.5 px-4 text-[9px] font-medium z-[100] whitespace-nowrap overflow-hidden">
        <div className="animate-marquee inline-block">
          Currently experiencing issues with Opay bank transfers. Please use other banks for now. Thank you for your patience!
        </div>
      </div>

      <div className="h-5"></div>

      <div className="flex justify-center my-4">
        <div className="w-24 h-8 rounded-lg bg-gradient-to-r from-purple-900 via-purple-700 to-orange-500 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm tracking-tighter">PAYGO</span>
        </div>
      </div>
      
      <div className="bg-[#6b21a8] rounded-[2rem] p-6 text-white mb-6 shadow-2xl relative overflow-hidden dark:bg-purple-900">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border border-white/10">
              {profilePic ? (
                <img src={profilePic} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-user text-base"></i>
              )}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Hi, {name} 👋</h3>
              <p className="text-[10px] text-white/70">Account: {userLevel}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="text-white/80 hover:text-white transition-colors">
              <i className="fas fa-bell text-base"></i>
            </button>
            <Link to="/login" className="text-xs font-semibold hover:underline">Logout</Link>
          </div>
        </div>

        <p className="text-[10px] text-white/70 mb-0.5 font-medium tracking-wide uppercase">Your Balance</p>
        <div className="flex items-center space-x-2.5 mb-0.5">
          <h2 className="text-2xl font-bold">
            {showBalance ? `₦${wallet.balance.toLocaleString()}.00` : '₦ ••••••••'}
          </h2>
          <button onClick={() => setShowBalance(!showBalance)} className="text-white/60 hover:text-white">
            <i className={`fas ${showBalance ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
          </button>
        </div>
        <p className="text-xs text-white/70 mb-6">Weekly Rewards: ₦180,000.00</p>

        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/upgrade', { state: { name, email } })}
            className="flex-1 bg-white/20 backdrop-blur-md h-10 rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 border border-white/10 hover:bg-white/30 transition-all"
          >
            <i className="fas fa-check-circle text-xs"></i>
            <span>Upgrade</span>
          </button>
          <button 
            onClick={() => navigate('/transfer', { state: { name, email } })}
            className="flex-1 bg-white/20 backdrop-blur-md h-10 rounded-full text-xs font-bold flex items-center justify-center space-x-1.5 border border-white/10 hover:bg-white/30 transition-all"
          >
            <i className="fas fa-arrow-up text-xs"></i>
            <span>Transfer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {quickActions.map((action, i) => (
          <div key={i} className="flex flex-col items-center space-y-1.5">
            <div 
              onClick={() => handleAction(action.id)}
              className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center transform active:scale-95 transition-transform cursor-pointer dark:bg-gray-800 dark:border-gray-700"
            >
              <i className={`fas ${action.icon} ${action.color} text-lg`}></i>
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase text-center leading-tight dark:text-gray-400">
              {action.label}
            </span>
          </div>
        ))}
      </div>

      {/* Transaction History Section - limited to 3 */}
      <div className="mb-6 px-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800 text-base dark:text-gray-200">Recent Transactions</h3>
          {wallet.transactions.length > 3 && (
            <button 
              onClick={() => navigate('/transactions', { state: { name, email } })}
              className="text-[10px] font-bold text-purple-600 uppercase hover:underline"
            >
              See All
            </button>
          )}
        </div>
        <div className="space-y-2.5">
          {wallet.transactions.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-3">No transactions yet.</p>
          ) : (
            wallet.transactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-gray-50 flex items-center justify-between dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'Credit' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    <i className={`fas ${tx.type === 'Credit' ? 'fa-arrow-down' : 'fa-arrow-up'} text-xs`}></i>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{tx.label}</p>
                    <p className="text-[9px] text-gray-400 uppercase font-bold">{tx.date}</p>
                  </div>
                </div>
                <div className={`text-xs font-black ${
                  tx.type === 'Credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {tx.type === 'Credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-gray-800 text-base px-1 dark:text-gray-200">Current Promotions</h3>
        <div className="relative group overflow-hidden rounded-[1.5rem] shadow-lg aspect-[16/9] bg-[#312e81]">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-900 via-indigo-900 to-orange-500"></div>
          <img 
            src="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800" 
            alt="Promotion"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <div className="bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-white/20">PAYGO EXCLUSIVE</div>
              <div className="flex space-x-1.5">
                <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[7px] font-bold">airtel</div>
                <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[7px] font-bold text-black">MTN</div>
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-1">August 27-28</h4>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Grand Prize Pool: ₦2,000,000</p>
            </div>
          </div>
        </div>
        <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-1.5 px-6 dark:text-gray-500">
          All customers who pay with PayGo in store will stand a chance to win great prizes.
        </p>
      </div>
      
      {/* WhatsApp Chat Button Floating (matches screenshot) */}
      <button 
        onClick={() => window.open("https://t.me/gopaycom154", "_blank")}
        className="fixed bottom-5 right-5 w-12 h-12 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center z-[50] hover:scale-110 active:scale-95 transition-all"
      >
        <i className="fas fa-comment-dots text-xl"></i>
      </button>
    </div>
  );
};

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      try {
        const existingUsers = JSON.parse(localStorage.getItem('paygo_users') || '[]');
        const matchedUser = existingUsers.find(
          (u: any) => u.email.toLowerCase() === formData.email.toLowerCase() && u.password === formData.password
        );

        if (matchedUser) {
          setLoading(false);
          navigate('/dashboard', { state: { name: matchedUser.name, email: matchedUser.email } });
        } else {
          setError('Account not found on this device or invalid credentials. You must register on this device first.');
          setLoading(false);
        }
      } catch (err) {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      <h1 className="text-xl font-bold text-[#1a1b3a] mb-6 text-center dark:text-white">
        Login to PayGo
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="w-full space-y-3">
        <Input 
          type="email" 
          placeholder="Enter Email" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          className="border-[#ebe8e5]"
        />
        <Input 
          type="password" 
          placeholder="Enter Password" 
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />

        <button 
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-black text-white rounded-2xl text-base font-medium mt-6 hover:bg-gray-900 transition-colors shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center dark:bg-purple-600"
        >
          {loading ? (
            <i className="fas fa-circle-notch animate-spin"></i>
          ) : (
            'Login'
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link to="/" className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors dark:text-purple-400">
          Don't have an account? Register
        </Link>
      </div>
    </div>
  );
};

// --- Telegram Advert Component ---
const TelegramAdvert: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Only show on dashboard as per user request
    if (location.pathname !== '/dashboard') {
      setVisible(false);
      return;
    }

    const interval = setInterval(() => {
      setVisible(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden dark:bg-gray-900 border border-purple-100 dark:border-purple-900/30">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-200 dark:shadow-none rotate-3">
            <i className="fas fa-bullhorn text-white text-3xl"></i>
          </div>
          
          <h3 className="text-2xl font-black text-gray-800 mb-3 leading-tight dark:text-white">
            Special Offer! 🚀
          </h3>
          
          <p className="text-gray-600 text-sm font-medium mb-8 leading-relaxed dark:text-gray-400">
            Register and withdraw free on <span className="text-purple-600 font-bold">earnix9ja</span>. Don't miss out on this opportunity!
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => {
                window.open("https://earnix.top", "_blank");
                setVisible(false);
              }}
              className="w-full h-14 bg-purple-600 text-white rounded-2xl text-base font-bold shadow-lg shadow-purple-200 active:scale-95 transition-all flex items-center justify-center space-x-2 dark:shadow-none"
            >
              <span>Proceed</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </button>
            
            <button 
              onClick={() => setVisible(false)}
              className="w-full h-12 bg-gray-50 text-gray-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all dark:bg-gray-800 dark:text-gray-500"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    // Initial theme check - STRICTLY ensure light mode is default if no preference is set
    // We remove 'dark' class first to avoid system default behavior if Tailwind CDN isn't configured yet
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      // Set to light in storage if not set, to be explicit
      if (!currentTheme) {
        localStorage.setItem('theme', 'light');
      }
    }
  }, []);

  return (
    <Router>
      <Layout>
        <TelegramAdvert />
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/buy-pay-id" element={<BuyPayIdPage />} />
          <Route path="/transfer" element={<TransferPage />} />
          <Route path="/upgrade" element={<UpgradeAccountPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/earn" element={<EarnMoneyPage />} />
          <Route path="/buy-airtime" element={<BuyAirtimePage />} />
          <Route path="/buy-data" element={<BuyDataPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
        </Routes>
        <LiveWithdrawalFeed />
      </Layout>
    </Router>
  );
};

export default App;
