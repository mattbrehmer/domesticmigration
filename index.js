var globals = {
  svg_0: undefined,
  svg_1: undefined,
  svg_2: undefined,
  tilemap_g_0: undefined,
  tilemap_instance_0: undefined,
  tilemap_g_1: undefined,
  tilemap_instance_1: undefined,
  tilemap_g_2: undefined,
  tilemap_instance_2: undefined,
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
  outbound_counts: undefined,
  inbound: undefined,
  inbound_counts: undefined,
  loadQuery: undefined,
  originQuery: undefined,
  destQuery: undefined
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

function loadOutboundFlows(query) {
  var outbound_flows = [];

  globals.stateCodesWithNames.forEach(function(state) {
    outbound_flows.push({
      'state': state.state,
      'code': state.code
    });
  });

  d3.tsv('data/graph.tsv',function(outbound_data) {
    var outbound_array = d3.nest()
    .key(function(d){
      return d.Origin_State;
    })
    .sortKeys(d3.ascending)
    .key(function(d){
      return d.Dest_State;
    })
    .rollup(function(leaves){
      return d3.sum(leaves, function(d) {return (d[query]);});
    })
    .sortKeys(d3.ascending)    
    .entries(outbound_data);

    for(var i = 0; i < outbound_array.length; i++) {
      if (outbound_array[i].key != "District of Columbia") {
        var outbound_count = 0;
        for (var j = 0; j < outbound_array[i].values.length; j++){
          if (outbound_array[i].values[j].key != "District of Columbia") {
            outbound_count += outbound_array[i].values[j].value;
          }
        }
        outbound_flows[_.findIndex(outbound_flows, { 'state': outbound_array[i].key })].count = outbound_count;
      }
    }
  });
  return outbound_flows;  
}

function loadInboundFlows(query) {
  var inbound_flows = [];

  globals.stateCodesWithNames.forEach(function(state) {    
    inbound_flows.push({
      'state': state.state,
      'code': state.code
    });
  });

  d3.tsv('data/graph.tsv',function(inbound_data) {
    var inbound_array = d3.nest()
    .key(function(d){
      return d.Dest_State;
    })
    .sortKeys(d3.ascending)
    .key(function(d){
      return d.Origin_State;
    })
    .rollup(function(leaves){
      return d3.sum(leaves, function(d) {return (d[query]);});
    })
    .sortKeys(d3.ascending)    
    .entries(inbound_data);

    for(var i = 0; i < inbound_array.length; i++) {
      if (inbound_array[i].key != "District of Columbia") {
        var inbound_count = 0;
        for (var j = 0; j < inbound_array[i].values.length; j++){
          if (inbound_array[i].values[j].key != "District of Columbia") {
            inbound_count += inbound_array[i].values[j].value;
          }
        }
        inbound_flows[_.findIndex(inbound_flows, { 'state': inbound_array[i].key })].count = inbound_count;
      }
    }
  });
  return inbound_flows;
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

  globals.svg_0 = d3.select('#svg_0');
  globals.tilemap_g_0 = globals.svg_0.append('g')
  .attr('id','tilemap_g_0');

  globals.svg_1 = d3.select('#svg_1');
  globals.tilemap_g_1 = globals.svg_1.append('g')
  .attr('id','tilemap_g_1');

  globals.svg_2 = d3.select('#svg_2');
  globals.tilemap_g_2 = globals.svg_2.append('g')
  .attr('id','tilemap_g_2');
  
  d3.json('tiles-topo-us.json', function showData(error, tilegram) {
    globals.tiles = topojson.feature(tilegram, tilegram.objects.tiles);
    globals.tile_bbox = tilegram.bbox;
    
    globals.scaling_factor = globals.svg_w / (globals.tile_bbox[2] - globals.tile_bbox[0]);
    globals.svg_h = globals.scaling_factor * (globals.tile_bbox[3] - globals.tile_bbox[1]);

    globals.double_svg_h = window.innerWidth < 506 ? (globals.svg_h * 2) : globals.svg_h;

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

  var checkExist = setInterval(function() {
    if (globals.tiles != undefined) {        
      globals.tilemap_g_0.datum(globals.tiles);
      globals.tilemap_g_1.datum(globals.tiles);
      globals.tilemap_g_2.datum(globals.tiles);
      render();    

      clearInterval(checkExist);
    }
  }, 100); // check every 100ms

  globals.tilemap_instance_0 = paired_tilemap();
  globals.tilemap_instance_1 = tilemap();
  globals.tilemap_instance_2 = tilemap();
  
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
  
  globals.svg_0.style('width',globals.double_svg_w + 'px')
               .style('height',globals.double_svg_h + 'px');

  globals.svg_1.style('width',globals.svg_w + 'px')
               .style('height',globals.svg_h + 'px');

  globals.svg_2.style('width',globals.svg_w + 'px')
               .style('height',globals.svg_h + 'px');   

  var animation_rates = _.sampleSize([1,2,3,4,5],5);

  d3.selectAll('.outgoing_arc').transition()
  .duration(100)
  .style('animation',function(d,i) {
    var origin_state = globals.path.centroid(d3.select('#origin_tile_' + d.origin_state)._groups[0][0].__data__),
        dest_state = globals.path.centroid(d3.select('#origin_tile_' + d.dest_state)._groups[0][0].__data__);

    var west_of_source = (dest_state[0] - origin_state[0]) < 0;
    var south_of_source = (dest_state[1] - origin_state[1]) > 0;
    
    if (west_of_source || south_of_source) {
      return 'reverseflow ' + animation_rates[i] + 's linear infinite';
    }
    else {
      return 'flow ' + animation_rates[i] + 's linear infinite';
    }
  })
  .style('-webkit-animation',function(d,i) {
    var origin_state = globals.path.centroid(d3.select('#origin_tile_' + d.origin_state)._groups[0][0].__data__),
        dest_state = globals.path.centroid(d3.select('#origin_tile_' + d.dest_state)._groups[0][0].__data__);

    var west_of_source = (dest_state[0] - origin_state[0]) < 0;
    var south_of_source = (dest_state[1] - origin_state[1]) > 0;

    if (west_of_source || south_of_source) {
      return 'reverseflow ' + animation_rates[i] + 's linear infinite';
    }
    else {
      return 'flow ' + animation_rates[i] + 's linear infinite';
    }
  })
  .attr('d', function(d) {
    var origin_state = globals.path.centroid(d3.select('#origin_tile_' + d.origin_state)._groups[0][0].__data__),
        dest_state = globals.path.centroid(d3.select('#origin_tile_' + d.dest_state)._groups[0][0].__data__);

    var west_of_source = (dest_state[0] - origin_state[0]) < 0;
    var south_of_source = (dest_state[1] - origin_state[1]) > 0;

    dest_state[0] = globals.double_svg_h > globals.double_svg_w ? dest_state[0] : dest_state[0] + globals.svg_w;

    dest_state[1] = globals.double_svg_h > globals.double_svg_w ? dest_state[1] + globals.svg_h : dest_state[1];
            
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
  .style('animation',function(d,i) {
    var origin_state = globals.path.centroid(d3.select('#origin_tile_' + d.origin_state)._groups[0][0].__data__),
        dest_state = globals.path.centroid(d3.select('#origin_tile_' + d.dest_state)._groups[0][0].__data__);

    var west_of_source = (dest_state[0] - origin_state[0]) < 0;
    var south_of_source = (dest_state[1] - origin_state[1]) > 0;

    if (globals.double_svg_h > globals.double_svg_w && west_of_source || globals.double_svg_h < globals.double_svg_w && south_of_source) {
      return 'flow ' + animation_rates[i] + 's linear infinite';
    }
    else {
      return 'reverseflow ' + animation_rates[i] + 's linear infinite';
    }
  })
  .style('-webkit-animation',function(d,i) {
    var origin_state = globals.path.centroid(d3.select('#origin_tile_' + d.origin_state)._groups[0][0].__data__),
        dest_state = globals.path.centroid(d3.select('#origin_tile_' + d.dest_state)._groups[0][0].__data__);

    var west_of_source = (dest_state[0] - origin_state[0]) < 0;
    var south_of_source = (dest_state[1] - origin_state[1]) > 0;

    if (globals.double_svg_h > globals.double_svg_w && west_of_source || globals.double_svg_h < globals.double_svg_w && south_of_source) {
      return 'flow ' + animation_rates[i] + 's linear infinite';
    }
    else {
      return 'reverseflow ' + animation_rates[i] + 's linear infinite';
    }
  })
  .attr('d', function(d) {
    var origin_state = globals.path.centroid(d3.select('#origin_tile_' + d.origin_state)._groups[0][0].__data__),
        dest_state = globals.path.centroid(d3.select('#origin_tile_' + d.dest_state)._groups[0][0].__data__);

    var west_of_source = (dest_state[0] - origin_state[0]) < 0;
    var south_of_source = (dest_state[1] - origin_state[1]) > 0;

    dest_state[0] = globals.double_svg_h > globals.double_svg_w ? dest_state[0] : dest_state[0] + globals.svg_w;

    dest_state[1] = globals.double_svg_h > globals.double_svg_w ? dest_state[1] + globals.svg_h : dest_state[1];
            
    var dx = dest_state[0] - origin_state[0],
        dy = dest_state[1] - origin_state[1],
        dr = Math.sqrt(dx * dx + dy * dy)*2;
    if (globals.double_svg_h > globals.double_svg_w && west_of_source || globals.double_svg_h < globals.double_svg_w && south_of_source) {
      return "M" + origin_state[0] + "," + origin_state[1] + "A" + dr + "," + dr + " 0 0,1 " + dest_state[0] + "," + dest_state[1];
    }
    return "M" + dest_state[0] + "," + dest_state[1] + "A" + dr + "," + dr + " 0 0,1 " + origin_state[0] + "," + origin_state[1];
  });

  globals.tilemap_g_0.call(globals.tilemap_instance_0);             
  globals.tilemap_g_1.call(globals.tilemap_instance_1);
  globals.tilemap_g_2.call(globals.tilemap_instance_2);

}

window.addEventListener('load', function() {
  var single_w = d3.select('.single').style('width').indexOf('p');
  globals.svg_w = +d3.select('.single').style('width').substr(0,single_w);

  var double_w = d3.select('.double').style('width').indexOf('p');
  globals.double_svg_w = +d3.select('.double').style('width').substr(0,double_w);
 
  globals.stateCodesWithNames = window.stateCodesWithNames;
  globals.topojson = window.topojson;
  globals.d3 = window.d3;
  globals.tilemap = window.tilemap;
  globals.paired_tilemap = window.paired_tilemap;
  globals._ = window._;
  globals.stateCodes = [];
  globals.stateNames = [];

  globals.loadQuery = function(query){    

    var outbound_results = loadOutboundFlows(query);
    var inbound_results = loadInboundFlows(query);
    
    globals.tilemap_instance_1.state_values(outbound_results);
    globals.tilemap_instance_2.flowtype("inbound");
    globals.tilemap_instance_2.state_values(inbound_results);
    
    var checkOutboundExist = setInterval(function() {
      if (globals.tilemap_instance_1.state_values() != []) {
        globals.tilemap_g_1.call(globals.tilemap_instance_1);
        clearInterval(checkOutboundExist);
      }      
    }, 100); // check every 100ms

    var checkInboundExist = setInterval(function() {
      if (globals.tilemap_instance_2.state_values() != []) {
        globals.tilemap_g_2.call(globals.tilemap_instance_2); 
        clearInterval(checkInboundExist);
      }      
    }, 100); // check every 100ms
  };

  globals.originQuery = function(origin,query){
    originFlows(origin,query);
    var checkExist = setInterval(function() {
      if (globals.dest_counts != []) {        
        render();      
        clearInterval(checkExist);
      }
    }, 100);
  };

   globals.destQuery = function(dest,query){
    destFlows(dest,query);
    var checkExist = setInterval(function() {
      if (globals.origin_counts != []) {        
        render();      
        clearInterval(checkExist);
      }
    }, 100);
  };
  
  loadTiles();
});

window.onresize = function(e) {  

  var single_w = d3.select('.single').style('width').indexOf('p');
  globals.svg_w = +d3.select('.single').style('width').substr(0,single_w);

  var double_w = d3.select('.double').style('width').indexOf('p');
  globals.double_svg_w = +d3.select('.double').style('width').substr(0,double_w);

  globals.scaling_factor = globals.svg_w / (globals.tile_bbox[2] - globals.tile_bbox[0]);
  globals.svg_h = globals.scaling_factor * (globals.tile_bbox[3] - globals.tile_bbox[1]);

  globals.path = d3.geoPath()
  .projection(scale(globals.scaling_factor)); 

  
  var checkOrientation = setInterval(function() {

    globals.orientation_changed = false;
    if (window.innerWidth < 506 && globals.double_svg_h <= globals.svg_h) {
      orientation_changed = false;
      globals.double_svg_h = (globals.svg_h * 2);    
      render();
    }
    else if (window.innerWidth >= 506 && globals.double_svg_h != globals.svg_h) {
      orientation_changed = false;
      globals.double_svg_h = globals.svg_h; 
      render(); 
    }
    else {
      orientation_changed = true;
      render();
      clearInterval(checkOrientation);
    }
  }, 100);

};