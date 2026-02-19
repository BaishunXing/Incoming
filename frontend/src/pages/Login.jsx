import React, { useEffect, useState } from 'react';
import './Login.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const dict = {
  en: {
    title: 'Login to your Account',
    subtitle: 'Welcome back! Select method to log in:',
    divider: 'or continue with email',
    email: 'Email',
    password: 'Password',
    remember: 'Remember me',
    forgot: 'Forgot Password?',
    login: 'LOG IN',
    noAccount: "Don't have an account?",
    create: 'Create an account',
    networkErr: 'Network error',
    loginFailed: (status) => `Login failed (status ${status})`,
    illusLine1: 'Connect with any device.',
    illusLine2: 'Everything you need is an internet connection.'
  },
  cn: {
    title: '登录到你的账户',
    subtitle: '欢迎回来！请选择登录方式：',
    divider: '或使用邮箱继续',
    email: '邮箱',
    password: '密码',
    remember: '记住我',
    forgot: '忘记密码？',
    login: '登 录',
    noAccount: '还没有账号？',
    create: '创建一个账户',
    networkErr: '网络错误',
    loginFailed: (status) => `登录失败（状态码 ${status}）`,
    illusLine1: '连接任意设备。',
    illusLine2: '你只需要一条互联网连接。'
  }
};

export default function Login() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const t = dict[lang];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, remember })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.message || t.loginFailed(res.status));
        return;
      }
      window.location.href = '/dashboard';
    } catch {
      setError(t.networkErr);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="authRoot">
      <div className="langSwitch">
        <button
          className={`langBtn ${lang === 'en' ? 'is-active' : ''}`}
          onClick={() => setLang('en')}
          aria-label="Switch to English"
        >
          EN
        </button>
        <span className="langDivider">/</span>
        <button
          className={`langBtn ${lang === 'cn' ? 'is-active' : ''}`}
          onClick={() => setLang('cn')}
          aria-label="切换为中文"
        >
          CN
        </button>
      </div>

      <div className="authCard">
        <div className="leftPane">
          <div className="logoSlot" />
          <h1 className="title">{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>

          <div className="divider">
            <span className="divider__line" />
            <span className="divider__text">{t.divider}</span>
            <span className="divider__line" />
          </div>

          <form className="form" onSubmit={handleSubmit}>
            {/* Email */}
            <label className="inputWrap">
              <span className="icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </span>
              <input
                type="email"
                placeholder={t.email}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <span />
            </label>

            {/* Password */}
            <label className="inputWrap">
              <span className="icon" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 10V7a4 4 0 1 1 8 0v3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </span>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder={t.password}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="ghostBtn"
                onClick={() => setShowPwd(s => !s)}
                aria-label={showPwd ? 'Hide password' : 'Show password'}
                title={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                )}
              </button>
            </label>

            {/* Remember + Forgot */}
            <div className="row">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span>{t.remember}</span>
              </label>

              <a href="#" onClick={e => e.preventDefault()}>
                {t.forgot}
              </a>
            </div>

            {/* Error message */}
            {error && <div className="error">{error}</div>}

            {/* Submit */}
            <button className="primaryBtn" type="submit" disabled={submitting}>
              {submitting ? (lang === 'cn' ? '登录中...' : 'Signing in...') : t.login}
            </button>

            {/* Footer helper */}
            <p className="footText">
              {t.noAccount}{' '}
              <a href="#" onClick={e => e.preventDefault()}>
                {t.create}
              </a>
            </p>
          </form>
        </div>

        {/* Right: illustration column */}
        <div className="rightPane">
          <div className="illustration">
            <div className="device device--laptop" />
            <div className="device device--window" />
            <div className="device device--phone" />
            <p className="caption">
              {t.illusLine1}<br/>
              {t.illusLine2}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}