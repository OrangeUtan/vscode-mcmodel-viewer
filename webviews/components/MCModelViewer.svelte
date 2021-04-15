<script lang="ts">
    import OrbitControls from 'three-orbitcontrols';
    import * as THREE from 'three';
    import {MinecraftModelLoader, MinecraftTextureLoader} from 'three-mcmodel';

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let controls: OrbitControls;
    let renderer: THREE.WebGLRenderer;

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

        animate()
    }

    function animate () {
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
            scene.add(mesh)
        })
    }
</script>