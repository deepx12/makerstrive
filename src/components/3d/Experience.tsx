import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, Sparkles, useScroll } from '@react-three/drei';
import { HailstoneRock } from './HailstoneRock';
import * as THREE from 'three';

export const Experience = () => {
    const groupRef = useRef<THREE.Group>(null);
    const scroll = useScroll();

    useFrame(() => {
        // Move the entire group based on scroll
        // Page 1: Center
        // Page 2: Move Left
        // Page 3: Move Right

        const r2 = scroll.range(1 / 3, 1 / 3);
        const r3 = scroll.range(2 / 3, 1 / 3);

        if (groupRef.current) {
            // Basic camera/object movement
            // X position shifts
            groupRef.current.position.x = THREE.MathUtils.lerp(0, -2, r2) + THREE.MathUtils.lerp(0, 2, r3);

            // Z position zoom out/in
            groupRef.current.position.z = THREE.MathUtils.lerp(0, -2, r2);
        }
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} intensity={1} penumbra={1} />
            <pointLight position={[-10, -10, -10]} color="#00f2ff" intensity={0.5} />

            <group ref={groupRef}>
                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                    <HailstoneRock />
                </Float>
            </group>

            <Sparkles count={200} scale={[10, 10, 10]} size={2} speed={0.4} opacity={0.5} color="#00f2ff" />
            <Environment preset="city" />
        </>
    );
};
