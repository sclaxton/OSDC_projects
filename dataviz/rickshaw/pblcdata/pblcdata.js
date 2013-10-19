$(document).ready( function () {
    // set up our data series with 150 random data points

    var seriesData = [ [], [], [], [], [], [], [], [], [] ];
    var random = new Rickshaw.Fixtures.RandomData(150);

    for (var i = 0; i < 150; i++) {
        random.addData(seriesData);
    }

    var palette = new Rickshaw.Color.Palette( { scheme: 'osdc' } );

    // instantiate our graph!

    var graph = new Rickshaw.Graph( {
        element: document.getElementById("chart"),
        width: 600,
        height: (1000 / 3),
        renderer: 'area',
        stroke: true,
        preserve: true,
        series: [
            {
                color: palette.color(),
                data: seriesData[0],
                name: 'Moscow'
            }, {
                color: palette.color(),
                data: seriesData[1],
                name: 'Shanghai'
            }, {
                color: palette.color(),
                data: seriesData[2],
                name: 'Amsterdam'
            }, {
                color: palette.color(),
                data: seriesData[3],
                name: 'Paris'
            }, {
                color: palette.color(),
                data: seriesData[4],
                name: 'Tokyo'
            }, {
                color: palette.color(),
                data: seriesData[5],
                name: 'London'
            }, {
                color: palette.color(),
                data: seriesData[6],
                name: 'New York'
            }
        ]
    } );

    graph.render();

    var slider = new Rickshaw.Graph.RangeSlider( {
        graph: graph,
        element: $('#slider')
    } );

    // var hoverDetail = new Rickshaw.Graph.HoverDetail( {
    //     graph: graph,
    //     xFormatter: function(x) {
    //         return new Date(x * 1000).toString();
    //     }
    // } );

    // var annotator = new Rickshaw.Graph.Annotate( {
    //     graph: graph,
    //     element: document.getElementById('timeline')
    // } );

    var legend = new Rickshaw.Graph.Legend( {
        graph: graph,
        element: document.getElementById('legend')

    } );

    // var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
    //     graph: graph,
    //     legend: legend
    // } );

    // var order = new Rickshaw.Graph.Behavior.Series.Order( {
    //     graph: graph,
    //     legend: legend
    // } );

    // var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight( {
    //     graph: graph,
    //     legend: legend
    // } );

    
    var ticksTreatment = 'glow';

    var xAxis = new Rickshaw.Graph.Axis.Time( {
        graph: graph,
        ticksTreatment: ticksTreatment,
        timeFixture: new Rickshaw.Fixtures.Time.Local()
    } );

    xAxis.render();

    var yAxis = new Rickshaw.Graph.Axis.Y( {
        graph: graph,
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        ticksTreatment: ticksTreatment
    } );

    yAxis.render();

    var controls = new RenderControls( {
        element: document.querySelector('form'),
        graph: graph
    } );

    // add some data every so often

    var messages = [
        "Changed home page welcome message",
        "Minified JS and CSS",
        "Changed button color from blue to green",
        "Refactored SQL query to use indexed columns",
        "Added additional logging for debugging",
        "Fixed typo",
        "Rewrite conditional logic for clarity",
        "Added documentation for new methods"
    ];

    setInterval( function() {
        random.removeData(seriesData);
        random.addData(seriesData);
        graph.update();

    }, 3000 );

})
