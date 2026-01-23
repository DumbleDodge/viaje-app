import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getFileMetadata } from '../../utils/storageClient';

const DebugConsole = () => {
    const [logs, setLogs] = useState([]);
    const [isVisible, setIsVisible] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        // ... (existing logging logic) ...
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
            setLogs(prev => [...prev.slice(-49), { type, msg, time }]);
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

    const handleRecalculateStorage = async () => {
        if (!confirm("Esto recalculará el espacio usado verificando cada archivo en R2. ¿Continuar?")) return;
        setIsSyncing(true);
        console.log("🔄 Iniciando sincronización de almacenamiento...");

        try {
            // 1. Obtener usuario actual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No hay usuario autenticado");

            // 2. Obtener todos los items de viajes (Asumimos que el usuario es dueño de sus viajes)
            // Esto es aproximado. En multi-usuario real haría falta field 'uploader_id' en attachment.
            const { data: items, error } = await supabase.from('trip_items').select('attachments');
            if (error) throw error;

            let totalBytes = 0;
            let fileCount = 0;
            let missingMetaCount = 0;

            // 3. Iterar y sumar
            for (const item of items) {
                if (item.attachments && Array.isArray(item.attachments)) {
                    for (const att of item.attachments) {
                        fileCount++;
                        if (att.size) {
                            totalBytes += att.size;
                        } else if (att.path) {
                            // Si no tiene size guardado, preguntar a R2
                            console.log(`🔎 Consultando R2 para: ${att.name}...`);
                            const meta = await getFileMetadata(att.path);
                            if (meta && meta.size) {
                                totalBytes += meta.size;
                                missingMetaCount++;
                            }
                        }
                    }
                }
            }

            // 4. Actualizar perfil
            console.log(`💾 Total calculado: ${(totalBytes / 1024 / 1024).toFixed(2)} MB en ${fileCount} archivos.`);

            // Forzamos update directo (no increment)
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ storage_used: totalBytes })
                .eq('id', user.id);

            if (updateError) throw updateError;

            console.log("✅ Almacenamiento sincronizado correctamente.");
            alert(`Sincronización completada.\n\nNuevo total: ${(totalBytes / 1024 / 1024).toFixed(2)} MB\nArchivos: ${fileCount}`);

        } catch (e) {
            console.error("Error sync storage:", e);
            alert("Error: " + e.message);
        } finally {
            setIsSyncing(false);
        }
    };

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
                <div>
                    <button onClick={handleRecalculateStorage} disabled={isSyncing} style={{ marginRight: 10, background: isSyncing ? '#666' : '#2979FF', color: 'white', border: 'none', padding: '2px 8px', borderRadius: 4, cursor: 'pointer' }}>
                        {isSyncing ? 'SYNCING...' : 'SYNC STORAGE'}
                    </button>
                    <button onClick={() => setLogs([])} style={{ marginRight: 10, background: '#333', color: 'white', border: 'none', padding: '2px 8px' }}>CLEAR</button>
                    <button onClick={() => setIsVisible(false)} style={{ background: '#333', color: 'white', border: 'none', padding: '2px 8px' }}>MINIMIZE</button>
                </div>
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
