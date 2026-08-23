import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function GoldRibbon() {
  const mountRef = useRef(null)
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })
  const scrollRef = useRef({ progress: 0 })

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 6)

    scene.add(new THREE.AmbientLight(0xfff2d6, 0.6))
    const key = new THREE.DirectionalLight(0xe8c877, 1.4)
    key.position.set(2, 3, 4)
    scene.add(key)
    const rim = new THREE.PointLight(0xcba656, 1.0, 20)
    rim.position.set(-3, -2, 3)
    scene.add(rim)

    const width = 6.5
    const height = 1.6
    const segX = 120
    const segY = 24
    const geometry = new THREE.PlaneGeometry(width, height, segX, segY)

    const basePositions = geometry.attributes.position.array.slice()

    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e8c877'),
      metalness: 0.65,
      roughness: 0.25,
      transmission: 0.35,
      thickness: 0.4,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      emissive: new THREE.Color('#e8c877'),
      emissiveIntensity: 0.5,
    })

    const ribbon = new THREE.Mesh(geometry, material)
    ribbon.rotation.z = -0.15
    scene.add(ribbon)

    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / Math.max(h, 1)
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(mount)

    const onPointerMove = (e) => {
      pointerRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1
      pointerRef.current.targetY = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onPointerMove)

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      scrollRef.current.progress = max > 0 ? window.scrollY / max : 0
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    let raf = 0
    const clock = new THREE.Clock()
    const posAttr = geometry.attributes.position

    const animate = () => {
      const t = clock.getElapsedTime()
      const p = pointerRef.current
      p.x += (p.targetX - p.x) * 0.04
      p.y += (p.targetY - p.y) * 0.04

      for (let i = 0; i < posAttr.count; i++) {
        const ix = i * 3
        const bx = basePositions[ix]
        const by = basePositions[ix + 1]
        const wave =
          Math.sin(bx * 0.9 + t * 0.5) * 0.22 +
          Math.sin(bx * 0.35 - t * 0.3 + by * 1.5) * 0.12 +
          Math.cos(by * 2.0 + t * 0.4) * 0.05
        posAttr.array[ix + 2] = wave + p.y * 0.3 * Math.cos(bx * 0.3)
      }
      posAttr.needsUpdate = true
      geometry.computeVertexNormals()

      ribbon.rotation.y = p.x * 0.35
      ribbon.rotation.x = p.y * 0.15
      ribbon.position.y = Math.sin(t * 0.15) * 0.3 - scrollRef.current.progress * 1.4
      ribbon.position.x = Math.sin(t * 0.08) * 0.4

      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('scroll', onScroll)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="ma-ribbon" aria-hidden="true" />
}
