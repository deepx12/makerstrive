import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

export const Rocks = ({ count = 100 }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null!)
    const { positions, rotations, scales, rotationSpeeds } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const rotations = new Float32Array(count * 3)
        const scales = new Float32Array(count * 3)
        const rotationSpeeds = new Float32Array(count * 3) // Store random rotation speeds

        for (let i = 0; i < count; i++) {
            // Distribute rocks along a "tunnel" 
            // Z goes from close to camera/behind to deep into scene
            const z = 30 - Math.random() * 250 // Longer tunnel for more depth

            // Keep them outside a central tunnel radius but TIGHTER
            const angle = Math.random() * Math.PI * 2
            // Radius varies more to create layers
            // Inner layer: 4-8, Outer layer: 8-25
            const radius = 5 + Math.pow(Math.random(), 2) * 20

            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius

            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            // Random rotations
            rotations[i * 3] = Math.random() * Math.PI
            rotations[i * 3 + 1] = Math.random() * Math.PI
            rotations[i * 3 + 2] = Math.random() * Math.PI

            // Random scales - Tweak for "heavy" asteroids
            const scale = 1 + Math.random() * 5
            scales[i * 3] = scale
            scales[i * 3 + 1] = scale
            scales[i * 3 + 2] = scale

            // Random rotation speeds
            rotationSpeeds[i * 3] = (Math.random() - 0.5) * 0.2
            rotationSpeeds[i * 3 + 1] = (Math.random() - 0.5) * 0.2
            rotationSpeeds[i * 3 + 2] = (Math.random() - 0.5) * 0.2
        }
        return { positions, rotations, scales, rotationSpeeds }
    }, [count])

    // Optimize: Update individual matrices every frame for "tumbling" effect
    // Note: InstancedMesh + useFrame loop can be expensive for thousands of objects, 
    // but for < 500 rocks it is performant on modern devices.
    useFrame((state, delta) => {
        if (!meshRef.current) return

        const dummy = new THREE.Object3D()
        for (let i = 0; i < count; i++) {
            // Reconstruct current transform state
            // In a real optimized scenario we'd track state in a data structure, but this is simple enough

            // For now, let's just rotate them in place.
            // WE need to persist the rotation.
            // Since we don't have a state array for current rotation, we'll increment based on time
            // Or easier: just rotate the whole instance matrix? No, that's complex.

            // Simpler approach: We updated 'rotations' initially. We can keep updating an internal array?
            // Actually, querying the matrix back is slow.
            // Let's rely on a stable rotation calculation based on TIME.

            const t = state.clock.getElapsedTime()

            dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])

            // Rotate based on time * speed
            dummy.rotation.set(
                rotations[i * 3] + t * rotationSpeeds[i * 3],
                rotations[i * 3 + 1] + t * rotationSpeeds[i * 3 + 1],
                rotations[i * 3 + 2] + t * rotationSpeeds[i * 3 + 2]
            )

            dummy.scale.set(scales[i * 3], scales[i * 3 + 1], scales[i * 3 + 2])

            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        }
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    // Initial setup handled by useFrame mostly now, but we can keep memo for static props
    // Removing the static useMemo for setMatrixAt to avoid conflict, relying on useFrame loop.

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
                color="#1a1a1d"
                roughness={0.8}
                metalness={0.2}
                flatShading
            />
        </instancedMesh>
    )
}
