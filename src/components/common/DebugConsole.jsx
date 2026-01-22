import React, { useState, useEffect } from 'react';

const DebugConsole = () => {
    const [logs, setLogs] = useState([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        const formatArgs = (args) => {
            return args.map(arg => {
                if (typeof arg === 'object') {
                    try {
                        return JSON.stringify(arg);
                    } catch (e) {
                        return String(arg);
                    }
                }
                return String(arg);
            }).join(' ');
        };

        const addLog = (type, args) => {
            const msg = formatArgs(args);
            const time = new Date().toISOString().split('T')[1].split('.')[0];
            setLogs(prev => [...prev.slice(-49), { type, msg, time }]); // Keep last 50
        };

        console.log = (...args) => { addLog('INFO', args); originalLog(...args); };
        console.error = (...args) => { addLog('ERROR', args); originalError(...args); };
        console.warn = (...args) => { addLog('WARN', args); originalWarn(...args); };

        return () => {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
        };
    }, []);

    if (!isVisible) return <button
        onClick={() => setIsVisible(true)}
        style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 99999, padding: 10, background: 'red', color: 'white', border: 'none', borderRadius: '5px' }}>
        DEBUG
    </button>;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            height: '35vh',
            overflowY: 'auto',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
            color: '#00FF00',
            fontFamily: 'monospace',
            fontSize: '11px',
            zIndex: 99999,
            padding: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            borderBottom: '1px solid #333'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, borderBottom: '1px solid #444', paddingBottom: 5 }}>
                <span style={{ fontWeight: 'bold', color: 'white' }}>📱 DEBUG CONSOLE</span>
                <button onClick={() => setLogs([])} style={{ marginRight: 10, background: '#333', color: 'white', border: 'none', padding: '2px 8px' }}>CLEAR</button>
                <button onClick={() => setIsVisible(false)} style={{ background: '#333', color: 'white', border: 'none', padding: '2px 8px' }}>MINIMIZE</button>
            </div>
            {logs.map((l, i) => (
                <div key={i} style={{
                    marginBottom: '2px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: l.type === 'ERROR' ? '#FF5252' : l.type === 'WARN' ? '#FFD740' : '#69F0AE'
                }}>
                    <span style={{ opacity: 0.5, marginRight: '6px' }}>[{l.time}]</span>
                    <span>{l.msg}</span>
                </div>
            ))}
        </div>
    );
};

export default DebugConsole;
