import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export const AudioPlayer = ({ enabled }: { enabled: boolean }) => {
    const [isPlaying, setIsPlaying] = useState(enabled)
    const [volume] = useState(0.5)
    // Using a placeholder ambient sound URL or we can generate one. 
    // For now, let's assume a file exists or use a synth.
    // We'll use a simple synth for space ambience to avoid external dependencies.

    const audioContextRef = useRef<AudioContext | null>(null)
    const oscRef = useRef<OscillatorNode | null>(null)
    const gainRef = useRef<GainNode | null>(null)
    const initializedRef = useRef(false)

    useEffect(() => {
        if (enabled && !initializedRef.current) {
            toggleAudio()
            initializedRef.current = true
        }
    }, [enabled])

    const toggleAudio = async () => {
        if (isPlaying) {
            if (audioContextRef.current) {
                audioContextRef.current.suspend()
            }
            setIsPlaying(false)
        } else {
            if (!audioContextRef.current) {
                // Init Audio Context
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()

                // Create a deep drone sound
                const osc = audioContextRef.current.createOscillator()
                const gain = audioContextRef.current.createGain()

                osc.type = 'sine'
                osc.frequency.setValueAtTime(60, audioContextRef.current.currentTime) // Low drone

                // Add some modulation for "spacey" feel
                const lfo = audioContextRef.current.createOscillator()
                lfo.type = 'sine'
                lfo.frequency.setValueAtTime(0.1, audioContextRef.current.currentTime)

                const lfoGain = audioContextRef.current.createGain()
                lfoGain.gain.setValueAtTime(50, audioContextRef.current.currentTime)

                lfo.connect(lfoGain)
                lfoGain.connect(osc.frequency)
                lfo.start()

                osc.connect(gain)
                gain.connect(audioContextRef.current.destination)
                osc.start()

                oscRef.current = osc
                gainRef.current = gain
                gain.gain.setValueAtTime(volume * 0.2, audioContextRef.current.currentTime) // Lower volume
            }
            await audioContextRef.current.resume()
            setIsPlaying(true)
        }
    }

    return (
        <motion.button
            className="fixed bottom-8 right-8 z-50 text-white flex items-center space-x-2 mix-blend-difference"
            onClick={toggleAudio}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-neon-blue animate-pulse shadow-[0_0_10px_#00f0ff]' : 'bg-gray-500'}`} />
            <span className="text-xs tracking-widest uppercase font-bold text-gray-400">
                {isPlaying ? 'Sound On' : 'Sound Off'}
            </span>
        </motion.button>
    )
}
