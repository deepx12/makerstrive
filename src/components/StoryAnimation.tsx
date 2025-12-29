import { useScroll, Instances, Instance } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

// --- ROCKY CORE SHADERS ---
const CoreVertexShader = `
uniform float uTime;
uniform float uDisplacementStrength;
varying vec2 vUv;
varying float vNoise;
varying vec3 vNormal;

// Simplex 3D Noise 
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - -1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0; 
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z); 

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ ); 

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vUv = uv;
  vNormal = normal;
  
  float n = snoise(position * 2.0 + uTime * 0.1);
  float n2 = snoise(position * 0.5 + uTime * 0.05);
  float finalNoise = n * 0.5 + n2 * 0.5;
  
  vec3 newPos = position + normal * finalNoise * uDisplacementStrength;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  
  vNoise = finalNoise;
}
`

const CoreFragmentShader = `
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorGlow;

varying float vNoise;
varying vec3 vNormal;

void main() {
  // Cracks
  float crackMix = smoothstep(-0.2, 0.0, vNoise);
  
  // Surface
  vec3 surfaceColor = mix(uColorA, uColorB, vNoise * 0.5 + 0.5);
  
  // Glow (Deep cracks)
  float glowIntensity = 1.0 - smoothstep(-0.4, 0.1, vNoise);
  vec3 glow = uColorGlow * glowIntensity * 5.0; 
  
  vec3 finalColor = mix(glow, surfaceColor, crackMix);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`

// Sub-component to handle individual rock logic
const RockInstance = ({ data }: { data: any }) => {
    const ref = useRef<any>(null!)
    const scroll = useScroll()

    useFrame((state, delta) => {
        if (!ref.current) return

        // TIMELINE - REVERSED
        const implosionPhase = scroll.range(0.1, 0.3)
        const dispersionPhase = scroll.range(0.6, 0.3)

        const start = new THREE.Vector3(data.startPos[0], data.startPos[1], data.startPos[2])
        const core = new THREE.Vector3(data.corePos[0], data.corePos[1], data.corePos[2])
        const end = new THREE.Vector3(data.endPos[0], data.endPos[1], data.endPos[2])

        let targetPos = new THREE.Vector3()

        if (dispersionPhase > 0) {
            const t = THREE.MathUtils.smoothstep(dispersionPhase, 0, 1)
            targetPos.lerpVectors(core, start, t)

            if (dispersionPhase >= 1) {
                ref.current.position.y += Math.sin(state.clock.elapsedTime + data.startPos[0]) * 0.005
            }
        } else {
            targetPos.lerpVectors(end, core, implosionPhase)

            const orbitStrength = 1.0 - THREE.MathUtils.smoothstep(scroll.offset, 0.0, 0.2)

            if (orbitStrength > 0) {
                const time = state.clock.elapsedTime
                const speed = 0.1 + (data.startPos[0] % 0.2)
                const angle = time * speed * orbitStrength

                const x = targetPos.x
                const z = targetPos.z
                targetPos.x = x * Math.cos(angle) - z * Math.sin(angle)
                targetPos.z = x * Math.sin(angle) + z * Math.cos(angle)
            }

            if (implosionPhase < 1) {
                ref.current.rotation.x += delta * 2 * (1 - implosionPhase)
                ref.current.rotation.y += delta * 2 * (1 - implosionPhase)
            }
        }

        ref.current.position.copy(targetPos)

        if (implosionPhase < 1) {
            const scaleIn = implosionPhase * 5
            ref.current.scale.setScalar(Math.min(data.scale, data.scale * scaleIn))
        } else {
            ref.current.scale.setScalar(data.scale)
        }
    })

    return <Instance ref={ref} color="#202020" />
}

const RayShader = {
    vertex: `
      uniform float uTime;
      uniform float uProgress;
      attribute float aSpeed;
      attribute float aLength;
      attribute float aPhase;
      
      varying float vAlpha;
      varying vec3 vColor;
      
      void main() {
        vec3 scaledPos = position;
        scaledPos.z *= aLength;
        
        float travel = uProgress * 25.0 * aSpeed;
        travel += aPhase; 
        
        vec3 finalPos = scaledPos + vec3(0.0, 0.0, travel);
        
        vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        float life = uProgress * (1.0 + aPhase * 0.2);
        
        vec3 colorBase = vec3(0.1, 0.08, 0.05);
        vec3 colorGlow = vec3(1.0, 0.3, 0.0);
        vec3 colorDark = vec3(0.4, 0.1, 0.0);
        
        if (life < 0.2) {
             vColor = mix(colorBase, colorGlow, life * 5.0);
        } else {
             vColor = mix(colorGlow, colorDark, (life - 0.2) * 2.0);
        }
        
        vAlpha = 1.0 - smoothstep(0.5, 0.9, life);
        if (uProgress <= 0.0) vAlpha = 0.0;
      }
    `,
    fragment: `
      varying float vAlpha;
      varying vec3 vColor;
      
      void main() {
        gl_FragColor = vec4(vColor, vAlpha);
      }
    `
}

const ExplosionRays = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null!)
    const scroll = useScroll()
    const count = 60

    const { speeds, lengths, phases } = useMemo(() => {
        const speeds = new Float32Array(count)
        const lengths = new Float32Array(count)
        const phases = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            speeds[i] = 0.2 + Math.random() * 2.0
            lengths[i] = 1.0 + Math.random() * 8.0
            phases[i] = Math.random()
        }

        return { speeds, lengths, phases }
    }, [])

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uProgress: { value: 0 }
    }), [])

    useFrame((state) => {
        if (!meshRef.current) return

        const r = scroll.range(0.48, 0.45)
        const progress = THREE.MathUtils.smoothstep(r, 0, 1)

        const shader = meshRef.current.material as THREE.ShaderMaterial
        if (shader.uniforms) {
            shader.uniforms.uTime.value = state.clock.elapsedTime
            shader.uniforms.uProgress.value = progress
        }

        if (progress > 0) {
            meshRef.current.rotation.y += 0.002
            meshRef.current.rotation.z += 0.001
        }
    })

    const initRef = (node: THREE.InstancedMesh) => {
        if (node) {
            meshRef.current = node
            const tempObj = new THREE.Object3D()

            for (let i = 0; i < count; i++) {
                const theta = Math.random() * Math.PI * 2
                const phi = Math.acos(2 * Math.random() - 1)
                const r = Math.pow(Math.random(), 1 / 3) * 0.5

                const x = r * Math.sin(phi) * Math.cos(theta)
                const y = r * Math.sin(phi) * Math.sin(theta)
                const z = r * Math.cos(phi)

                tempObj.position.set(x, y, z)
                tempObj.lookAt(x * 2, y * 2, z * 2)

                tempObj.rotateZ(Math.random() * 0.2)
                tempObj.rotateX((Math.random() - 0.5) * 0.1)

                tempObj.updateMatrix()
                node.setMatrixAt(i, tempObj.matrix)
            }
            node.instanceMatrix.needsUpdate = true
        }
    }

    return (
        <instancedMesh ref={initRef} args={[undefined, undefined, count]}>
            <boxGeometry args={[0.08, 0.08, 1.0]} />
            <shaderMaterial
                vertexShader={RayShader.vertex}
                fragmentShader={RayShader.fragment}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
            <bufferAttribute attach="geometry-attributes-aSpeed" count={speeds.length} array={speeds} itemSize={1} args={[speeds, 1]} />
            <bufferAttribute attach="geometry-attributes-aLength" count={lengths.length} array={lengths} itemSize={1} args={[lengths, 1]} />
            <bufferAttribute attach="geometry-attributes-aPhase" count={phases.length} array={phases} itemSize={1} args={[phases, 1]} />
        </instancedMesh>
    )
}

export const StoryAnimation = () => {
    const scroll = useScroll()
    const coreRef = useRef<THREE.Mesh>(null!)
    const lightRef = useRef<THREE.PointLight>(null!)

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

    // Core Uniforms
    const coreUniforms = useMemo(() => ({
        uTime: { value: 0 },
        uDisplacementStrength: { value: 0.8 },
        uColorA: { value: new THREE.Color('#050505') },
        uColorB: { value: new THREE.Color('#1a1a1a') },
        uColorGlow: { value: new THREE.Color('#ff3300') } // Deeper Orange
    }), [])

    useFrame((state, delta) => {
        // --- CORE ANIMATION (REVERSED) ---
        const fadePhase = scroll.range(0.45, 0.15)

        if (coreRef.current && lightRef.current) {
            let intensity = 15 * (1 - fadePhase)
            lightRef.current.intensity = Math.max(0, intensity)

            let scale = 2.0 * (1 - fadePhase)

            coreRef.current.scale.setScalar(Math.max(0, scale))

            // Update Shader Time & Rotation
            coreRef.current.rotation.y += delta * 0.2
            coreRef.current.rotation.z += delta * 0.1

            const mat = coreRef.current.material as THREE.ShaderMaterial
            if (mat && mat.uniforms) {
                mat.uniforms.uTime.value = state.clock.elapsedTime
            }

            if (scale > 0) {
                // Pulse
                // coreRef.current.scale.multiplyScalar(1 + Math.sin(state.clock.elapsedTime * 10) * 0.01)
            }
        }
    })

    return (
        <group>
            {/* Central Glow Code */}
            <pointLight position={[0, 0, 0]} ref={lightRef} distance={20} decay={2} color="#ff6600" />

            {/* Sun Explosion */}
            <ExplosionRays />

            {/* Rocky Core Mesh (Replaces Dodecahedron) */}
            <mesh ref={coreRef}>
                <icosahedronGeometry args={[1, 60]} /> {/* High detail for displacement */}
                <shaderMaterial
                    vertexShader={CoreVertexShader}
                    fragmentShader={CoreFragmentShader}
                    uniforms={coreUniforms}
                />
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
