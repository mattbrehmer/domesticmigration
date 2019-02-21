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
      .on('click', function (d, i) {
        
        d3.event.preventDefault(); 

        d3.select('.arcs').remove();
        d3.selectAll('.origin_tile').select('path').attr('stroke', '#130C0E');
        d3.selectAll('.dest_tile').select('path').attr('stroke', '#130C0E');
        
        var arcdata = [];
        var links = _.sampleSize(globals.stateCodes,5);
        for (var j = 0; j < links.length; j++){
          arcdata.push({
            origin: globals.path.centroid(d),
            origin_state: globals.stateCodes[i],
            dest: globals.path.centroid(d3.select('#dest_tile_' + links[j])._groups[0][0].__data__),
            dest_state: links[j]
          });
          if (globals.double_svg_h > globals.double_svg_w) {
            arcdata[j].dest[1] = arcdata[j].dest[1] + globals.svg_h;
          }
          else {
            arcdata[j].dest[0] = arcdata[j].dest[0] + globals.svg_w;
          }
        }

        console.log({
          'd': d,
          'stateCodes[i]': globals.stateCodes[i],
          'stateNames[i]': globals.stateNames[i],
          'centroid(d)': globals.path.centroid(d),
          'arcdata': arcdata
        });

        arc_links = this_paired_tilemap.append('g')
        .attr('class','arcs');

        var arc_enter = arc_links.selectAll('path')
        .data(arcdata)
        .enter();
        
        var animation_rates = _.sampleSize([1,2,3,4,5],5);

        arc_enter.append('path')
        .attr('class','arc')
        .attr('id',function(d) {
          return 'arc_' + d.origin_state + '_' + d.dest_state;
        })
        .attr('stroke', 'tomato')
        .style('animation',function(d,i) {
          var west_of_source = (d.dest[0] - d.origin[0]) < 0;
          if (west_of_source) {
            return 'reverseflow ' + animation_rates[i] + 's linear infinite';
          }
          else {
            return 'flow ' + animation_rates[i] + 's linear infinite';
          }
        })
        .style('-webkit-animation',function(d,i) {
          var west_of_source = (d.dest[0] - d.origin[0]) < 0;
          if (west_of_source) {
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
          if (west_of_source) {
            return "M" + d.dest[0] + "," + d.dest[1] + "A" + dr + "," + dr + " 0 0,1 " + d.origin[0] + "," + d.origin[1];
          }
          return "M" + d.origin[0] + "," + d.origin[1] + "A" + dr + "," + dr + " 0 0,1 " + d.dest[0] + "," + d.dest[1];
        });

        d3.select('#origin_tile_' + globals.stateCodes[i]).select('path').attr('stroke', 'tomato');
        d3.select('#origin_tile_' + globals.stateCodes[i]).moveToFront();

        for (var k = 0; k < links.length; k++){
          d3.select('#dest_tile_' + links[k]).select('path')
          .attr('stroke', 'tomato');       
          
          d3.select('#dest_tile_' + links[k]).moveToFront();
        }

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
      .on('click', function (d, i) {
        
        d3.event.preventDefault(); 

        d3.select('.arcs').remove();
        d3.selectAll('.origin_tile').select('path').attr('stroke', '#130C0E');
        d3.selectAll('.dest_tile').select('path').attr('stroke', '#130C0E');
        
        var arcdata = [];
        var links = _.sampleSize(globals.stateCodes,5);
        for (var j = 0; j < links.length; j++){
          arcdata.push({
            origin: globals.path.centroid(d3.select('#dest_tile_' + links[j])._groups[0][0].__data__),
            origin_state: links[j] ,
            dest: globals.path.centroid(d),
            dest_state: globals.stateCodes[i]
          });
          if (globals.double_svg_h > globals.double_svg_w) {
            arcdata[j].dest[1] = arcdata[j].dest[1] + globals.svg_h;
          }
          else {
            arcdata[j].dest[0] = arcdata[j].dest[0] + globals.svg_w;
          }
        }

        console.log({
          'd': d,
          'stateCodes[i]': globals.stateCodes[i],
          'stateNames[i]': globals.stateNames[i],
          'centroid(d)': globals.path.centroid(d),
          'arcdata': arcdata
        });

        arc_links = this_paired_tilemap.append('g')
        .attr('class','arcs');

        var animation_rates = _.sampleSize([1,2,3,4,5],5);

        var arc_enter = arc_links.selectAll('path')
        .data(arcdata)
        .enter();

        arc_enter.append('path')
        .attr('class','arc')
        .attr('id',function(d) {
          return 'arc_' + d.origin_state + '_' + d.dest_state;
        })
        .attr('stroke', 'cornflowerblue')
        .style('animation',function(d,i) {
          var west_of_source = (d.dest[0] - d.origin[0]) < 0;
          if (west_of_source) {
            return 'flow ' + animation_rates[i] + 's linear infinite';
          }
          else {
            return 'reverseflow ' + animation_rates[i] + 's linear infinite';
          }
        })
        .style('-webkit-animation',function(d,i) {
          var west_of_source = (d.dest[0] - d.origin[0]) < 0;
          if (west_of_source) {
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
          if (west_of_source) {            
            return "M" + d.origin[0] + "," + d.origin[1] + "A" + dr + "," + dr + " 0 0,1 " + d.dest[0] + "," + d.dest[1];
          }
          return "M" + d.dest[0] + "," + d.dest[1] + "A" + dr + "," + dr + " 0 0,1 " + d.origin[0] + "," + d.origin[1];
        });

        d3.select('#dest_tile_' + globals.stateCodes[i]).select('path').attr('stroke', 'cornflowerblue');
        d3.select('#dest_tile_' + globals.stateCodes[i]).moveToFront();

        for (var k = 0; k < links.length; k++){
          d3.select('#origin_tile_' + links[k]).select('path')
          .attr('stroke', 'cornflowerblue');       
          
          d3.select('#origin_tile_' + links[k]).moveToFront();
        }

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

      d3.selection.prototype.moveToFront = function() {  
        return this.each(function(){
          this.parentNode.appendChild(this);
        });
      };

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