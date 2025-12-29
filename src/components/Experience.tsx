import { PerspectiveCamera, useScroll } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { Background } from './Background'
import { VideoExperience } from './VideoExperience'

export const Experience = () => {
    const scroll = useScroll()
    const cameraRef = useRef<THREE.PerspectiveCamera>(null!)
    const sceneGroupRef = useRef<THREE.Group>(null!)

    useFrame((state, delta) => {
        // Determine the scroll offset (0 to 1)
        const r1 = scroll.range(0, 1) // Full range

        // Move the camera forward based on scroll
        // The scene is long, so we move deeply into negative Z or positive Z
        // const cameraZ = -r1 * 180

        if (cameraRef.current) {
            // Smoothly interpolate camera position
            // Camera focuses on the asteroid scene
            // cameraRef.current.position.z = THREE.MathUtils.lerp(cameraRef.current.position.z, cameraZ + 20, delta * 3)
            // Instead of flying through, we just subtly zoom or stay relative
            // The Asteroid component handles its own 'zoom' effect via scroll

            // Just some float
            cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, -r1 * 2, delta * 3)

            // Add some subtle mouse parallax or noise
            const mouseX = state.pointer.x
            const mouseY = state.pointer.y
            cameraRef.current.rotation.x = THREE.MathUtils.lerp(cameraRef.current.rotation.x, mouseY * 0.1, delta * 2)
            cameraRef.current.rotation.y = THREE.MathUtils.lerp(cameraRef.current.rotation.y, -mouseX * 0.1, delta * 2)
        }

        // Slightly rotate the whole scene for dynamism
        if (sceneGroupRef.current) {
            // Slower scene rotation
            sceneGroupRef.current.rotation.z = r1 * 0.2
        }
    })

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 20]} ref={cameraRef} fov={50} />

            {/* Cinematic Lighting Setup */}
            <ambientLight intensity={0.1} /> {/* Very dark ambient */}
            <directionalLight
                position={[10, 10, 5]}
                intensity={4}
                color="#ffffff"
                castShadow
            />
            {/* Rim/Fill Light (Teal/Cyan) */}
            <pointLight position={[-10, 0, -20]} intensity={2} color="#00f0ff" distance={50} />
            {/* Secondary Color Light (Pink/Purple) for contrast */}
            <pointLight position={[10, -10, -50]} intensity={1} color="#ff00ff" distance={50} />

            <Background />

            <group ref={sceneGroupRef}>
                <VideoExperience />
            </group>
        </>
    )
}
