paired_tilemap = function() {
  var params = {};

  function paired_tilemap (selection) {
    selection.each(function(data){

      this_paired_tilemap = d3.select(this);

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
      .attr('d', globals.path)
      .attr('class', 'border')
      .attr('fill', '#966')
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

      origin_tiles_enter.append('text')
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

      var origin_tiles_update = origin_tiles.transition()
      .duration(100);

      origin_tiles_update.selectAll('path')
      .attr('d', globals.path);

      origin_tiles_update.selectAll('text')
      .style('font-size', globals.scaling_factor + 'em')
      .attr('transform', function (d) {
        return 'translate(' + globals.path.centroid(d) + ')';
      });

      origin_tiles.exit()
      .remove();

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
        return 'translate(' + (globals.double_svg_h > globals.double_svg_w ? 0 : globals.svg_w) + ',' + (globals.double_svg_h > globals.double_svg_w ? globals.svg_h : 0) + ')';
      });

      dest_tiles_enter.append('path')
      .attr('d', globals.path)
      .attr('class', 'border')
      .attr('fill', '#669')
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

      dest_tiles_enter.append('text')
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

      var dest_tiles_update = dest_tiles.transition()
      .duration(100)
      .attr('transform', function (d) {
        return 'translate(' + (globals.double_svg_h > globals.double_svg_w ? 0 : globals.svg_w) + ',' + (globals.double_svg_h > globals.double_svg_w ? globals.svg_h : 0) + ')';
      });

      dest_tiles_update.selectAll('path')
      .attr('d', globals.path);

      dest_tiles_update.selectAll('text')
      .style('font-size', globals.scaling_factor + 'em')
      .attr('transform', function (d) {
        return 'translate(' + globals.path.centroid(d) + ')';
      });

      dest_tiles.exit()
      .remove();

    });
  }

  paired_tilemap.params = function (x) {
    if (!arguments.length) {
      return params;
    }
    params = x;
    return paired_tilemap;
  };
  
  return paired_tilemap;

};