import React, { useState } from 'react';
import { User, Shield, KeyRound, Globe, HelpCircle, Mail, Terminal, Info, Users } from 'lucide-react';

interface AuthSystemProps {
  lang: 'id' | 'en';
  onAuthSuccess: (user: { username: string; email: string; simulatedIp: string; isGuest: boolean; isAdmin: boolean }) => void;
  onBackdoorInit: () => void;
  simulatedIp: string;
  setSimulatedIp: (ip: string) => void;
}

export default function AuthSystem({
  lang,
  onAuthSuccess,
  onBackdoorInit,
  simulatedIp,
  setSimulatedIp,
}: AuthSystemProps) {
  const isIndo = lang === 'id';
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Register Fields
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Login Fields
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot Password Fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Error / Alert feedback
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // Command Admin trigger
  const [secretCmd, setSecretCmd] = useState('');

  // Helper validation
  const validateRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);

    if (regUsername.trim().length < 4) {
      setErrorText(isIndo ? '🚫 Username minimal 4 karakter!' : '🚫 Username must be at least 4 characters!');
      return;
    }
    if (!regEmail.endsWith('@gmail.com')) {
      setErrorText(isIndo ? '🚫 Email WAJIB menggunakan domain @gmail.com!' : '🚫 Email MUST use @gmail.com domain!');
      return;
    }
    if (regPassword.length < 5) {
      setErrorText(isIndo ? '🚫 Password minimal 5 karakter!' : '🚫 Password must be at least 5 characters!');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorText(isIndo ? '🚫 Ulangi Password tidak cocok!' : '🚫 Confirm Password does not match!');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          email: regEmail,
          password: regPassword,
          simulatedIp: simulatedIp,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorText(data.error || 'Registration failed');
      } else {
        setSuccessText(
          isIndo
            ? `✅ Registrasi Sukses! Akun Anda terikat pada IP: ${simulatedIp}. Silahkan login.`
            : `✅ Registration Success! Account bound to IP: ${simulatedIp}. Please login now.`
        );
        // Switch to login mode
        setMode('login');
        setLoginUsername(regUsername);
        setLoginPassword('');
      }
    } catch (err) {
      setErrorText('Server connection error during registration.');
    }
  };

  const validateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
          simulatedIp: simulatedIp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorText(data.error || 'Login failed');
      } else {
        onAuthSuccess(data.user);
      }
    } catch (err) {
      setErrorText('Server error during login authentication.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.endsWith('@gmail.com')) {
      setErrorText(isIndo ? '🚫 Alamat email harus berakhiran @gmail.com!' : '🚫 Email must end with @gmail.com!');
      return;
    }
    setForgotSuccess(true);
    setErrorText(null);
  };

  const enterAsGuest = () => {
    onAuthSuccess({
      username: isIndo ? 'Tamu_AdCreator' : 'Guest_AdCreator',
      email: 'guest@adcreator.com',
      simulatedIp: simulatedIp,
      isGuest: true,
      isAdmin: false,
    });
  };

  const handleSecretCmdCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretCmd.trim() === '/dev_admin_init') {
      fetch('/api/dev_admin_init', { method: 'POST' })
        .then((r) => r.json())
        .then(() => {
          onBackdoorInit();
        });
    } else {
      setErrorText(isIndo ? '🚫 Perintah admin rahasia tidak sah!' : '🚫 Invalid backdoor secret command!');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 animate-fade-in py-8" id="auth-panel">
      {/* Cybersecurity Sandbox HUD Info */}
      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-950/20 text-left space-y-2">
        <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold uppercase">
          <Shield className="w-4 h-4" />
          <span>CYBERSECURITY GATEWAY SIMULATOR</span>
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
          {isIndo
            ? 'Sistem ini membatasi autentikasi berdasarkan sidik jari IP. Anda dapat memanipulasi alamat IP Virtual di bawah untuk menyimulasikan serangan pembajakan sesi atau memvalidasi blokir firewall.'
            : 'This system validates credentials tightly based on registration IP bindings. You may alter/simulate your Virtual Client IP below to verify authorization defenses.'}
        </p>

        {/* IP Address Simulator Widget */}
        <div className="pt-2 flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 font-mono font-semibold">Virtual Resident IP:</span>
          <input
            type="text"
            value={simulatedIp}
            onChange={(e) => setSimulatedIp(e.target.value)}
            className="flex-1 max-w-[140px] px-2 py-0.5 rounded text-xs font-mono font-bold bg-zinc-900 border border-zinc-700 text-amber-500 text-center focus:outline-none focus:border-amber-500"
            placeholder="192.168.1.120"
          />
          <button
            onClick={() => setSimulatedIp(Math.random() > 0.5 ? '10.0.0.12' : '172.16.50.88')}
            className="px-2 py-0.5 rounded bg-zinc-800 text-[9px] font-mono text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            {isIndo ? 'Acak IP' : 'Randomize IP'}
          </button>
        </div>
        <div className="text-[9px] text-zinc-500 font-mono">
          * {isIndo ? 'Default IP normal terdaftar:' : 'Default normal registered IP:'} <span className="text-zinc-400">192.168.1.120</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 shadow-2xl relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-black px-4 py-1 rounded-full text-[11px] font-bold font-mono tracking-widest uppercase">
          AdCreator GATE
        </div>

        {mode === 'login' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">{isIndo ? 'Login Anggota' : 'Member Login'}</h3>
              <p className="text-xs text-zinc-500 mt-1">
                {isIndo ? 'Masukkan kredensial Anda untuk melanjutkan ke dasbor' : 'Provide registered login to open full console access'}
              </p>
            </div>

            <form onSubmit={validateLogin} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">{isIndo ? 'Username' : 'Username'}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="Contoh: afiliator_master"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">{isIndo ? 'Password' : 'Password'}</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setForgotSuccess(false);
                      setErrorText(null);
                    }}
                    className="text-[11px] text-amber-500/80 hover:text-amber-400 font-mono focus:outline-none"
                  >
                    {isIndo ? 'Lupa Password?' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {errorText && (
                <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-950/20 text-xs font-mono text-red-400 leading-normal">
                  {errorText}
                </div>
              )}

              {successText && (
                <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-950/20 text-xs font-mono text-emerald-400 leading-normal">
                  {successText}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-black text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-amber-500/10 focus:outline-none"
              >
                🔓 {isIndo ? 'MASUK KE DASHBOARD' : 'ACCESS DASHBOARD'}
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink mx-4 text-zinc-600 text-xs font-mono">OR</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setMode('register');
                  setErrorText(null);
                  setSuccessText(null);
                }}
                className="py-2.5 px-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-xs text-zinc-300 font-semibold text-center transition-all cursor-pointer focus:outline-none"
              >
                📝 {isIndo ? 'Registrasi Baru' : 'Register New'}
              </button>
              <button
                onClick={enterAsGuest}
                className="py-2.5 px-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-xs text-zinc-300 font-semibold text-center transition-all cursor-pointer focus:outline-none"
              >
                👥 {isIndo ? 'Masuk Tamu (Guest)' : 'Guest Bypass'}
              </button>
            </div>
            <div className="p-2.5 bg-yellow-500/5 rounded-lg border border-yellow-500/10 text-[10px] text-yellow-500/80 leading-relaxed text-left font-mono flex items-start gap-2">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                {isIndo
                  ? 'Gunakan akun demo: "afiliator_master" dengan password "afiliator" (harus samakan virtual IP ke "192.168.1.100") untuk uji coba cepat.'
                  : 'Try demo username "afiliator_master" with password "afiliator" (requires virtual IP to match "192.168.1.100").'}
              </span>
            </div>
          </div>
        )}

        {mode === 'register' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">{isIndo ? 'Daftar Akun Baru' : 'Register Account'}</h3>
              <p className="text-xs text-zinc-500 mt-1">
                {isIndo ? 'Data Anda akan diikat ke IP Virtual saat ini' : 'Your credentials will secure-bind to your active virtual IP address'}
              </p>
            </div>

            <form onSubmit={validateRegister} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">{isIndo ? 'Username' : 'Username'}</label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="Min. 4 huruf, misal: rayan_aff"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">{isIndo ? 'Alamat Email' : 'Email Address'}</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="WAJIB: @gmail.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">{isIndo ? 'Password' : 'Password'}</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="Min. 5 karakter"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">{isIndo ? 'Ulangi Password' : 'Confirm Password'}</label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                  placeholder="Ulangi kembali sandi di atas"
                />
              </div>

              {errorText && (
                <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-950/20 text-xs font-mono text-red-400 leading-normal">
                  {errorText}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-black text-sm transition-all duration-200 cursor-pointer shadow-lg focus:outline-none"
              >
                💾 {isIndo ? 'BUAT AKUN & SELESAIKAN' : 'FINALIZE REGISTRATION'}
              </button>
            </form>

            <button
              onClick={() => {
                setMode('login');
                setErrorText(null);
                setSuccessText(null);
              }}
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors duration-200 mt-2 block mx-auto focus:outline-none"
            >
              ← {isIndo ? 'Kembali ke Login' : 'Back to Login'}
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white">{isIndo ? 'Lupa Password' : 'Reset Password'}</h3>
              <p className="text-xs text-zinc-500 mt-1">
                {isIndo ? 'Simulasi pemulihan akun Anda via email' : 'Simulate remote security password reset link shipment'}
              </p>
            </div>

            {!forgotSuccess ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">{isIndo ? 'Masukkan Email Gmail' : 'Enter Gmail'}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
                      placeholder="email@gmail.com"
                    />
                  </div>
                </div>

                {errorText && (
                  <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-950/20 text-xs font-mono text-red-200 leading-normal">
                    {errorText}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-black text-sm transition-all duration-200 cursor-pointer shadow-lg focus:outline-none"
                >
                  ✉️ {isIndo ? 'KIRIM LINK PEMULIHAN' : 'SHIP RESET LINK'}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center py-4 bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-5">
                <span className="text-2xl">📨</span>
                <h4 className="font-bold text-emerald-400 text-sm">
                  {isIndo ? 'Simulasi Tautan Terkirim!' : 'Simulated Mail Shipped!'}
                </h4>
                <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                  {isIndo
                    ? `Email simulator berhasil mengirim link pemulihan ke "${forgotEmail}". Di dunia nyata, Anda akan mengklik link tersebut untuk menyetel ulang password.`
                    : `Simulated secure email token successfully dispatched to "${forgotEmail}". Simply return to login and apply your credentials.`}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setMode('login');
                setErrorText(null);
                setSuccessText(null);
              }}
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors duration-200 block mx-auto focus:outline-none"
            >
              ← {isIndo ? 'Kembali ke Login' : 'Back to Login'}
            </button>
          </div>
        )}
      </div>

      {/* Secret Admin Backdoor command input console */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4 text-left">
        <div className="flex items-center gap-2 mb-2 text-zinc-400 font-mono text-xs">
          <Terminal className="w-4 h-4 text-zinc-500 animate-pulse" />
          <span>Secret Backdoor Console</span>
        </div>
        <form onSubmit={handleSecretCmdCheck} className="flex gap-2">
          <input
            type="text"
            value={secretCmd}
            onChange={(e) => setSecretCmd(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono placeholder-zinc-600 focus:outline-none focus:border-amber-500/60"
            placeholder={isIndo ? "Masukkan perintah rahasia..." : "Type secret command here..."}
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-mono transition-colors font-bold cursor-pointer focus:outline-none"
          >
            EXEC
          </button>
        </form>
      </div>
    </div>
  );
}
