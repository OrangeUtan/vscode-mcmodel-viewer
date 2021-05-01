Changelog

## [1.1.2](https://github.com/OrangeUtan/vscode-mcmodel-viewer/compare/v1.1.1...v1.1.2) (2021-05-01)


### Bug Fixes

* Overlay settings changes did not update renderer ([9da1686](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/9da1686ffef95686df695f788e47b7ef51475a62))

## [1.1.1](https://github.com/OrangeUtan/vscode-mcmodel-viewer/compare/v1.1.0...v1.1.1) (2021-05-01)


### Bug Fixes

* Tried to add elements if array had length 0 ([d6f3be8](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/d6f3be8e59dc58f01f57096bbbd9ef948cebc70a))

# [1.1.0](https://github.com/OrangeUtan/vscode-mcmodel-viewer/compare/v1.0.1...v1.1.0) (2021-05-01)


### Bug Fixes

* Resize listener was not unregistered ([c52134a](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/c52134aedc58d65032e7660fe0ddd26a53ca480c))


### Features

* Added overlays toggle ([38e4b85](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/38e4b85d51f40a07113a077ff3d787d7bade7c85))
* Added shading controls ([9124a9a](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/9124a9ad186a5e7f2b4932e81b046f053c047296))
* Added wireframe mode ([24af27d](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/24af27d6f75c042c3982deb220ce2b464c5470be))

## [1.0.1](https://github.com/OrangeUtan/vscode-mcmodel-viewer/compare/v1.0.0...v1.0.1) (2021-04-26)


### Bug Fixes

* Camera now initialized looking South ([fccdcbf](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/fccdcbf5a6b77a77ca9ffa46837063908d67cd19))
* Command 'mcmodel-viewer.addAssetsRoot' did not activate extension ([e2e9fee](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/e2e9feee7f3a90b2f6feaeafd8ba3f147f73fee3))

## [1.0.1](https://github.com/OrangeUtan/vscode-mcmodel-viewer/compare/v1.0.0...v1.0.1) (2021-04-26)


### Bug Fixes

* Camera now initialized looking South ([fccdcbf](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/fccdcbf5a6b77a77ca9ffa46837063908d67cd19))
* Command 'mcmodel-viewer.addAssetsRoot' did not activate extension ([e2e9fee](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/e2e9feee7f3a90b2f6feaeafd8ba3f147f73fee3))

# 1.0.0 (2021-04-24)


### Bug Fixes

* "Show Model Preview" menu was not working ([e2155fb](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/e2155fbbc9219afe1abcbd9454cecba469214a96))
* Preview html was reset every time a model was loaded ([b34cca8](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/b34cca8eeed0e9ccebb20d595cbccdf15b918238))
* Removed scroll bars from viewer ([614b939](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/614b9392da0e4ba2f58977e507482ab616bda231))
* Scene was not rescaled when panel was rescaled ([9818fa3](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/9818fa38524205784219fe6c7088754b07dd2795))


### Features

* Added 'Add assets root' command ([70e0e44](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/70e0e4483a70d8b50629c39b1cffefc3e8ea248e))
* Added Anti-Aliasing ([e31b175](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/e31b175577c3cea0893c26763c14907eb7ce63ca))
* Added bounding box ([a2c17ed](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/a2c17ed4382f6b7be770a4cb59e41b255d2f229b))
* Added cardinal direction labels ([7fe5116](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/7fe5116e4005df78889126c61ecfb089b587a87e))
* Added grids ([eaa1021](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/eaa1021addfaa9fa378781731b6242429fe813c6))
* Added options to enable/disable helpers ([1f7fe90](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/1f7fe902e776ffac0a5aa7b00ba215a17e066500))
* Added support for parent models ([2c7a6ed](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/2c7a6edd164629d02af12f48b819f9c02cb34c8f))
* Automatically reloads model of file changes ([cbb8597](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/cbb85976be77c17d645339e3228ac4256c08fc56))
* Can now resolve assets taht include namespaces ([326fefe](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/326fefe747d4e70bc644861aaec74b9627afa926))
* Texture/Model loading errors are now displayed in window ([5930c7e](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/5930c7e7d9f478b05bc90b83703dbb1e5a437b2e))
* Viewer title reflects loaded model ([38d1741](https://github.com/OrangeUtan/vscode-mcmodel-viewer/commit/38d1741249a39432a4cc1856c80c8de576b6c9d5))
