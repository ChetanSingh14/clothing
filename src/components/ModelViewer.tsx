"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage, Environment, Decal, useTexture } from "@react-three/drei";
import { Suspense } from "react";
import { Loader2, Cuboid } from "lucide-react";
import * as THREE from "three";

// Suppress Three.js deprecation warnings (caused by internal usage in dependencies)
if (typeof console !== "undefined") {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === "string" && args[0].includes("THREE.Clock: This module has been deprecated")) {
      return;
    }
    originalWarn(...args);
  };
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function DecalGraphic({ url }: { url: string }) {
  const texture = useTexture(url);
  // Ensure the texture maps properly in SRGB space
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;

  return (
    <Decal
      position={[0, 0.04, 0.15]}
      rotation={[0, 0, 0]}
      scale={0.15}
      map={texture}
      depthTest={true}
    />
  );
}

function ShirtModel({ decalUrl, color }: { decalUrl?: string; color?: string }) {
  const { nodes } = useGLTF("/shirt_baked.glb") as any;

  // Fallback to the first mesh if T_Shirt_male isn't found
  const meshNode = nodes.T_Shirt_male || Object.values(nodes).find((n: any) => n.isMesh);
  
  if (!meshNode) return null;

  return (
    <mesh geometry={meshNode.geometry} dispose={null}>
      <meshStandardMaterial color={color || "#ffffff"} roughness={0.8} />
      {decalUrl && <DecalGraphic url={decalUrl} />}
    </mesh>
  );
}

export default function ModelViewer({ url, decalUrl, color }: { url?: string; decalUrl?: string; color?: string }) {
  // If url is explicitly provided and no decal is needed, we load that external model. 
  // Otherwise, we load our dynamic ShirtModel with the decal.
  const isValidDecal = decalUrl && decalUrl.trim() !== "";
  const isExternalModel = url && url.trim() !== "" && url.includes(".glb");

  return (
    <div className="w-full h-full bg-[#f8f9fa] rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing group">
      {/* 360 Badge */}
      <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-black/5">
        <Cuboid className="w-4 h-4 text-brand-charcoal" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-charcoal">360° View</span>
      </div>
      
      {/* Helper text on hover */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium tracking-wide">
          Drag to rotate • Scroll to zoom
        </div>
      </div>

      <Suspense fallback={
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f8f9fa]">
          <Loader2 className="h-10 w-10 text-brand-green animate-spin mb-4" />
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-charcoal/40">Loading 3D Model...</span>
        </div>
      }>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />
          <Stage environment={null} intensity={0.8}>
            {isExternalModel && !isValidDecal ? (
              <Model url={url!} />
            ) : (
              <ShirtModel decalUrl={decalUrl} color={color} />
            )}
          </Stage>
          <OrbitControls 
            autoRotate 
            autoRotateSpeed={1.5} 
            enableZoom={true} 
            enablePan={false}
            minPolarAngle={Math.PI / 3} 
            maxPolarAngle={Math.PI / 1.5}
            minDistance={2}
            maxDistance={6}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

// Preload the base shirt model for performance
if (typeof window !== "undefined") {
  useGLTF.preload("/shirt_baked.glb");
}
