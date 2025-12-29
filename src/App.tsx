import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll } from '@react-three/drei'
import { Suspense, useState } from 'react'
import { Experience } from './components/Experience'
import { Overlay } from './components/layout/Overlay'
import { Header } from './components/layout/Header'
import { CustomCursor } from './components/CustomCursor'
import { AudioPlayer } from './components/AudioPlayer'
import { Loader } from './components/Loader'
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'

function App() {
  const [started, setStarted] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)

  const handleStart = (enableAudio: boolean) => {
    setStarted(true)
    setAudioEnabled(enableAudio)
  }

  return (
    <>
      <Loader onStart={handleStart} started={started} />
      {started && <Header />}

      <Canvas
        gl={{ antialias: false }}
        dpr={window.innerWidth < 768 ? [1, 1.2] : [1, 1.5]}
        camera={{
          fov: window.innerWidth < 768 ? 60 : 45,
          position: [0, 0, 5]
        }}
      >
        <color attach="background" args={['#000000']} />
        <Suspense fallback={null}>
          <ScrollControls pages={5} damping={0.3}>
            {started && <Experience />}
            {started && (
              <Scroll html style={{ width: '100%' }}>
                <Overlay />
              </Scroll>
            )}
          </ScrollControls>

          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            <Noise opacity={0.02} />
          </EffectComposer>
        </Suspense>
      </Canvas>
      {started && <CustomCursor />}
      {started && <AudioPlayer enabled={audioEnabled} />}
    </>
  )
}

export default App
