export default function Loading() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'var(--bg-primary)',
      zIndex: 9999
    }}>
      <img src="/poste.gif" alt="Cargando..." style={{ width: '150px', objectFit: 'contain' }} />
      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '2px', animation: 'pulse 1.5s infinite' }}>CARGANDO...</p>
    </div>
  );
}
