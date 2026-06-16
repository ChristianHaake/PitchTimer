import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MarkdownPage } from './MarkdownPage';
import './index.css';

import { useTimer } from './hooks/useTimer';
import { useHistory } from './hooks/useHistory';
import { TimerDisplay } from './components/TimerDisplay';
import { TimerControls } from './components/TimerControls';
import { ProgressBar } from './components/ProgressBar';
import { TimeSelector } from './components/TimeSelector';
import { NotesField } from './components/NotesField';
import { HistoryStats } from './components/HistoryStats';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from './i18n';

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
          <svg xmlns="http://www.w3.org/0000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
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
        disabled={isRunning} 
      />

      <div className="timer-wrapper" style={{ padding: 'var(--spacing-6) 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <TimerDisplay 
          timeLeft={timeLeft} 
          isPreparing={isPreparing} 
          prepTimeLeft={prepTimeLeft} 
        />
        <ProgressBar progress={progress} />
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
      
      <NotesField />
      
      <HistoryStats history={history} onClear={clearHistory} />
      
      </div>
    </>
  );
}

function App() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <Router>
      <header className="app-header hide-in-presentation">
        <div className="header-logo-container">
          <div className="header-logo-icon">
            <svg xmlns="http://www.w3.org/0000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="header-title-group">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>PitchTimer</h1>
            </Link>
            <div className="header-subtitle">{t('header.subtitle')}</div>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="badge-success">
            <svg xmlns="http://www.w3.org/0000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            {t('header.localData')}
          </div>
          
          <div className="segmented-control">
            <button 
              onClick={() => setLanguage('de')} 
              className={language === 'de' ? 'active' : ''}
            >
              DE
            </button>
            <button 
              onClick={() => setLanguage('en')} 
              className={language === 'en' ? 'active' : ''}
            >
              EN
            </button>
          </div>

          <Link to="/ueber" className="header-link">
            <svg xmlns="http://www.w3.org/0000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            {t('header.teachers')}
          </Link>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hilfe" element={<MarkdownPage contentRawPromise={language === 'en' ? import('../content/hilfe.en.md?raw') : import('../content/hilfe.de.md?raw')} />} />
          <Route path="/ueber" element={<MarkdownPage contentRawPromise={language === 'en' ? import('../content/ueber.en.md?raw') : import('../content/ueber.de.md?raw')} />} />
          <Route path="/datenschutz" element={<MarkdownPage contentRawPromise={language === 'en' ? import('../content/datenschutz.en.md?raw') : import('../content/datenschutz.de.md?raw')} />} />
          <Route path="/impressum" element={<MarkdownPage contentRawPromise={language === 'en' ? import('../content/impressum.en.md?raw') : import('../content/impressum.de.md?raw')} />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <Link to="/hilfe">{t('app.help')}</Link>
        <Link to="/ueber">{t('app.about')}</Link>
        <Link to="/datenschutz">{t('app.privacy')}</Link>
        <Link to="/impressum">{t('app.imprint')}</Link>
        <a href="https://github.com/ChristianHaake/PitchTimer" target="_blank" rel="noopener noreferrer">
          {t('app.source')}
        </a>
      </footer>
    </Router>
  );
}

export default App;
