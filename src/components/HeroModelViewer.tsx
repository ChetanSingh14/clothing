"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Decal, useTexture, Stage, OrbitControls } from "@react-three/drei";
import { Suspense, useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import * as THREE from "three";
import gsap from "gsap";

function DecalGraphic({ url }: { url: string }) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;

  // Logo ratio is width: 1195, height: 369 -> approx 3.24
  // scale={[width, height, depth]}
  return (
    <Decal
      position={[0, 0.04, 0.15]}
      rotation={[0, 0, 0]}
      scale={[0.18, 0.18 / 3.24, 0.15]}
      map={texture}
      depthTest={true}
    />
  );
}

function ShirtModel({ flavor }: { flavor: "cream" | "brown" }) {
  const { nodes } = useGLTF("/shirt_baked.glb") as any;
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Fallback to the first mesh if T_Shirt_male isn't found
  const meshNode = nodes.T_Shirt_male || Object.values(nodes).find((n: any) => n.isMesh);

  // cream flavor -> black shirt (#111111)
  // brown flavor -> cream shirt (#f5e0cf)
  const targetColor = useRef(new THREE.Color(flavor === "brown" ? "#f5e0cf" : "#111111"));

  useEffect(() => {
    targetColor.current.set(flavor === "brown" ? "#f5e0cf" : "#111111");
  }, [flavor]);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.color.lerp(targetColor.current, 0.08);
    }
  });

  if (!meshNode) return null;

  // cream flavor -> brown shirt -> use logo-light.png
  // brown flavor -> cream shirt -> use logo-dark.png
  const decalUrl = flavor === "brown" ? "/logo-dark.png" : "/logo-light.png";

  return (
    <mesh geometry={meshNode.geometry} dispose={null}>
      <meshStandardMaterial
        ref={materialRef}
        color={flavor === "brown" ? "#f5e0cf" : "#111111"}
        roughness={0.85}
      />
      <DecalGraphic url={decalUrl} />
    </mesh>
  );
}

function RotatingGroup({ flavor, spinRef, children }: { flavor: "cream" | "brown"; spinRef: React.MutableRefObject<number>; children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Rotate group for flavor switch animation
      groupRef.current.rotation.y = spinRef.current;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function InnerViewer({ flavor, spinRef }: { flavor: "cream" | "brown"; spinRef: React.MutableRefObject<number> }) {
  return (
    <Stage environment={null} intensity={0.8} adjustCamera={1.8}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <OrbitControls enableZoom={false} enablePan={false} />
      <RotatingGroup flavor={flavor} spinRef={spinRef}>
        <ShirtModel flavor={flavor} />
      </RotatingGroup>
    </Stage>
  );
}

export default function HeroModelViewer({ flavor, className }: { flavor: "cream" | "brown"; className?: string }) {
  const [blurVal, setBlurVal] = useState(0);
  const spinRef = useRef(0);
  const prevFlavor = useRef(flavor);

  useEffect(() => {
    if (prevFlavor.current !== flavor) {
      prevFlavor.current = flavor;

      const animObj = { val: 0, blur: 0 };
      
      // Phase 1: spin 360 and blur to 15px in 0.6s (using radians: Math.PI * 2)
      gsap.to(animObj, {
        val: Math.PI * 2,
        blur: 15,
        duration: 0.6,
        ease: "power2.in",
        onUpdate: () => {
          spinRef.current = animObj.val;
          setBlurVal(animObj.blur);
        },
        onComplete: () => {
          // Phase 2: spin another 360 (to 720, i.e., Math.PI * 4) and unblur to 0px in 0.9s
          gsap.to(animObj, {
            val: Math.PI * 4,
            blur: 0,
            duration: 0.9,
            ease: "back.out(0.7)",
            onUpdate: () => {
              spinRef.current = animObj.val;
              setBlurVal(animObj.blur);
            },
            onComplete: () => {
              spinRef.current = 0;
              setBlurVal(0);
            }
          });
        }
      });
    }
  }, [flavor]);

  return (
    <div
      className={className}
      style={{
        filter: blurVal > 0 ? `blur(${blurVal}px)` : "none",
        transition: "filter 0.1s ease-out",
        background: "transparent",
        backgroundColor: "transparent",
      }}
    >
      <Suspense
        fallback={
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent">
            <Loader2 className="h-10 w-10 text-brand-green animate-spin mb-4" />
          </div>
        }
      >
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{ preserveDrawingBuffer: true, alpha: true }}
          style={{ background: "transparent", backgroundColor: "transparent" }}
        >
          <ambientLight intensity={0.7} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <InnerViewer flavor={flavor} spinRef={spinRef} />
        </Canvas>
      </Suspense>
    </div>
  );
}

// Preload the base shirt model for performance
if (typeof window !== "undefined") {
  useGLTF.preload("/shirt_baked.glb");
}
