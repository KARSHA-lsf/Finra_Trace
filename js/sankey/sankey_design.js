function draw_sankey(graphDiv,data_got, title_note){

    // var newscript = document.createElement('script');
    //     newscript.type = 'text/javascript';
    //     newscript.async = true;
    //     newscript.src = 'https://cdnjs.cloudflare.com/ajax/libs/d3/5.12.0/d3.min.js';
    
    // // $( "head" ).find('script').remove();
    // // $( "head" ).append( newscript );
        
   // document.getElementsByTagName('head')[0].appendChild(newscript);


    change_header(title_note,"sankey")
    $('#show_here').hide();
    $('#show_sankey').show();

    var data_link = [], data_node = []

    for (let i = 0; i < data_got.link.source.length; i++) {
        data_link.push({"source":data_got.link.source[i],"target":data_got.link.target[i],"value":data_got.link.value[i]})
    }

    for (let j = 0; j < data_got.node.label.length; j++) {
        data_node.push({"node":j,"name":data_got.node.label[j]})
    }
    var data = {"nodes":data_node,"links":data_link} 
    
    d3.selectAll('#show_sankey').selectAll('*').remove();
        
    var svg = d3.select('#'+graphDiv).append("svg")
        .attr('width', '200%')
        .attr('height', '100%');

    var width = 400;
    var height = 2900;


var formatNumber = d3.format(",.0f"), format = function(d) {
return formatNumber(d) + " ";
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