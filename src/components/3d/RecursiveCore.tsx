import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useScroll } from '@react-three/drei';

export const RecursiveCore = () => {
    const scroll = useScroll();
    const outerRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        const offset = scroll.offset; // 0 to 1 based on scroll

        // Constant rotation
        if (outerRef.current) {
            outerRef.current.rotation.x = offset * 5;
            outerRef.current.rotation.y += delta * 0.2;
        }

        // Inner core pulses
        if (innerRef.current) {
            innerRef.current.rotation.y -= delta * 0.5;
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
            innerRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group>
            {/* Outer Shell - Metallic/Robotic */}
            <Sphere ref={outerRef} args={[1.5, 32, 32]}>
                <meshStandardMaterial
                    color="#1a1a1a"
                    metalness={0.9}
                    roughness={0.1}
                    wireframe
                />
            </Sphere>

            {/* Inner Core - Nuclear/Glowing */}
            <Sphere ref={innerRef} args={[0.8, 64, 64]}>
                <MeshDistortMaterial
                    color="#00f2ff"
                    emissive="#00f2ff"
                    emissiveIntensity={2}
                    distort={0.4}
                    speed={2}
                    toneMapped={false}
                />
            </Sphere>

            {/* Decorative Rings */}
            <mesh rotation-x={Math.PI / 2}>
                <torusGeometry args={[2.2, 0.02, 16, 100]} />
                <meshBasicMaterial color="#444" transparent opacity={0.5} />
            </mesh>
        </group>
    );
};
