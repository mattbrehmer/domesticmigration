var globals = {
  tilemap_g: undefined,
  tilemap_instance: undefined,
  svg_1: undefined,
  h: undefined,
  w: undefined,
  stateCodesWithNames: undefined,
  topojson: undefined,
  d3: undefined,
  tilemap: undefined,
  tile_bbox: undefined,
  _: undefined,
  tiles: undefined,
  path: undefined,
  stateCodes: undefined,
  stateNames: undefined,
  scaling_factor: undefined
  //colorValues: undefined
};

function scale (scaleFactor) {
  return d3.geoTransform({
    point: function(x, y) {
      this.stream.point(scaleFactor * (x - globals.tile_bbox[0]), scaleFactor * ((globals.tile_bbox[3] - globals.tile_bbox[1]) + -1 * (y - globals.tile_bbox[1])));
    }
  });
}
  
function loadTiles() {

  globals.svg_1 = d3.select('#svg_1');

  globals.tilemap_g = globals.svg_1.append('g')
  .attr('id','tilemap_g');
  
  d3.json('tiles-topo-us.json', function showData(error, tilegram) {
    globals.tiles = topojson.feature(tilegram, tilegram.objects.tiles);
    globals.tile_bbox = tilegram.bbox;
    
    globals.scaling_factor = globals.w / (globals.tile_bbox[2] - globals.tile_bbox[0]);

    globals.path = d3.geoPath()
    .projection(scale(globals.scaling_factor)); 

    tilegram.objects.tiles.geometries.forEach(function (geometry) {
      if (globals.stateCodes.indexOf(geometry.properties.state) === -1) {
        globals.stateCodes.push(geometry.properties.state);
        globals.stateNames.push(_.find(stateCodesWithNames, { 'code': geometry.properties.state }).state);
        // globals.colorValues.push(_.find(data, { 'code': geometry.properties.state }).value);
      }
    });
  });

  checkExist = setInterval(function() {
    if (globals.tiles != undefined) {        
      globals.tilemap_g.datum(globals.tiles);
      render();    

      clearInterval(checkExist);
    }
  }, 100); // check every 100ms

  globals.tilemap_instance = tilemap();
  
}

function render() {

  globals.svg_1.style('height',globals.h + 'px')
  .style('width',globals.w + 'px');

  globals.tilemap_g.call(globals.tilemap_instance);

}

window.addEventListener('load', function() {
  globals.w = window.innerWidth;
  globals.h = window.innerHeight;
  globals.stateCodesWithNames = window.stateCodesWithNames;
  globals.topojson = window.topojson;
  globals.d3 = window.d3;
  globals.tilemap = window.tilemap;
  globals._ = window._;
  globals.stateCodes = [];
  globals.stateNames = [];
  //globals.colorValues = [];

  loadTiles();
});

window.onresize = function(e) {
  globals.w = window.innerWidth;
  globals.h = window.innerHeight;

  globals.scaling_factor = globals.w / (globals.tile_bbox[2] - globals.tile_bbox[0]);

  globals.path = d3.geoPath()
  .projection(scale(globals.scaling_factor)); 

  render();
};