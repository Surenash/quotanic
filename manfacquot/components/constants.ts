import * as THREE from 'three';
import { ViewPreset } from '../types/types';

export const CAMERA_VIEW_DIRECTIONS: Record<string, THREE.Vector3> = {
  [ViewPreset.ISO]: new THREE.Vector3(1, 1, 1).normalize(),
  [ViewPreset.TOP]: new THREE.Vector3(0, 1, 0),
  [ViewPreset.FRONT]: new THREE.Vector3(0, 0, 1),
  [ViewPreset.RIGHT]: new THREE.Vector3(1, 0, 0),
  [ViewPreset.LEFT]: new THREE.Vector3(-1, 0, 0),
  // Lowercase fallbacks
  'iso': new THREE.Vector3(1, 1, 1).normalize(),
  'top': new THREE.Vector3(0, 1, 0),
  'front': new THREE.Vector3(0, 0, 1),
  'right': new THREE.Vector3(1, 0, 0),
  'left': new THREE.Vector3(-1, 0, 0),
};
