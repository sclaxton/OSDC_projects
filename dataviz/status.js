var $j = jQuery.noConflict()
$j( document ).ready(function () {                                               
    console.log( "document loaded" )
    var JSON
    var JSON_vals  
    var obj_arr = [];
    (function() {
        var callback = function () {
            JSON = (function () {
                var json = null
                $j.ajax({
                    'async': false,
                    'global': false,
                    'url': 'json.txt',
                    'dataType': 'json',
                  //  'mimeType': 'application/json',
                    'success': function (data) { 
                        json = data
                    }
                })
                return json
            })()
        }
        callback()
        setInterval(callback, 30000) 
    })()
        
    var keys = Object.keys(JSON) 
    var times = [] 
    $j.each(JSON, function (k, v) {
        times.push(v["time"])
    });        
    var chart = d3.select("body div")
        .attr("class", "chart")
    
    var main_title = chart.append("h1")
        .attr("id", "main_title")
        .attr("class", "title")
        .text("Status")

    var expand_head = chart.append("h2")
        .attr("id", "expand_heading")
    
    var expand_span = expand_head.append("span")
        .attr("id", "expand")
        .attr("style", "float:right;")
     
    var expand_open_brack = expand_span.append("span")
        .attr("class", "expand-bracket") 
        .text("[")

    var expand_toggle = expand_span.append("a")
        .attr("class", "expander")
        .attr("data-expander-target", ".closed")
        .text("+")
    
    var expand_close_brack = expand_span.append("span")
        .attr("class", "expand-bracket") 
        .text("]")
 
    var list = chart.append("ul")
        .attr("class", "list") 

    var header_containers = list.selectAll("li")
        .data(keys) 
        .enter().append("li")
        .attr("class", "header_container")
    
    // SVG IMPLEMENTATION

    // var title_containers = header_containers.append("svg")
    //     .attr("class", "title_container")
    //     .attr("viewbox", "0 0 700 30")
    
    // var header_titles = title_containers.append("text") 
    //     .attr("text-anchor", "start")
    //     .attr("dx", 50)
    //     .attr("class", "expander")
    //     .text(function(d) { return d })
    
    // var text_height
    
    // header_titles.attr("y", function () {
    //     var that = this
    //     text_height = that.getBBox().height
    //     return text_height
    // })  
    
    // title_containers.attr("height", 2 * text_height ); 
       
    // var lines = title_containers.append("line")
    //     .attr("y1", text_height + 10)
    //     .attr("y2", text_height + 10)
    //     .attr("x1", 50) 
    //     .attr("x2", 700) 
    //     .attr("stroke", "black")
    //     .attr("stroke-width", 0.5)
    //     .attr("stroke-opacity", 0.5)
    //     .attr("shape-rendering", "crispEdges")

    // HTML IMPLEMENTATION
 
    var title_containers = header_containers.append("div")
        .attr("class", "title_container")

    // var header_titles_container = title_containers.append("div")
    //     .attr("class", "header_titles_container")
        
    var header_titles = title_containers.append("span") 
        .attr("class", "expander title")
        .text(function(d) { return d })

    var title_height = $j(".expander.title").height()
    
    var update_times = title_containers.append("span")
        .attr("class", "times")
        .text(function (d, i) { return "Updated: " + times[i] } ) 

    var time_height = $j(".times").height()

    update_times.attr("style", "bottom:" + ( time_height - title_height ) + "px;" ) 

    var lines = title_containers.append("hr")
        .attr("class", "lines")

    var content_containers = header_containers.append("div")
        .attr("class", "content closed")

    $j(".expander").simpleexpand();
    
    var $closingBracket,$expandedOnly,$hiddenBracket,$outerClosingBracket,expandTimeout
    var shrinkTimeout,$expand,$heading,$link,$link,$brackets
    $expand=$j('#expand')
    $heading=$j('#expand_heading')
    $link=$expand.find('a').eq(0)
    $link.attr("href","#expand")
    $brackets=$j([$expand.get(0).firstChild,$expand.get(0).lastChild]);
    function toggleAll() {
        $link.text(function() {
            var $expanders = $j(".expander.title") 
            var $expanded = $expanders.filter(".expanded")
            var $collapsed = $expanders.filter(".collapsed")
            var toggle = ""
            if ($collapsed.length)  {
                $link.attr("data-expander-target", "")
                $collapsed.removeClass("collapsed").addClass("expanded")
                toggle = "−" 
            }
            else {
                $link.attr("data-expander-target", ".closed") 
                $expanded.removeClass("expanded").addClass("collapsed")        
                toggle = "+"
            }
            
            $j(".expander.title").each( function (i, el) { 
                setTimeout( function () { update_data(el) }, 200) 
            });     
            return toggle   
        });
    }
    function expandSoon() {
        clearTimeout(shrinkTimeout);
        expandTimeout=setTimeout(expand,100);
    }
    function expand() {
        clearTimeout(shrinkTimeout);
        $heading.addClass('expand-expanded');
        $link.attr("style","opacity:0.6;");
    }
    function shrinkSoon() {
        clearTimeout(expandTimeout);
        shrinkTimeout=setTimeout(shrink,100);
    }
    function shrink(){
        clearTimeout(expandTimeout);
        if(!$link.is(':focus') || !$link.hasClass('hover')){
            $heading.removeClass('expand-expanded');
            $link.attr("style", "opacity:1")
        }        
    }
    if(!$brackets.hasClass('expand-bracket')){
        $brackets=$brackets.wrap($j('<span>').addClass('expand-bracket')).parent();
    }
    $closingBracket=$brackets.last();
    $heading.on({'mouseenter':expandSoon,'mouseleave':shrinkSoon});
    $link.mouseenter(function(){
        $j(this).addClass('hover');
    }).mouseleave(function(){
        $j(this).removeClass('hover');
    });
    $link.on({'focus':expand, 'blur':shrinkSoon,'click':toggleAll});

    ///////////////////////////////////////////////////////////////////////////////
    //// PIECHART CODE MODIFIED FROM D3 TUTORIAL //////////////////////////////////
    //// BY STEPHEN BOAK //////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////
        
    var w = 300;
    var h = 300;
    var r = 110;
    var ir = 0;
    var textOffset = 18;
    var tweenDuration = 250;
        
    //OBJECTS TO BE POPULATED WITH DATA LATER
    var valueLabels
    var pieData = [];    
    var oldPieData = [];
    var filteredPieData = [];
    var arc_group
    var label_group
   
    //D3 helper function to draw arcs, populates parameter "d" in path
    //object
    var arc = d3.svg.arc()
        .startAngle(function(d){ return d.startAngle; })
        .endAngle(function(d){ return d.endAngle; })
        .innerRadius(ir)
        .outerRadius(r);
        
    ///////////////////////////////////////////////////////////
    // CREATE VIS & GROUPS ////////////////////////////////////
    ///////////////////////////////////////////////////////////
    
    var h_list_containers = content_containers.append("div")
        .attr("class", "h_list_container")

    var h_list = h_list_containers.append("ul")
        .attr("class", "h_list")

    var vis_containers = content_containers.append("div")
        .attr("class", "vis_container")

    var vises = vis_containers.append("svg")
        .attr("class", "vis")
        .attr("width", w)
        .attr("height", h) 
        .attr("viewBox", "0 0 " + w + " " + 10 * (h/9) ) 

    
    var clear_divs = content_containers.append("div")
        .attr("class", "clear")

    //GROUP FOR ARCS/PATHS
    var arc_groups = vises.append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

    //PLACEHOLDER GRAY CIRCLE
    var loading_circles = arc_groups.append("circle")
        .attr("fill", "#000")
        .attr("r", r);
    
    //HANDLER FOR GRAY CIRCLE
    // $j(":not(.dropdown_container *):not(#piechart):not(#piechart *)")
    //     .on("mouseenter", function (event) {
    
    //         arc_group.selectAll("circle").remove();
    //         arc_group.append("svg:circle")
    //             .attr("fill", "#EFEFEF")
    //             .attr("r", r);

    //     })

    var stat_list_containers = content_containers.append("div")
        .attr("class", "stat_list_container")

    var stat_lists = stat_list_containers.append("ul")
        .attr("class", "stat_list")

    var labels = [ "Total in Use: ", "Total: " ] 

    var stat_label_containers = stat_lists.selectAll("li").data(labels)
        .enter().append("li")
    
    var stat_labels = stat_label_containers.append("span")
        .text(String)
    
    stat_label_containers.append("span")
    
    var label_groups = vises.append("g")
        .attr("class", "label_group")
        .attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");
    
    function update_data (expander) {
        var $content = $j(expander).closest("div").next(".content")
        if ( $content.is(":visible") ) {
            $content.removeClass("closed") 
            var menu = $content.children(".h_list_container").contents().get(0)
            var cloud = d3.select(expander).data()
            var cloud_data = JSON[cloud]
            var data = cloud_data["stats"]
            var menu_keys = Object.keys(data)
            var time = cloud_data["time"]
            
            // update the  update time
            $j(expander).next().text("Updated: " + time)
            
            var menu_items = d3.select(menu).selectAll("li")
                .data(menu_keys)            
    
            menu_items.enter().append("li")
                .text(String)
            
            menu_items.datum(function (d, i) { return data[menu_keys[i]] })
          
        }

        else { $content.addClass("closed")
             } 
    }
    
    $j(".h_list").on("click", "li", function (event) { update(event) })

    $j(".expander.title").on("click", function (event) { 
        var that = event.target;
        setTimeout(function () { update_data(that) 
                               }, 200)
    })

    
    $j(".content").siblings().addBack().contents().addBack().on("mouseenter", function (event) {
        var that = event.target
        var $vis = $j(that).hasClass("content") || $j(that).hasClass("expander") ? $j(that).closest(".title_container").siblings().addBack().find(".vis_container").contents() : $j(that).closest(".content").find(".vis_container").contents()
        arc_group = d3.select($vis.find(".arc")[0])
        label_group = d3.select($vis.find(".label_group")[0]) 
    })


    
    ///////////////////////////////////////////////////////////
    // MOUSEENTER HANDLER  /////////////////////////////////////
    ///////////////////////////////////////////////////////////

    // $j(".update").on("mouseenter", update) 

    // event handler for when status attribute is moused over 
    // to run each time data is generated
    function update (event) {
        
        var that = event.target

        var data = d3.select(that).data()[0] 

        var value = data.value
        var max_val = data.max_val

        var stat_list_node = $j(that).parent().parent().siblings(".stat_list_container").contents().get(0)
        var stat_list = d3.select(stat_list_node) 

        function format_stat (str) {
            return /[.]/.test(str) ? Number(str).toFixed(1) : str 
        } 
        
        var stat_values = [ format_stat(value) + " " + data.unit,format_stat(max_val) + " " + data.unit ]
        
        stat_list.selectAll("li").selectAll("span").filter(":last-child").remove()
        
        stat_list.selectAll("li").append("span").text(function (d, i) { return stat_values[i] })

        var empty_slice = Number(max_val) - Number(value) 
        
        var values = [ Number(value), empty_slice ]
        
        var pie_func = d3.layout.pie().sort(null) 

        pieData = pie_func(values)
        oldPieData = filteredPieData;
               
        var totalOctets = Number(data.max_val)

        filteredPieData = pieData.filter(filterData);
        function filterData(element, index, array) {
            element.value = values[index];
            return (element.value > 0);
        }

                
        if( filteredPieData.length > 0 ){
            arc_group.selectAll("circle").remove();
            filteredPieData = shuffle_array(filteredPieData); 
            //DRAW ARC PATHS
            paths = arc_group.selectAll("path").data(filteredPieData);
            paths.enter().append("svg:path")
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("fill", function(d, i) {  return d.startAngle ? "white" : "black"; })
                .transition()
                .duration(tweenDuration)
                .attrTween("d", pieTween);
            paths.data(filteredPieData)
                .attr("fill", function(d, i) {  return d.startAngle ? "white" : "black"; })
                .transition()
                .duration(tweenDuration)
                .attrTween("d", pieTween);
            paths.exit()
                .transition()
                .duration(tweenDuration)
                .attrTween("d", removePieTween)
                .remove();

            var label_data = filteredPieData.filter( function (el, i) { return  !el.startAngle; })
        
            //DRAW LABELS WITH PERCENTAGE VALUES
            valueLabels = label_group.selectAll("text.value").data(label_data)
                .attr("dy", function(d){
                    if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
                        return 5;
                    } else {
                        return -7;
                    }
                })
                .attr("text-anchor", function(d){
                    if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
                        return "beginning";
                    } else {
                        return "end";
                    }
                }).text(function(d){
                    var percentage = (d.value/totalOctets)*100;
                    return percentage.toFixed(1) + "%";
                });

            valueLabels.enter().append("svg:text")
                .attr("class", "value")
                .attr("transform", function(d) {
                    return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (r+textOffset) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (r+textOffset) + ")";
                })
                .attr("dy", function(d){
                    if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
                        return 5;
                    } else {
                        return -7;
                    }
                })
                .attr("text-anchor", function(d){
                    if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
                        return "beginning";
                    } else {
          return "end";
                    }
                }).text(function(d){
                    var percentage = (d.value/totalOctets)*100;
                    return percentage.toFixed(1) + "%";
                });
            
            var text = label_group.selectAll("text.value")
            var text_bbox = text.node().getBBox()
            var text_height = text_bbox.height
            var text_width = text_bbox.width
            text.selectAll("tspan").data(["Capacity"])
                .enter().append("tspan")
                .attr("alignment-baseline", "inherit")
                .attr("dy", text_height)
                .attr("dx", 0 - text_width )
                .text(String)

            valueLabels.transition().duration(tweenDuration).attrTween("transform", textTween);
            valueLabels.exit().remove();
        }
    }

    ///////////////////////////////////////////////////////////
    // FUNCTIONS //////////////////////////////////////////////
    ///////////////////////////////////////////////////////////

    // Interpolate the arcs in data space.
    function pieTween(d, i) {
        var s0;
        var e0;
        if(oldPieData[i]){
            s0 = oldPieData[i].startAngle;
            e0 = oldPieData[i].endAngle;
        } else if (!(oldPieData[i]) && oldPieData[i-1]) {
            s0 = oldPieData[i-1].endAngle;
            e0 = oldPieData[i-1].endAngle;
        } else if(!(oldPieData[i-1]) && oldPieData.length > 0){
            s0 = oldPieData[oldPieData.length-1].endAngle;
            e0 = oldPieData[oldPieData.length-1].endAngle;
        } else {
            s0 = 0;
            e0 = 0;
        }
        var i = d3.interpolate({startAngle: s0, endAngle: e0}, {startAngle: d.startAngle, endAngle: d.endAngle});
        return function(t) {
            var b = i(t);
            return arc(b);
        };
    }

    function removePieTween(d, i) {
        s0 = 2 * Math.PI;
        e0 = 2 * Math.PI;
        var i = d3.interpolate({startAngle: d.startAngle, endAngle: d.endAngle}, {startAngle: s0, endAngle: e0});
        return function(t) {
            var b = i(t);
            return arc(b);
        };
    }

    function textTween(d, i) {
        var a;
        if(oldPieData[i]){
            a = (oldPieData[i].startAngle + oldPieData[i].endAngle -
                 Math.PI)/2;
        } else if (!(oldPieData[i]) && oldPieData[i-1]) {
            a = (oldPieData[i-1].startAngle + oldPieData[i-1].endAngle -
                 Math.PI)/2;
        } else if(!(oldPieData[i-1]) && oldPieData.length > 0) {
            a = (oldPieData[oldPieData.length-1].startAngle +
                 oldPieData[oldPieData.length-1].endAngle - Math.PI)/2;
        } else {
            a = 0;
        }
        var b = (d.startAngle + d.endAngle - Math.PI)/2;

        var fn = d3.interpolateNumber(a, b);
        return function(t) {
            var val = fn(t);
            return "translate(" + Math.cos(val) * (r+textOffset) + "," +
                Math.sin(val) * (r+textOffset) + ")";
        };
    }

    function shuffle_array (array) {
        var currentIndex = array.length
        , temporaryValue
        , randomIndex
        ;
        
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        
        return array;
    }
    
})
