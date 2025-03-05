import {
  Application,
  Sprite,
  // Container,
  Ticker,
  Filter,
  Container,
  AnimatedSprite,
  Assets,
  Spritesheet,
} from 'pixi.js'; // Version: ^8.6.6

import gsap from 'gsap';
import { containScale } from '@/utils/scale-fit';
// import { CRTFilter } from 'pixi-filters';
import { debounce } from '@/utils/debounce';
import type { TileMap } from '@/types/tile.types';
// import { bringToFront } from '@/utils/pixi';

// import { delay } from '@/utils/async';

// import { KawaseBlurFilter } from 'pixi-filters';

type InitProps = {
  parent: HTMLElement;
  onLoaded?: () => void;
};

export type Anim = {
  init: (initProps: InitProps) => void;
  destroy: (() => Promise<void>) | (() => void);
} | null;

export type AnimProps = {
  tileDims: { width: number; height: number };
  tileSize: number;
};

const PIXEL_SCALE = 1;
// Supports smoother movement, by rendering more pixels and as a result upscaling pixel textures:
// Eg. A value of 2.0 will render twice as many pixels (in each dimension).
// A single pixel will be drawn as 2x2.
// - This allows objects to sit at a half pixel position while still being rendered as whole pixels.
// - Will not affect scene units though will limit the options to scale the canvas.

Assets.init({
  basePath: import.meta.env.BASE_URL,
});
// TexturePool.textureOptions.scaleMode = 'nearest';

export function createAnim({ tileDims, tileSize }: AnimProps): Anim {
  if (!window) {
    return null;
  }

  const stageDims = {
    width: tileDims.width * tileSize,
    height: tileDims.height * tileSize,
  };

  const app = new Application();
  let resizeObserver: ResizeObserver | undefined;

  const containers: Record<string, Container> = {};
  const sprites: Record<string, Sprite> = {};
  const filters: Record<string, Filter> = {};

  // Create reference to shared ticker
  const ticker = Ticker.shared;
  let sheet: Spritesheet;
  let tilemap: TileMap;

  async function init({ parent, onLoaded }: InitProps) {
    await app.init({
      background: Math.floor(Math.random() * 256 * 256 * 256),
      // resizeTo: window,
      autoDensity: false,
      backgroundAlpha: 1.0,
      //  width: 100, //  Number of pixels being drawn
      //  height: 100, //  Number of pixels being drawn
      resolution: 1, //  The resolution / device pixel ratio of the renderer. Resolution controls scaling of content (sprites, etc.)
      hello: false,
      antialias: false,
      // resizeTo: parent, // document.getElementById('sizer'), // parent, //parent.parentNode,
      // preference: 'webgl', //  'webgl' | 'webgpu'
      roundPixels: true, // If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation. Advantages can include sharper image quality (like text) and faster rendering on canvas. The main disadvantage is movement of objects may appear less smooth.
      width: stageDims.width * PIXEL_SCALE, // Number of pixels being drawn
      height: stageDims.height * PIXEL_SCALE, // Number of pixels being drawn
    });

    app.canvas.style.imageRendering = 'pixelated';
    app.stage.scale.set(PIXEL_SCALE, PIXEL_SCALE);

    // Load all assets

    sheet = (await Assets.load(`img/main.json`)) as Spritesheet;
    sheet.textureSource.scaleMode = 'nearest';

    //sprite.texture.source
    const response = await fetch(`maps/level1.json`);
    tilemap = await response.json();

    // await delay(3000);

    parent.appendChild(app.canvas); // Attach (after loading)

    // Observe stage dims

    resizeObserver = new ResizeObserver(
      debounce((entries: ResizeObserverEntry[]) => {
        if (entries.length >= 1) {
          onStageResize(
            Math.round(entries[0].contentRect.width),
            Math.round(entries[0].contentRect.height),
          );
        }
      }, -1),
    );
    resizeObserver.observe(parent);

    if (onLoaded) {
      onLoaded();
    }
  }

  // - |dims| will be set before this is called
  // - |onStageResize| will be called immediately after
  function start() {
    containers.camera = new Container();
    app.stage.addChild(containers.camera);

    loadLevel();

    ticker.add(onTick);
    onTick();
  }

  let startCalled = false;
  // Shouldn't have to check if items exist
  let stageScale = 1.0;
  function onStageResize(width: number, height: number) {
    const scale = containScale(
      stageDims.width,
      stageDims.height,
      width,
      height,
    );
    stageScale = Math.max(1.0, Math.floor(scale));

    // The scale should be wholly divisible by PIXEL_SCALE or render will not occupy whole pixels.
    // In this way PIXEL_SCALE limits the potential scale sizes available.
    stageScale -= stageScale % PIXEL_SCALE;
    stageScale = Math.max(stageScale, PIXEL_SCALE);

    // Update canvas CSS
    // was
    // app.renderer.view.style.width = `${Math.round(stageDims.width * stageScale)}px`;
    // app.renderer.view.style.height = `${Math.round(stageDims.height * stageScale)}px`;
    app.canvas.style.width = `${Math.round(stageDims.width * stageScale)}px`;
    app.canvas.style.height = `${Math.round(stageDims.height * stageScale)}px`;

    if (!startCalled) {
      startCalled = true;
      start();
    }
  }

  let elapsedTime = 0.0;
  function onTick() {
    elapsedTime += ticker.elapsedMS * 0.001;
    console.log(elapsedTime);
  }

  // Load level
  // ----------

  async function loadLevel() {
    const mapIdToTxLookup: Record<
      string,
      { tx: string; tileW: number; tileH: number; animBase: string | null }
    > = {};
    for (let j = 0; j < tilemap.tilesets.length; j++) {
      const tileset = tilemap.tilesets[j];
      const firstGID = tileset.firstgid;

      if (tileset.tiles) {
        for (let i = 0; i < tileset.tiles.length; i++) {
          const tile = tileset.tiles[i];
          const id = firstGID + tile.id;
          const path = tile.image;

          const pathParts = path.split('/');
          const filename = pathParts[pathParts.length - 1];
          const filenameParts = filename.split('.');
          filenameParts.splice(filenameParts.length - 1, 1);
          const tx =
            pathParts[pathParts.length - 2] + '/' + filenameParts.join('.');

          const tileW = tile.imagewidth / tileSize;
          const tileH = tile.imageheight / tileSize;

          let animBase = null;
          if (tx.endsWith('_0')) {
            const baseParts = tx.split('_');
            baseParts.splice(baseParts.length - 1, 1);
            animBase = baseParts.join('_');
          }

          mapIdToTxLookup[`tx_${id}`] = {
            tx: tx,
            tileW: tileW,
            tileH: tileH,
            animBase: animBase,
          };
        }
      }
    }

    for (let j = 0; j < tilemap.layers.length; j++) {
      const layer = tilemap.layers[j];
      if (layer.width && layer.height) {
        for (let r = 0; r < layer.height; r++) {
          for (let c = 0; c < layer.width; c++) {
            let _c = c + layer.x;
            let _r = r + layer.y;
            const id = layer.data ? layer.data[r * layer.width + c] : 0;
            if (id > 0) {
              const tileInfo = mapIdToTxLookup[`tx_${id}`];
              if (!tileInfo) {
                throw Error(`Tile not found ${id}`);
              }

              // Consider the dimensions of the sprite tile - ie. some aren't 1x1
              _c -= tileInfo.tileW - 1; // |!| Need to check this
              _r -= tileInfo.tileH - 1;

              if (tileInfo.animBase && sheet.animations[tileInfo.animBase]) {
                const animSprite = new AnimatedSprite(
                  sheet.animations[tileInfo.animBase],
                );
                animSprite.animationSpeed = 0.1;
                animSprite.play();

                if (tileInfo.animBase.includes('player')) {
                  animSprite.anchor.set(0.5, 1.0);

                  animSprite.x = _c * tileSize + 0.5 * 20.0;
                  animSprite.y = _r * tileSize + 2.0 * 20.0;

                  animSprite.scale.x = -1.0;
                  let prevProgress = 0.0;
                  const tw = gsap.to(animSprite, 2.0, {
                    x: `+=${tileSize * 4.0}`,
                    ease: 'Power2.easeInOut',
                    repeat: -1,
                    yoyo: true,
                    delay: 2.0,
                    onUpdate: () => {
                      const progress = tw.progress();
                      animSprite.scale.x = progress > prevProgress ? -1.0 : 1.0;
                      prevProgress = progress;
                    },
                  });
                } else {
                  animSprite.anchor.set(0.0, 0.0);
                  animSprite.x = _c * tileSize;
                  animSprite.y = _r * tileSize;
                }

                containers.camera.addChild(animSprite);
              } else {
                const sprite = new Sprite(sheet.textures[tileInfo.tx]);

                if (tileInfo.tx.includes('diamond')) {
                  sprite.scale.set(2.0, 2.0);
                  _c -= 0.5;
                  _r -= 1.0;
                }

                sprite.anchor.set(0.0, 0.0);

                sprite.x = _c * tileSize;
                sprite.y = _r * tileSize;

                containers.camera.addChild(sprite);
              }
            }
          }
        }
      }
    }

    gsap.fromTo(
      containers.camera,
      2.0,
      { y: tileDims.height * tileSize },
      { y: 0.0, ease: 'Elastic.easeOut' },
    ); // Pan in camera
  }

  function destroy() {
    ticker.remove(onTick);
    resizeObserver?.disconnect(); // Unobserves all observed Element or SVGElement targets.

    for (const spriteName in sprites) {
      sprites[spriteName].filters = [];
      gsap.killTweensOf(sprites[spriteName]);
      delete sprites[spriteName];
    }

    for (const containerName in containers) {
      containers[containerName].filters = [];
      gsap.killTweensOf(containers[containerName]);
      delete containers[containerName];
    }

    for (const filterName in filters) {
      const destroyPrograms = false;
      filters[filterName].destroy(destroyPrograms);
      delete filters[filterName];
    }

    // if (sheet) {
    //   sheet.destroy(true);
    //   sheet = null;
    // }

    app.destroy(
      { removeView: true },
      {
        children: true, // If set to true, all the children will have their destroy method called as well. 'options' will be passed on to those calls.
        texture: false, // Only used for child Sprites if options.children is set to true Should it destroy the texture of the child sprite
        textureSource: false, // Only used for children with textures e.g. Sprites. If options.children is set to true, it should destroy the texture source of the child sprite.
        context: false, // Only used for children with graphicsContexts e.g. Graphics. If options.children is set to true, it should destroy the context of the child graphics.
      },
    ); // https://pixijs.download/dev/docs/PIXI.PIXI.Application.html#destroy
  }

  return {
    init,
    destroy,
  };
}
