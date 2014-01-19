/**Variablen für Breite, Höhe, Radius und Farbe aus einer Kategorie von 10 Farben*/
 var width = 300,    
    height = 300, 
    radius = 100,
    color = d3.scale.category10(); 
 
 /**Datensatz mit prozentualer Verteilung der Buchstaben.**/
  var  daten = [{"label":"a", "value":10},
            {"label":"b", "value":30},
            {"label":"c", "value":10},
            {"label":"d", "value":10},
            {"label":"e", "value":40}];

/**In das Div mit der Id #pieGerman wird ein SVG-Element eingefüght mit den vorher definierten Daten, Breite und Höhe.
 * Außerdem wird eine Gruppe eingefügt und der Mittelpunkt des Kreises von Punkt (0,0) auf Punkt (radius,radius) verschoben.**/
    var chart= d3.select("#pieGerman")
        .append("svg:svg") 
        .data([daten]) 
        .attr("width", width)
        .attr("height", height)
        .append("svg:g") 
        .attr("transform", "translate(" + radius + "," + radius + ")") 
 
/**Es wird ein Pfad-Element generiert, welches arc-Daten verarbeitet mit dem Radius.**/        
    var arc = d3.svg.arc() //this will create <path> elements for us using arc data
        .outerRadius(radius);
 
/**Es wird auf ein Layout eines Kreis-Diagramms zugegriffen und die Werte aus den Daten für jedes Element ausgelesen.*/
    var pie = d3.layout.pie() 
        .value(function(d) { return d.value; }); 
 
 /**Es werden alle Gruppen-Elemente als Teile des Kuchens gesucht und diesen die Daten übergeben.
  * Jedem Stück wird eine Gruppe zugewiesen, die  die Pfad- und Text-Elemente enthalten und eine Klasse eingefügt.
  **/
    var arcs = chart.selectAll("g.slice") 
        .data(pie) 
        .enter() 
        .append("svg:g")
        .attr("class", "slice"); 
 
 /**Jedem Stück als Pfad wird eine Farbe zugewiesen und das arc übergeben.*/
     arcs.append("svg:path")
        .attr("fill", function(d, i) { return color(i); } ) 
        .attr("d", arc); 
 
 /**Es werden jeden Stück der Text zugeweisen und dieses in die Mitte des Stücks setzen.*/
    arcs.append("svg:text")
    .attr("transform", function(d) { 
        d.innerRadius = 0;
        d.outerRadius = radius;
            return "translate(" + arc.centroid(d) + ")"; 
        })
        .attr("text-anchor", "middle") 
        .text(function(d, i) { return daten[i].label; }); 

