import { useScroll, Instances, Instance } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

// Sub-component to handle individual rock logic
const RockInstance = ({ data }: { data: any }) => {
    const ref = useRef<any>(null!)
    const scroll = useScroll()

    useFrame((state, delta) => {
        if (!ref.current) return

        // TIMELINE - REVERSED
        // Scroll 0.0: Fully Exploded (Core Revealed)
        // Scroll 1.0: Void (Floating)

        // 0.1 - 0.4: Implosion (End -> Core)
        const implosionPhase = scroll.range(0.1, 0.3)

        // 0.6 - 0.9: Dispersion (Core -> Start)
        const dispersionPhase = scroll.range(0.6, 0.3)

        // Vectors
        const start = new THREE.Vector3(data.startPos[0], data.startPos[1], data.startPos[2])
        const core = new THREE.Vector3(data.corePos[0], data.corePos[1], data.corePos[2])
        const end = new THREE.Vector3(data.endPos[0], data.endPos[1], data.endPos[2])

        let targetPos = new THREE.Vector3()

        if (dispersionPhase > 0) {
            // Dispersion: Core -> Start
            // If phase is 0 (start of dispersion), we are at Core.
            // If phase is 1 (end of dispersion), we are at Start.
            const t = THREE.MathUtils.smoothstep(dispersionPhase, 0, 1)
            targetPos.lerpVectors(core, start, t)

            // Drift when fully dispersed (phase=1)
            if (dispersionPhase >= 1) {
                ref.current.position.y += Math.sin(state.clock.elapsedTime + data.startPos[0]) * 0.005
            }
        } else {
            // We are in the first half (Implosion or Static End)
            // Implosion: End -> Core
            targetPos.lerpVectors(end, core, implosionPhase)

            // Rotate fast when near End (Implosion Phase < 0.5)
            if (implosionPhase < 1) {
                ref.current.rotation.x += delta * 2 * (1 - implosionPhase)
                ref.current.rotation.y += delta * 2 * (1 - implosionPhase)
            }
        }

        ref.current.position.copy(targetPos)

        // Scale Logic
        if (implosionPhase < 1) {
            // Coming from End (shrunken/invisible) to Core (visible)
            const scaleIn = implosionPhase * 5 // Ramps up quickly
            ref.current.scale.setScalar(Math.min(data.scale, data.scale * scaleIn))
        } else {
            ref.current.scale.setScalar(data.scale)
        }
    })

    return <Instance ref={ref} color="#202020" />
}

export const StoryAnimation = () => {
    const scroll = useScroll()
    const coreRef = useRef<THREE.Mesh>(null!)
    const lightRef = useRef<THREE.PointLight>(null!)

    // 1. Setup Data for Rocks
    const rocksData = useMemo(() => {
        return Array.from({ length: 80 }).map(() => ({
            startPos: [
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 20
            ],
            corePos: [
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
            ],
            endPos: [
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 80
            ],
            scale: 0.2 + Math.random() * 0.8
        }))
    }, [])

    useFrame((state, delta) => {
        // --- CORE ANIMATION (REVERSED) ---
        // 0.45 -> 0.6: Energy Fades (Scale down).

        const fadePhase = scroll.range(0.45, 0.15) // 0.45 to 0.6

        if (coreRef.current && lightRef.current) {
            // Light Intensity
            // Starts High (10+). Fades to 0.
            let intensity = 15 * (1 - fadePhase)
            lightRef.current.intensity = Math.max(0, intensity)

            // Core Scale
            // Starts Big (2.0). Scales to 0.
            let scale = 2.0 * (1 - fadePhase)

            coreRef.current.scale.setScalar(Math.max(0, scale))
            coreRef.current.rotation.y -= delta
            coreRef.current.rotation.z -= delta * 0.5

            if (scale > 0) {
                coreRef.current.scale.multiplyScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.01)
            }
        }
    })

    return (
        <group>
            {/* Central Glow Code */}
            <pointLight position={[0, 0, 0]} ref={lightRef} distance={20} decay={2} color="#ff6600" />

            <mesh ref={coreRef}>
                <dodecahedronGeometry args={[1, 1]} />
                <meshBasicMaterial color="#ff4400" wireframe />
                <mesh scale={[0.8, 0.8, 0.8]}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshBasicMaterial color="#ffaa00" />
                </mesh>
            </mesh>

            {/* Rocks Shell */}
            <Instances range={80}>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
                {rocksData.map((data, i) => (
                    <RockInstance key={i} data={data} />
                ))}
            </Instances>
        </group>
    )
}
