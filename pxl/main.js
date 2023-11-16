

import * as PIXI from 'pixi.js';
import * as utils from './utils.js';
import gsap from "gsap";
import './style.css'
const PIXEL_SCALE = 1;
// Supports smoother movement, by rendering more pixels and as a result upscaling pixel textures:
// Eg. A value of 2.0 will render twice as many pixels (in each dimension). 
// A single pixel will be drawn as 2x2.
// - This allows objects to sit at a half pixel position while still being rendered as whole pixels.
// - Will not affect scene units though will limit the options to scale the canvas.

const tileDims = {width:16,height:14} 
const tileSize = 18; 
const stageDims = {width: tileDims.width*tileSize, height: tileDims.height*tileSize}
PIXI.settings.ROUND_PIXELS = true; // If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation. Advantages can include sharper image quality (like text) and faster rendering on canvas. The main disadvantage is movement of objects may appear less smooth.
const app = new PIXI.Application({
    background: '#84e6ff',
    //resizeTo: window,
    autoDensity: false,
    backgroundAlpha: 1.0,
    width: stageDims.width*PIXEL_SCALE, // Number of pixels being drawn
    height: stageDims.height*PIXEL_SCALE, // Number of pixels being drawn
    resolution: 1,
    hello: false,
    antialias: false
});
PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
app.view.style.imageRendering = 'pixelated';
app.stage.scale.set(PIXEL_SCALE,PIXEL_SCALE)
document.getElementById('app').appendChild(app.view);

function killApp(){
  app.destroy(true); // https://pixijs.download/dev/docs/PIXI.Application.html#destroy
}

// Resize
// ------

let stageScale = 1.0
function onResize(){

  const scale = utils.containScale(stageDims.width, stageDims.height, window.innerWidth, window.innerHeight);
  stageScale = Math.max(1.0, Math.floor(scale));

  // The scale should be wholly divisible by PIXEL_SCALE or render will not occupy whole pixels.
  // In this way PIXEL_SCALE limits the potential scale sizes available.
  stageScale -= stageScale%PIXEL_SCALE;
  stageScale = Math.max(stageScale, PIXEL_SCALE)

  // Update canvas CSS
  app.renderer.view.style.width = `${Math.round(stageDims.width * stageScale)}px`;
  app.renderer.view.style.height = `${Math.round(stageDims.height * stageScale)}px`;

}
window.addEventListener('resize', onResize);
function killResizing(){
  window.removeEventListener('resize', onResize);
}
onResize();

// Sprites
// -------

const camera = new PIXI.Container();
app.stage.addChild(camera);

// Load level
// ----------

let sheet
async function loadLevel() {
  
  if (!sheet){
    sheet = await PIXI.Assets.load(`${import.meta.env.BASE_URL}img/main.json`);
  }

  const response = await fetch(`${import.meta.env.BASE_URL}maps/level1.json`);
  const tilemap = await response.json();

  let mapIdToTxLookup = {}
  for (let j=0; j < tilemap.tilesets.length; j++){
    let tileset = tilemap.tilesets[j]
    let firstGID = tileset.firstgid;

    
    for (let i=0; i < tileset.tiles.length; i++){
      let tile = tileset.tiles[i];
      let id = firstGID + tile.id;
      let path = tile.image;


      let pathParts = path.split('/');
      let filename = pathParts[pathParts.length-1];
      let filenameParts = filename.split('.')
      filenameParts.splice(filenameParts.length-1,1)
      let tx = pathParts[pathParts.length-2] + '/' + filenameParts.join('.')
      
      let tileW = tile.imagewidth / tileSize;
      let tileH = tile.imageheight / tileSize;
      
      let animBase = null
      if (tx.endsWith('_0')){
        let baseParts = tx.split('_')
        baseParts.splice(baseParts.length-1, 1)
        animBase = baseParts.join('_')
      }

      mapIdToTxLookup[`tx_${id}`] = {
        tx: tx,
        tileW: tileW,
        tileH: tileH,
        animBase: animBase
      }
    }
  }


  for (let j = 0; j < tilemap.layers.length; j++){
    let layer = tilemap.layers[j];
    for (let r = 0; r < layer.height; r++){
      for (let c = 0; c < layer.width; c++){
         
        let _c = c + layer.x;
        let _r = r + layer.y;
        let id = layer.data[r*layer.width + c]
        if (id > 0){  
          let tileInfo = mapIdToTxLookup[`tx_${id}`];
          if (!tileInfo){
            throw Error(`Tile not found ${id}`)
          }
          let sprite;

          // Consider the dimensions of the sprite tile - ie. some aren't 1x1
          _c -= (tileInfo.tileW - 1); // |!| Need to check this
          _r -= (tileInfo.tileH - 1);           

          if (tileInfo.animBase && sheet.animations[tileInfo.animBase]){
            
            sprite = new PIXI.AnimatedSprite(sheet.animations[tileInfo.animBase]);
            sprite.animationSpeed = 0.1
            sprite.play();

            if (tileInfo.animBase.includes('player')){

              sprite.anchor.set(0.5,1.0)

              sprite.x = _c * tileSize + 0.5*20.0;
              sprite.y = _r * tileSize + 2.0*20.0;
        
              sprite.scale.x = -1.0;
              let prevProgress = 0.0;
              const tw = gsap.to(sprite, 2.0, {x:`+=${tileSize*4.0}`, ease: 'Power2.easeInOut', repeat:-1, yoyo:true, delay: 2.0, onUpdate:()=>{
                const progress = tw.progress();
                sprite.scale.x = progress > prevProgress ? -1.0 : 1.0;
                prevProgress = progress;
              }});

            } else {
              sprite.anchor.set(0.0,0.0)
              sprite.x = _c * tileSize 
              sprite.y = _r * tileSize 
            }

          } else {

            sprite = new PIXI.Sprite(sheet.textures[tileInfo.tx]);

           
            if (tileInfo.tx.includes('diamond')){
              sprite.scale.set(2.0,2.0)
              _c -= 0.5
              _r -= 1.0;               
            }

            sprite.anchor.set(0.0,0.0)

            sprite.x = _c * tileSize 
            sprite.y = _r * tileSize 

          }
          
          camera.addChild(sprite);
        }
      }
    }
  } 

  gsap.fromTo(camera, 2.0, {y: tileDims.height * tileSize }, {y:0.0, ease: 'Power2.easeOut'}); // Pan in camera

}

loadLevel();

// Frame loop
// ----------
function tick(dt){
  // camera.y -= 0.1
}
app.ticker.add(tick); 
function killTick(){
  app.ticker.remove(tick);
}


// Cleanup
// -------

function destroy(){
  killTick();
  killResizing();
  killApp();
  if (sheet){
    sheet.destroy(true)
  }
  sheet = null;
}
// setTimeout(destroy,2000); // Test
