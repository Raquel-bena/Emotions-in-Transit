import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { emotionMap } from '../utils/emotionConfig.js';

const Visualization = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Configurar escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Configurar cámara
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    // Configurar renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    mountRef.current.appendChild(renderer.domElement);

    // Crear partículas emocionales (4000 partículas)
    const particles = createEmotionalParticles();
    scene.add(particles);

    // Crear líneas del metro (geometría paramétrica)
    const metroLines = createMetroLines();
    scene.add(metroLines);

    // Controles de cámara
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Animación
    let animationFrame;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);

      // Rotar partículas con un movimiento más complejo
      const time = Date.now() * 0.0005;
      particles.rotation.x = Math.sin(time * 0.3) * 0.2;
      particles.rotation.y += 0.002;

      // Pulsación suave en la escala
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      particles.scale.set(pulse, pulse, pulse);

      // Mover líneas del metro
      metroLines.rotation.y -= 0.001;
      metroLines.rotation.z = Math.sin(time * 0.5) * 0.1;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Manejar resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement.parentNode) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
    };
  }, []);

  const createEmotionalParticles = () => {
    const particleCount = 4000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Distribuir partículas según emociones
    const emotions = Object.entries(emotionMap);
    emotions.forEach(([emotion, config], index) => {
      const count = Math.floor(particleCount / emotions.length);
      const startIndex = index * count;
      const endIndex = (index === emotions.length - 1) ? particleCount : startIndex + count;

      // Convertir color hex a RGB
      const color = new THREE.Color(config.color);

      for (let i = startIndex; i < endIndex; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        // Radio más variable para dar profundidad
        const radius = 5 + Math.random() * 8 + Math.random() * 2;

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Tamaños más variados
        sizes[i] = Math.random() * 2.5;

        // Guardamos datos extra para animación en userdata si fuera necesario, 
        // pero por ahora usaremos matemática en el loop de render.
      }
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    return new THREE.Points(geometry, material);
  };

  const createMetroLines = () => {
    const group = new THREE.Group();

    // Crear líneas paramétricas para cada emoción
    Object.entries(emotionMap).forEach(([emotion, config], index) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10 + index * 2, Math.sin(index) * 3, 0),
        new THREE.Vector3(-5 + index * 2, Math.cos(index) * 3, 5),
        new THREE.Vector3(0 + index * 2, Math.sin(index * 2) * 3, 0),
        new THREE.Vector3(5 + index * 2, Math.cos(index * 2) * 3, -5),
        new THREE.Vector3(10 + index * 2, Math.sin(index * 3) * 3, 0)
      ]);

      const points = curve.getPoints(100);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: config.color,
        linewidth: 2,
        transparent: true,
        opacity: 0.7
      });

      const line = new THREE.Line(geometry, material);
      group.add(line);
    });

    return group;
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-gray-800 border border-gray-600 hover:bg-gray-700 transition-colors"
        >
          ← Back to Main
        </button>
      </div>

      <div ref={mountRef} className="w-full h-screen" />

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 text-center">
        <div className="text-xl font-bold">EMOTIONAL TRANSIT SYSTEM</div>
        <div className="text-sm text-gray-400 mt-1">
          {Object.entries(emotionMap).map(([emotion, config]) => (
            <span key={emotion} className="mx-2" style={{ color: config.color }}>
              {config.line.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Visualization;
