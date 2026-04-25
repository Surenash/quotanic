import React, { useRef } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { Center, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { SupportedExtensions } from '../../types/types';

interface ModelComponentProps {
  url: string;
  viewportMode: string;
  materialOverride: { color: string, isOverride: boolean };
  activeFeatureIndex?: number | null;
  activeFeatureType?: string;
  onFeatureClick?: (index: number) => void;
}


const applyMaterialSettings = (obj: any, mode: string, override: any, activeFeatureIndex?: number | null, activeFeatureType?: string) => {
  const meshes: any[] = [];
  obj.traverse((child: any) => { 
    if (child.isMesh) {
      meshes.push(child);
      if (child.material && !child.userData.materialCloned) {
        child.material = child.material.clone();
        child.userData.materialCloned = true;
      }
    }
  });
  
  const totalMeshes = meshes.length;
  if (activeFeatureIndex !== null && activeFeatureIndex !== undefined) {
    console.log(`[Viewer Debug] Selecting Feature #${activeFeatureIndex} (${activeFeatureType}). Total Meshes in Model: ${totalMeshes}`);
  }

  meshes.forEach((child, idx) => {
    child.castShadow = true;
    child.receiveShadow = true;
    
    if (child.material) {
      child.material.wireframe = mode === 'wireframe';
      
      if (override.isOverride) {
        child.material.color.set(override.color);
      } else if (activeFeatureIndex !== undefined && activeFeatureIndex !== null) {
        const isBase = child.name.toLowerCase().includes('base');
        
        const typeMatch = activeFeatureType ? (
            (activeFeatureType.toLowerCase().includes('hole') && child.name.includes('Holes')) ||
            (activeFeatureType.toLowerCase().includes('pocket') && child.name.includes('Pockets'))
        ) : false;

        const isSelected = 
          (!isBase && (child.name === `Feature_${activeFeatureIndex}` || child.name === `Feature ${activeFeatureIndex}`)) || 
          (!isBase && typeMatch) ||
          (!isBase && totalMeshes > 1 && idx === activeFeatureIndex);

        if (isSelected) {
          if (idx < 5 || idx === activeFeatureIndex) {
             console.log(`[Viewer Debug] Highlighting Mesh: idx=${idx}, name="${child.name}", isSelected=${isSelected}`);
          }
          child.material.color.set('#facc15'); 
          child.material.emissive?.set('#332200');
        } else {
          child.material.color.set('#3b82f6');
          child.material.emissive?.set('#000000');
        }
      } else {
         child.material.color.set('#3b82f6');
         child.material.emissive?.set('#000000');
      }
    }
  });
};

// STL Loader Component
const STLModel: React.FC<ModelComponentProps> = ({ url, viewportMode, materialOverride, activeFeatureIndex, onFeatureClick }) => {
  const geometry = useLoader(STLLoader, url, (loader) => {
    loader.setCrossOrigin('anonymous');
  });
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.wireframe = viewportMode === 'wireframe';
      if (materialOverride.isOverride) {
        materialRef.current.color.set(materialOverride.color);
      } else if (activeFeatureIndex !== undefined && activeFeatureIndex !== null) {
        // STL is almost always 1 mesh, so we highlight the whole thing
        materialRef.current.color.set('#facc15');
      } else {
        materialRef.current.color.set('#3b82f6');
      }
    }
  });

  return (
    <mesh
        geometry={geometry}
        castShadow
        receiveShadow
        onClick={(e) => { 
            e.stopPropagation(); 
            if (onFeatureClick) onFeatureClick(0); // For STL, we only have one mesh/feature to click
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <meshStandardMaterial ref={materialRef} color="#3b82f6" metalness={0.6} roughness={0.4} />
    </mesh>
  );
};

// OBJ Loader Component
const OBJModel: React.FC<ModelComponentProps> = ({ url, viewportMode, materialOverride, activeFeatureIndex, activeFeatureType, onFeatureClick }) => {
  const model = useLoader(OBJLoader, url, (loader) => {
    loader.setCrossOrigin('anonymous');
  });

  useFrame(() => {
    applyMaterialSettings(model, viewportMode, materialOverride, activeFeatureIndex, activeFeatureType);
  });

  return <primitive
      object={model}
      onClick={(e: any) => { 
          e.stopPropagation(); 
          // Detect which sub-mesh was clicked if possible
          const meshIdx = e.intersections?.[0]?.object?.userData?.index || 0;
          if (onFeatureClick) onFeatureClick(meshIdx); 
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
  />;
};

// GLTF/GLB Loader Component
const GLTFModel: React.FC<ModelComponentProps> = ({ url, viewportMode, materialOverride, activeFeatureIndex, activeFeatureType, onFeatureClick }) => {
  const { scene } = useGLTF(url, undefined, undefined, (loader: any) => {
    loader.setCrossOrigin('anonymous');
  });

  // Assign indices to meshes for identification
  scene.traverse((child: any, idx: number) => {
      if (child.isMesh) child.userData.index = idx;
  });

  useFrame(() => {
    applyMaterialSettings(scene, viewportMode, materialOverride, activeFeatureIndex, activeFeatureType);
  });

  return <primitive
      object={scene}
      onClick={(e: any) => { 
          e.stopPropagation(); 
          // Get the index of the clicked mesh
          const meshIdx = e.object?.userData?.index || 0;
          if (onFeatureClick) onFeatureClick(meshIdx);
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
  />;
};

interface ModelProps {
  modelUrl: string;
  fileExtension: SupportedExtensions;
  onLoad: (payload: { boundingBox: THREE.Box3 }) => void;
  viewportMode: 'solid' | 'wireframe';
  materialOverride: { color: string, isOverride: boolean };
  animation: any;
  activeFeatureIndex?: number | null;
  activeFeatureType?: string;
  onFeatureClick?: (index: number) => void;
}

const Model: React.FC<ModelProps> = ({ modelUrl, fileExtension, onLoad, viewportMode, materialOverride, animation, activeFeatureIndex, activeFeatureType, onFeatureClick }) => {
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
    const props = { url: modelUrl, viewportMode, materialOverride, activeFeatureIndex, activeFeatureType, onFeatureClick };
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
