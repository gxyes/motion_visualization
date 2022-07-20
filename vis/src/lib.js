import * as THREE from 'three'   

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import  Dat  from 'three/examples/jsm/libs/dat.gui.module.js';

import  Stats  from 'three/examples/jsm/libs/stats.module.js';

THREE.GLTFLoader = GLTFLoader;
THREE.FBXLoader = FBXLoader;
THREE.DRACOLoader = DRACOLoader
THREE.OBJLoader = OBJLoader;

THREE.RGBELoader = RGBELoader;

THREE.OrbitControls = OrbitControls;

THREE.Dat = Dat;
THREE.Stats = Stats;

THREE.ModelAutoCenter =function(group){
		var box3 = new THREE.Box3()
		box3.expandByObject(group)
		var center = new THREE.Vector3()
		box3.getCenter(center)
		group.position.x = group.position.x - center.x
		group.position.y = group.position.y - center.y
		group.position.z = group.position.z - center.z
}

export default THREE;