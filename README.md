# Minecraft Model Viewer

- Features
    - [Open models in viewer](#Open-models-in-viewer)
    - [Animated textures](#Animated-textures)
    - [Automatically resolves assets](#Automatically-resolves-assets)
    - [External assets](#External-assets)
    - [Changelog](https://github.com/Oran9eUtan/vscode-mcmodel-viewer/blob/main/CHANGELOG.md)

# Features
## Open models in viewer
Open your models in an interactive 3D viewer
![](https://raw.githubusercontent.com/OrangeUtan/vscode-mcmodel-viewer/main/images/demo_open_in_viewer.gif)
## Animated textures
Detects and plays animated textures
![](https://raw.githubusercontent.com/OrangeUtan/vscode-mcmodel-viewer/main/images/demo_animated_texture.gif)
## Automatically resolves assets
Models reference textures and sometimes a parent model. The extension automatically searches for these assets in all asset roots contained in your workspace. <br>
Asset roots are directories containing a `.mcassetsroot` file and follow the minecraft directory structure:
```
assets_root
├╴minecraft
│  ├╴models
│  │ ├╴block
│  │ └╴item
│  └╴textures
│    ├╴block
│    └╴item
└╴.mcassetsroot
```
E.g. a model references the texture `block/cake_bottom`:
```json
"textures": {
    "bottom": "block/cake_bottom"
}, ...
```
 The extension will resolve this reference to the texture `assets_root/minecraft/textures/minecraft/block/cake_bottom.png`.
## External assets
If your models use assets outside of your workspace, you can add the paths of asset roots on your system to the setting `mcmodel-viewer.assetsRoots`. The extension will then include these directories when resolving assets.<br>

E.g. this model references a arrow texture that does not exist in the workspace:
```json
"textures": {
    "particle": "entity/projectiles/arrow",
    "arrow": "entity/projectiles/arrow"
}, ...
```
We can add the path to an external assets root `%APPDATA%/.minecraft/versions/1.16.5/assets/`. The texture will then be resolved to `%APPDATA%/.minecraft/versions/1.16.5/assets/entity/projectiles/arrow.png`.