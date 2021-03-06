<script lang="ts">
	import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
    import { AntiAliasing } from '../state/config';
    import type { OverlaySettings } from '../state/config';
    import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
    import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
    import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
    import type { Pass } from 'three/examples/jsm/postprocessing/Pass';
    import { onMount } from 'svelte';
    import Overlays from './Overlays.svelte';
    import Model from './Model.svelte';
    import { elementMeshes } from '../state/model';
    import type { ShadingMode } from '../state/shading';
    import { persistStore } from '../state/persistStore';
    import { get } from 'svelte/store';

    // Props
    export let overlaySettings: OverlaySettings;
    export let shadingMode: ShadingMode;
    export let showOverlays: boolean;

    // State
    let cameraPos = persistStore<[number, number, number]>("cameraPosition", [0, 48, -48]);
    let cameraTarget = persistStore<[number, number, number]>("cameraTarget", [0, 0, 0]);

    // Html elements
    let canvas: HTMLCanvasElement;

    // Scene components
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let renderer: THREE.Renderer;
    let composer: EffectComposer;
    let antiAliasingPass: Pass | undefined;

    onMount(async () => {
        initScene()
        animate()

        const resizeHandle = () => resizeRendererToDisplaySize();
        window.addEventListener('resize', resizeHandle);

        return () => {
            window.removeEventListener('resize', resizeHandle);
        }
    })

    // Update anti aliasing
    $: if(scene != null) {
        setAnitAliasing(overlaySettings.antiAliasing);
    }

    function initScene () {
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000)
        camera.position.fromArray(get(cameraPos));

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas })
        composer = new EffectComposer(renderer as THREE.WebGLRenderer)
        composer.addPass(new RenderPass(scene, camera));
        resizeRendererToDisplaySize()

        controls = new OrbitControls(camera, renderer.domElement)
        controls.screenSpacePanning = true
        controls.target.fromArray(get(cameraTarget))
        controls.addEventListener("change", (e) => {
            cameraPos.set(camera.position.toArray());
            cameraTarget.set(controls.target.toArray())
        })
    }

    function animate () {
        requestAnimationFrame(animate)
        controls.update()
        composer.render()
    }

    function resizeRendererToDisplaySize() {
        const pixelRatio = window.devicePixelRatio;
        const width = canvas.clientWidth * pixelRatio, height = canvas.clientHeight * pixelRatio

        if(canvas.width !== width ||  canvas.height != height) {
            renderer.setSize(width, height, false)
            composer.setSize(width, height)

            camera.aspect = width / height
            camera.updateProjectionMatrix()
        }
    }

    function setAnitAliasing(mode: string) {
        if(antiAliasingPass) {
            composer.removePass(antiAliasingPass)
        }
        switch(mode) {
            case AntiAliasing.SSAA:
                antiAliasingPass = new SSAARenderPass(scene, camera, 0, 0);
                composer.addPass(antiAliasingPass);
                break
        }
    }
</script>

<style lang="scss">
    canvas {
        width: 100%;
		height: 100%;
        display: block;
    }
</style>

<canvas bind:this={canvas}/>
<Overlays container={scene} {overlaySettings} visible={showOverlays}></Overlays>
<Model container={scene} {shadingMode} elements={$elementMeshes} ></Model>