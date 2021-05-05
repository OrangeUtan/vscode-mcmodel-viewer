import {Mesh, TextGeometry, MeshBasicMaterial} from 'three';

export class Text2D extends Mesh {
    constructor(text: string, font: THREE.Font, rotation: number[], translation: number[], textColor = 0x444444) {
        const geometry = new TextGeometry(text, {
            font: font,
            size: 4,
            height: 0,
        });
        geometry.rotateX(rotation[0]);
        geometry.rotateY(rotation[1]);
        geometry.rotateZ(rotation[2]);
        geometry.translate(translation[0], translation[1], translation[2]);

        super(geometry, new MeshBasicMaterial({color: textColor}));
    }
}