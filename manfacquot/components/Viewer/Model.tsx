import React from 'react';
import { useLoader } from '@react-three/fiber';
import { Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { SupportedExtensions } from '../../types/types';

interface ModelComponentProps {
  url: string;
}

// STL Loader Component
const STLModel: React.FC<ModelComponentProps> = ({ url }) => {
  const geometry = useLoader(STLLoader, url);
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#3b82f6" metalness={0.6} roughness={0.4} />
    </mesh>
  );
};

// OBJ Loader Component
const OBJModel: React.FC<ModelComponentProps> = ({ url }) => {
  const model = useLoader(OBJLoader, url);
  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return <primitive object={model} />;
};

// GLTF/GLB Loader Component
const GLTFModel: React.FC<ModelComponentProps> = ({ url }) => {
  const { scene } = useGLTF(url);
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return <primitive object={scene} />;
};

interface LoadedModelProps {
  modelUrl: string;
  fileExtension: SupportedExtensions;
}

const LoadedModel: React.FC<LoadedModelProps> = ({ modelUrl, fileExtension }) => {
  switch (fileExtension) {
    case 'stl':
      return <STLModel url={modelUrl} />;
    case 'obj':
      return <OBJModel url={modelUrl} />;
    case 'gltf':
    case 'glb':
      return <GLTFModel url={modelUrl} />;
    default:
      return null;
  }
};

interface ModelProps {
  modelUrl: string;
  fileExtension: SupportedExtensions;
  onLoad: (payload: { boundingBox: THREE.Box3 }) => void;
}

const Model: React.FC<ModelProps> = ({ modelUrl, fileExtension, onLoad }) => {
  return (
    <Center onCentered={onLoad}>
      <LoadedModel modelUrl={modelUrl} fileExtension={fileExtension} />
    </Center>
  );
};

export default Model;
