import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Preload } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { Experience } from './Experience';
import { Overlay } from '../layout/Overlay';
import { Navbar } from '../layout/Navbar';

export const Scene = () => {
    return (
        <div className="h-screen w-full bg-background relative">
            <Navbar />
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ antialias: false, alpha: false }} // Optimization
                dpr={[1, 1.5]} // Optimization for high DPI
            >
                <color attach="background" args={['#030303']} />

                <ScrollControls pages={3} damping={0.2} style={{ scrollbarWidth: 'none' }}>
                    {/* The 3D World */}
                    <Experience />

                    {/* The HTML Overlay */}
                    <Scroll html style={{ width: '100%' }}>
                        <Overlay />
                    </Scroll>
                </ScrollControls>

                {/* Post Processing */}
                <EffectComposer enableNormalPass={false}>
                    <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} radius={0.6} />
                    <Noise opacity={0.05} />
                    <Vignette eskil={false} offset={0.1} darkness={0.9} />
                </EffectComposer>

                <Preload all />
            </Canvas>
        </div>
    );
};
