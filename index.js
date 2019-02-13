var globals = {
  tilemap_g: undefined,
  tilemap_instance: undefined,
  tilemap_g_2: undefined,
  tilemap_instance_2: undefined,
  svg_1: undefined,
  svg_2: undefined,
  svg_w: undefined,
  svg_h: undefined,
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
      this.stream.point(
        0.975 * scaleFactor * (x - globals.tile_bbox[0]) + (0.0125 * globals.svg_w), 
        0.975 * scaleFactor * ((globals.tile_bbox[3] - globals.tile_bbox[1]) + -1 * (y - globals.tile_bbox[1])) + (0.0125 * globals.svg_h));
    }
  });
}
  
function loadTiles() {

  globals.svg_1 = d3.select('#svg_1');
  globals.tilemap_g = globals.svg_1.append('g')
  .attr('id','tilemap_g');

  globals.svg_2 = d3.select('#svg_2');
  globals.tilemap_g_2 = globals.svg_2.append('g')
  .attr('id','tilemap_g');
  
  d3.json('tiles-topo-us.json', function showData(error, tilegram) {
    globals.tiles = topojson.feature(tilegram, tilegram.objects.tiles);
    globals.tile_bbox = tilegram.bbox;
    
    globals.scaling_factor = globals.svg_w / (globals.tile_bbox[2] - globals.tile_bbox[0]);
    globals.svg_h = globals.scaling_factor * (globals.tile_bbox[3] - globals.tile_bbox[1]);

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
      globals.tilemap_g_2.datum(globals.tiles);
      render();    

      clearInterval(checkExist);
    }
  }, 100); // check every 100ms

  globals.tilemap_instance = tilemap();
  globals.tilemap_instance_2 = tilemap();
  
}

function render() {

  globals.svg_1.style('width',globals.svg_w + 'px')
               .style('height',globals.svg_h + 'px');

  globals.svg_2.style('width',globals.svg_w + 'px')
               .style('height',globals.svg_h + 'px');

  globals.tilemap_g.call(globals.tilemap_instance);
  globals.tilemap_g_2.call(globals.tilemap_instance);

}

window.addEventListener('load', function() {
  var p = d3.select('.content').style('width').indexOf('p');
  globals.svg_w = +d3.select('.content').style('width').substr(0,p);
  
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
  var p = d3.select('.content').style('width').indexOf('p');
  globals.svg_w = +d3.select('.content').style('width').substr(0,p);

  globals.scaling_factor = globals.svg_w / (globals.tile_bbox[2] - globals.tile_bbox[0]);
  globals.svg_h = globals.scaling_factor * (globals.tile_bbox[3] - globals.tile_bbox[1]);

  globals.path = d3.geoPath()
  .projection(scale(globals.scaling_factor)); 

  render();
};