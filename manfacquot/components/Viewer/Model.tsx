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
        const isBase = child.userData.isBase;
        const isSelected = !isBase && child.userData.featureIndex === activeFeatureIndex;

        if (isSelected) {
          console.log(`[Viewer Debug] Highlighting Mesh: idx=${idx}, featureIndex=${child.userData.featureIndex}, name="${child.name}"`);
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

  // Assign indices and parse names from hierarchy
  let mIdx = 0;
  scene.traverse((child: any) => {
      if (child.isMesh) {
          child.userData.index = mIdx++;
          
          // Walk up parents to find Feature_X or BaseModel name
          let current: any = child;
          let foundName = null;
          while (current) {
              if (current.name) {
                console.log(`[Viewer Debug] Traversal: Mesh="${child.name}", checking ancestor="${current.name}"`);
                const match = current.name.match(/Feature_(\d+)/i);
                if (match) {
                    child.userData.featureIndex = parseInt(match[1], 10);
                    child.userData.isFeature = true;
                    foundName = current.name;
                    break;
                }
                if (current.name.toLowerCase().includes('base')) {
                    child.userData.isBase = true;
                    foundName = current.name;
                    break;
                }
              }
              current = current.parent;
          }
          if (foundName) {
            console.log(`[Viewer Debug] Mapping Result: Mesh="${child.name}" -> Resolved Name="${foundName}", Index=${child.userData.featureIndex}`);
          }
      }
  });

  useFrame(() => {
    applyMaterialSettings(scene, viewportMode, materialOverride, activeFeatureIndex, activeFeatureType);
  });

  return <primitive
      object={scene}
      onClick={(e: any) => { 
          e.stopPropagation(); 
          // Find the intersected mesh
          const mesh = e.intersections?.[0]?.object || e.object;
          if (!mesh) return;

          console.log(`[Viewer Debug] Clicked Mesh: name="${mesh.name}", featureIndex=${mesh.userData?.featureIndex}`);

          if (mesh.userData?.isBase) {
              console.log("[Viewer Debug] Clicked base model, ignoring.");
              return;
          }

          if (mesh.userData?.featureIndex !== undefined) {
              if (onFeatureClick) onFeatureClick(mesh.userData.featureIndex);
          }
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
