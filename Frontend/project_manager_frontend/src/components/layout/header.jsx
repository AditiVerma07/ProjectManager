import { useLocation } from 'react-router-dom';

const titles = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview of your work' },
  '/projects': { title: 'Projects', sub: 'All your projects' },
  '/tasks': { title: 'My Tasks', sub: 'Tasks assigned to you' },
};

export default function Header() {
  const location = useLocation();
  const current = titles[location.pathname] || { title: 'Planify', sub: '' };

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      gap: 12,
    }}>
      <div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          {current.title}
        </h1>
        {current.sub && (
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
            {current.sub}
          </p>
        )}
      </div>
    </header>
  );
};