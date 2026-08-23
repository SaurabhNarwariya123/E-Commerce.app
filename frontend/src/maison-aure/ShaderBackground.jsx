import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

// Domain-warped fbm noise producing a slow, silk-like flowing gradient.
const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;

  uniform vec3 uInk;
  uniform vec3 uWine;
  uniform vec3 uGold;
  uniform vec3 uGoldBright;

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    const float K1 = 0.366025404;
    const float K2 = 0.211324865;
    vec2 i = floor(p + (p.x + p.y) * K1);
    vec2 a = p - i + (i.x + i.y) * K2;
    vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec2 b = a - o + K2;
    vec2 c = a - 1.0 + 2.0 * K2;
    vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
    vec3 n = h * h * h * h * vec3(dot(a, hash(i)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
    return dot(n, vec3(70.0));
  }

  float fbm(vec2 p) {
    float f = 0.0;
    float amp = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      f += amp * noise(p);
      p = m * p;
      amp *= 0.5;
    }
    return f;
  }

  vec2 warp(vec2 p, float t) {
    vec2 q = vec2(fbm(p + vec2(0.0, 0.0) + t * 0.02), fbm(p + vec2(5.2, 1.3) - t * 0.015));
    vec2 r = vec2(
      fbm(p + 3.5 * q + vec2(1.7, 9.2) + t * 0.01),
      fbm(p + 3.5 * q + vec2(8.3, 2.8) - t * 0.012)
    );
    return r;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 p = (uv - 0.5) * aspect * 1.3;

    float t = uTime * 0.035;
    vec2 r = warp(p, t);
    float flow = fbm(p * 0.8 + r * 1.1);

    float mixA = smoothstep(-0.15, 0.75, flow);
    float mixB = smoothstep(0.25, 0.95, r.x * 0.5 + 0.5);
    float highlight = smoothstep(0.72, 1.0, flow + r.y * 0.3);

    vec3 col = mix(uInk, uWine, mixA * 0.55);
    col = mix(col, uGold, mixB * 0.28);
    col = mix(col, uGoldBright, highlight * 0.4);

    // soft vignette
    vec2 centered = uv - 0.5;
    float vig = 1.0 - dot(centered, centered) * 1.1;
    vig = smoothstep(0.0, 1.0, vig);
    col *= mix(0.4, 1.0, vig);

    // fine film grain to avoid banding
    float grain = (fract(sin(dot(uv * uResolution.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.015;
    col += grain;

    gl_FragColor = vec4(col, 1.0);
  }
`

function hexToVec3(hex) {
  const c = new THREE.Color(hex)
  return [c.r, c.g, c.b]
}

export default function ShaderBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uInk: { value: new THREE.Vector3(...hexToVec3('#0b0b0d')) },
      uWine: { value: new THREE.Vector3(...hexToVec3('#5a2a2f')) },
      uGold: { value: new THREE.Vector3(...hexToVec3('#cba656')) },
      uGoldBright: { value: new THREE.Vector3(...hexToVec3('#e8c877')) },
    }

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      depthTest: false,
      depthWrite: false,
    })

    const geometry = new THREE.PlaneGeometry(2, 2)
    const quad = new THREE.Mesh(geometry, material)
    scene.add(quad)

    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      uniforms.uResolution.value.set(w, h)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    let raf = 0
    const clock = new THREE.Clock()
    const animate = () => {
      uniforms.uTime.value = clock.getElapsedTime()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="ma-shader-bg" aria-hidden="true" />
}
