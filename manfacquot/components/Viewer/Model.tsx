import React, { useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { SupportedExtensions } from '../../types/types';

interface ModelComponentProps {
  url: string;
  viewportMode: 'solid' | 'wireframe';
  materialOverride: { color: string, isOverride: boolean };
  animation: any;
}

const applyMaterialSettings = (obj: any, mode: string, override: any) => {
  obj.traverse((child: any) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        child.material.wireframe = mode === 'wireframe';
        if (override.isOverride) {
          child.material.color.set(override.color);
        }
      }
    }
  });
};

// STL Loader Component
const STLModel: React.FC<ModelComponentProps> = ({ url, viewportMode, materialOverride }) => {
  const geometry = useLoader(STLLoader, url);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.wireframe = viewportMode === 'wireframe';
      if (materialOverride.isOverride) {
        materialRef.current.color.set(materialOverride.color);
      } else {
        materialRef.current.color.set('#3b82f6');
      }
    }
  });

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial ref={materialRef} color="#3b82f6" metalness={0.6} roughness={0.4} />
    </mesh>
  );
};

// OBJ Loader Component
const OBJModel: React.FC<ModelComponentProps> = ({ url, viewportMode, materialOverride }) => {
  const model = useLoader(OBJLoader, url);
  useFrame(() => applyMaterialSettings(model, viewportMode, materialOverride));
  return <primitive object={model} />;
};

// GLTF/GLB Loader Component
const GLTFModel: React.FC<ModelComponentProps> = ({ url, viewportMode, materialOverride }) => {
  const { scene } = useGLTF(url);
  useFrame(() => applyMaterialSettings(scene, viewportMode, materialOverride));
  return <primitive object={scene} />;
};

interface ModelProps {
  modelUrl: string;
  fileExtension: SupportedExtensions;
  onLoad: (payload: { boundingBox: THREE.Box3 }) => void;
  viewportMode: 'solid' | 'wireframe';
  materialOverride: { color: string, isOverride: boolean };
  animation: any;
}

const Model: React.FC<ModelProps> = ({ modelUrl, fileExtension, onLoad, viewportMode, materialOverride, animation }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    const group = groupRef.current;

    // Reset base transforms
    group.position.set(0, 0, 0);
    
    // Apply manual rotations from state
    group.rotation.set(animation.rotation[0], animation.rotation[1], animation.rotation[2]);

    // Procedural Animations
    switch (animation.type) {
      case 'rotate':
        group.rotation.y += t * 0.5;
        break;
      case 'bounce':
        group.position.y = Math.sin(t * 2) * 2;
        break;
      case 'wobble':
        group.rotation.z = Math.sin(t * 3) * 0.2;
        group.rotation.x = Math.cos(t * 2) * 0.1;
        break;
      case 'hover':
        group.position.y = Math.sin(t * 1.5) * 0.5;
        break;
      case 'figure-eight':
        group.position.x = Math.sin(t) * 2;
        group.position.y = Math.sin(t * 2) * 1;
        break;
      case 'orbit':
        group.position.x = Math.sin(t) * 3;
        group.position.z = Math.cos(t) * 3;
        group.rotation.y = -t;
        break;
    }
  });

  const renderLoader = () => {
    const props = { url: modelUrl, viewportMode, materialOverride, animation };
    switch (fileExtension) {
      case 'stl': return <STLModel {...props} />;
      case 'obj': return <OBJModel {...props} />;
      case 'gltf':
      case 'glb': return <GLTFModel {...props} />;
      default: return null;
    }
  };

  return (
    <Center onCentered={onLoad}>
      <group ref={groupRef}>
        {renderLoader()}
      </group>
    </Center>
  );
};

export default Model;
