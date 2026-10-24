import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, RotateCw, ZoomIn, Info } from 'lucide-react';

interface SkillNode {
  name: string;
  demand_score: number;
  matched: boolean;
  category?: string;
}

interface ThreeSkillGalaxyProps {
  matchedSkills: string[];
  missingSkills: string[];
  targetRole: string;
  readinessScore: number;
}

export default function ThreeSkillGalaxy({
  matchedSkills,
  missingSkills,
  targetRole,
  readinessScore
}: ThreeSkillGalaxyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  // Combine skills into structured nodes
  const skillNodes: SkillNode[] = [
    ...matchedSkills.map(s => ({ name: s, demand_score: 88, matched: true })),
    ...missingSkills.map(s => ({ name: s, demand_score: 84, matched: false }))
  ];

  useEffect(() => {
    if (!containerRef.current || skillNodes.length === 0) return;

    const container = containerRef.current;
    let width = container.clientWidth || 600;
    let height = container.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0f1d'); // Deep dark cybernetic blue
    scene.fog = new THREE.FogExp2('#0a0f1d', 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 2, 7.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2.5, 20);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const topLight = new THREE.DirectionalLight(0x818cf8, 1.2);
    topLight.position.set(5, 10, 7);
    scene.add(topLight);

    // 3. Central Core Nucleus (Represents Career Target)
    const galaxyGroup = new THREE.Group();
    scene.add(galaxyGroup);

    const coreGeo = new THREE.IcosahedronGeometry(0.85, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    galaxyGroup.add(coreMesh);

    // Outer wireframe halo around the nucleus
    const wireGeo = new THREE.IcosahedronGeometry(1.05, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    galaxyGroup.add(wireMesh);

    // Background particle dust
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const r = 8 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      starPositions[i] = r * Math.cos(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi);
      starPositions[i + 2] = r * Math.cos(phi) * Math.sin(theta);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.08, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);

    // 4. Create Skill Orbital Nodes
    const interactiveMeshes: THREE.Mesh[] = [];
    const totalNodes = skillNodes.length;

    skillNodes.forEach((node, index) => {
      // Golden spiral distribution on sphere
      const phi = Math.acos(-1 + (2 * index) / Math.max(1, totalNodes));
      const theta = Math.sqrt(totalNodes * Math.PI) * phi;
      const radius = 2.8 + (index % 3) * 0.35;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const nodeRadius = node.matched ? 0.32 : 0.28;
      const nodeGeo = new THREE.SphereGeometry(nodeRadius, 24, 24);

      // Emerald for matched, Crimson/Amber for missing
      const baseColor = node.matched ? 0x10b981 : 0xf59e0b;
      const emissiveColor = node.matched ? 0x059669 : 0xd97706;

      const nodeMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: emissiveColor,
        emissiveIntensity: 0.65,
        roughness: 0.3,
        metalness: 0.6
      });

      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(x, y, z);
      mesh.userData = { skill: node };
      galaxyGroup.add(mesh);
      interactiveMeshes.push(mesh);

      // Connecting neural filament line back to nucleus
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: node.matched ? 0x059669 : 0x78350f,
        transparent: true,
        opacity: node.matched ? 0.45 : 0.25
      });
      const line = new THREE.Line(lineGeo, lineMat);
      galaxyGroup.add(line);
    });

    // 5. Mouse Interaction & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotSpeedX = 0;
    let rotSpeedY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        rotSpeedY = deltaX * 0.006;
        rotSpeedX = deltaY * 0.006;
        galaxyGroup.rotation.y += rotSpeedY;
        galaxyGroup.rotation.x += rotSpeedX;
        prevMouseX = clientX;
        prevMouseY = clientY;
      }

      // Update normalized mouse coordinate for raycasting
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hit.userData.skill) {
          setSelectedSkill(hit.userData.skill);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(4.5, Math.min(12, camera.position.z + e.deltaY * 0.005));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    dom.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('click', onClick);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Touch support for mobile
    dom.addEventListener('touchstart', onPointerDown);
    dom.addEventListener('touchmove', onPointerMove);
    window.addEventListener('touchend', onPointerUp);

    // 6. Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 7. Animation Loop
    let animId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow idle rotation
      if (autoRotate && !isDragging) {
        galaxyGroup.rotation.y += 0.0035;
        galaxyGroup.rotation.x = Math.sin(elapsedTime * 0.4) * 0.12;
      }

      // Gently pulse the core nucleus
      const pulse = 1 + Math.sin(elapsedTime * 2) * 0.05;
      coreMesh.scale.set(pulse, pulse, pulse);
      wireMesh.rotation.y -= 0.005;
      wireMesh.rotation.z += 0.003;

      // Inertia decay on manual rotation
      if (!isDragging) {
        rotSpeedX *= 0.92;
        rotSpeedY *= 0.92;
        galaxyGroup.rotation.y += rotSpeedY;
        galaxyGroup.rotation.x += rotSpeedX;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onPointerDown);
      dom.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('click', onClick);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onPointerDown);
      dom.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);

      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
      interactiveMeshes.forEach(m => {
        m.geometry.dispose();
        if (Array.isArray(m.material)) m.material.forEach(mat => mat.dispose());
        else m.material.dispose();
      });
      renderer.dispose();
    };
  }, [matchedSkills, missingSkills, targetRole, autoRotate]);

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden border border-slate-800 bg-[#070D1E] shadow-2xl flex flex-col">
      {/* Top Header Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 flex items-center gap-2 pointer-events-auto shadow-lg">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            3D Skill Space Topology • {targetRole}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all shadow-md ${
              autoRotate 
                ? 'bg-blue-600/30 border-blue-500/50 text-blue-200' 
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} />
            {autoRotate ? 'Auto Orbit' : 'Paused'}
          </button>
        </div>
      </div>

      {/* Main Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Interactive Legend Bar at Bottom */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-4 text-xs pointer-events-auto shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-slate-300 font-medium">Matched ({matchedSkills.length})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
            <span className="text-slate-300 font-medium">Missing Market Gap ({missingSkills.length})</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] border-l border-slate-700 pl-3">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Click any node to inspect details</span>
          </div>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 text-xs text-slate-300 pointer-events-auto">
          Readiness: <span className="font-bold text-blue-400">{readinessScore}%</span>
        </div>
      </div>

      {/* Selected Skill HUD Modal Card */}
      {selectedSkill && (
        <div className="absolute top-16 right-4 z-30 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl animate-fadeIn text-slate-200">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 ${
                selectedSkill.matched 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {selectedSkill.matched ? '✔ Matched in Profile' : '✖ Missing Market Gap'}
              </span>
              <h4 className="text-base font-bold text-white">{selectedSkill.name}</h4>
            </div>
            <button
              onClick={() => setSelectedSkill(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-xs text-slate-300 pt-1 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Market Demand Index:</span>
              <span className="font-semibold text-slate-100">{selectedSkill.demand_score}/100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Role Context:</span>
              <span className="font-semibold text-blue-300">{targetRole}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-2 pt-2 border-t border-slate-800/60">
              {selectedSkill.matched
                ? `You have declared ${selectedSkill.name}. Hiring teams expect practical portfolio artifacts demonstrating this capability.`
                : `${selectedSkill.name} is a high-demand requisite for ${targetRole}. Follow your AI Roadmap below to acquire this competency.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
