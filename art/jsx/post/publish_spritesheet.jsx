#target photoshop

(function(){

var spritesheetBaseName = getGlobalProp('spritesheet');
if (spritesheetBaseName == '%psdBase%'){
  spritesheetBaseName = psdBase
}
var spritesheetName = spritesheetBaseName + '.tps';



var spritesheetPath = psdContainingDir + 'tps/'+spritesheetName;
var spritesheetFile = new File(spritesheetPath);
if (!spritesheetFile.exists){
  alert('Spritesheet not found: `'+spritesheetFile+'`');
} else {
  // alert('bash '+psdContainingDir+'jsx/post/publish_spritesheet.sh '+spritesheetPath)
  app.system('bash '+psdContainingDir.split('%20').join(' ').split(' ').join('\\ ')+'jsx/post/publish_spritesheet.sh "'+spritesheetPath.split('%20').join(' ')+'"');
}
 
})();






