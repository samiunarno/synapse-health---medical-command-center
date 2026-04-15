import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create a DNA double helix
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const blueMaterial = new THREE.MeshPhongMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.5 });
    const purpleMaterial = new THREE.MeshPhongMaterial({ color: 0x8b5cf6, emissive: 0x6d28d9, emissiveIntensity: 0.5 });
    const lineMaterial = new THREE.MeshPhongMaterial({ color: 0x4b5563, transparent: true, opacity: 0.3 });

    const numPairs = 20;
    const radius = 1.5;
    const heightStep = 0.4;
    const twist = 0.5;

    for (let i = 0; i < numPairs; i++) {
      const y = (i - numPairs / 2) * heightStep;
      const angle = i * twist;

      // First strand
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const sphere1 = new THREE.Mesh(sphereGeometry, blueMaterial);
      sphere1.position.set(x1, y, z1);
      dnaGroup.add(sphere1);

      // Second strand
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;
      const sphere2 = new THREE.Mesh(sphereGeometry, purpleMaterial);
      sphere2.position.set(x2, y, z2);
      dnaGroup.add(sphere2);

      // Connecting line
      const lineGeometry = new THREE.CylinderGeometry(0.02, 0.02, radius * 2);
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.set(0, y, 0);
      line.rotation.z = Math.PI / 2;
      line.rotation.y = -angle;
      dnaGroup.add(line);
    }

    // Add some floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x3b82f6, 5);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8b5cf6, 3);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    camera.position.z = 8;

    // Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // GSAP ScrollTrigger Animation
    gsap.to(dnaGroup.rotation, {
      y: Math.PI * 4,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      }
    });

    gsap.to(dnaGroup.position, {
      y: -2,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      }
    });

    // Base continuous rotation
    const baseRotation = gsap.to(dnaGroup.rotation, {
      x: Math.PI * 2,
      duration: 30,
      repeat: -1,
      ease: "none"
    });

    const animate = () => {
      requestAnimationFrame(animate);
      
      // Parallax easing
      targetX = mouseX * 1.5;
      targetY = mouseY * 1.5;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0002;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      baseRotation.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 -z-10 pointer-events-none opacity-50 dark:opacity-30 overflow-hidden" />;
}
