function node_grid(data){
    $('#node_filter_main').show();

    // data.nodes.sort( compare );

    function edge_counter(source_name){
        return data.links.filter(function(d){
            if(d.source == source_name) return d
        }).length
    }

    var nodes_stat = data.nodes.sort( compare ).map(function(d,i){
        return ({
            'node' : d.node,
            'name' : d.name,
            'index': i,
            'edge_count' : edge_counter(d.name)
        })
    })

    console.log(nodes_stat)
    var selected_nodes = []
    
    nodes_stat.forEach(d => {
        $('#node_list_checkbox').append( '<div class="checkbox"><label><input type="checkbox" id="ch_'+d.name+'"> node '+d.name+'</label></div>' )
    });

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
          node_column = 20

    var color = d3.scaleLinear()
                .domain(d3.extent(nodes_stat.map(d => d.edge_count)))
                .range(['#ffffff','#d73027'])
                .interpolate(d3.interpolateHcl);

    var grid = d3.select("#node_filter")
        .append("svg")
        .attr("width","650px")
        .attr("height","400px");

    var node_g = grid.selectAll('g')
                        .data(nodes_stat)
                        .enter()
                        .append('g')
                        .attr("transform",d => "translate("+(d.index%node_column)*node_width+","+ Math.trunc(d.index/node_column)*node_width+")")
                        


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

                            var a = data_preparation(data,selected_nodes)
                            console.log(a)
                        
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
        if(selected_nodes.filter(d => (d.node == e.source) | (d.node == e.target)).length>0){
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
     return {"nodes":nodes, "links":links}
}