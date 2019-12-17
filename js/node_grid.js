function node_grid(data){
    $('#node_filter_main').show();
    $('#show_here').hide();

    $('#show_sankey').show();

    // data.nodes.sort( compare );

    function edge_counter(source_name){
        return data.links.filter(function(d){
            if(d.source == source_name || d.target == source_name) return d
        }).length
    }

    var node_temp = data.nodes.reduce((acc, current) => {
        const x = acc.find(item => item.node === current.node && item.name === current.name);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      var nodes_stat = node_temp.sort( compare ).map(function(d,i){
        return ({
            'node' : d.node,
            'name' : d.name,
            'index': i,
            'edge_count' : edge_counter(d.node)
        })
    })



    var selected_nodes = []
    
    nodes_stat.forEach(d => {
        $('#node_list_checkbox').append( '<div class="checkbox"><label><input type="checkbox" id="ch_'+d.name+'"> node '+d.name+'</label></div>' )
    });

    console.log(nodes_stat)

    //sorting 
    function compare( a, b ) {
        if ( a.name < b.name ){
          return -1;
        }
        if ( a.name > b.name ){
          return 1;
        }
        return 0;
    }
    
    const node_width = 30,
          node_column = 35

    var color = d3.scaleLinear()
                .domain(d3.extent(nodes_stat.map(d => d.edge_count)))
                .range(['#ffffff','#d73027'])
                //.interpolate(d3.interpolateHcl);

    d3.selectAll('#node_filter').selectAll('*').remove();

    var grid = d3.select("#node_filter")
        .append("svg")
        .attr("width","1300px")
        .attr("height","200px");

    var node_g = grid.selectAll('g')
                        .data(nodes_stat)
                        .enter()
                        .append('g')
                        .attr("transform",d => "translate("+(d.index%node_column)*node_width+","+ Math.trunc(d.index/node_column)*node_width+")")
                        

    console.log(nodes_stat)
    var node_rect = node_g.append('rect')
                        .attrs({
                            height :node_width,
                            width : node_width
                            
                        })
                        .styles({
                            "stroke" : "black",
                            "fill" : d => color(d.edge_count)
                        })
                        .on("click", function() {
                            
                            d3.select(this).styles({
                                'stroke-width' : (d3.select(this).style('stroke-width') == '1px')? '5px':'1px'
                            })
                            var node_element  = d3.select(this).data()[0]
                            if(selected_nodes.filter(function(d){ return (d.name == node_element.name)}).length>0){
                                selected_nodes = selected_nodes.filter(function(d){
                                    return d.name !== node_element.name
                                })
                            }else{
                                selected_nodes.push(node_element)
                            }


                            var node_show = selected_nodes.map(function(d){return d.name})
                            $('#selected_node_list').html(JSON.stringify(node_show))

                            var row_data = data_preparation(data,selected_nodes)

                            console.log(row_data)

                            //draw_sankey('show_sankey',graph)
                            new_draw_sankey('#show_sankey',row_data)
                        
                        });
                  
                        
    var node_txt = node_g.append('text')
                        .attrs({
                            x: node_width/2,
                            y: node_width/2,
                            'text-anchor' :"middle"
                        })
                        .text(d => d.name)
       
}

function data_preparation(data, selected_nodes){

    var links = data.links.filter(function(e){
        if(selected_nodes.filter(d => (d.node == e.source) || (d.node == e.target)).length>0){
            return e
        }
    })
    
    var link_node_list = links.map(d => d.source).concat(links.map(d => d.target))
    let remove_duplicates = (link_node_list) => link_node_list.filter((v,i) => link_node_list.indexOf(v) === i)
    let link_node_list_nodup = remove_duplicates(link_node_list); 

    var nodes = data.nodes.filter(function(e){
       if(link_node_list_nodup.includes(e.node)){
           return e
       }
    })

    new_nodes = nodes.map(function(d,i){
        return ({
            'node' : i,
            'name' : d.name.toString(),
            'pre_node' : d.node
        })
    })
    new_links = links.map(function(d){
        return ({
            'source' : new_nodes.filter(function(e){ if(d.source == e.pre_node){ return e}})[0].node,
            'target' : new_nodes.filter(function(e){ if(d.target == e.pre_node){ return e}})[0].node,
            'value'  : d.value
        })
    })



    //console.log(JSON.stringify({"nodes":new_nodes, "links":new_links}))
    return {"nodes":new_nodes, "links":new_links}
}

function draw_sankey(div_id,graph){

    d3.selectAll('#show_sankey').selectAll('*').remove();

    var units = "Widgets";

// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 700 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// format variables
var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; },
    color = d3.scaleOrdinal(d3.schemeCategory10);

// append the svg object to the body of the page
var svg = d3.select("#"+div_id).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(40)
    .size([width, height]);

var path = sankey.link();

sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);

// add in the links
  var link = svg.append("g").selectAll(".link")
      .data(graph.links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      .sort(function(a, b) { return b.dy - a.dy; });

// add the link titles
  link.append("title")
        .text(function(d) {
    		return d.source.name + " → " + 
                d.target.name + "\n" + format(d.value); });

// add in the nodes
  var node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
		  return "translate(" + d.x + "," + d.y + ")"; })
      .call(d3.drag()
        .subject(function(d) {
          return d;
        })
        .on("start", function() {
          this.parentNode.appendChild(this);
        })
        .on("drag", dragmove));

// add the rectangles for the nodes
  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { 
		  return d.color = color(d.name.replace(/ .*/, "")); })
      .style("stroke", function(d) { 
		  return d3.rgb(d.color).darker(2); })
    .append("title")
      .text(function(d) { 
		  return d.name + "\n" + format(d.value); });

// add in the title for the nodes
  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

// the function for moving the nodes
  function dragmove(d) {
    d3.select(this)
      .attr("transform", 
            "translate(" 
               + d.x + "," 
               + (d.y = Math.max(
                  0, Math.min(height - d.dy, d3.event.y))
                 ) + ")");
    sankey.relayout();
    link.attr("d", path);
  }
}

function new_draw_sankey(graphDiv,data){

    
    d3.selectAll('#show_sankey').selectAll('*').remove();
    
    console.log(data)

    var svg = d3.select(graphDiv).append("svg")
                            .attr('width', '200%')
                            .attr('height', '100%');

    var width = 400;
    var height = 2900;


    var formatNumber = d3.format(",.0f"), format = function(d) {
		return formatNumber(d) + " TWh";
	}, color = d3.scaleOrdinal(d3.schemeCategory10);

    var sankey = d3.sankey().nodeWidth(15)
                    .nodePadding(10)
                    .extent([ [ 1, 1 ], [ width - 1, height - 5 ] ]);

	var link = svg.append("g").attr("class", "links").attr("fill", "none")
			.attr("stroke", "#000").attr("stroke-opacity", 0.2).selectAll(
                    "path")

    
        

	var node = svg.append("g").attr("class", "nodes").attr("font-family",
			"sans-serif").attr("font-size", 10).selectAll("g");

    var graph = sankey(data);

		link = link.data(data.links).enter().append("path").attr("d",
				d3.sankeyLinkHorizontal()).attr("stroke-width", function(d) {

			return Math.max(1, d.width);
		});

		link.append("title").text(
				function(d) {
					return d.source.name + " -> " + d.target.name + "\n"
							+"value :" +d.value;
                });
                
        node = node.data(data.nodes)
                    .enter()
                    .append("g")
                    .call(
                        d3.drag().subject(function(d) {
                            return d
                        }).on('start', function() {
                            this.parentNode.appendChild(this);
                        })
                    .on('drag', dragmove));
    
        node.append("rect").attr("x", function(d) {
                return d.x0;
            }).attr("y", function(d) {
                return d.y0;
            }).attr("height", function(d) {
                return d.y1 - d.y0;
            }).attr("width", function(d) {
                return d.x1 - d.x0;
            }).attr("fill", function(d) {
                return color(d.name.replace(/ .*/, ""));
            }).attr("stroke", "#000");
    
        node.append("text").attr("x", function(d) {
                return d.x0 - 6;
            }).attr("y", function(d) {
                return (d.y1 + d.y0) / 2;
            }).attr("dy", "0.35em").attr("text-anchor", "end").text(function(d) {
                return d.name;
            })
            //.filter(function(d) {return d.x0 < width / 2;})
            .attr("x", function(d) {
                return d.x1 + 6;
            }).attr("text-anchor", "start");
    
            node.append("title").text(function(d) {
                return d.name + "\n" + format(d.value);
            });
        
        
        // the function for moving the nodes
        function dragmove(d) {
    
            var rectY = d3.select(this).select("rect").attr("y");
    
            d.y0 = d.y0 + d3.event.dy;
    
            var yTranslate = d.y0 - rectY;
    
            d3.select(this).attr("transform", "translate(0" + "," + (yTranslate) + ")");
    
            sankey.update(graph);
            link.attr("d", d3.sankeyLinkHorizontal());
        }

}