import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { District } from '../types';

interface ThreeGlobeProps {
  districts: District[];
  selectedDistrictId: number | null;
  onSelectDistrict: (id: number) => void;
}

export default function ThreeGlobe({ districts, selectedDistrictId, onSelectDistrict }: ThreeGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedDistrictIdRef = useRef<number | null>(selectedDistrictId);

  // Sync ref to avoid closing dependencies in animation loop
  useEffect(() => {
    selectedDistrictIdRef.current = selectedDistrictId;
  }, [selectedDistrictId]);

  useEffect(() => {
    if (!containerRef.current || districts.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Create Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // Rich slate dark background

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 2. Add Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x60a5fa, 0.8); // Cool blue key light
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 0.3); // Rose accent light
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 3. Create Main Globe Group (to rotate everything together)
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 3a. Earth Wireframe Sphere
    const sphereRadius = 2.0;
    const sphereGeo = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x334155,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const mainSphere = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(mainSphere);

    // 3b. Add grid/latitude/longitude rings for a high-tech radar vibe
    const ringGeo = new THREE.RingGeometry(sphereRadius + 0.05, sphereRadius + 0.08, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, side: THREE.DoubleSide });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.rotation.x = Math.PI / 2;
    globeGroup.add(ring1);

    // 4. Position and Create District Node Meshes
    // Pre-mapped latitudes/longitudes to space out the 5 districts nicely
    const coordinates = [
      { lat: 40, lon: 0 },       // District 1
      { lat: -15, lon: 110 },    // District 2
      { lat: -45, lon: -45 },    // District 3
      { lat: 15, lon: -110 },    // District 4
      { lat: 5, lon: 60 },       // District 5
    ];

    const nodes: { mesh: THREE.Mesh; id: number }[] = [];

    districts.forEach((dist, index) => {
      const coords = coordinates[index % coordinates.length];
      const latRad = (coords.lat * Math.PI) / 180;
      const lonRad = (coords.lon * Math.PI) / 180;

      // Spherical to Cartesian calculation
      const x = sphereRadius * Math.cos(latRad) * Math.cos(lonRad);
      const y = sphereRadius * Math.sin(latRad);
      const z = sphereRadius * Math.cos(latRad) * Math.sin(lonRad);

      // Node size proportional to gap score
      const nodeRadius = 0.07 + (dist.gap_score / 100) * 0.16;
      const nodeGeo = new THREE.SphereGeometry(nodeRadius, 16, 16);

      // Node color: Red for high gap, Orange for medium gap, Green for low gap
      let nodeColor = 0x10b981; // Green
      if (dist.gap_score > 60) {
        nodeColor = 0xef4444; // Red
      } else if (dist.gap_score > 40) {
        nodeColor = 0xf59e0b; // Orange
      }

      const nodeMat = new THREE.MeshPhongMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.7,
        specular: 0xffffff,
        shininess: 30,
      });

      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(x, y, z);
      nodeMesh.userData = { id: dist.id, name: dist.name, gap_score: dist.gap_score };

      // Add small orbit path or visual anchor for high-tech look
      const anchorGeo = new THREE.BoxGeometry(0.02, 0.02, 0.4);
      const anchorMat = new THREE.MeshBasicMaterial({ color: nodeColor, transparent: true, opacity: 0.5 });
      const anchor = new THREE.Mesh(anchorGeo, anchorMat);
      anchor.position.copy(nodeMesh.position);
      anchor.lookAt(0, 0, 0);
      globeGroup.add(anchor);

      globeGroup.add(nodeMesh);
      nodes.push({ mesh: nodeMesh, id: dist.id });
    });

    // 5. Setup Drag / Drag Rotation Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      globeGroup.rotation.y += deltaX * 0.005;
      globeGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    // 6. Click Handler using Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check intersection only with our nodes
      const targetMeshes = nodes.map((n) => n.mesh);
      const intersects = raycaster.intersectObjects(targetMeshes);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const districtId = clickedMesh.userData.id;
        onSelectDistrict(districtId);
      }
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('click', handleClick);

    // 7. Animation / Rendering Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto-rotation when not dragging
      if (!isDragging) {
        globeGroup.rotation.y += 0.002;
        globeGroup.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.2; // Subtle sway
      }

      // Animate/pulse the nodes
      const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.05;
      nodes.forEach(({ mesh, id }) => {
        // Double size pulse if selected
        if (id === selectedDistrictIdRef.current) {
          mesh.scale.set(scale * 1.3, scale * 1.3, scale * 1.3);
          if (mesh.material instanceof THREE.MeshPhongMaterial) {
            mesh.material.emissiveIntensity = 1.2;
          }
        } else {
          mesh.scale.set(scale, scale, scale);
          if (mesh.material instanceof THREE.MeshPhongMaterial) {
            mesh.material.emissiveIntensity = 0.7;
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // 8. Handle Resize
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('click', handleClick);
      resizeObserver.disconnect();
      try {
        container.removeChild(renderer.domElement);
      } catch (err) {
        // Already removed or empty
      }
      scene.clear();
      renderer.dispose();
    };
  }, [districts, onSelectDistrict]);

  return (
    <div className="relative w-full h-full bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" id="threejs-globe-canvas" />
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-[#1e293b]/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Low Gap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
            <span>High Gap</span>
          </div>
        </div>
        <div className="bg-[#1e293b]/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400">
          Drag to rotate • Click nodes to explore
        </div>
      </div>
    </div>
  );
}
