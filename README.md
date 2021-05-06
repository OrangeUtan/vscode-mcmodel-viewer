# Minecraft Model Viewer
[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Oran9eutan.mcmodel-viewer?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=Oran9eutan.mcmodel-viewer)
[![GitHub](https://img.shields.io/github/license/mcbeet/vscode-beet)](https://raw.githubusercontent.com/mcbeet/vscode-beet/main/LICENSE)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)


- [Features](#Features)
    - [Open model in 3D viewer](#Open-model-in-3D-viewer)
    - [Animated textures](#Animated-textures)
    - [Automatically resolves assets](#Automatically-resolves-assets)
    - [External assets](#External-assets)
    - [Hot reload parents](#Hot-reload-parents)
- [Assets roots](#Assets-roots)
- [Changelog](https://github.com/OrangeUtan/vscode-mcmodel-viewer/blob/main/CHANGELOG.md)

# Features
## Open model in 3D viewer
There are 2 ways to open your models in the 3D viewer:
1. Json files that are recognized as model files (must be located in an [assets root](#Assets-roots)) will have a menu item that opens them in the viewer
2. Executing the command `MCModelViewer: Open model in viewer` will open the model currently selected in the editor in the viewer

![](https://raw.githubusercontent.com/OrangeUtan/vscode-mcmodel-viewer/main/images/demos/open_in_viewer.gif)

## Animated textures
Automatically detects if a texture is animated and plays the animation with 1 tick per frame.
![](https://raw.githubusercontent.com/OrangeUtan/vscode-mcmodel-viewer/main/images/demos/animated_texture.gif)

## Automatically resolves assets
Models reference textures and sometimes a parent model. The extension automatically searches for these assets in all [assets roots](#Assets-roots) contained in your workspace. <br>

E.g. a model references the texture `block/cake_bottom`:
```json
"textures": {
    "bottom": "block/cake_bottom"
}
```
 The extension might resolve this reference to the texture `assets_root/minecraft/textures/minecraft/block/cake_bottom.png`.

## External assets
Some models use assets outside of your workspace, e.g. if they use Vanilla Minecraft textures or depend on another resourcepack.<br>
In this case you can add external [assets roots](#Assets-roots), that the extension will include when trying to resolve a referenced asset:
- Execute the command `MCModelViewer: Add assets root`
- Manually add entry to `mcmodel-viewer.assetsRoots` setting

E.g. this model references the Vanilla Minecraft texture for arrow entities:
```json
"textures": {
    "particle": "entity/projectiles/arrow",
    "arrow": "entity/projectiles/arrow"
}
```
We could extracted all Vanilla Minecraft assets from the version JAR into the folder `%APPDATA%/.minecraft/versions/1.16.5/assets/` and then add it as an assets root. The texture will then be resolved to `%APPDATA%/.minecraft/versions/1.16.5/assets/minecraft/textures/entity/projectiles/arrow.png`

## Hot reload parents
If any ancestor of the currently opened model changes, the model will be automatically reloaded.
![](https://raw.githubusercontent.com/OrangeUtan/vscode-mcmodel-viewer/main/images/demos/hot_reload_parent.gif)

# Assets roots
Asset roots are directories that contain assets for minecraft. Resourcepacks use them to overwrite or add custom assets. They containing a `.mcassetsroot` file and follow a certain directory structure:
```
assets_root
├╴.mcassetsroot
└╴<namespace>
   ├╴models
   │ ├╴block
   │ └╴item
   ├╴textures
   │ ├╴block
   │ └╴item
   ⠇
```