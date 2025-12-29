"use client"

import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useRef, Suspense } from 'react'

function Diamond(props: JSX.IntrinsicElements['group']) {
  const ref = useRef<THREE.Group>(null!)
  const { nodes } = useGLTF('https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/diamond/model.gltf') as any;

  // Diamond material
  const diamondMaterial = new THREE.MeshPhysicalMaterial({
    metalness: 0,
    roughness: 0.05,
    transmission: 0.9,
    thickness: 2.3,
    ior: 2.417,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    color: new THREE.Color('white'),
    reflectivity: 0.9,
  });

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime()
    ref.current.rotation.x = -Math.PI / 1.75 + Math.cos(t / 4) / 8
    ref.current.rotation.y = Math.sin(t / 2) / 1
    ref.current.rotation.z = (1 + Math.sin(t / 1.5)) / 20
    ref.current.position.y = (1 + Math.sin(t / 1.5)) / 10
  })

  return (
    <group ref={ref} {...props} dispose={null}>
      <mesh geometry={nodes.diamond.geometry} material={diamondMaterial} />
    </group>
  )
}

function Model() {
  const { nodes } = useGLTF('https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/ring/model.gltf') as any;

  // Gold material
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: '#FFD700',
    metalness: 0.9,
    roughness: 0.2,
  });

  return (
    <group position={[0, -5, 0]}>
        <mesh geometry={nodes.ring.geometry} material={goldMaterial} receiveShadow castShadow />
        <Diamond position={[0, 17, 0]} scale={[8, 8, 8]} />
    </group>
  )
}

export function Ring() {
  return (
    <Canvas
      style={{ touchAction: 'none' }}
      camera={{ position: [0, 0, 100], fov: 25 }}
    >
      <ambientLight intensity={1} />
      <spotLight intensity={0.5} angle={0.1} penumbra={1} position={[10, 15, 10]} castShadow />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}
