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
}

// Sidebar Panel Types
type PanelType = 'background' | 'material' | 'animation' | 'lighting' | null;

const Viewer: React.FC<ViewerProps> = ({ modelUrl, fileExtension, view, isViewLocked, onUserInteraction }) => {
  // --- STATE ---
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [viewportMode, setViewportMode] = useState<'solid' | 'wireframe'>('solid');
  const [zoomLevel, setZoomLevel] = useState(1);
  
  const [background, setBackground] = useState({
    top: '#1a1a2e',
    bottom: '#0a0a0f',
    isGradient: true
  });

  const [material, setMaterial] = useState({
    color: '#3b82f6',
    isOverride: false
  });

  const [animation, setAnimation] = useState({
    type: 'none',
    rotation: [0, 0, 0] as [number, number, number]
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

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // --- RENDER HELPERS ---
  const ToolbarButton = ({ icon: Icon, onClick, active = false, label }: any) => (
    <button
      onClick={onClick}
      title={label}
      style={{
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        border: 'none',
        background: active ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
        color: active ? '#3b82f6' : '#94a3b8',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      className="viewer-tool-btn"
    >
      <Icon size={20} />
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
        height: '56px',
        width: '100%',
        background: 'rgba(15, 15, 25, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 100
      }}>
        {/* Left Group: Contextual Tools */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ToolbarButton icon={Icons.ZoomOutIcon} onClick={() => setZoomLevel(prev => Math.max(0.1, prev - 0.1))} label="Zoom Out" />
          <ToolbarButton icon={Icons.ZoomInIcon} onClick={() => setZoomLevel(prev => Math.min(5, prev + 0.1))} label="Zoom In" />
          <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
          <ToolbarButton icon={Icons.BackgroundIcon} onClick={() => togglePanel('background')} active={activePanel === 'background'} label="Background" />
          <ToolbarButton icon={Icons.ModelColorIcon} onClick={() => togglePanel('material')} active={activePanel === 'material'} label="Model Color" />
          <ToolbarButton icon={Icons.AnimationIcon} onClick={() => togglePanel('animation')} active={activePanel === 'animation'} label="Animation" />
          <ToolbarButton icon={Icons.LightingIcon} onClick={() => togglePanel('lighting')} active={activePanel === 'lighting'} label="Lighting" />
          <ToolbarButton icon={Icons.LandscapeIcon} onClick={() => {}} label="Environment Map" />
          <ToolbarButton icon={Icons.CloudDownloadIcon} onClick={() => {}} label="Download" />
        </div>

        {/* Right Group: Viewport Modes */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ToolbarButton icon={Icons.SettingsIcon} onClick={() => {}} label="Settings" />
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
          <ToolbarButton icon={Icons.FullscreenIcon} onClick={handleFullscreen} label="Toggle Fullscreen" />
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        {/* 2. DYNAMIC LEFT SIDEBAR */}
        {activePanel && (
          <div style={{
            width: '280px',
            background: 'rgba(15, 15, 25, 0.95)',
            backdropFilter: 'blur(15px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 90,
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ 
              padding: '16px', 
              background: '#3b82f6', 
              color: 'white', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '12px'
            }}>
              <span>{activePanel} Controls</span>
              <button onClick={() => setActivePanel(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <Icons.CloseIcon size={18} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
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
            </div>
          </div>
        )}

        {/* 3. MAIN CANVAS */}
        <div style={{ flex: 1, position: 'relative' }}>
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
              />
            </Canvas>
          </Suspense>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .viewer-tool-btn:hover {
          color: white !important;
          background: rgba(255,255,255,0.05) !important;
        }
      `}</style>
    </div>
  );
};

// --- SIDEBAR PANEL COMPONENTS ---

const BackgroundPanel = ({ state, setState }: any) => {
  const presets = [
    '#0a0a0f', '#1a1a2e', '#16213e', '#0f3460', '#1b1b1b', '#2d3436',
    ['#833ab4', '#fd1d1d'], ['#00b09b', '#96c93d'], ['#4facfe', '#00f2fe'],
    ['#f093fb', '#f5576c'], ['#5eeff9', '#4568dc'], ['#30cfd0', '#330867']
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Presets</div>
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
              border: '2px solid rgba(255,255,255,0.1)',
              background: Array.isArray(p) ? `linear-gradient(135deg, ${p[0]}, ${p[1]})` : p,
              cursor: 'pointer'
            }}
          />
        ))}
      </div>
      
      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', color: '#94a3b8' }}>Top</label>
          <input 
            type="color" 
            value={state.top} 
            onChange={(e) => setState({ ...state, top: e.target.value })}
            style={{ width: '60px', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }}
          />
        </div>
        <button 
          onClick={() => setState({ ...state, top: state.bottom, bottom: state.top })}
          style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer' }}
        >
          <Icons.SwapIcon size={16} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '11px', color: '#94a3b8' }}>Bottom</label>
          <input 
            type="color" 
            value={state.bottom} 
            onChange={(e) => setState({ ...state, bottom: e.target.value })}
            style={{ width: '60px', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
};

const MaterialPanel = ({ state, setState }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Model Base Color</div>
    <input 
      type="color" 
      value={state.color} 
      onChange={(e) => setState({ color: e.target.value, isOverride: true })}
      style={{ width: '100%', height: '40px', border: 'none', background: 'none', cursor: 'pointer' }}
    />
    <button 
      onClick={() => setState({ color: '#3b82f6', isOverride: false })}
      style={{
        padding: '10px',
        borderRadius: '6px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        color: 'white',
        cursor: 'pointer',
        fontSize: '13px'
      }}
    >
      Reset to Original
    </button>
  </div>
);

const AnimationPanel = ({ state, setState }: any) => {
  const types = ['none', 'rotate', 'bounce', 'figure-eight', 'hover', 'orbit', 'wobble'];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8' }}>Standard Animations</div>
      <select 
        value={state.type}
        onChange={(e) => setState({ ...state, type: e.target.value })}
        style={{
          width: '100%',
          padding: '10px',
          background: '#1a1a2e',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px',
          outline: 'none'
        }}
      >
        {types.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
      </select>

      <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {['X', 'Y', 'Z'].map((axis, i) => (
          <div key={axis}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', color: '#94a3b8' }}>Rotation {axis}</label>
              <span style={{ fontSize: '11px', color: 'white' }}>{Math.round(state.rotation[i] * 180 / Math.PI)}°</span>
            </div>
            <input 
              type="range" 
              min="-3.14" 
              max="3.14" 
              step="0.01"
              value={state.rotation[i]}
              onChange={(e) => {
                const newRot = [...state.rotation];
                newRot[i] = parseFloat(e.target.value);
                setState({ ...state, rotation: newRot });
              }}
              style={{ width: '100%', accentColor: '#3b82f6' }}
            />
          </div>
        ))}
      </div>

      <button 
        onClick={() => setState({ type: 'none', rotation: [0, 0, 0] })}
        style={{
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '13px',
          marginTop: '10px'
        }}
      >
        Stop & Reset
      </button>
    </div>
  );
};

const LightingPanel = ({ state, setState }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8', borderLeft: '2px solid #3b82f6', paddingLeft: '8px' }}>Ambient Light</div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input 
          type="color" 
          value={state.ambient.color} 
          onChange={(e) => setState({ ...state, ambient: { ...state.ambient, color: e.target.value } })}
          style={{ width: '40px', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }}
        />
        <select 
          value={state.ambient.intensity}
          onChange={(e) => setState({ ...state, ambient: { ...state.ambient, intensity: parseFloat(e.target.value) } })}
          style={{ flex: 1, padding: '6px', background: '#1a1a2e', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v/2}>{v}</option>)}
        </select>
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '13px', color: '#94a3b8', borderLeft: '2px solid #3b82f6', paddingLeft: '8px' }}>Directional Light</div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input 
          type="color" 
          value={state.directional.color} 
          onChange={(e) => setState({ ...state, directional: { ...state.directional, color: e.target.value } })}
          style={{ width: '40px', height: '30px', border: 'none', background: 'none', cursor: 'pointer' }}
        />
        <select 
          value={state.directional.intensity}
          onChange={(e) => setState({ ...state, directional: { ...state.directional, intensity: parseFloat(e.target.value) } })}
          style={{ flex: 1, padding: '6px', background: '#1a1a2e', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => <option key={v} value={v/2}>{v}</option>)}
        </select>
      </div>
    </div>
  </div>
);

export default Viewer;
