import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logoWideImg from './assets/logo-wide.png';
import './index.css';

import { useTimer } from './hooks/useTimer';
import { useHistory } from './hooks/useHistory';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { ProgressBar } from './components/ProgressBar';
import { TimeSelector } from './components/TimeSelector';
import { HistoryStats } from './components/HistoryStats';
import { useWakeLock } from './hooks/useWakeLock';
import { clearAllLocalData } from './utils/localData';

import { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { useTranslation } from './i18n';

const NotesField = lazy(() => import('./components/NotesField').then((module) => ({ default: module.NotesField })));
const MarkdownPage = lazy(() => import('./MarkdownPage').then((module) => ({ default: module.MarkdownPage })));

function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="surface-panel" style={{ textAlign: 'left' }}>
      <Link to="/" className="content-back-link">{t('content.back')}</Link>
      <h1>{t('content.notFoundTitle')}</h1>
      <p>{t('content.notFoundBody')}</p>
    </div>
  );
}

function Home() {
  const { t } = useTranslation();
  const { history, addRecord, clearHistory } = useHistory();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleComplete = useCallback((mode: number, duration: number) => {
    addRecord({ timeMode: mode, actualDuration: duration, status: 'completed' });
  }, [addRecord]);

  const handleCancel = useCallback((mode: number, duration: number) => {
    addRecord({ timeMode: mode, actualDuration: duration, status: 'cancelled' });
  }, [addRecord]);

  const { timeMode, setTimeMode, timeLeft, isRunning, isPreparing, prepTimeLeft, progress, start, pause, reset } = useTimer({
    onComplete: handleComplete,
    onCancel: handleCancel,
  });
  useWakeLock(isRunning || isPreparing || isFullscreen);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (isFull) {
        document.body.classList.add('presentation-mode');
      } else {
        document.body.classList.remove('presentation-mode');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <>
      <div className="educational-banner hide-in-presentation">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <svg aria-hidden="true" xmlns="http://www.w3.org/0000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
          <strong>{t('banner.education')}</strong>
        </div>
        <Link to="/ueber">{t('banner.responsibility')}</Link>
      </div>

      <div className="hero-section hide-in-presentation">
        <div className="hero-subhead">{t('hero.subhead')}</div>
        <h1 className="hero-headline">{t('hero.headline')}</h1>
        <p className="hero-description">{t('hero.description')}</p>
      </div>

      <div className="surface-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
          <button onClick={toggleFullscreen} className="btn-outline hide-in-presentation" style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-sm)' }}>
            {isFullscreen ? t('home.exitFullscreen') : t('home.fullscreen')}
          </button>
        </div>
      
      <TimeSelector 
        timeMode={timeMode} 
        setTimeMode={setTimeMode} 
        disabled={isRunning || isPreparing} 
      />

      <div className="timer-wrapper" style={{ padding: 'var(--spacing-6) 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <TimerDisplay 
          timeLeft={timeLeft} 
          isPreparing={isPreparing} 
          prepTimeLeft={prepTimeLeft} 
        />
        <ProgressBar progress={progress} label={t('timer.progress')} />
        <TimerControls 
          isRunning={isRunning} 
          isPreparing={isPreparing}
          timeLeft={timeLeft} 
          timeMode={timeMode} 
          onStart={start} 
          onPause={pause} 
          onReset={reset} 
        />
      </div>
      
      <Suspense fallback={<div className="notes-loading">{t('notes.loading')}</div>}>
        <NotesField presentationMode={isFullscreen} />
      </Suspense>
      
      <HistoryStats history={history} onClear={clearHistory} />
      
      </div>
    </>
  );
}

function App() {
  const { t, language, setLanguage } = useTranslation();
  const loadHelpContent = useCallback(() => language === 'en' ? import('../content/hilfe.en.md?raw') : import('../content/hilfe.de.md?raw'), [language]);
  const loadTeacherContent = useCallback(() => language === 'en' ? import('../content/lehrkraefte.en.md?raw') : import('../content/lehrkraefte.de.md?raw'), [language]);
  const loadAboutContent = useCallback(() => language === 'en' ? import('../content/ueber.en.md?raw') : import('../content/ueber.de.md?raw'), [language]);
  const loadPrivacyContent = useCallback(() => language === 'en' ? import('../content/datenschutz.en.md?raw') : import('../content/datenschutz.de.md?raw'), [language]);
  const loadImprintContent = useCallback(() => language === 'en' ? import('../content/impressum.en.md?raw') : import('../content/impressum.de.md?raw'), [language]);

  const handleClearLocalData = () => {
    if (window.confirm(t('app.clearDataConfirm'))) {
      clearAllLocalData();
      window.location.reload();
    }
  };

  return (
    <Router>
      <header className="app-header hide-in-presentation">
        <Link to="/" className="brand" aria-label={`${t('home.title')} – Startseite`} style={{ gap: 'var(--spacing-3)' }}>
          <img src={logoWideImg} alt="PitchTimer Logo" style={{ height: '36px', width: 'auto' }} />
          <div className="brand-text">
            <small style={{ marginTop: '2px' }}>{t('header.subtitle')}</small>
          </div>
        </Link>
        
        <div className="header-actions">
          <div className="badge-success">
            <svg aria-hidden="true" xmlns="http://www.w3.org/0000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            {t('header.localData')}
          </div>
          
          <div className="segmented-control">
            <button 
              onClick={() => setLanguage('de')} 
              className={language === 'de' ? 'active' : ''}
              aria-pressed={language === 'de'}
            >
              DE
            </button>
            <button 
              onClick={() => setLanguage('en')} 
              className={language === 'en' ? 'active' : ''}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
          </div>

          <Link to="/lehrkraefte" className="header-link">
            <svg aria-hidden="true" xmlns="http://www.w3.org/0000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            {t('header.teachers')}
          </Link>
        </div>
      </header>

      <main className="app-main">
        <Suspense fallback={<div className="surface-panel">{t('content.loading')}</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hilfe" element={<MarkdownPage loadContentRaw={loadHelpContent} />} />
            <Route path="/lehrkraefte" element={<MarkdownPage loadContentRaw={loadTeacherContent} />} />
            <Route path="/ueber" element={<MarkdownPage loadContentRaw={loadAboutContent} />} />
            <Route path="/datenschutz" element={<MarkdownPage loadContentRaw={loadPrivacyContent} />} />
            <Route path="/impressum" element={<MarkdownPage loadContentRaw={loadImprintContent} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="app-footer hide-in-presentation">
        <div className="app-footer-links" style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/hilfe" className="header-link">{t('app.help')}</Link>
          <Link to="/ueber" className="header-link">{t('app.about')}</Link>
          <Link to="/datenschutz" className="header-link">{t('app.privacy')}</Link>
          <Link to="/impressum" className="header-link">{t('app.imprint')}</Link>
          <button type="button" onClick={handleClearLocalData} className="footer-button-link">
            {t('app.clearData')}
          </button>
          
          <a href="https://www.buymeacoffee.com/Haake" target="_blank" rel="noopener noreferrer" className="bmc-link" aria-label="Buy me a coffee">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"></path>
            </svg>
            <span className="bmc-link-label">{t('app.coffee')}</span>
          </a>
          <a href="https://github.com/ChristianHaake/PitchTimer" target="_blank" rel="noopener noreferrer" className="github-link" aria-label="GitHub Repository">
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.2.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17.9 4.8 19 5.1 19 5.1c.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.7c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"></path>
            </svg>
            <span className="github-link-label">{t('app.source')}</span>
          </a>
        </div>
      </footer>
    </Router>
  );
}

export default App;
