function sankey_init(view_in,data_URL){

    d3.csv(data_URL)
    .then(function(data) {
        //console.log(data_for_sankey(data))
        draw_sankey('show_here',data_for_sankey(data))
    })
    .catch(function(error){
     
    })
}

function data_for_sankey(data){   
    console.log("hi") 
    
    
    // create nodes array for sankey
    var nodes=[], links = []
    var nodes_tmp= new Set()
    var links_tmp = new Set()

    function node_element(a){
        const found = nodes.filter(function(d){
            if(+d.name == +a) return d.node
        })[0].node
        console.log(found)
    }

    data.forEach(ele => {
        if(!nodes_tmp.has(ele.source)){
            nodes.push({node: nodes.length, name: ele.source})
            nodes_tmp.add(ele.source)
        }else if(!nodes_tmp.has(ele.target)){
            nodes.push(new sankey_node_prototype(nodes.length,ele.target))
            nodes_tmp.add(ele.target)
        } 
    })
    
    data.forEach(ele1 => {
        //links.push({ source: node_element(ele1.source), target: node_element(ele1.target), value: ele1.value} )
        links.push(ele1.source)
    })

    console.log(links)
    

    

    // }).then(function(k){
    //     
    // }).then(function(callback){
    //     console.log(links)
    // })
    
}
    

    

    

    





   
    // var years =  d3.map(topic_data, function(d){return d.Year;}).keys().sort()
    
    // years.forEach(ele => {
    //     nodes.push(new sankey_node_prototype(nodes.length,ele))
    // });

    

    // //create links array for sankey
    // var links =[]
    // topic_data.forEach(ele => {
    //     var target = nodes.find(function(e){
    //         return e.name == ele.comp_role
    //     });
    //     var source = nodes.find(function(e){
    //         return e.name == ele.Year
    //     });
    //     links.push(new sankey_link_prototype(source.node, target.node ,ele.weight))
    // }); 
    // return { nodes:nodes, links:links}
    //console.log(links)


function draw_sankey(div_id,graph1){
    d3.selectAll('#'+div_id+' svg').remove();
    

    // set the dimensions and margins of the graph
    var margin = {top: 100, right: 10, bottom: 10, left: 10},
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    
    // format variables
    var formatNumber = d3.format(",.0f"),    // zero decimal places
        format = function(d) { return formatNumber(d) + " " + units; },
        color = d3.scaleOrdinal(d3.schemeCategory10);
    
    // append the svg object to the body of the page
    var svg = d3.select("div#"+div_id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .classed("svg-content", true)
      .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");
    
    // Set the sankey diagram properties
    var sankey = d3.sankey()
        .nodeWidth(8)
        .nodePadding(15)
        .size([width, height]);
    
    var path = sankey.link();



    
    // load the data
    //d3.json("data/test/test.json").then(function(graph) {
    //console.log(graph.nodes.sort((a, b) => (a.name > b.name) ? 1 : -1))
   // console.log(graph.nodes)
    //console.log(graph.links)
      sankey
          .nodes(graph.nodes)
          .links(graph.links)
          .layout(0);
    
    // add in the links
      var link = svg.append("g").selectAll(".link")
          .data(graph.links)
        .enter().append("path")
          .attr("class", "link")
          .attr("d", path)
          .style("stroke", "#b2beb5")
          .style("stroke-width", function(d) { return Math.max(1, d.dy); })
          .sort(function(a, b) { return b.dy - a.dy; });
    
    // add the link titles
      link.append("title")
            .text(function(d) {
                return d.source.name + " → " + 
                    d.target.name + "\n" + d.value; });
    
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

    //chart title
    // svg.append("text")
    //   .attr("class", "title")
    //   .attr("x", width/2)
    //   .attr("y", (- margin.top / 2))
    //   .attr("text-anchor", "middle")
    //   .style("font-size", "15px")
    //   .text('Topic'+topic_id);
    
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

function sankey_node_prototype(node,name){
    this.node = node
    this.name = name
}

function sankey_link_prototype(source,target,value){
    this.source = source
    this.target = target
    this.value = value
}