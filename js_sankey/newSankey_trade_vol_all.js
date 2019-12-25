function newSankey_trade_vol(div_id,header,T,data_set){
  change_header(header)

  //console.log(data_tr_vol);

  var nodes_s = data_set.map(d => d.s)
  var nodes_t = data_set.map(d => d.t)
  var nodes_concat = [...new Set([...nodes_s, ...nodes_t])]

  var nodes = nodes_concat.map(function(i,d){
    return(
      {
        "node": d,
        "name": i
      }
    )
  })

  var links = data_set.map(function(d){
    return(
      {
        "source": d.s,
        "target": d.t,
        "value" : d.v
      }
    )
    
  })

  var data_t = {
    "nodes": nodes,
    "links": links.filter(d => d.value >= T)
  }

node_grid(data_t)

}
