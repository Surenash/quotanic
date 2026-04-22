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
  const geometry = useLoader(STLLoader, url, undefined, (loader) => {
    loader.setCrossOrigin('anonymous');
  });
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
  const model = useLoader(OBJLoader, url, undefined, (loader) => {
    loader.setCrossOrigin('anonymous');
  });
  useFrame(() => applyMaterialSettings(model, viewportMode, materialOverride));
  return <primitive object={model} />;
};

// GLTF/GLB Loader Component
const GLTFModel: React.FC<ModelComponentProps> = ({ url, viewportMode, materialOverride }) => {
  const { scene } = useGLTF(url, undefined, 'anonymous');
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

    // Reset base transforms to Manual Orientation
    group.position.set(0, 0, 0);
    group.rotation.set(animation.orientation[0], animation.orientation[1], animation.orientation[2]);

    const speedFactor = (6 - animation.length); // length 1 -> 5 speed, length 5 -> 1 speed
    const ampFactor = animation.height === 'high' || animation.radius === 'high' || animation.angle === 'high' ? 2 : 1;

    // Procedural Animations
    switch (animation.type) {
      case 'rotate':
        // Continuous rotation based on speed sliders
        group.rotation.x += t * animation.speed[0];
        group.rotation.y += t * animation.speed[1];
        group.rotation.z += t * animation.speed[2];
        break;
      case 'bounce':
        group.position.y = Math.sin(t * speedFactor) * ampFactor;
        break;
      case 'figure-eight':
        group.position.x = Math.sin(t * speedFactor) * ampFactor * 2;
        group.position.y = Math.sin(t * speedFactor * 2) * ampFactor;
        break;
      case 'hover':
        group.position.y = Math.sin(t * speedFactor) * 0.5 * ampFactor;
        break;
      case 'orbit':
        group.position.x = Math.sin(t * speedFactor) * 3 * ampFactor;
        group.position.z = Math.cos(t * speedFactor) * 3 * ampFactor;
        group.rotation.y = -t * speedFactor;
        break;
      case 'wobble':
        group.rotation.z = Math.sin(t * speedFactor) * 0.2 * ampFactor;
        group.rotation.x = Math.cos(t * speedFactor * 0.7) * 0.1 * ampFactor;
        break;
    }
  });

  const renderLoader = () => {
    const props = { url: modelUrl, viewportMode, materialOverride };
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
