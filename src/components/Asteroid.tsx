import { useFrame } from '@react-three/fiber'
import { useScroll, Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { random } from 'maath'

export const Asteroid = () => {
    const scroll = useScroll()
    const coreRef = useRef<THREE.Group>(null)
    const debrisRef = useRef<THREE.Group>(null)

    // Generate random data for the core rocks
    const coreRocks = useMemo(() => {
        // Create a dense cluster for the core
        return Array.from({ length: 40 }).map(() => ({
            position: [
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            ] as [number, number, number],
            rotation: [
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            ] as [number, number, number],
            scale: 0.5 + Math.random() * 1.5
        }))
    }, [])

    // Generate random data for floating debris
    const debris = useMemo(() => {
        const data = new Float32Array(50 * 3)
        // Spread debris in a wider spherical shell
        random.inSphere(data, { radius: 15 })
        return Array.from({ length: 50 }).map((_, i) => ({
            position: [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]] as [number, number, number],
            rotation: [
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            ] as [number, number, number],
            scale: 0.1 + Math.random() * 0.4
        }))
    }, [])

    useFrame((_, delta) => {
        if (!coreRef.current || !debrisRef.current) return

        // Base rotation
        coreRef.current.rotation.y += delta * 0.1
        coreRef.current.rotation.x += delta * 0.05
        debrisRef.current.rotation.y -= delta * 0.05

        // Scroll influence
        // Using scroll.offset to control zoom/intensity
        const scrollOffset = scroll.offset // 0 to 1

        // Zoom camera slightly based on scroll
        // note: we usually shouldn't mutate camera pos directly if using ScrollControls purely for DOM
        // but here we want a cinematic effect.
        // Let's just rotate the object faster on scroll or move it.

        coreRef.current.rotation.z = scrollOffset * Math.PI * 2

        // Move asteroid closer on scroll
        coreRef.current.position.z = scrollOffset * 5
        debrisRef.current.position.z = scrollOffset * 8
    })

    return (
        <group dispose={null}>
            {/* Inner glowing core light */}
            <pointLight position={[0, 0, 0]} intensity={25} color="#ff5500" distance={10} decay={2} />
            <pointLight position={[0, 0, 0]} intensity={10} color="#ffaa00" distance={5} decay={2} />

            {/* Core Cluster */}
            <group ref={coreRef}>
                <Instances range={40}>
                    <dodecahedronGeometry args={[0.5, 0]} />
                    <meshStandardMaterial
                        color="#121212"
                        roughness={0.9}
                        metalness={0.1}
                    />
                    {coreRocks.map((data, i) => (
                        <Instance
                            key={i}
                            position={data.position}
                            rotation={data.rotation}
                            scale={data.scale}
                        />
                    ))}
                </Instances>

                {/* Add an inner emissive sphere to simulate the leaking magma source */}
                <mesh scale={[1.8, 1.8, 1.8]}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshBasicMaterial color="#ff3300" wireframe={true} transparent opacity={0.1} />
                </mesh>
            </group>

            {/* Floating Debris */}
            <group ref={debrisRef} scale={[1.5, 1.5, 1.5]}>
                <Instances range={50}>
                    <dodecahedronGeometry args={[0.2, 0]} />
                    <meshStandardMaterial
                        color="#2a2a2a"
                        roughness={0.8}
                    />
                    {debris.map((data, i) => (
                        <Instance
                            key={i}
                            position={data.position}
                            rotation={data.rotation}
                            scale={data.scale}
                        />
                    ))}
                </Instances>
            </group>
        </group>
    )
}
