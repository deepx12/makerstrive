import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// GLSL Noise functions
const noiseGLSL = `
// Simplex 3D Noise 
// by Ian McEwan, Ashima Arts
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0.0 + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - -1.0 + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

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

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const VertexShader = `
uniform float uTime;
uniform float uDisplacementStrength;
varying vec2 vUv;
varying float vNoise;
varying vec3 vNormal;

${noiseGLSL}

void main() {
  vUv = uv;
  vNormal = normal;
  
  // High frequency noise for "rocky" detail
  float n = snoise(position * 2.0 + uTime * 0.1);
  
  // Low frequency noise for big shape changes
  float n2 = snoise(position * 0.5 + uTime * 0.05);
  
  // Combine
  float finalNoise = n * 0.5 + n2 * 0.5;
  
  // Displace along normal
  vec3 newPos = position + normal * finalNoise * uDisplacementStrength;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  
  vNoise = finalNoise;
}
`;

const FragmentShader = `
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorGlow;

varying float vNoise;
varying vec3 vNormal;

void main() {
  // Determine if this area is a "valley" (crack) or "peak" (surface)
  // vNoise ranges roughly -1 to 1.
  
  // Create a sharp transition for cracks
  float crackMix = smoothstep(-0.2, 0.0, vNoise);
  
  // Surface color (Dark Rock)
  vec3 surfaceColor = mix(uColorA, uColorB, vNoise * 0.5 + 0.5);
  
  // Glow Color from deep cracks
  // When noise is low (negative), we want glow
  float glowIntensity = 1.0 - smoothstep(-0.4, 0.1, vNoise);
  vec3 glow = uColorGlow * glowIntensity * 5.0; // Boost intensity for bloom
  
  // Final composite
  vec3 finalColor = mix(glow, surfaceColor, crackMix);
  
  // Add some fresnel/rim light for definition
  // float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
  // finalColor += uColorGlow * fresnel * 0.5;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const HailstoneRock = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDisplacementStrength: { value: 0.4 },
      uColorA: { value: new THREE.Color('#050505') }, // Pitch black/grey
      uColorB: { value: new THREE.Color('#1a1a1a') }, // Dark grey
      uColorGlow: { value: new THREE.Color('#00f2ff') }, // Cyan/Electric Blue
    }),
    []
  );

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Update shader time
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;

      // Rotation - slow tumble
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.z += delta * 0.05;

      // Scroll interaction if needed (optional)
      // const offset = scroll.offset;
      // meshRef.current.rotation.x = offset * Math.PI;
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* High detail Icosahedron for better displacement */}
      <icosahedronGeometry args={[1.5, 60]} />
      <shaderMaterial
        vertexShader={VertexShader}
        fragmentShader={FragmentShader}
        uniforms={uniforms}
      // transparent
      />
    </mesh>
  );
};
