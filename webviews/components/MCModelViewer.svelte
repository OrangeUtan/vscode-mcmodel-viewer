<script lang="ts">
    import * as THREE from 'three';
    import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
    import {MinecraftModelLoader, MinecraftModelMesh, MinecraftTextureLoader} from '@oran9e/three-mcmodel';
    import { FontLoader } from 'three';
    import { Text2D } from './Text2D';

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let renderer: THREE.WebGLRenderer;
    let modelMesh: MinecraftModelMesh
    const clock = new THREE.Clock()

    const voxelGrid = new THREE.GridHelper(16*3, 16*3, 0x444444, 0x444444)
    const blockGrid = new THREE.GridHelper(16*3, 3)
    let cardinalDirectionLabels = []

    function init () {
        scene = new THREE.Scene()
        camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000)
        camera.position.set(16, 16, 64)

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        document.body.appendChild(renderer.domElement)
        renderer.setSize(window.innerWidth, window.innerHeight)

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        })

        controls = new OrbitControls(camera, renderer.domElement)
        controls.enableKeys = false
        controls.screenSpacePanning = true

        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x1111cc, linewidth: 3 });
        const cube =  new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.BoxGeometry(16, 16, 16)),
            lineMaterial
        )
        scene.add(cube)

        scene.add(voxelGrid)
        scene.add(blockGrid)

        createCardinalDirectionLabels()

        animate()
    }

    function animate () {
        const delta = clock.getDelta();

        if(modelMesh) {
            modelMesh.updateAnimation(1000 * delta)
        }

        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
    }

    init()

    window.addEventListener('message', e => {
        switch(e.data.command) {
            case "loadModel":
                loadModel(e.data.value.model, e.data.value.textures);
        }
    });

    function loadModel (model: string, textures: string[]) {
        new MinecraftModelLoader().load(model, mesh => {
            const textureLoader = new MinecraftTextureLoader()
            mesh.resolveTextures(p => textureLoader.load(textures[p]))

            modelMesh = mesh
            scene.add(modelMesh)
        })
    }

    function createCardinalDirectionLabels() {
        const loader = new THREE.FontLoader();
        loader.load(MEDIA_ROOT + '/helvetiker_regular.typeface.json', function ( font ) {
            cardinalDirectionLabels = [
                new Text2D("N", font, [-Math.PI / 2, 0, 0], [-2, 0, -26]),
                new Text2D("E", font, [0, Math.PI / 2, -Math.PI / 2], [26, 0, 2]),
                new Text2D("S", font, [-Math.PI / 2, Math.PI, 0], [2, 0, 26]),
                new Text2D("W", font, [0, Math.PI / 2, Math.PI / 2], [-26, 0, 2]),
            ]

            for(const label of cardinalDirectionLabels) {
                scene.add(label)
            }
        })
    }
</script>