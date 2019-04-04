var gl = {
  svg_0: undefined,
  svg_1: undefined,
  svg_2: undefined,
  tilemap_g_0: undefined,
  tilemap_g_1: undefined,
  tilemap_g_2: undefined,
  tilemap_instances: undefined,
  svg_w: undefined,
  svg_h: undefined,
  double_svg_w: undefined,
  double_svg_h: undefined,
  stateCodesWithNames: undefined,
  topojson: undefined,
  d3: undefined,
  tilemap: undefined,
  paired_tilemap: undefined,
  tile_bbox: undefined,
  _: undefined,
  tiles: undefined,
  path: undefined,
  stateCodes: undefined,
  stateNames: undefined,
  scaling_factor: undefined,
  orientation_changed: undefined,
  outbound: undefined,
  flow_counts: undefined,
  inbound: undefined,
  inbound_counts: undefined,
  loadQuery: undefined,
  originQuery: undefined,
  destQuery: undefined,
  migration_graph: undefined,
  //colorValues: undefined
};

function scale (scaleFactor) {
  return d3.geoTransform({
    point: function(x, y) {
      this.stream.point(
        0.975 * scaleFactor * (x - gl.tile_bbox[0]) + (0.0125 * gl.svg_w), 
        0.975 * scaleFactor * ((gl.tile_bbox[3] - gl.tile_bbox[1]) + -1 * (y - gl.tile_bbox[1])) + (0.0125 * gl.svg_h));
    }
  });
}

function loadFlows(query,flowtype) {
  var flows = [];

  gl.stateCodesWithNames.forEach(function(state) {
    flows.push({
      'state': state.state,
      'code': state.code
    });
  });

  var flow_array = d3.nest()
  .key(function(d){
    return (flowtype == 'outbound') ? d.Origin_State : d.Dest_State;
  })
  .sortKeys(d3.ascending)
  .key(function(d){
    return (flowtype == 'outbound') ? d.Dest_State : d.Origin_State;
  })
  .rollup(function(leaves){
    return d3.sum(leaves, function(d) {return (d[query]);});
  })
  .sortKeys(d3.ascending)    
  .entries(gl.migration_graph);

  for(var i = 0; i < flow_array.length; i++) {
    if (flow_array[i].key != "District of Columbia") {
      var flow_count = 0;
      for (var j = 0; j < flow_array[i].values.length; j++){
        if (flow_array[i].values[j].key != "District of Columbia") {
          flow_count += flow_array[i].values[j].value;
        }
      }
      flows[_.findIndex(flows, { 'state': flow_array[i].key })].count = flow_count;
    }
  }
  return flows;  
}

function originFlows(origin,query) {
  console.log({
    'origin': origin,
    'query': query
  });
}

function destFlows(dest,query) {
  console.log({
    'dest': dest,
    'query': query
  });
}
  
function loadTiles() {

  d3.selectAll('svg').append('defs');

  gl.svg_0 = d3.select('#svg_0');
  gl.tilemap_g_0 = gl.svg_0.append('g')
  .attr('id','tilemap_g_0');

  gl.svg_1 = d3.select('#svg_1');
  gl.tilemap_g_1 = gl.svg_1.append('g')
  .attr('id','tilemap_g_1');

  gl.svg_2 = d3.select('#svg_2');
  gl.tilemap_g_2 = gl.svg_2.append('g')
  .attr('id','tilemap_g_2');
  
  d3.json('tiles-topo-us.json', function showData(error, tilegram) {
    gl.tiles = topojson.feature(tilegram, tilegram.objects.tiles);
    gl.tile_bbox = tilegram.bbox;
    
    gl.scaling_factor = gl.svg_w / (gl.tile_bbox[2] - gl.tile_bbox[0]);
    gl.svg_h = gl.scaling_factor * (gl.tile_bbox[3] - gl.tile_bbox[1]);

    gl.double_svg_h = window.innerWidth < 506 ? (gl.svg_h * 2) : gl.svg_h;

    gl.path = d3.geoPath()
    .projection(scale(gl.scaling_factor)); 

    tilegram.objects.tiles.geometries.forEach(function (geometry) {
      if (gl.stateCodes.indexOf(geometry.properties.state) === -1) {
        gl.stateCodes.push(geometry.properties.state);
        gl.stateNames.push(_.find(stateCodesWithNames, { 'code': geometry.properties.state }).state);
        // gl.colorValues.push(_.find(data, { 'code': geometry.properties.state }).value);
      }
    });
  });

  var checkExist = setInterval(function() {
    if (gl.tiles != undefined) {        
      gl.tilemap_g_0.datum(gl.tiles);
      gl.tilemap_g_1.datum(gl.tiles);
      gl.tilemap_g_2.datum(gl.tiles);
      render();    

      clearInterval(checkExist);
    }
  }, 100); // check every 100ms

  gl.tilemap_instances[0] = paired_tilemap();
  gl.tilemap_instances[1] = tilemap();
  gl.tilemap_instances[2] = tilemap();
  
}

function nest(seq,keys) {
  if (!keys.length) {
    return seq;
  }
  var first = keys[0];
  var rest = keys.slice(1);
  return _.mapValues(_.groupBy(seq, first), function (value) { 
    return nest(value, rest);
  });
}

function render() {
  
  gl.svg_0.style('width',gl.double_svg_w + 'px')
               .style('height',gl.double_svg_h + 'px');

  gl.svg_1.style('width',gl.svg_w + 'px')
               .style('height',gl.svg_h + 'px');

  gl.svg_2.style('width',gl.svg_w + 'px')
               .style('height',gl.svg_h + 'px');   

  var animation_rates = _.sampleSize([1,2,3,4,5],5);

  d3.selectAll('.outgoing_arc').transition()
  .duration(100)
  .style('animation',function(d) {
    var animation_rate = this.id.substr(-1);
    var origin_state = gl.path.centroid(d3.select('#origin_tile_' + d.origin_state)._groups[0][0].__data__),
        dest_state = gl.path.centroid(d3.select('#origin_tile_' + d.dest_state)._groups[0][0].__data__);

    var west_of_source = (dest_state[0] - origin_state[0]) < 0;
    var south_of_source = (dest_state[1] - origin_state[1]) > 0;
    
    if (west_of_source || south_of_source) {
      return 'reverseflow ' + animation_rate + 's linear infinite';
    }
    else {
      return 'flow ' + animation_rate + 's linear infinite';
    }
  })
  .style('-webkit-animation',function(d) {
    var animation_rate = this.id.substr(-1);
    var origin_state = gl.path.centroid(d3.select('#origin_tile_' + d.origin_state)._groups[0][0].__data__),
        dest_state = gl.path.centroid(d3.select('#origin_tile_' + d.dest_state)._groups[0][0].__data__);

    var west_of_source = (dest_state[0] - origin_state[0]) < 0;
    var south_of_source = (dest_state[1] - origin_state[1]) > 0;

    if (west_of_source || south_of_source) {
      return 'reverseflow ' + animation_rate + 's linear infinite';
    }
    else {
      return 'flow ' + animation_rate + 's linear infinite';
    }
  })
  .attr('d', function(d) {
    var origin_state = gl.path.centroid(d3.select('#origin_tile_' + d.origin_state)._groups[0][0].__data__),
        dest_state = gl.path.centroid(d3.select('#origin_tile_' + d.dest_state)._groups[0][0].__data__);

    var west_of_source = (dest_state[0] - origin_state[0]) < 0;
    var south_of_source = (dest_state[1] - origin_state[1]) > 0;

    dest_state[0] = gl.double_svg_h > gl.double_svg_w ? dest_state[0] : dest_state[0] + gl.svg_w;

    dest_state[1] = gl.double_svg_h > gl.double_svg_w ? dest_state[1] + gl.svg_h : dest_state[1];
            
    var dx = dest_state[0] - origin_state[0],
        dy = dest_state[1] - origin_state[1],
        dr = Math.sqrt(dx * dx + dy * dy)*2;
    if (west_of_source || south_of_source) {
      return "M" + dest_state[0] + "," + dest_state[1] + "A" + dr + "," + dr + " 0 0,1 " + origin_state[0] + "," + origin_state[1];
    }
    return "M" + origin_state[0] + "," + origin_state[1] + "A" + dr + "," + dr + " 0 0,1 " + dest_state[0] + "," + dest_state[1];
  });

  d3.selectAll('.incoming_arc').transition()
  .duration(100)
  .style('animation',function(d) {
    var animation_rate = this.id.substr(-1);
    var origin_state = gl.path.centroid(d3.select('#origin_tile_' + d.origin_state)._groups[0][0].__data__),
        dest_state = gl.path.centroid(d3.select('#origin_tile_' + d.dest_state)._groups[0][0].__data__);

    var west_of_source = (dest_state[0] - origin_state[0]) < 0;
    var south_of_source = (dest_state[1] - origin_state[1]) > 0;

    if (gl.double_svg_h > gl.double_svg_w && west_of_source || gl.double_svg_h < gl.double_svg_w && south_of_source) {
      return 'flow ' + animation_rate + 's linear infinite';
    }
    else {
      return 'reverseflow ' + animation_rate + 's linear infinite';
    }
  })
  .style('-webkit-animation',function(d) {
    var animation_rate = this.id.substr(-1);
    var origin_state = gl.path.centroid(d3.select('#origin_tile_' + d.origin_state)._groups[0][0].__data__),
        dest_state = gl.path.centroid(d3.select('#origin_tile_' + d.dest_state)._groups[0][0].__data__);

    var west_of_source = (dest_state[0] - origin_state[0]) < 0;
    var south_of_source = (dest_state[1] - origin_state[1]) > 0;

    if (gl.double_svg_h > gl.double_svg_w && west_of_source || gl.double_svg_h < gl.double_svg_w && south_of_source) {
      return 'flow ' + animation_rate + 's linear infinite';
    }
    else {
      return 'reverseflow ' + animation_rate + 's linear infinite';
    }
  })
  .attr('d', function(d) {
    var origin_state = gl.path.centroid(d3.select('#origin_tile_' + d.origin_state)._groups[0][0].__data__),
        dest_state = gl.path.centroid(d3.select('#origin_tile_' + d.dest_state)._groups[0][0].__data__);

    var west_of_source = (dest_state[0] - origin_state[0]) < 0;
    var south_of_source = (dest_state[1] - origin_state[1]) > 0;

    dest_state[0] = gl.double_svg_h > gl.double_svg_w ? dest_state[0] : dest_state[0] + gl.svg_w;

    dest_state[1] = gl.double_svg_h > gl.double_svg_w ? dest_state[1] + gl.svg_h : dest_state[1];
            
    var dx = dest_state[0] - origin_state[0],
        dy = dest_state[1] - origin_state[1],
        dr = Math.sqrt(dx * dx + dy * dy)*2;
    if (gl.double_svg_h > gl.double_svg_w && west_of_source || gl.double_svg_h < gl.double_svg_w && south_of_source) {
      return "M" + origin_state[0] + "," + origin_state[1] + "A" + dr + "," + dr + " 0 0,1 " + dest_state[0] + "," + dest_state[1];
    }
    return "M" + dest_state[0] + "," + dest_state[1] + "A" + dr + "," + dr + " 0 0,1 " + origin_state[0] + "," + origin_state[1];
  });

  gl.tilemap_g_0.call(gl.tilemap_instances[0]);             
  gl.tilemap_g_1.call(gl.tilemap_instances[1]);
  gl.tilemap_g_2.call(gl.tilemap_instances[2]);

}

window.addEventListener('load', function() {
  var single_w = d3.select('.single').style('width').indexOf('p');
  gl.svg_w = +d3.select('.single').style('width').substr(0,single_w);

  var double_w = d3.select('.double').style('width').indexOf('p');
  gl.double_svg_w = +d3.select('.double').style('width').substr(0,double_w);
 
  gl.stateCodesWithNames = window.stateCodesWithNames;
  gl.topojson = window.topojson;
  gl.d3 = window.d3;
  gl.tilemap = window.tilemap;
  gl.paired_tilemap = window.paired_tilemap;
  gl._ = window._;
  gl.stateCodes = [];
  gl.stateNames = [];
  gl.tilemap_instances = [];

  d3.tsv('data/graph.tsv',function(error,data) {
    if (error) throw (error);

    gl.migration_graph = data;
    
  });  

  gl.loadQuery = function(tilemap,query,flowtype){      
    
    gl.tilemap_instances[tilemap].results(loadFlows(query,flowtype));
    gl.tilemap_instances[tilemap].flowtype(flowtype);

    render();    
   
  };

  gl.originQuery = function(origin,query){
    originFlows(origin,query);
    var checkExist = setInterval(function() {
      if (gl.dest_counts != []) {        
        render();      
        clearInterval(checkExist);
      }
    }, 100);
  };

   gl.destQuery = function(dest,query){
    destFlows(dest,query);
    var checkExist = setInterval(function() {
      if (gl.origin_counts != []) {        
        render();      
        clearInterval(checkExist);
      }
    }, 100);
  };
  
  loadTiles();

  setTimeout(function(){
    // Hide the address bar!
    gl.loadQuery("1","AllQueries","outbound");
    gl.loadQuery("2","AllQueries","inbound");
  }, 500);   

});

window.onresize = function(e) {  

  var single_w = d3.select('.single').style('width').indexOf('p');
  gl.svg_w = +d3.select('.single').style('width').substr(0,single_w);

  var double_w = d3.select('.double').style('width').indexOf('p');
  gl.double_svg_w = +d3.select('.double').style('width').substr(0,double_w);

  gl.scaling_factor = gl.svg_w / (gl.tile_bbox[2] - gl.tile_bbox[0]);
  gl.svg_h = gl.scaling_factor * (gl.tile_bbox[3] - gl.tile_bbox[1]);

  gl.path = d3.geoPath()
  .projection(scale(gl.scaling_factor)); 

  
  var checkOrientation = setInterval(function() {

    gl.orientation_changed = false;
    if (window.innerWidth < 506 && gl.double_svg_h <= gl.svg_h) {
      orientation_changed = false;
      gl.double_svg_h = (gl.svg_h * 2);    
      render();
    }
    else if (window.innerWidth >= 506 && gl.double_svg_h != gl.svg_h) {
      orientation_changed = false;
      gl.double_svg_h = gl.svg_h; 
      render(); 
    }
    else {
      orientation_changed = true;
      render();
      clearInterval(checkOrientation);
    }
  }, 100);

};