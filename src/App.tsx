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
    <div className="surface-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
        <h2 style={{ margin: 0 }} className="hide-in-presentation">{t('home.title')}</h2>
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
  );
}

function App() {
  const { t, language, setLanguage } = useTranslation();

  return (
    <Router>
      <header className="app-header">
        <div>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>PitchTimer</h1>
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }} className="hide-in-presentation">
            {t('app.localData')}
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <button 
              onClick={() => setLanguage('de')} 
              className={language === 'de' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-xs)' }}
            >
              DE
            </button>
            <button 
              onClick={() => setLanguage('en')} 
              className={language === 'en' ? 'btn-primary' : 'btn-outline'}
              style={{ padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-xs)' }}
            >
              EN
            </button>
          </div>
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
