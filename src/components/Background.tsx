import { Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

export const Background = () => {
    const starsRef = useRef<THREE.Group>(null!)

    useFrame((state) => {
        if (starsRef.current) {
            starsRef.current.rotation.x = state.clock.elapsedTime * 0.05
            starsRef.current.rotation.y = state.clock.elapsedTime * 0.02
        }
    })

    return (
        <group ref={starsRef}>
            <Stars radius={150} depth={100} count={600} factor={6} saturation={0} fade speed={0.5} />
            <color attach="background" args={['#050510']} />
        </group>
    )
}
