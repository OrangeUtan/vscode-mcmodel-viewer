<script lang="ts">
	import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
    import { MinecraftModelMesh, MinecraftTextureLoader } from '@oran9e/three-mcmodel';
    import { Text2D } from '../utils/Text2D'
    import { modelStore, texturesStore } from '../data/model'
    import { AntiAliasing, rendererSettingsStore } from '../data/config'
    import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
    import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
    import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass';
    import type { Pass } from 'three/examples/jsm/postprocessing/Pass';

    let canvas: HTMLCanvasElement;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let renderer: THREE.Renderer;
    let composer: EffectComposer;
    let antiAliasingPass: Pass | undefined;
    const clock = new THREE.Clock()

    let modelMesh: MinecraftModelMesh | undefined = undefined
    let textures: {[textureVariabel: string] : string} | undefined = undefined

    // Helpers
    const voxelGrid = new THREE.GridHelper(48, 48, 0x444444, 0x444444)
    const blockGrid = new THREE.GridHelper(48, 3)
    let cardinalDirectionLabels: Text2D[] = []
    createCardinalDirectionLabels()
    const boundingBox = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(48, 48, 48)).translate(0, 8, 0),
        new THREE.LineBasicMaterial({ color: 0x444444, linewidth: 3 })
    )

    initScene()

    modelStore.subscribe(mesh => {
        if(modelMesh) {
            scene.remove(modelMesh)
        }
        modelMesh = mesh
        if(modelMesh) {
            scene.add(modelMesh)
        }
    })

    texturesStore.subscribe(t => textures = t)

    rendererSettingsStore.subscribe(cfg => {
        cfg.showBoundingBox ? scene.add(boundingBox) : scene.remove(boundingBox)
        cfg.show3x3BlocksGrid ? scene.add(blockGrid) : scene.remove(blockGrid)
        cfg.showVoxelGrid ? scene.add(voxelGrid) : scene.remove(voxelGrid)
        cfg.showCardinalDirectionLabels ? scene.add(...cardinalDirectionLabels) : scene.remove(...cardinalDirectionLabels)

        if(antiAliasingPass) {
            composer.removePass(antiAliasingPass)
        }
        switch(cfg.anitAliasing) {
            case AntiAliasing.SSAA:
                antiAliasingPass = new SSAARenderPass(scene, camera, 0, 0);
                composer.addPass(antiAliasingPass);
                break
        }
    });

    $: if(modelMesh != null && textures != null) {
        const textureLoader = new MinecraftTextureLoader()
        modelMesh.resolveTextures(p => textureLoader.load(textures![p]))
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        composer.setSize(window.innerWidth, window.innerHeight)
    })

    function initScene () {
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000)
        camera.position.set(0, 48, 48)

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        document.body.appendChild(renderer.domElement)
        renderer.setSize(window.innerWidth, window.innerHeight)

        composer = new EffectComposer(renderer as THREE.WebGLRenderer)
        composer.addPass(new RenderPass(scene, camera));

        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableKeys = false
        controls.screenSpacePanning = true

        animate()
    }

    function animate () {
        const delta = clock.getDelta();

        if(modelMesh) {
            modelMesh.updateAnimation(1000 * delta)
        }

        requestAnimationFrame(animate)
        controls.update()
        composer.render()
    }

    function createCardinalDirectionLabels() {
        const loader = new THREE.FontLoader();
        loader.load(MEDIA_ROOT + '/helvetiker_regular.typeface.json', function ( font ) {
            cardinalDirectionLabels = [
                new Text2D("N", font, [-Math.PI / 2, 0, 0], [-2, 0, -26]),
                new Text2D("E", font, [0, -Math.PI / 2, -Math.PI / 2], [26, 0, -2]),
                new Text2D("S", font, [-Math.PI / 2, Math.PI, 0], [2, 0, 26]),
                new Text2D("W", font, [0, Math.PI / 2, Math.PI / 2], [-26, 0, 2]),
            ]
        })
    }
</script>

<canvas
    bind:this={canvas}/>