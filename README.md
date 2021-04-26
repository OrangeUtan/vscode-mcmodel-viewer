# Minecraft Model Viewer

- Features
    - [Open model in 3D viewer](#Open-model-in-3D-viewer)
    - [Animated textures](#Animated-textures)
    - [Automatically resolves assets](#Automatically-resolves-assets)
    - [External assets](#External-assets)
    - [Changelog](https://github.com/Oran9eUtan/vscode-mcmodel-viewer/blob/main/CHANGELOG.md)

# Features
## Open model in 3D viewer
There are 2 ways to open your models in the 3D viewer:
1. Json files that are recognized as model files (must be located in an assets root folder) will have a menu item that opens them in the viewer
2. Executing the command `MCModelViewer: Open model in viewer` will open the model currently selected in the editor in the viewer

![](https://raw.githubusercontent.com/OrangeUtan/vscode-mcmodel-viewer/main/images/demos/open_in_viewer.gif)

## Animated textures
Detects and plays animated textures
![](https://raw.githubusercontent.com/OrangeUtan/vscode-mcmodel-viewer/main/images/demos/animated_texture.gif)

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
If your models use assets outside of your workspace, you can add the paths of asset roots on your system to the setting `mcmodel-viewer.assetsRoots`. The extension will then include these directories when resolving assets. You can also add assets roots with the `Add assets root` command.<br>

E.g. this model references a arrow texture that does not exist in the workspace:
```json
"textures": {
    "particle": "entity/projectiles/arrow",
    "arrow": "entity/projectiles/arrow"
}, ...
```
We can add the path to an external assets root `%APPDATA%/.minecraft/versions/1.16.5/assets/`. The texture will then be resolved to `%APPDATA%/.minecraft/versions/1.16.5/assets/entity/projectiles/arrow.png`.