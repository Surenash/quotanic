import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Model from './Model';
import { ViewPreset, SupportedExtensions } from '../../types/types';
import { CAMERA_VIEW_DIRECTIONS } from '../constants';

interface SceneProps {
  modelUrl: string;
  fileExtension: SupportedExtensions;
  view: ViewPreset;
  isViewLocked: boolean;
  onUserInteraction: () => void;
  viewportMode: 'solid' | 'wireframe';
  material: { color: string, isOverride: boolean };
  lighting: any;
  animation: any;
  zoomLevel: number;
  showGrid: boolean;
  showAxes: boolean;
  resetKey: number;
  activeFeatureIndex?: number | null;
  onFeatureClick?: (index: number) => void;
  onLoadComplete?: () => void;
}

const Scene: React.FC<SceneProps> = ({ 
  modelUrl, fileExtension, view, isViewLocked, onUserInteraction,
  viewportMode, material, lighting, animation, zoomLevel,
  showGrid, showAxes, resetKey, activeFeatureIndex, onFeatureClick, onLoadComplete
}) => {
  const { camera, controls, size, gl } = useThree();
  const targetPosition = useRef(new THREE.Vector3(5, 5, 5));
  const [modelBounds, setModelBounds] = useState<THREE.Box3 | null>(null);
  const [baseDistance, setBaseDistance] = useState(10);

  // Force camera update when size changes (e.g. sidebar or fullscreen)
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
    }
    gl.setSize(size.width, size.height);
  }, [size, camera, gl]);

  const handleModelLoad = useCallback((payload: { boundingBox: THREE.Box3 }) => {
    setModelBounds(payload.boundingBox);

    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const boxSize = new THREE.Vector3();
    payload.boundingBox.getSize(boxSize);
    
    const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
    const fov = camera.fov * (Math.PI / 180);
    const distance = (maxDim / (2 * Math.tan(fov / 2))) * 1.5;

    setBaseDistance(distance);
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();
    
    if (controls) {
      (controls as any).target.set(0, 0, 0);
      (controls as any).update();
    }
    
    if (onLoadComplete) {
      // If we are doing a headless capture, jump immediately to the target position
      // instead of lerping, to ensure we capture the full part perfectly framed.
      const direction = CAMERA_VIEW_DIRECTIONS[view];
      const jumpDistance = distance;
      camera.position.copy(direction).multiplyScalar(jumpDistance);
      if (controls) {
        (controls as any).target.set(0, 0, 0);
        (controls as any).update();
      }
      
      // Use a slightly longer delay to ensure the 3D geometry has fully painted 
      // and the browser has finished any initial layout/render cycles.
      setTimeout(() => {
        onLoadComplete();
      }, 500);
    }
  }, [camera, controls, onLoadComplete, view]);

  // RESET LOGIC
  useEffect(() => {
    if (resetKey > 0) {
      const direction = CAMERA_VIEW_DIRECTIONS[ViewPreset.ISO];
      const distance = baseDistance;
      camera.position.copy(direction).multiplyScalar(distance);
      if (controls) {
        (controls as any).target.set(0, 0, 0);
        (controls as any).update();
      }
    }
  }, [resetKey, baseDistance, camera, controls]);

  useEffect(() => {
    if (controls) {
      const handleStart = () => onUserInteraction();
      (controls as any).addEventListener('start', handleStart);
      return () => (controls as any).removeEventListener('start', handleStart);
    }
  }, [controls, onUserInteraction]);

  useEffect(() => {
    const distance = baseDistance / (zoomLevel || 1);
    const direction = CAMERA_VIEW_DIRECTIONS[view];
    
    if (isViewLocked) {
      targetPosition.current.copy(direction).multiplyScalar(distance);
    } else if (controls) {
      // If unlocked, just adjust the distance of the existing camera position relative to origin
      const currentDir = camera.position.clone().normalize();
      camera.position.copy(currentDir).multiplyScalar(distance);
      (controls as any).update();
    }
  }, [view, modelBounds, baseDistance, zoomLevel, isViewLocked, camera, controls]);

  useFrame((state) => {
    if (isViewLocked && !state.camera.position.equals(targetPosition.current)) {
      state.camera.position.lerp(targetPosition.current, 0.1);
      if (controls) (controls as any).update();
    }
  });

  return (
    <>
      {/* Dynamic Lighting */}
      <ambientLight 
        intensity={lighting.ambient.intensity} 
        color={lighting.ambient.color} 
      />
      <directionalLight 
        position={[baseDistance, baseDistance, baseDistance / 2]} 
        intensity={lighting.directional.intensity}
        color={lighting.directional.color}
        castShadow
      />
      <directionalLight 
        position={[-baseDistance, -baseDistance, -baseDistance / 2]} 
        intensity={lighting.directional.intensity * 0.5} 
        color={lighting.directional.color}
      />
      
      <Environment preset="city" opacity={0.5} />

      {showAxes && <axesHelper args={[baseDistance]} />}

      <Model 
        modelUrl={modelUrl} 
        fileExtension={fileExtension} 
        onLoad={handleModelLoad} 
        viewportMode={viewportMode}
        materialOverride={material}
        animation={animation}
        activeFeatureIndex={activeFeatureIndex}
        onFeatureClick={onFeatureClick}
      />
      
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        minDistance={baseDistance / 20}
        maxDistance={baseDistance * 20}
      />

      {showGrid && (
        <Grid
          infiniteGrid
          cellSize={baseDistance / 10}
          sectionSize={baseDistance}
          sectionColor={"#4f4f4f"}
          fadeDistance={baseDistance * 5}
          fadeStrength={1}
        />
      )}
    </>
  );
};

export default Scene;
