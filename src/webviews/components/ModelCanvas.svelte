<script lang="ts">
	import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
    import type { MinecraftModelMesh } from '@oran9e/three-mcmodel';
    import { Text2D } from '../utils/Text2D'
    import { AntiAliasing, RendererSettings } from '../data/config'
    import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
    import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
    import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
    import type { Pass } from 'three/examples/jsm/postprocessing/Pass';
    import { onMount } from 'svelte';

    export let modelMesh: MinecraftModelMesh | undefined = undefined
    let _modelMesh: MinecraftModelMesh | undefined = undefined
    export let settings: RendererSettings

    onMount(async () => {
        initScene()
        window.addEventListener('resize', () => resizeRendererToDisplaySize())
    })

    // Update model mesh
    $: {
        if(_modelMesh) {
            scene.remove(_modelMesh)
        }
        _modelMesh = modelMesh;
        if(_modelMesh) {
            scene.add(_modelMesh);
        }
    }

    // Update settings
    $: if(scene != null) {
        settings.showBoundingBox ? scene.add(boundingBox) : scene.remove(boundingBox)
        settings.show3x3BlocksGrid ? scene.add(blockGrid) : scene.remove(blockGrid)
        settings.showVoxelGrid ? scene.add(voxelGrid) : scene.remove(voxelGrid)
        settings.showCardinalDirectionLabels ? scene.add(...cardinalDirectionLabels) : scene.remove(...cardinalDirectionLabels)

        if(antiAliasingPass) {
            composer.removePass(antiAliasingPass)
        }
        switch(settings.anitAliasing) {
            case AntiAliasing.SSAA:
                antiAliasingPass = new SSAARenderPass(scene, camera, 0, 0);
                composer.addPass(antiAliasingPass);
                break
        }
    }

    let canvas: HTMLCanvasElement;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let renderer: THREE.Renderer;
    let composer: EffectComposer;
    let antiAliasingPass: Pass | undefined;

    // Helpers
    const voxelGrid = new THREE.GridHelper(48, 48, 0x444444, 0x444444)
    const blockGrid = new THREE.GridHelper(48, 3)
    let cardinalDirectionLabels: Text2D[] = []
    createCardinalDirectionLabels()
    const boundingBox = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(48, 48, 48)).translate(0, 8, 0),
        new THREE.LineBasicMaterial({ color: 0x444444, linewidth: 3 })
    )

    function initScene () {
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000)
        camera.position.set(0, 48, 48)

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas })
        composer = new EffectComposer(renderer as THREE.WebGLRenderer)
        composer.addPass(new RenderPass(scene, camera));
        resizeRendererToDisplaySize()

        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableKeys = false
        controls.screenSpacePanning = true

        animate()
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

    function createCardinalDirectionLabels() {
        const loader = new THREE.FontLoader();
        loader.load(RESOURCES_ROOT + '/helvetiker_regular.typeface.json', function ( font ) {
            cardinalDirectionLabels = [
                new Text2D("N", font, [-Math.PI / 2, 0, 0], [-2, 0, -26]),
                new Text2D("E", font, [0, -Math.PI / 2, -Math.PI / 2], [26, 0, -2]),
                new Text2D("S", font, [-Math.PI / 2, Math.PI, 0], [2, 0, 26]),
                new Text2D("W", font, [0, Math.PI / 2, Math.PI / 2], [-26, 0, 2]),
            ]
        })
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