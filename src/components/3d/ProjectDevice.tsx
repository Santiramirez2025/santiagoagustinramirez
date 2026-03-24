"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, MeshDistortMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

interface DeviceMockupProps {
  color: string;
  isActive: boolean;
}

function GlowingSphere({ color, position, scale }: { color: string; position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <MeshDistortMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        roughness={0.2}
        metalness={0.8}
        distort={0.3}
        speed={2}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function PhoneDevice({ color, isActive }: DeviceMockupProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame((state) => {
    if (groupRef.current) {
      const target = isActive ? 0 : Math.PI * 0.15;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        target + Math.sin(state.clock.elapsedTime * 0.5) * 0.08,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        Math.sin(state.clock.elapsedTime * 0.3) * 0.05,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        {/* Phone body */}
        <RoundedBox args={[1.6, 3.2, 0.12]} radius={0.15} smoothness={4}>
          <meshPhysicalMaterial
            color="#111118"
            roughness={0.1}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </RoundedBox>

        {/* Screen */}
        <RoundedBox args={[1.4, 2.9, 0.01]} radius={0.1} smoothness={4} position={[0, 0, 0.07]}>
          <meshPhysicalMaterial
            color={matColor}
            emissive={matColor}
            emissiveIntensity={0.15}
            roughness={0.05}
            metalness={0.1}
            clearcoat={0.5}
          />
        </RoundedBox>

        {/* Screen content bars */}
        {[-0.8, -0.3, 0.2, 0.7].map((y, i) => (
          <RoundedBox
            key={i}
            args={[1 - i * 0.15, 0.15, 0.005]}
            radius={0.05}
            smoothness={2}
            position={[-0.05 + i * 0.03, y, 0.08]}
          >
            <meshBasicMaterial color="white" transparent opacity={0.15 + i * 0.05} />
          </RoundedBox>
        ))}

        {/* Notch */}
        <RoundedBox args={[0.5, 0.08, 0.005]} radius={0.03} smoothness={2} position={[0, 1.35, 0.08]}>
          <meshBasicMaterial color="black" />
        </RoundedBox>
      </Float>

      {/* Floating particles */}
      <GlowingSphere color={color} position={[1.5, 1, -0.5]} scale={0.15} />
      <GlowingSphere color={color} position={[-1.3, -0.8, -0.3]} scale={0.1} />
      <GlowingSphere color={color} position={[1, -1.2, 0.5]} scale={0.08} />
    </group>
  );
}

interface ProjectDeviceProps {
  color: string;
  isActive: boolean;
}

export function ProjectDevice({ color, isActive }: ProjectDeviceProps) {
  return (
    <div className="w-full h-[360px] md:h-[420px] relative">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, -3, 2]} intensity={0.5} color={color} />
        <spotLight
          position={[0, 5, 3]}
          intensity={0.6}
          angle={0.5}
          penumbra={0.8}
          color={color}
        />
        <PhoneDevice color={color} isActive={isActive} />
        <Environment preset="city" />
      </Canvas>

      {/* Glow effect behind canvas */}
      <div
        className="absolute inset-0 -z-10 opacity-30 blur-[80px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}40, transparent 70%)`,
        }}
      />
    </div>
  );
}
