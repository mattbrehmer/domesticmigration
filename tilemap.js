tilemap = function() {
  var params = {};
      params.state_values = [];
      params.flowtype = "outbound";
      color_scale = d3.scaleLinear();

  function tilemap (selection) {
    selection.each(function(data){

      var color_scale_max = 1;
      if (params.state_values.length != 0) {
        color_scale_max = d3.max(params.state_values, function(d) { 
          return d.count; 
        });
      }

      color_scale.domain([0,(color_scale_max / 2),color_scale_max])
      .range(params.flowtype == "outbound" ? [d3.lab("#fee0d2"),d3.lab("#fc9272"),d3.lab("#de2d26")] : [d3.lab("#deebf7"),d3.lab("#9ecae1"),d3.lab("#3182bd")])
      .interpolate(d3.interpolateLab)
      .nice();

      var legend = d3.select(this).selectAll('.legend')
      .data([null]);

      var parent_svg = d3.select(this)._groups[0][0].parentElement;
      
      var legend_enter = legend.enter()
      .append("g")
      .attr('class','legend')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        return 'translate(' + (+parent_svg.style.width.substr(0,w) / 3) + ',' + (+parent_svg.style.height.substr(0,h) / 16) + ')';
      });

      var defs = d3.select("#" + parent_svg.id).select('defs');

      var linear_gradient = defs.selectAll('.linear_gradient')
      .data([null]);

      var linear_gradient_enter = linear_gradient.enter()
      .append('linearGradient')
      .attr('id',parent_svg.id + '_gradient')
      .attr('class','linear_gradient')
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

      linear_gradient_enter.append('stop')
      .attr('class','linear_gradient_start')
      .attr('offset', '0%')
      .attr('stop-color', function(){
        return params.flowtype == "outbound" ? d3.lab("#fee0d2") : d3.lab("#deebf7");
      });

      linear_gradient_enter.append('stop')
      .attr('class','linear_gradient_end')
      .attr('offset', '100%')
      .attr('stop-color', function(d){
        return params.flowtype == "outbound" ? d3.lab("#de2d26") : d3.lab("#3182bd");
      });

      var linear_gradient_exit = linear_gradient.exit()
      .remove(); 

      legend_enter.append('rect')
      .attr('id', parent_svg.id + '_legend_swatch')
      .attr('width', function() {
        var w = parent_svg.style.width.indexOf('p');
        return +parent_svg.style.width.substr(0,w) / 3;
      })
      .attr('height', function() {
        var h = parent_svg.style.height.indexOf('p');
        return +parent_svg.style.height.substr(0,h) / 16;
      })      
      .attr('fill',function(){
        return "url(#" + parent_svg.id +"_gradient)"; 
      });

      legend_enter.append('text')
      .attr('class','legend_text')
      .text('0')
      .attr('text-anchor', "start")
      .attr('dy','-0.2em');

      legend_enter.append('text')
      .attr('class','legend_text')
      .attr('id','legend_text_end')
      .text(color_scale.domain()[2])
      .attr('text-anchor', "end")
      .attr('dy','-0.2em')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        return 'translate(' + (+parent_svg.style.width.substr(0,w) / 3) + ',0)';
      });

      var legend_update = d3.select(this).selectAll('.legend')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        return 'translate(' + (+parent_svg.style.width.substr(0,w) / 3) + ',' + (+parent_svg.style.height.substr(0,h) / 16) + ')';
      });

      legend_update.select('rect')
      .attr('width', function() {
        var w = parent_svg.style.width.indexOf('p');
        return +parent_svg.style.width.substr(0,w) / 3;
      })
      .attr('height', function() {
        var h = parent_svg.style.height.indexOf('p');
        return +parent_svg.style.height.substr(0,h) / 16;
      });

      legend_update.select('#legend_text_end')
      .text(color_scale.domain()[2])
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        return 'translate(' + (+parent_svg.style.width.substr(0,w) / 3) + ',0)';
      });
      
      var legend_exit = legend.exit()
      .remove(); 

      this_tilemap = d3.select(this);

      var tiles = this_tilemap.selectAll(".tile")
      .data(data.features, function(d) {
        return d.properties.state;
      }); 

      var tiles_enter = tiles.enter()
      .append("g")
      .attr("class","tile")
      .attr("id", function (d) {
        return "tile_" + d.properties.state;
      });

      tiles_enter.append('path')
      .attr('d', globals.path)
      .attr('class', 'border')
      .attr('fill', function (d, i) {
        if (params.state_values.length != 0) {
          return color_scale(_.find(params.state_values, { 'code': d.properties.state }).count);
        }
        else {
          return color_scale(0);
        }
      })
      .attr('stroke', '#222222')
      .attr('stroke-width', globals.scaling_factor * 4)
      .on('touchstart', function (d, i) {
        d3.event.preventDefault(); 
        console.log(d);
        console.log('stateCodes[i]', globals.stateCodes[i]);
        console.log('stateNames[i]', globals.stateNames[i]);
      });

      tiles_enter.append('text')
      .attr('class', function (d) {
        return 'state-label state-label-' + d.id;
      })
      .attr('transform', function (d) {
        return 'translate(' + globals.path.centroid(d) + ')';
      })
      .attr('dy', '.35em')
      .style('font-size', (globals.scaling_factor * 1.25) + 'em')
      .text(function (d) {
        return d.properties.state;
      });

      var tiles_update = tiles.transition()
      .duration(100);

      tiles_update.selectAll('path')
      .attr('d', globals.path)
      .attr('fill', function (d, i) {
        if (params.state_values.length != 0) {
          return color_scale(_.find(params.state_values, { 'code': d.properties.state }).count);
        }
        else {
          return color_scale(0);
        }
      });

      tiles_update.selectAll('text')
      .style('font-size', (globals.scaling_factor * 1.25) + 'em')
      .attr('transform', function (d) {
        return 'translate(' + globals.path.centroid(d) + ')';
      });

      tiles.exit()
      .remove();

    });
  }

  tilemap.params = function (x) {
    if (!arguments.length) {
      return params;
    }
    params = x;
    return tilemap;
  };

  tilemap.color_scale = function (x) {
    if (!arguments.length) {
      return color_scale;
    }
    color_scale = x;
    return tilemap;
  };
  
  return tilemap;

};