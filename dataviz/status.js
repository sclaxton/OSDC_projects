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

////////////////////////////////////////////////////////// 
// GLOBAL VARIABLES AND OBJECTS //////////////////////////
//////////////////////////////////////////////////////////

var keys = Object.keys(JSON) 
var times = []
// piechart dimensions and properties
var w = 260;
var h = 260;
var r = 120;
var ir = 0;
var textOffset = 18;
var tweenDuration = 250;
var valueLabels
var pieData = [];    
var oldPieData = [];
var filteredPieData = [];
var arc_group
var label_group
var stat_list
var time_height
var title_height


$j.each(JSON, function (k, v) {
    times.push(v["time"])
}); 

///////////////////////////////////////////////////////////
// FUNCTIONS //////////////////////////////////////////////
///////////////////////////////////////////////////////////
//// TWEEN FUNCTIONS TAKEN FROM D3 TUTORIAL BY ////////////
//// STEPHEN BOAK  ////////////////////////////////////////
///////////////////////////////////////////////////////////


// interpolate the arcs in data space.
var pieTween = function (d, i) {
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

var removePieTween = function (d, i) {
    s0 = 2 * Math.PI;
    e0 = 2 * Math.PI;
    var i = d3.interpolate({startAngle: d.startAngle, endAngle: d.endAngle}, {startAngle: s0, endAngle: e0});
    return function(t) {
        var b = i(t);
        return arc(b);
    };
}

var textTween = function (d, i) {
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

// shuffles array at random using fisher-yates  
var shuffle_array = function  (array) {
    var currentIndex = array.length
    var temporaryValue, randomIndex;
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


var cumulativeOffset = function(element) {
    var top = 0 
    do {
        top += element.offsetTop  || 0;
        element = element.offsetParent;
    } while(element);

    return top
    };
    
    var filterData = function (element, index, array) {
        return (element.value >= 0);
    }
    
    var format_stat = function (str) {
        return /[.]/.test(str) ? Number(str).toFixed(1) : str 
    } 
    
    var drawPaths = function (pieData) {
        paths = arc_group.selectAll("path").data(pieData);
        paths.enter().append("svg:path")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", function(d, i) {  return d.startAngle ? "white" : "black"; })
            .transition()
            .duration(tweenDuration)
            .attrTween("d", pieTween);
        paths.data(pieData)
            .attr("fill", function(d, i) {  return d.startAngle ? "white" : "black"; })
            .transition()
            .duration(tweenDuration)
            .attrTween("d", pieTween);
        paths.exit()
            .transition()
            .duration(tweenDuration)
            .attrTween("d", removePieTween)
            .remove();
    }

    var drawLabels = function (labelData, total) {
        valueLabels = label_group.selectAll("text.value").data(labelData)
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
                var percentage = (d.value / total) * 100;
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
                var percentage = (d.value / total) * 100;
                return percentage.toFixed(1) + "%";
            });
        // attach "capacity" label
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

    // handler for metric menu
    var update = function (event) {
        var that = event.target
        var data = d3.select(that).data()[0] 
        if (data != undefined) {
            var value = data.value
            var max_val = data.max_val
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
            if ( filteredPieData.length > 0 ) {
                arc_group.selectAll("circle").remove();
                filteredPieData = shuffle_array(filteredPieData); 
                drawPaths(filteredPieData)
                var label_data = filteredPieData.filter( function(el, i) { return el.value != empty_slice })
                drawLabels(label_data, totalOctets)        
            }
        }
    }
    
    var getUniqueTime = function () {
        var time = new Date().getTime();
        while (time == new Date().getTime());
        return new Date().getTime();
    }
    
    var disable_event = function (evnt_or_el, type) {
        var that = evnt_or_el.target || evnt_or_el
        var events_data = $j._data(that).events
        if (events_data) { 
            type = type || evnt_or_el.type
            var event_instances = events_data[type]
            var event_id = getUniqueTime()
            var event_obj = {}
            event_obj.id = event_id
            event_obj.type = type 
            event_obj.events = event_instances
            $j._data(that).events[type] = null
            $j._data(that).events.disabled_events = $j._data(that).events.disabled_events || [] 
            $j._data(that).events.disabled_events.push(event_obj)
            return event_id 
        }
    }

    var enable_event = function (evnt_or_el, event_id) {
        var that = evnt_or_el.target || evnt_or_el
        var disabled_events = $j._data(that).events.disabled_events
        var event_obj
        var type 
        if (disabled_events){
            disabled_events.forEach( function (el, i, arr) {
                if (el.id == event_id && el.events ) {
                    event_obj = el
                    arr.splice(i,1)
                    type = event_obj.type  
                    $j._data(that).events[type] = event_obj.events      
                }
            })
        }
    }

    var toggle_animation = function (event, $menu, $time, $time_content, onComplete) {
        var slide_dist = cumulativeOffset($time_content.get(0)) - cumulativeOffset($time.get(0))
        var menu_fade = 400
        var wait = 200
        var duration = 400
        if ($time.css("display") != "none") {
            setTimeout(
                function () {
                    $menu.fadeToggle(menu_fade) 
                    $time_content.css("opacity", 0)
                    $time.animate({top: slide_dist + "px" }, 
                                  {duration: duration, 
                                   complete : function () { $time.hide() 
                                                            $time_content.css("opacity", 1) 
                                                            onComplete()
                                                          }
                                  })}, wait)   
        }
        else {
            $menu.fadeToggle(menu_fade) 
            var default_top_value = d3.select($time.get(0)).data() 
            setTimeout(
                function () {
                    $time.show()
                    $time_content.css("opacity", 0)
                    $time.animate({top: default_top_value }, 
                                  {duration: duration, 
                                   complete: onComplete})
                                 }, wait)
            }
        }
 
        var update_content = function (expander, $menu, $time, $time_content) {
            var menu = $menu.contents().get(0)
            var cloud = d3.select(expander).data()
            var cloud_data = JSON[cloud]
            var data = cloud_data["stats"]
            var time = cloud_data["time"]
            var update_time = "Updated: " + time
            // update the  update time
            $time.text(update_time)
            $time_content.text(update_time)
            d3.select(menu).selectAll("li").datum(function (d, i) { return Object.values(data)[i] })
        }
        
        // handler hooked on click of single clouds  
        var toggleClouds = function(all, event) {
            var expander = event.target   
            console.log(event)
            var $expander = $j(expander)
            var $time = $expander.siblings(".times")
            var $menu = $expander.siblings(".h_list_container")
            var $content = $expander.closest("div").siblings(".content")
            var $time_content = $content.contents(".times")
            setTimeout( function () {
                if ( $content.is(":visible") ) {
                    $content.removeClass("closed").addClass("open")                
                    update_content(expander, $menu, $time, $time_content)
                }
                else {                   
                    $content.addClass("closed").removeClass("open")
                    if (!$j(".expanded.title").length) {
                        $j(".expander:not(.title)").text("+").attr("data-expander-target", ".closed")
                    }
                }
            }, 200)
            var callBack = function () {} 
            if (!all) { var event_id = disable_event(event)
                        callBack = function () {enable_event(event, event_id)}
                      }
            toggle_animation(expander, $menu, $time, $time_content, callBack)
        }
    
    var toggleCloud = toggleClouds.bind(null, false)
    
    // main handler for expand all button
        var toggleAll = function (event) {
        $expander.text(function() {
            var $expanders = $j(".expander.title") 
            var $expanded = $expanders.filter(".expanded")
            var $collapsed = $expanders.filter(".collapsed")
            var toggle = ""
            var $remainder
            if ($collapsed.length && $expander.text() == "+")  {
                $expander.attr("data-expander-target", ".open")
                $remainder = $j(".collapsed.title")
                $collapsed.removeClass("collapsed").addClass("expanded")
                toggle = "−" 
            }
            else {
                $expander.attr("data-expander-target", ".closed")
                $remainder = $j(".expanded.title")
                $expanded.removeClass("expanded").addClass("collapsed")        
                toggle = "+"
            }
            var event_id = disable_event(event)
            setTimeout(function () {enable_event(event, event_id)}, 1000)
            console.log($remainder)
            $remainder.one("click.allClouds", toggleClouds.bind(null, true))
                           .trigger("click.allClouds")
            return toggle   
        });
    }

    // functions for expand all button animation

    var expandSoon = function () {
        clearTimeout(shrinkTimeout);
        expandTimeout=setTimeout(expand,100);
    }

    var expand = function () {
        clearTimeout(shrinkTimeout);
        $heading.addClass('expand-expanded');
        $expander.attr("style","opacity:0.6;");
    }

    var shrinkSoon = function (){
        clearTimeout(expandTimeout);
        shrinkTimeout=setTimeout(shrink,100);
    }
    
    var shrink = function (){
        clearTimeout(expandTimeout);
        if(!$expander.is(':focus') || !$expander.hasClass('hover')){
            $heading.removeClass('expand-expanded');
            $expander.attr("style", "opacity:1")
        }        
    }

    //////////////////////////////////////////////////////////
    // HTML CONTENT //////////////////////////////////////////
    //////////////////////////////////////////////////////////

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

    var expand_toggle = expand_span.append("span")
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
     
    var title_containers = header_containers.append("div")
        .attr("class", "title_container")
            
    var header_titles = title_containers.append("span") 
        .attr("class", "expander title")
        .text(function(d) { return d })
    
    var h_list_containers = title_containers.append("div")
        .attr("class", "h_list_container")
    
    var h_list = h_list_containers.append("ul")
        .attr("class", "h_list")

    var cloud_data = [] 
    
    for ( var cloud in JSON ) {
        cloud_data.push(Object.keys(JSON[cloud]["stats"]))
    }
    
    var menu_items = h_list.each( function (d, i) {
        var data = cloud_data[i]        
        d3.select(this).selectAll("li")
            .data(data)            
            .enter().append("li")
            .text(String)
    });
    
    $j(".h_list li").hover( function (event) { $j(event.target).css("opacity", 0.5) }, 
                            function (event) { var that = event.target;  
                                 if (!$j(that).hasClass("clicked")) { 
                                     $j(that).css("opacity", 1)
                                 } } ).on("click", function (event) {
                                     var that = event.target        
                                     $j(that).closest(".h_list").contents().css("opacity", 1).removeClass("clicked")
                                     $j(that).css("opacity", 0.5).addClass("clicked")
                                 })                                             
    
    var update_times = title_containers.append("span")
        .attr("class", "times")
        
    update_times.text(function (d, i) { return "Updated: " + times[i] } ) 
        .datum(function () {return $j(this).css("top")})
    
    var lines = title_containers.append("hr")
        .attr("class", "lines")

    var clears = header_containers.append("div")
        .attr("class", "clear")

    var content_containers = header_containers.append("div")
        .attr("class", "content closed")

    $j(".expander").simpleexpand();
    
    // expand all bracket animation
    var $closingBracket,$expandedOnly,$hiddenBracket,$outerClosingBracket,expandTimeout
    var shrinkTimeout,$expand,$heading,$expander,$brackets
    $expand=$j('#expand')
    $heading=$j('#expand_heading')
    expander=$expand.find(".expander").get(0)
    $expander = $j(expander)
    $expander.attr("href","#expand")
    $brackets=$j([$expand.get(0).firstChild,$expand.get(0).lastChild]);

    if(!$brackets.hasClass('expand-bracket')){
        $brackets=$brackets.wrap($j('<span>').addClass('expand-bracket')).parent();
    }

    $closingBracket=$brackets.last();

    $heading.on({'mouseenter':expandSoon,'mouseleave':shrinkSoon});

    $expander.mouseenter(function(){
        $j(this).addClass('hover');
    }).mouseleave(function(){
        $j(this).removeClass('hover');
    });

    $expander.on({'focus':expand, 'blur':shrinkSoon,'click':toggleAll});

    // initalize pie charts
    var arc = d3.svg.arc()
        .startAngle(function(d){ return d.startAngle; })
        .endAngle(function(d){ return d.endAngle; })
        .innerRadius(ir)
        .outerRadius(r);
    
    var vis_containers = content_containers.append("div")
        .attr("class", "vis_container")

    var vises = vis_containers.append("svg")
        .attr("class", "vis")
        .attr("width", w)
        .attr("height", h) 
        .attr("viewBox", "0 " + 0 + " " + w + " " + 5 * (h / 4) ) 
  
    //group for arcs/paths
    var arc_groups = vises.append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + (w/2 - 40) + "," + 5 * (h / 8) + ")");

    //placeholder gray circle
    var loading_circles = arc_groups.append("circle")
        .attr("fill", "#000")
        .attr("r", r);
    
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

    $j(".times").map(function (i, el) {
        var $clone = $j(el).clone().addClass("times_content")
        var $content = $j($j(".content")[i])
        $content.append($clone)
        $content.append("<div class='clear'></div>")
    })
    
    var label_groups = vises.append("g")
        .attr("class", "label_group")
        .attr("transform", "translate(" + (w/2 - 40) + "," + 5 * (h / 8) + ")");
    
    $j(".h_list").on("click", "li", function (event) { update(event) })

    $j(".expander.title").on("click.cloud", toggleCloud)
    
    var set_variables = $j(".content").siblings().addBack().contents().addBack().on("mouseenter", function (event) {
        var that = event.target
        var $title = $j(that).closest(".title_container").siblings().addBack().find(".vis_container").contents() 
        var $not_content = $j(that).closest(".content").find(".vis_container").contents()
        var $vis = $not_content.length ? $not_content : $title 
        var stat_list_node = $vis.parent().siblings(".stat_list_container").contents().get(0)
        stat_list = d3.select(stat_list_node) 
        arc_group = d3.select($vis.find(".arc")[0])
        label_group = d3.select($vis.find(".label_group")[0]) 
    })
          
})
