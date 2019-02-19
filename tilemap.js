tilemap = function() {
  var params = {};

  function tilemap (selection) {
    selection.each(function(data){

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
      .attr('fill', '#666')
      // .attr('fill', function (d, i) {
      //   return linear(colorValues[i]);
      // })
      .attr('stroke', '#130C0E')
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
      .attr('d', globals.path);

      tiles_update.selectAll('text')
      .style('font-size', globals.scaling_factor + 'em')
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
  
  return tilemap;

};