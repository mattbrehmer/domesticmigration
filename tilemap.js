tilemap = function() {

  //paremeterizable tilemap properties (getter/setter functions follow)
  var params = {},
      results = [],
      flowtype = 'outbound',
      color_scale_max = 1,
      color_scale = d3.scaleLinear();

  function tilemap (selection) {
    selection.each(function(data){

      //determine the new maximum value among the query results
      color_scale_max = (results.length == 0) ? 1 : d3.max(results, function(d) { 
        return d.count;
      });

      //update the color scale
      color_scale.domain([0,(color_scale_max / 2),color_scale_max])
      .range(flowtype == "outbound" ? [d3.lab("#fee0d2"),d3.lab("#fc9272"),d3.lab("#de2d26")] : [d3.lab("#deebf7"),d3.lab("#9ecae1"),d3.lab("#3182bd")])
      .interpolate(d3.interpolateLab)
      .nice();
      
      var parent_svg = d3.select(this)._groups[0][0].parentElement;
      
      //enter the legend 
      var legend = d3.select(this).selectAll('.legend')
      .data([null]);
      
      var legend_enter = legend.enter()
      .append("g")
      .attr('class','legend')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        var h = parent_svg.style.height.indexOf('p');
        return 'translate(' + (+parent_svg.style.width.substr(0,w) / 3) + ',' + (+parent_svg.style.height.substr(0,h) / 16) + ')';
      });

      //enter the legend gradient
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
      .attr('stop-color',  d3.lab('#fee0d2'));

      linear_gradient_enter.append('stop')
      .attr('class','linear_gradient_mid')
      .attr('offset', '50%')
      .attr('stop-color', (results.length == 0) ?  d3.lab('#fee0d2') : (flowtype == "outbound") ? d3.lab("#fc9272") : d3.lab("#9ecae1"));

      linear_gradient_enter.append('stop')
      .attr('class','linear_gradient_end')
      .attr('offset', '100%')
      .attr('stop-color', (results.length == 0) ?  d3.lab('#fee0d2') : (flowtype == "outbound") ? d3.lab("#de2d26") : d3.lab("#3182bd"));

      var linear_gradient_update = linear_gradient;

      linear_gradient_update.select('.linear_gradient_start')
      .attr('stop-color', (results.length == 0) ?  d3.lab('#fee0d2') : (flowtype == "outbound") ? d3.lab("#fee0d2") : d3.lab("#deebf7"));

      linear_gradient_update.select('.linear_gradient_mid')
      .attr('stop-color', (results.length == 0) ?  d3.lab('#fee0d2') : (flowtype == "outbound") ? d3.lab("#fc9272") : d3.lab("#9ecae1"));

      linear_gradient_update.select('.linear_gradient_end')
      .attr('stop-color', (results.length == 0) ?  d3.lab('#fee0d2') : (flowtype == "outbound") ? d3.lab("#de2d26") : d3.lab("#3182bd"));

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
      .text('1')
      .attr('text-anchor', "start")
      .attr('dy','-0.2em');

      legend_enter.append('text')
      .attr('class','legend_text')
      .attr('id','legend_text_end')
      .text((results.length == 0) ? 1 : color_scale.domain()[2])
      .attr('text-anchor', "end")
      .attr('dy','-0.2em')
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        return 'translate(' + (+parent_svg.style.width.substr(0,w) / 3) + ',0)';
      });

      //update the legend
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
      .text((results.length == 0) ? 1 : color_scale.domain()[2])
      .attr('transform', function(){
        var w = parent_svg.style.width.indexOf('p');
        return 'translate(' + (+parent_svg.style.width.substr(0,w) / 3) + ',0)';
      });
      
      //enter the tiles
      var tiles = d3.select(this).selectAll(".tile")
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
      .attr('d', gl.path)
      .attr('class', 'border')
      .attr('fill', '#fee0d2')
      .attr('stroke', '#222222')
      .attr('stroke-width', gl.scaling_factor * 4)
      .on('touchstart', function (d, i) {
        d3.event.preventDefault(); 
        console.log(d);
        console.log('stateCodes[i]', gl.stateCodes[i]);
        console.log('stateNames[i]', gl.stateNames[i]);
      });

      tiles_enter.append('text')
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

      //update the tiles
      var tiles_update = tiles.transition()
      .duration(100);

      tiles_update.selectAll('path')
      .attr('d', gl.path)
      .attr('fill', function (d) {
        if (results.length != 0) {
          return color_scale(_.find(results, { 'code': d.properties.state }).count);
        }
        else {
          return color_scale(0);
        }
      });

      tiles_update.selectAll('text')
      .style('font-size', (gl.scaling_factor * 1.25) + 'em')
      .attr('transform', function (d) {
        return 'translate(' + gl.path.centroid(d) + ')';
      });

    });
  }

  //getter / setter functions for tilemap properties

  tilemap.params = function (x) {
    if (!arguments.length) {
      return params;
    }
    params = x;
    return tilemap;
  };

  tilemap.results = function (x) {
    if (!arguments.length) {
      return results;
    }
    results = x;
    return tilemap;
  };

  tilemap.flowtype = function (x) {
    if (!arguments.length) {
      return flowtype;
    }
    flowtype = x;
    return tilemap;
  };

  return tilemap;

};