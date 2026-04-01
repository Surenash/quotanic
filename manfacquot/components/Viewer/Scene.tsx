
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
}

const Scene: React.FC<SceneProps> = ({ 
  modelUrl, fileExtension, view, isViewLocked, onUserInteraction,
  viewportMode, material, lighting, animation, zoomLevel,
  showGrid, showAxes
}) => {
  const { camera, controls } = useThree();
  const targetPosition = useRef(new THREE.Vector3(5, 5, 5));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const [modelBounds, setModelBounds] = useState<THREE.Box3 | null>(null);
  const [baseDistance, setBaseDistance] = useState(10);

  const handleModelLoad = useCallback((payload: { boundingBox: THREE.Box3 }) => {
    setModelBounds(payload.boundingBox);

    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    const size = new THREE.Vector3();
    payload.boundingBox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const distance = (maxDim / (2 * Math.tan(fov / 2))) * 1.5;

    setBaseDistance(distance);
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();
  }, [camera]);

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
    targetPosition.current.copy(direction).multiplyScalar(distance);
  }, [view, modelBounds, baseDistance, zoomLevel]);

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
      />
      
      <OrbitControls
        makeDefault
        target={targetLookAt.current}
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
