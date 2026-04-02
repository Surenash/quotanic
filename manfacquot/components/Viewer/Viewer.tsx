import React, { Suspense, useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import Loader from './Loader';
import { ViewPreset, SupportedExtensions } from '../../types/types';
import * as Icons from './Icons';

interface ViewerProps {
  modelUrl: string;
  fileExtension: SupportedExtensions;
  view: ViewPreset;
  isViewLocked: boolean;
  onUserInteraction: () => void;
  design?: any; // To get the original file key for download
}

// Sidebar Panel Types
type PanelType = 'background' | 'material' | 'animation' | 'lighting' | 'settings' | null;

const Viewer: React.FC<ViewerProps> = ({ modelUrl, fileExtension, view, isViewLocked, onUserInteraction, design }) => {
  // --- STATE ---
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [viewportMode, setViewportMode] = useState<'solid' | 'wireframe'>('solid');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(false);
  const [resetKey, setResetKey] = useState(0); // Counter to trigger recentering
  
  const [background, setBackground] = useState({
    top: '#1a1a2e',
    bottom: '#0a0a0f',
    isGradient: true
  });

  const [material, setMaterial] = useState({
    color: '#3b82f6',
    isOverride: false
  });

  // Complex Animation State
  const [animation, setAnimation] = useState({
    type: 'none',
    speed: [0, 0.5, 0] as [number, number, number], // X, Y, Z speed
    length: 2, // 1 to 5 seconds
    height: 'low' as 'low' | 'high',
    amplitude: { x: 'low', y: 'low', z: 'low' } as Record<string, 'low' | 'high'>,
    radius: 'low' as 'low' | 'high',
    angle: 'low' as 'low' | 'high',
    orientation: [0, 0, 0] as [number, number, number] // Manual static rotation
  });

  const [lighting, setLighting] = useState({
    ambient: { color: '#ffffff', intensity: 1.5 },
    directional: { color: '#ffffff', intensity: 2.5 }
  });

  // --- HANDLERS ---
  const togglePanel = (panel: PanelType) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const handleFullscreen = () => {
    const element = document.getElementById('viewer-container');
    if (!element) return;
    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const downloadSnapshot = () => {
    const canvas = document.querySelector('#viewer-container canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `quotanic-3d-view-${design?.design_name || 'model'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadOriginal = () => {
    if (design?.s3_file_key) {
      // Assuming VITE_API_BASE_URL is available via global or passed down
      const baseUrl = (window as any).VITE_API_BASE_URL || 'https://api.quotanic.com';
      window.open(`${baseUrl}/media/${design.s3_file_key}`, '_blank');
    }
  };

  // --- RENDER HELPERS ---
  const ToolbarButton = ({ icon: Icon, onClick, active = false, label, danger = false }: any) => (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        border: 'none',
        background: active ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
        color: active ? '#3b82f6' : (danger ? '#ef4444' : '#94a3b8'),
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0
      }}
      className="viewer-tool-btn"
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div 
      id="viewer-container"
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative', 
        background: background.isGradient 
          ? `linear-gradient(to bottom, ${background.top}, ${background.bottom})`
          : background.bottom,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 1. TOP TOOLBAR */}
      <div style={{
        height: '48px',
        width: '100%',
        background: '#0a0a0f',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
        padding: '0 8px',
        zIndex: 110,
        position: 'relative',
        userSelect: 'none'
      }}>
        {/* Left Group: Contextual Tools */}
        <div style={{ 
          display: 'flex', 
          gap: '2px', 
          alignItems: 'center', 
          overflowX: 'auto', 
          minWidth: 0,
          marginRight: '8px'
        }} className="no-scrollbar">
          <ToolbarButton icon={Icons.ZoomOutIcon} onClick={() => setZoomLevel(prev => Math.max(0.1, prev * 0.8))} label="Zoom Out" />
          <ToolbarButton icon={Icons.ZoomInIcon} onClick={() => setZoomLevel(prev => Math.min(10, prev * 1.2))} label="Zoom In" />
          <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.15)', margin: '0 6px', flexShrink: 0 }} />
          <ToolbarButton icon={Icons.BackgroundIcon} onClick={() => togglePanel('background')} active={activePanel === 'background'} label="Background" />
          <ToolbarButton icon={Icons.ModelColorIcon} onClick={() => togglePanel('material')} active={activePanel === 'material'} label="Model Color" />
          <ToolbarButton icon={Icons.AnimationIcon} onClick={() => togglePanel('animation')} active={activePanel === 'animation'} label="Animation" />
          <ToolbarButton icon={Icons.LightingIcon} onClick={() => togglePanel('lighting')} active={activePanel === 'lighting'} label="Lighting" />
          <ToolbarButton icon={Icons.LandscapeIcon} onClick={downloadSnapshot} label="Download Image" />
          <ToolbarButton icon={Icons.CloudDownloadIcon} onClick={downloadOriginal} label="Download Original File" />
        </div>

        {/* Right Group: Viewport Modes (ABSOLUTELY PINNED TO RIGHT) */}
        <div style={{ 
          display: 'flex', 
          gap: '4px', 
          alignItems: 'center', 
          background: '#0a0a0f',
          paddingLeft: '12px',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0
        }}>
          <ToolbarButton 
            icon={Icons.CenterIcon} 
            onClick={() => {
              setResetKey(prev => prev + 1);
              setZoomLevel(1);
            }} 
            label="Center & Reset View" 
          />
          <ToolbarButton icon={Icons.SettingsIcon} onClick={() => togglePanel('settings')} active={activePanel === 'settings'} label="Settings" />
          <ToolbarButton 
            icon={Icons.WireframeIcon} 
            onClick={() => setViewportMode('wireframe')} 
            active={viewportMode === 'wireframe'} 
            label="Wireframe Mode" 
          />
          <ToolbarButton 
            icon={Icons.SolidIcon} 
            onClick={() => setViewportMode('solid')} 
            active={viewportMode === 'solid'} 
            label="Solid Mode" 
          />
          <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
          <ToolbarButton icon={Icons.FullscreenIcon} onClick={handleFullscreen} label="Toggle Fullscreen" />
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        {/* 2. DYNAMIC LEFT SIDEBAR */}
        {activePanel && (
          <div style={{
            width: '300px',
            background: 'rgba(10, 10, 18, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 90,
            animation: 'slideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '10px 0 30px rgba(0,0,0,0.5)'
          }}>
            <div style={{ 
              padding: '14px 18px', 
              background: '#3b82f6', 
              color: 'white', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              fontSize: '11px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
              <span>{activePanel} Controls</span>
              <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
                <Icons.CloseIcon size={16} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }} className="custom-scrollbar">
              {activePanel === 'background' && (
                <BackgroundPanel state={background} setState={setBackground} />
              )}
              {activePanel === 'material' && (
                <MaterialPanel state={material} setState={setMaterial} />
              )}
              {activePanel === 'animation' && (
                <AnimationPanel state={animation} setState={setAnimation} />
              )}
              {activePanel === 'lighting' && (
                <LightingPanel state={lighting} setState={setLighting} />
              )}
              {activePanel === 'settings' && (
                <SettingsPanel 
                  showGrid={showGrid} setShowGrid={setShowGrid} 
                  showAxes={showAxes} setShowAxes={setShowAxes} 
                />
              )}
            </div>
          </div>
        )}

        {/* 3. MAIN CANVAS */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
          <Suspense fallback={<Loader />}>
            <Canvas
              camera={{ fov: 50 }}
              shadows
              gl={{ preserveDrawingBuffer: true, antialias: true }}
            >
              <Scene 
                modelUrl={modelUrl} 
                fileExtension={fileExtension} 
                view={view}
                isViewLocked={isViewLocked}
                onUserInteraction={onUserInteraction}
                viewportMode={viewportMode}
                material={material}
                lighting={lighting}
                animation={animation}
                zoomLevel={zoomLevel}
                showGrid={showGrid}
                showAxes={showAxes}
                resetKey={resetKey}
              />
            </Canvas>
          </Suspense>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .viewer-tool-btn:hover {
          background: rgba(255,255,255,0.08) !important;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.3); borderRadius: 10px; }
        input[type="range"] { height: 4px; -webkit-appearance: none; background: #1e293b; border-radius: 2px; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: #3b82f6; border-radius: 50%; cursor: pointer; }
      `}</style>
    </div>
  );
};

// --- SIDEBAR PANEL COMPONENTS ---

const SectionTitle = ({ children }: any) => (
  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '12px' }}>
    {children}
  </div>
);

const BackgroundPanel = ({ state, setState }: any) => {
  const presets = [
    '#0a0a0f', '#1a1a2e', '#16213e', '#0f3460', '#1b1b1b', '#2d3436',
    ['#833ab4', '#fd1d1d'], ['#00b09b', '#96c93d'], ['#4facfe', '#00f2fe'],
    ['#f093fb', '#f5576c'], ['#5eeff9', '#4568dc'], ['#30cfd0', '#330867']
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <SectionTitle>Presets</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => setState({ 
                top: Array.isArray(p) ? p[0] : p, 
                bottom: Array.isArray(p) ? p[1] : p, 
                isGradient: Array.isArray(p) 
              })}
              style={{
                height: '40px',
                borderRadius: '6px',
                border: '2px solid rgba(255,255,255,0.05)',
                background: Array.isArray(p) ? `linear-gradient(135deg, ${p[0]}, ${p[1]})` : p,
                cursor: 'pointer',
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          ))}
        </div>
      </div>
      
      <div>
        <SectionTitle>Custom Gradient</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>TOP</span>
            <input type="color" value={state.top} onChange={(e) => setState({ ...state, top: e.target.value })} style={{ width: '44px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
          </div>
          <button 
            onClick={() => setState({ ...state, top: state.bottom, bottom: state.top })}
            style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Icons.SwapIcon size={14} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>BOTTOM</span>
            <input type="color" value={state.bottom} onChange={(e) => setState({ ...state, bottom: e.target.value })} style={{ width: '44px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const MaterialPanel = ({ state, setState }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div>
      <SectionTitle>Model Base Color</SectionTitle>
      <input 
        type="color" 
        value={state.color} 
        onChange={(e) => setState({ color: e.target.value, isOverride: true })}
        style={{ width: '100%', height: '48px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '8px' }}
      />
    </div>
    <button 
      onClick={() => setState({ color: '#3b82f6', isOverride: false })}
      style={{
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        color: 'white',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 600,
        transition: 'all 0.2s'
      }}
      className="hover:bg-blue-600"
    >
      Reset to Original
    </button>
  </div>
);

const AnimationPanel = ({ state, setState }: any) => {
  const [activeTab, setActiveTab] = useState<'standard' | 'orientation'>('standard');
  const types = ['none', 'rotate', 'bounce', 'figure-eight', 'hover', 'orbit', 'wobble'];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '6px' }}>
        {['standard', 'orientation'].map((t: any) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              flex: 1, padding: '8px', border: 'none', borderRadius: '4px',
              background: activeTab === t ? '#3b82f6' : 'transparent',
              color: activeTab === t ? 'white' : '#94a3b8',
              fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'standard' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <SectionTitle>Animation Type</SectionTitle>
            <select 
              value={state.type}
              onChange={(e) => setState({ ...state, type: e.target.value })}
              style={{ width: '100%', padding: '10px', background: '#1e293b', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}
            >
              {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>

          {state.type !== 'none' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Length (Cycle Speed)</label>
                  <span style={{ fontSize: '11px', color: 'white' }}>{state.length}s</span>
                </div>
                <input type="range" min="1" max="5" step="0.5" value={state.length} onChange={(e) => setState({ ...state, length: parseFloat(e.target.value) })} />
              </div>

              {state.type === 'rotate' && (
                ['X', 'Y', 'Z'].map((axis, i) => (
                  <div key={axis} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', color: '#94a3b8' }}>Speed {axis}</label>
                    <input type="range" min="-2" max="2" step="0.1" value={state.speed[i]} onChange={(e) => {
                      const newSpeed = [...state.speed];
                      newSpeed[i] = parseFloat(e.target.value);
                      setState({ ...state, speed: newSpeed });
                    }} />
                  </div>
                ))
              )}

              {['bounce', 'orbit', 'wobble', 'figure-eight', 'hover'].includes(state.type) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Amplitude / Intensity</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['low', 'high'].map((level: any) => (
                      <button
                        key={level}
                        onClick={() => setState({ ...state, height: level, radius: level, angle: level })}
                        style={{
                          flex: 1, padding: '6px', fontSize: '10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)',
                          background: state.height === level ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                          color: state.height === level ? '#3b82f6' : '#94a3b8', cursor: 'pointer'
                        }}
                      >
                        {level.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <SectionTitle>Manual Static Rotation</SectionTitle>
          {['X', 'Y', 'Z'].map((axis, i) => (
            <div key={axis}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8' }}>Rotation {axis}</label>
                <span style={{ fontSize: '11px', color: 'white' }}>{Math.round(state.orientation[i] * 180 / Math.PI)}°</span>
              </div>
              <input 
                type="range" min="-3.14" max="3.14" step="0.01" value={state.orientation[i]}
                onChange={(e) => {
                  const newRot = [...state.orientation];
                  newRot[i] = parseFloat(e.target.value);
                  setState({ ...state, orientation: newRot });
                }}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => setState({ type: 'none', orientation: [0, 0, 0], speed: [0, 0.5, 0], length: 2, height: 'low' })}
        style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', fontSize: '11px', fontWeight: 700, marginTop: '10px' }}
      >
        STOP & RESET ALL
      </button>
    </div>
  );
};

const LightingPanel = ({ state, setState }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <SectionTitle>Ambient Light</SectionTitle>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input type="color" value={state.ambient.color} onChange={(e) => setState({ ...state, ambient: { ...state.ambient, color: e.target.value } })} style={{ width: '40px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
        <select value={state.ambient.intensity} onChange={(e) => setState({ ...state, ambient: { ...state.ambient, intensity: parseFloat(e.target.value) } })} style={{ flex: 1, padding: '8px', background: '#1e293b', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v/2}>{v}</option>)}
        </select>
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <SectionTitle>Directional Light</SectionTitle>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input type="color" value={state.directional.color} onChange={(e) => setState({ ...state, directional: { ...state.directional, color: e.target.value } })} style={{ width: '40px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }} />
        <select value={state.directional.intensity} onChange={(e) => setState({ ...state, directional: { ...state.directional, intensity: parseFloat(e.target.value) } })} style={{ flex: 1, padding: '8px', background: '#1e293b', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v/2}>{v}</option>)}
        </select>
      </div>
    </div>
  </div>
);

const SettingsPanel = ({ showGrid, setShowGrid, showAxes, setShowAxes }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <SectionTitle>Viewport Helpers</SectionTitle>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>
        <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} />
        Show Floor Grid
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', fontSize: '13px', cursor: 'pointer' }}>
        <input type="checkbox" checked={showAxes} onChange={(e) => setShowAxes(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} />
        Show Coordinate Axes
      </label>
    </div>
  </div>
);

export default Viewer;
