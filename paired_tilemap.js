paired_tilemap = function() {

  //paremeterizable properties for a paired tilemap (getter/setter functions follow)
  var params = {},
      query = "AllQueries",
      origin_color_scale_max = 1,
      origin_color_scale = d3.scaleLinear(),
      dest_color_scale_max = 1,
      dest_color_scale = d3.scaleLinear();

  function paired_tilemap (selection) {
    selection.each(function(data){

      this_paired_tilemap = d3.select(this);

      var parent_svg = d3.select(this)._groups[0][0].parentElement;

      var defs = d3.select("#" + parent_svg.id).select('defs');

      //enter the origin legend

      var origin_legend = d3.select(this).selectAll('.origin_legend')
      .data([null]);

      origin_color_scale.domain([0,(origin_color_scale_max / 2),origin_color_scale_max])
      .range([d3.lab("#fee0d2"),d3.lab("#fc9272"),d3.lab("#de2d26")])
      .interpolate(d3.interpolateLab)
      .nice();    

      var origin_legend_enter = origin_legend.enter()
      .append("g")
      .attr('class','origin_legend')
      .style('visibility','hidden')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var h_shift = (wt >= ht) ? 6 : 3;
        var swatch_h = (wt >= ht) ? 16 : 32;
        return 'translate(' + (wt / h_shift) + ',' + (ht / swatch_h) + ')';
      });

      //enter the gradient for the origin legend

      var origin_linear_gradient = defs.selectAll('.origin_linear_gradient')
      .data([null]);

      var origin_linear_gradient_enter = origin_linear_gradient.enter()
      .append('linearGradient')
      .attr('id',parent_svg.id + '_origin_gradient')
      .attr('class','origin_linear_gradient')
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

      origin_linear_gradient_enter.append('stop')
      .attr('class','origin_linear_gradient_start')
      .attr('offset', '0%')
      .attr('stop-color', d3.lab('#fee0d2'));

      origin_linear_gradient_enter.append('stop')
      .attr('class','origin_linear_gradient_mid')
      .attr('offset', '50%')
      .attr('stop-color', d3.lab("#fee0d2"));

      origin_linear_gradient_enter.append('stop')
      .attr('class','origin_linear_gradient_end')
      .attr('offset', '100%')
      .attr('stop-color', d3.lab("#fee0d2"));      

      origin_legend_enter.append('rect')
      .attr('id', parent_svg.id + '_origin_legend_swatch')
      .attr('width', function() {
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var h_shift = (wt >= ht) ? 6 : 3;
        return wt / h_shift;
      })
      .attr('height', function() {
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var swatch_h = (wt >= ht) ? 16 : 32;
        return ht / swatch_h;
      })      
      .attr('fill',function(){
        return "url(#" + parent_svg.id +"_origin_gradient)"; 
      });

      origin_legend_enter.append('text')
      .attr('class','legend_text')
      .text('0')
      .attr('text-anchor', "start")
      .attr('dy','-0.2em');

      origin_legend_enter.append('text')
      .attr('class','legend_text')
      .attr('id','origin_legend_text_end')
      .text('1')
      .attr('text-anchor', "end")
      .attr('dy','-0.2em')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var h_shift = (wt >= ht) ? 6 : 3;
        return 'translate(' + (wt / h_shift) + ',0)';
      });

      //update the origin legend

      var origin_legend_update = d3.select(this).selectAll('.origin_legend')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var h_shift = (wt >= ht) ? 6 : 3;
        var swatch_h = (wt >= ht) ? 16 : 32;
        return 'translate(' + (wt / h_shift) + ',' + (ht / swatch_h) + ')';
      });

      origin_legend_update.select('rect')
      .attr('width', function() {
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var h_shift = (wt >= ht) ? 6 : 3;

        return wt / h_shift;
      })
      .attr('height', function() {
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var swatch_h = (wt >= ht) ? 16 : 32;

        return ht / swatch_h;
      });

      origin_legend_update.select('#origin_legend_text_end')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var h_shift = (wt >= ht) ? 6 : 3;
        return 'translate(' + (wt / h_shift) + ',0)';
      });

      //enter the origin tiles

      var origin_tiles = this_paired_tilemap.selectAll(".origin_tile")
      .data(data.features, function(d) {
        return d.properties.state;
      }); 

      var origin_tiles_enter = origin_tiles.enter()
      .append("g")
      .attr("class","origin_tile")
      .attr("id", function (d) {
        return "origin_tile_" + d.properties.state;
      });

      origin_tiles_enter.append('path')
      .attr('d', gl.path)
      .attr('class', 'border')
      .attr('fill', origin_color_scale(0))
      // .attr('fill', function (d, i) {
      //   return linear(colorValues[i]);
      // })
      .attr('stroke', '#222222')
      .attr('stroke-width', gl.scaling_factor * 4)
      .on('click', function (d, i) {

        //trigger outbound flows from selected origin tile to dest tiles

        d3.event.preventDefault(); 

        d3.select('.origin_legend').style('visibility','hidden');
        d3.select('.dest_legend').style('visibility','visible');

        d3.selectAll('.origin_tile').select('path').attr('fill', origin_color_scale(0));
        d3.selectAll('.dest_tile').select('path').attr('fill', dest_color_scale(0));
        d3.select('.arcs').remove();
        d3.selectAll('.origin_tile').select('path').attr('stroke', '#222222');
        d3.selectAll('.dest_tile').select('path').attr('stroke', '#222222');

        d3.select('.dest_linear_gradient_start')
        .attr('stop-color', d3.lab("#deebf7"));

        d3.select('.dest_linear_gradient_mid')
        .attr('stop-color', d3.lab("#9ecae1"));

        d3.select('.dest_linear_gradient_end')
        .attr('stop-color', d3.lab("#3182bd"));

        origin_color_scale.domain([0,(origin_color_scale_max / 2),origin_color_scale_max]);
        
        var flow_array = _.filter(gl.migration_graph, ['Origin_State', gl.stateNames[i]]);
        flow_array = _.sortBy(flow_array, [function(d) { return -d[query]; }]);

        dest_color_scale_max = (flow_array.length == 0) ? 1 : d3.max(flow_array, function(d) { 
          return +d[query];
        });        
        
        d3.select('#dest_legend_text_end')
        .text(dest_color_scale.domain()[2]);

        dest_color_scale.domain([0,(dest_color_scale_max / 2),dest_color_scale_max]);

        flow_array.forEach(function (d){
          if (d.Dest_State != "District of Columbia") {
            var dest_name = _.find(gl.stateCodesWithNames, {'state': d.Dest_State }).code;

            d3.select('#dest_tile_' + dest_name).select('path').attr('fill', dest_color_scale(+d[query]));
          }
        });
        
        var arcdata = [];

        var links = [];

        for (var h = 0; h < 5; h++){
          if (flow_array[h].Dest_State != "District of Columbia") {
            links.push(_.find(gl.stateCodesWithNames, {'state': flow_array[h].Dest_State }).code);
          }
        }

        for (var j = 0; j < links.length; j++){
          arcdata.push({
            origin: gl.path.centroid(d),
            origin_state: gl.stateCodes[i],
            dest: gl.path.centroid(d3.select('#dest_tile_' + links[j])._groups[0][0].__data__),
            dest_state: links[j]
          });
          if (gl.double_svg_h > gl.double_svg_w) {
            arcdata[j].dest[1] = arcdata[j].dest[1] + gl.svg_h;
          }
          else {
            arcdata[j].dest[0] = arcdata[j].dest[0] + gl.svg_w;
          }
        }

        arc_links = this_paired_tilemap.append('g')
        .attr('class','arcs');

        var arc_enter = arc_links.selectAll('path')
        .data(arcdata)
        .enter();
        
        var animation_rates = [1,2,3,4,5];

        arc_enter.append('path')
        .attr('class','outgoing_arc')
        .attr('id',function(d,i) {
          return 'arc_' + d.origin_state + '_' + d.dest_state + '_' + animation_rates[i];
        })
        .attr('stroke', 'tomato')
        .style('animation',function(d,i) {
          var west_of_source = (d.dest[0] - d.origin[0]) < 0;
          var south_of_source = (d.dest[1] - d.origin[1]) > 0;
          if (gl.double_svg_h > gl.double_svg_w && west_of_source || gl.double_svg_h < gl.double_svg_w && south_of_source) {
            return 'reverseflow ' + animation_rates[i] + 's linear infinite';
          }
          else {
            return 'flow ' + animation_rates[i] + 's linear infinite';
          }
        })
        .style('-webkit-animation',function(d,i) {
          var west_of_source = (d.dest[0] - d.origin[0]) < 0;
          var south_of_source = (d.dest[1] - d.origin[1]) > 0;
          if (gl.double_svg_h > gl.double_svg_w && west_of_source || gl.double_svg_h < gl.double_svg_w && south_of_source) {
            return 'reverseflow ' + animation_rates[i] + 's linear infinite';
          }
          else {
            return 'flow ' + animation_rates[i] + 's linear infinite';
          }
        })
        .attr('d', function(d) {
          var dx = d.dest[0] - d.origin[0],
					    dy = d.dest[1] - d.origin[1],
              dr = Math.sqrt(dx * dx + dy * dy)*2;
          var west_of_source = (d.dest[0] - d.origin[0]) < 0;
          var south_of_source = (d.dest[1] - d.origin[1]) > 0;
          if (gl.double_svg_h > gl.double_svg_w && west_of_source || gl.double_svg_h < gl.double_svg_w && south_of_source) {
            return "M" + d.dest[0] + "," + d.dest[1] + "A" + dr + "," + dr + " 0 0,1 " + d.origin[0] + "," + d.origin[1];
          }
          return "M" + d.origin[0] + "," + d.origin[1] + "A" + dr + "," + dr + " 0 0,1 " + d.dest[0] + "," + d.dest[1];
        });

        d3.select('#origin_tile_' + gl.stateCodes[i]).select('path')
        .attr('stroke', 'tomato')
        .attr('fill','#fc9272');

        d3.select('#dest_tile_' + gl.stateCodes[i]).select('path').attr('fill','#999');

        d3.select('#origin_tile_' + gl.stateCodes[i]).moveToFront();

        for (var k = 0; k < links.length; k++){
          d3.select('#dest_tile_' + links[k]).select('path')
          .attr('stroke', 'tomato');       
          
          d3.select('#dest_tile_' + links[k]).moveToFront();
        }

      });      

      // origin tile labels

      origin_tiles_enter.append('text')
      .attr('class', function (d) {
        return 'state-label state-label-' + d.id;
      })
      .attr('transform', function (d) {
        return 'translate(' + gl.path.centroid(d) + ')';
      })
      .attr('dy', '.35em')
      .style('font-size', (gl.scaling_factor * 1.25) + 'em')
      .text(function (d) {
        return d.properties.state;
      });

      var origin_tiles_update = origin_tiles.transition()
      .duration(100);

      origin_tiles_update.selectAll('path')
      .attr('d', gl.path);

      origin_tiles_update.selectAll('text')
      .style('font-size', (gl.scaling_factor * 1.25) + 'em')
      .attr('transform', function (d) {
        return 'translate(' + gl.path.centroid(d) + ')';
      });

      origin_tiles.exit()
      .remove();

      //dest color scale

      dest_color_scale.domain([0,(dest_color_scale_max / 2),dest_color_scale_max])
      .range([d3.lab("#deebf7"),d3.lab("#9ecae1"),d3.lab("#3182bd")])
      .interpolate(d3.interpolateLab)
      .nice();

      //dest legend enter

      var dest_legend = d3.select(this).selectAll('.dest_legend')
      .data([null]);

      var dest_legend_enter = dest_legend.enter()
      .append("g")
      .attr('class','dest_legend')
      .style('visibility','hidden')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var h_shift = (wt >= ht) ? 6 : 3;
        var swatch_h = (wt >= ht) ? 16 : 32;
        return 'translate(' + ((gl.double_svg_h > gl.double_svg_w ? 0 : gl.svg_w) + (wt / h_shift)) + ',' + ((gl.double_svg_h > gl.double_svg_w ? gl.svg_h : 0) + (ht / swatch_h)) + ')';
      });

      var dest_linear_gradient = defs.selectAll('.dest_linear_gradient')
      .data([null]);

      var dest_linear_gradient_enter = dest_linear_gradient.enter()
      .append('linearGradient')
      .attr('id',parent_svg.id + '_dest_gradient')
      .attr('class','dest_linear_gradient')
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

      dest_linear_gradient_enter.append('stop')
      .attr('class','dest_linear_gradient_start')
      .attr('offset', '0%')
      .attr('stop-color', d3.lab('#deebf7'));

      dest_linear_gradient_enter.append('stop')
      .attr('class','dest_linear_gradient_mid')
      .attr('offset', '50%')
      .attr('stop-color', d3.lab("#deebf7"));

      dest_linear_gradient_enter.append('stop')
      .attr('class','dest_linear_gradient_end')
      .attr('offset', '100%')
      .attr('stop-color', d3.lab("#deebf7"));      

      dest_legend_enter.append('rect')
      .attr('id', parent_svg.id + '_dest_legend_swatch')
      .attr('width', function() {
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var h_shift = (wt >= ht) ? 6 : 3;
        return wt / h_shift;
      })
      .attr('height', function() {
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var swatch_h = (wt >= ht) ? 16 : 32;
        return ht / swatch_h;
      })      
      .attr('fill',function(){
        return "url(#" + parent_svg.id +"_dest_gradient)"; 
      });

      dest_legend_enter.append('text')
      .attr('class','legend_text')
      .text('0')
      .attr('text-anchor', "start")
      .attr('dy','-0.2em');

      dest_legend_enter.append('text')
      .attr('class','legend_text')
      .attr('id','dest_legend_text_end')
      .text('1')
      .attr('text-anchor', "end")
      .attr('dy','-0.2em')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var h_shift = (wt >= ht) ? 6 : 3;
        return 'translate(' + (wt / h_shift) + ',0)';
      });

      //dest legend update

      var dest_legend_update = d3.select(this).selectAll('.dest_legend')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var h_shift = (wt >= ht) ? 6 : 3;
        var swatch_h = (wt >= ht) ? 16 : 32;
        return 'translate(' + ((gl.double_svg_h > gl.double_svg_w ? 0 : gl.svg_w) + (wt / h_shift)) + ',' + ((gl.double_svg_h > gl.double_svg_w ? gl.svg_h : 0) + (ht / swatch_h)) + ')';
      });

      dest_legend_update.select('rect')
      .attr('width', function() {
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var h_shift = (wt >= ht) ? 6 : 3;

        return wt / h_shift;
      })
      .attr('height', function() {
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var swatch_h = (wt >= ht) ? 16 : 32;

        return ht / swatch_h;
      });

      dest_legend_update.select('#dest_legend_text_end')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        var wt = +parent_svg.style.width.substr(0,w);
        var ht = +parent_svg.style.height.substr(0,h);
        var h_shift = (wt >= ht) ? 6 : 3;
        return 'translate(' + (wt / h_shift) + ',0)';
      });

      //dest tiles enter

      var dest_tiles = this_paired_tilemap.selectAll(".dest_tile")
      .data(data.features, function(d) {
        return d.properties.state;
      }); 

      var dest_tiles_enter = dest_tiles.enter()
      .append("g")
      .attr("class","dest_tile")
      .attr("id", function (d) {
        return "dest_tile_" + d.properties.state;
      })
      .attr('transform', function (d) {
        return 'translate(' + (gl.double_svg_h > gl.double_svg_w ? 0 : gl.svg_w) + ',' + (gl.double_svg_h > gl.double_svg_w ? gl.svg_h : 0) + ')';
      });

      dest_tiles_enter.append('path')
      .attr('d', gl.path)
      .attr('class', 'border')
      .attr('fill', dest_color_scale(0))
      // .attr('fill', function (d, i) {
      //   return linear(colorValues[i]);
      // })
      .attr('stroke', '#222222')
      .attr('stroke-width', gl.scaling_factor * 4)
      .on('click', function (d, i) {

        // trigger incoming flows to selected dest tile from origin tiles
        
        d3.event.preventDefault();         

        d3.select('.origin_legend').style('visibility','visible');
        d3.select('.dest_legend').style('visibility','hidden');

        d3.selectAll('.dest_tile').select('path').attr('fill', dest_color_scale(0));
        d3.selectAll('.origin_tile').select('path').attr('fill', origin_color_scale(0));        

        d3.select('.arcs').remove();
        d3.selectAll('.origin_tile').select('path').attr('stroke', '#222222');
        d3.selectAll('.dest_tile').select('path').attr('stroke', '#222222');

        d3.select('.origin_linear_gradient_start')
        .attr('stop-color', d3.lab("#fee0d2"));

        d3.select('.origin_linear_gradient_mid')
        .attr('stop-color', d3.lab("#fc9272"));

        d3.select('.origin_linear_gradient_end')
        .attr('stop-color', d3.lab("#de2d26"));

        var flow_array = _.filter(gl.migration_graph, ['Dest_State', gl.stateNames[i]]);
        flow_array = _.sortBy(flow_array, [function(d) { return -d[query]; }]);

        origin_color_scale_max = (flow_array.length == 0) ? 1 : d3.max(flow_array, function(d) { 
          return +d[query];
        });

        origin_color_scale.domain([0,(origin_color_scale_max / 2),origin_color_scale_max]);
        
        d3.select('#origin_legend_text_end')
        .text(origin_color_scale.domain()[2]);

        flow_array.forEach(function (d){
          if (d.Origin_State != "District of Columbia") {
            var origin_name = _.find(gl.stateCodesWithNames, {'state': d.Origin_State }).code;

            d3.select('#origin_tile_' + origin_name).select('path').attr('fill', origin_color_scale(+d[query]));
          }
        });
        
        var arcdata = [];

        var links = [];

        for (var h = 0; h < 5; h++){
          if (flow_array[h].Origin_State != "District of Columbia") {
            links.push(_.find(gl.stateCodesWithNames, {'state': flow_array[h].Origin_State }).code);
          }
        }
        
        for (var j = 0; j < links.length; j++){
          arcdata.push({
            origin: gl.path.centroid(d3.select('#dest_tile_' + links[j])._groups[0][0].__data__),
            origin_state: links[j] ,
            dest: gl.path.centroid(d),
            dest_state: gl.stateCodes[i]
          });
          if (gl.double_svg_h > gl.double_svg_w) {
            arcdata[j].dest[1] = arcdata[j].dest[1] + gl.svg_h;
          }
          else {
            arcdata[j].dest[0] = arcdata[j].dest[0] + gl.svg_w;
          }
        }

        arc_links = this_paired_tilemap.append('g')
        .attr('class','arcs');

        var animation_rates = [1,2,3,4,5];

        var arc_enter = arc_links.selectAll('path')
        .data(arcdata)
        .enter();

        arc_enter.append('path')
        .attr('class','incoming_arc')
        .attr('id',function(d) {
          return 'arc_' + d.origin_state + '_' + d.dest_state;
        })
        .attr('stroke', 'cornflowerblue')
        .style('animation',function(d,i) {
          var west_of_source = (d.dest[0] - d.origin[0]) < 0;
          var south_of_source = (d.dest[1] - d.origin[1]) > 0;
          if (gl.double_svg_h > gl.double_svg_w && west_of_source || gl.double_svg_h < gl.double_svg_w && south_of_source) {
            return 'flow ' + animation_rates[i] + 's linear infinite';
          }
          else {
            return 'reverseflow ' + animation_rates[i] + 's linear infinite';
          }
        })
        .style('-webkit-animation',function(d,i) {
          var west_of_source = (d.dest[0] - d.origin[0]) < 0;
          var south_of_source = (d.dest[1] - d.origin[1]) > 0;
          if (gl.double_svg_h > gl.double_svg_w && west_of_source || gl.double_svg_h < gl.double_svg_w && south_of_source) {
            return 'flow ' + animation_rates[i] + 's linear infinite';
          }
          else {
            return 'reverseflow ' + animation_rates[i] + 's linear infinite';
          }
        })
        .attr('d', function(d) {
          var dx = d.dest[0] - d.origin[0],
					    dy = d.dest[1] - d.origin[1],
              dr = Math.sqrt(dx * dx + dy * dy)*2;
          var west_of_source = (d.dest[0] - d.origin[0]) < 0;
          var south_of_source = (d.dest[1] - d.origin[1]) > 0;
          if (gl.double_svg_h > gl.double_svg_w && west_of_source || gl.double_svg_h < gl.double_svg_w && south_of_source) {            
            return "M" + d.origin[0] + "," + d.origin[1] + "A" + dr + "," + dr + " 0 0,1 " + d.dest[0] + "," + d.dest[1];
          }
          return "M" + d.dest[0] + "," + d.dest[1] + "A" + dr + "," + dr + " 0 0,1 " + d.origin[0] + "," + d.origin[1];
        });

        d3.select('#dest_tile_' + gl.stateCodes[i]).select('path')
        .attr('stroke', 'cornflowerblue')
        .attr('fill', '#9ecae1');
  
        d3.select('#origin_tile_' + gl.stateCodes[i]).select('path').attr('fill','#999');

        d3.select('#dest_tile_' + gl.stateCodes[i]).moveToFront();

        for (var k = 0; k < links.length; k++){
          d3.select('#origin_tile_' + links[k]).select('path')
          .attr('stroke', 'cornflowerblue');       
          
          d3.select('#origin_tile_' + links[k]).moveToFront();
        }

      });  

      //text labels for dest tiles

      dest_tiles_enter.append('text')
      .attr('class', function (d) {
        return 'state-label state-label-' + d.id;
      })
      .attr('transform', function (d) {
        return 'translate(' + gl.path.centroid(d) + ')';
      })
      .attr('dy', '.35em')
      .style('font-size', (gl.scaling_factor * 1.25) + 'em')
      .text(function (d) {
        return d.properties.state;
      });

      // update the dest tiles

      var dest_tiles_update = dest_tiles.transition()
      .duration(100)
      .attr('transform', function (d) {
        return 'translate(' + (gl.double_svg_h > gl.double_svg_w ? 0 : gl.svg_w) + ',' + (gl.double_svg_h > gl.double_svg_w ? gl.svg_h : 0) + ')';
      });

      dest_tiles_update.selectAll('path')
      .attr('d', gl.path);

      dest_tiles_update.selectAll('text')
      .style('font-size', (gl.scaling_factor * 1.25) + 'em')
      .attr('transform', function (d) {
        return 'translate(' + gl.path.centroid(d) + ')';
      });

      dest_tiles.exit()
      .remove();

      //move SVG element to front helper function

      d3.selection.prototype.moveToFront = function() {  
        return this.each(function(){
          this.parentNode.appendChild(this);
        });
      };

    });
  }

  //getter / setter functions for paired tilemap properties

  paired_tilemap.params = function (x) {
    if (!arguments.length) {
      return params;
    }
    params = x;
    return paired_tilemap;
  };

  paired_tilemap.query = function (x) {
    if (!arguments.length) {
      return query;
    }
    query = x;
    return paired_tilemap;
  };
  
  return paired_tilemap;

};