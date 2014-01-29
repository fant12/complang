// --------------------
// Darstellung der Karte mit den dazugehoerigen Balken-Diagrammen. 
// --------------------

// Hoehe und Breite des SVGs
const SVG_WIDTH = 1000; 
const SVG_HEIGHT = 800;

// Tooltip für die Maus zum Zeigen des Laender-Namens
var tooltip = d3.select("#Map").append("div").attr("class", "tooltip");

/*
 * Das SVG-Element wird angelegt und an das Div-Element #Map im body angehaengt.
 * Die Hoehe und Breite wird als Attribut uebergeben.
 */
var svg = d3.select("#Map")
    .append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT);	
	
// Die Verschiebung wird mit einer Dauer von 2,5 Sekunden und einem linearen Verlauf initialisiert
var transition = d3.transition().duration(2500).ease("linear");

/*
 * Die Albers-Projektion wird mithilfe von d3 angelegt und das Zentrum von Europa durch den 
 * Breitengrad und Laengengrad angegeben. Die Karte wird nicht rotiert, die Laengengrade als Parallelen angegeben, 
 * und die Karte in den Mittelpunkt des SVGs verschoben.
 */
var proj = d3.geo.albers()
    .center([10, 52])
    .rotate([0, 0])
    .parallels([35, 75])
    .scale(1200)
    .translate([0.5 * SVG_WIDTH, 0.5 * SVG_HEIGHT]);	

// Es wird die Projektion dem Pfad uebergeben, der zuvor definiert wurde.
var pth = d3.geo.path().projection(proj);  

/**
 * @class DiaState-Klasse.
 * @brief Beschreibt das Diagramm, welches die Statistik eines Landes darstellt.
 * @param {String} name - ist der Name des Landes.
 * @param {Array} data - ist ein Array, welches die Daten enth&auml;lt.
 * @param {Object} pos - ist ein Positionsobjekt mit den Koordinaten, die die 
 * Position des Diagramms auf der Karte definieren.
 */ 
function DiaState(name, data, pos){
    
    this.data = data;
    this.name = name;
    
    this.x = pos.x;
    this.y = pos.y;
}

/**
 * @brief Liefert das zugeh&ouml;rige Land zu einer Sprache.
 * @param {String} language - die Sprache.
 * @returns einen String, der das zur Sprache zugeh&ouml;rige Land enth&auml;lt.
 */ 
function assignCountry(language){
    
    switch(language){
        case "en": return "UnitedKingdom";
        case "es": return "Spain";
        case "fr": return "France";
        case "it": return "Italy";
        case "pt": return "Portugal";
        case "sv": return "Sweden";
        default: return "Germany";
    }
}

/**
 * @brief Wandelt das JSON-Objekt in ein zweidimensionales Array um.
 * @param {Object} o - das JSON-Ojbekt.
 * @returns ein assoziatives zweidimensionales Array, welches die Daten des Objektes in sich tr&auml;gt.
 * Das innere Array ist non-assoziativ.
 */ 
function convertToArray(o){
    
    var arr = [];
    
    for(var key in o) {
        var obj = o[key];
        var subarr = [];
        var j = 0;
        for(var prop in obj) 
            if(obj.hasOwnProperty(prop))
                subarr[j++] = obj[prop]; 
        arr[key] = subarr;
    }
    return arr;
}

/**
 * @brief Funktion zum Zeichnen der Karte.
 * @param {Array} data ist ein zweidimensionales Array mit den erforderlichen Daten f&uuml;r alle Balkendiagramme.
 * Das &auml;u&szlig;ere Array ist assoziativ nach L&auml;nderkennung, das innere Array ist non-assoziativ.
 *  @li de = deutsch
 *  @li en = englisch
 *  @li es = spanisch
 *  @li fr = franz&ouml;sisch
 *  @li it = italienisch
 *  @li pt = portugiesisch
 *  @li sv = schwedisch
 *  @li usw..
 * @param {Array} diaLabels - ist ein Array, welches alle Parameter der Diagrammskala beinhaltet. 
 */ 
function drawMap(data, diaLabels){
    
    // Breite und Hoehe der unteren Skale/Linie des Diagramms
    const RECTBASE_WIDTH = 77; 
    const RECTBASE_HEIGHT = 2;

    // Breite der Balken
    const RECTDIA_WIDTH = 12;
    
    // Abstand des Textes und der Balken
    const TEXT_MARGIN = 16;
    
    // Skalierungsfakor der Balken
    const FACTOR_DIA = 2.2;
    
    // Farbe aus einer Skala von d3 für verschiedene Balken
    const COLOR = d3.scale.category10();
    
    /*
     * Laden der Kartendaten aus der TopoJSON-Datei.
     * Es wird im SVG nach den Attributen .land gesucht, die noch nicht existieren und 
     * die Daten von Europa/die Elemente dem Pfad uebergeben. Jedem Land wird eine Klasse mit dem Laendernamen 
     * zugewiesen, fuer die Gestaltung in der CSS-Datei. Am Ende des Absatzes wird die Projektion dem Pfad uebergeben.
     */
    d3.json("../data/europaTOPOJSON.json", function(error, eu) {
        
        if(error) 
            console.warn(error);
        
        svg.selectAll(".land")			
            .data(topojson.feature(eu, eu.objects.europa).features)	
            .enter().append("path")	
            .attr("class", function(d) { 
                return "land " + d.properties.name ;
            })
            .attr("d", pth);
    
        /*
         * Jedem Land wird ein Text mit dem Ländernamen angehängt.
         * Die TopoJSON-Daten werden übergeben und ein Text-Element angehängt.
         * Jedes Text-Element erhält eine Klasse für die Gestaltung.
         * Das Element wird in die Mitte des aktuellen Landes/Pfads verschoben.
         * Die Schriftgröße wird festgesetzt und der Text wird aus den Daten ausgelesen.
         */
        svg.selectAll(".country_label")
            .data(topojson.feature(eu, eu.objects.europa).features)
            .enter().append("text")
            .attr("class", function(d) { return "country_label " + d.properties.name; })
            .attr("transform", function(d) { return "translate(" + pth.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .text(function(d) { return d.properties.name; });
              
        /**
         * @brief Ermittelt den Mittelpunkt eines Landes, an dem ein Balkendiagramm eingef&uuml;gt werden soll.
         * Die Landesbeschriftung wird direkt darunter gesetzt.
         * @param {String} country - das bezeichnete Land.
         * @returns ein Positions-Objekt.
         */
        function checkPosition(country){
        
            var node = svg.selectAll(".country_label." + country);
            var transformAttr = node.attr("transform");
            
            // /translate\([0-9]+\.[0-9]+,[0-9]+\.[0-9]+\)/
            var schnittX = transformAttr.indexOf("(");
            var schnittY = transformAttr.indexOf(",");
        
            var pos = {
                "x": parseInt(transformAttr.substring(1+schnittX, 4+schnittX), 10) - 40,
                "y": parseInt(transformAttr.substring(1+schnittY, 4+schnittY), 10) - 10
            };
            
            node.attr("transform", "translate(" + (40 + pos.x) + "," + (30 + pos.y) + ")");
            return pos;
        }
        
        var states = [];
        for(var key in data)
            states[key] = new DiaState(assignCountry(key), data[key], checkPosition(assignCountry(key)));
        
        
        /*
         * Den Laendern werden Mouse-Events-zugeordnet
         */
        
        svg.selectAll(".land")		
            .on("mouseover", function(d) { // MouseOver-Event: Balkendiagramm ausfahren
            
                svg.selectAll(".textDia." + d.properties.name).attr("font-size", "9px");
                svg.selectAll(".textDia." + d.properties.name).classed("hidden", false);			

                for(var item in states){
                    var cur = states[item];
                    if(cur.name === d.properties.name)
                        transitionRectDiaIn(cur.x, cur.y, cur.name);
                }
            })    
    
            .on("mouseout",  function(d) { // MouseOut-Event: Balkendiagramm einfahren
            
                tooltip.classed("hidden", true);

                for(var item in states){
                    var cur = states[item];
                    if(cur.name === d.properties.name)
                        transitionRectDiaOut(cur.x, cur.y, cur.name);
                }

                svg.selectAll(".textDia." + d.properties.name).classed("hidden", true);
            })
      
            .on("mousemove", function(d){ // MouseMove-Event: Tooltip ueber Laender einblenden
            
                var mouse = d3.mouse(svg.node()).map(function(d) { return parseInt(d, 10); });
                
                var svgPos = $("#Map svg").position();
                var left = svgPos.left;
                var top = svgPos.top;
                
                //isn't chrome?
                if(-1 === navigator.userAgent.toLowerCase().indexOf("chrome"))
                    left = document.getElementById("Map").getBoundingClientRect().left; //top += 10; left += 105;
                
                tooltip
                    .classed("hidden", false)
                    .attr("style", "left:" + (mouse[0]+left) + "px;top:" + (mouse[1]+top) + "px")
                    .html(d.properties.name);
            });
            
            /**
             * @brief Zeichnet ein Diagramm.
             * @description Erst das untere Rechteck, dann die einzelnen S&auml;ulen, sowie die Beschriftung.
             * @param {Array} labels - beinhaltet die Skala-Beschriftung.
             */ 
            DiaState.prototype.drawChart = function(labels){
            
                this.makeRectBase();
                this.makeRectDia();
                this.makeTextDia();
                this.makeTextBase(labels);
            };
      
            // Zeichne alle Diagramme
            for(var item in states)
                states[item].drawChart(diaLabels);
    });
    
    /**
     * @brief Funktion zum Zeichnen der unteren Achse auf der die S&auml;ulen stehen.
     * @description Es wird dem SVG-Element ein Rechteck angeh&auml;ngt mit den &uuml;bergebenen Parametern 
     * als Attribute, sowie H&ouml;he, Breite und Farbe.
     */ 
    DiaState.prototype.makeRectBase = function() {
        svg.selectAll("rectBase")
            .data([0]).enter()
            .append("rect")
            .attr("x", this.x)
            .attr("y", this.y)
            .attr("width", RECTBASE_WIDTH)
            .attr("height", RECTBASE_HEIGHT)
            .attr("style", "fill: #000");
    };
    
    /**
     * @brief Funktion zum Zeichnen der S&auml;ulen im Diagramm. 
     * @description Dem SVG-Element werden Rechtecke angeh&auml;ngt mit einer Klasse mit der Element-Bezeichnung und dem L&auml;nder-Namen.
     * Die x und y -Attribute werden  durch Funktionen berechnet, die anhand der &uuml;bergebenen Daten die Abst&auml;nde berechnet.
     * Noch ist die H&ouml;he auf 0, da die Balken erst bei Ber&uuml;hren der L&auml;nder ausgefahren wird.
     */
    DiaState.prototype.makeRectDia = function(){
        
        var me = this;
        
        svg.selectAll("rectDia")
            .data(me.data).enter().append("rect")
            .attr("class", function() { return "rectDia " + me.name; })
            .attr({x:function(d, a){ return me.x + TEXT_MARGIN * a; },
                    y: function() {	return me.y; },
                    width: RECTDIA_WIDTH,
                    height: 0
            })
            .attr("fill",function(d, i) { return COLOR(i); });
    };
    
    /** 
     * @brief Funktion f&uuml;r die Transition der Balken mit ihren Beschriftungen, wenn die Maus &uuml;ber ein Land f&auml;hrt.
     * @description Es wird nach dem Diagramm mit dem L&auml;ndernamen im SVG gesucht. Die Rechtecke werden dann
     * verschoben. Y und die H&ouml;he sind von den Daten abh&auml;ngig.
     * Mit den Balken wird auch die Beschriftung wie beschrieben verschoben.
     * @param {int} xKoordinate - x-Koordinate des Landes.
     * @param {int} yKoordinate - y-Koordinate des Landes.
     * @param {String} name - Name des Landes
     */
    function transitionRectDiaIn(xKoordinate, yKoordinate, name){
        svg.selectAll(".rectDia." + name)
            .transition()
            .attr({
                x: function(d, a){ return xKoordinate + TEXT_MARGIN * a; },
                y: function(d){ return yKoordinate - d * FACTOR_DIA; },
                width: RECTDIA_WIDTH,
                height: function(d){ return d * FACTOR_DIA; }
            });
	
        svg.selectAll(".textDia." + name)
            .transition()
            .attr({
                x: function(d, a){ return xKoordinate + TEXT_MARGIN * a; },
                y: function(d){	return yKoordinate - d * FACTOR_DIA + 10; }
            });
    }
    
    /** 
     * @brief Funktion f&uuml;r Transition der Balken mit ihren Beschriftungen, wenn die Maus aus dem Landesbereich hinaus geht.
     * @description Es wird nach dem Diagramm mit dem L&auml;ndernamen im SVG gesucht. Die Rechtecke werden dann
     * verschoben. Y ist von den Daten abh&auml;ngig und die H&ouml;he wird wie anfangs wieder auf 0 gesetzt.
     * Mit den Balken wird auch die Beschriftung wie beschrieben verschoben.
     * @param {int} xKoordinate - x-Koordinate des Landes.
     * @param {int} yKoordinate - y-Koordinate des Landes.
     * @param {String} name - Name des Landes.
     */
    function transitionRectDiaOut(xKoordinate, yKoordinate, name){
        svg.selectAll(".rectDia." + name)
            .transition()
            .attr({
                x: function(d, a){ return xKoordinate + TEXT_MARGIN * a; },
                y: function(){ return yKoordinate; },
                width: RECTDIA_WIDTH,
                height: 0
            });
    
        svg.selectAll(".textDia." + name)
            .transition()
            .attr({
                x: function(d, a){ return xKoordinate + TEXT_MARGIN * a; },
                y: function(){ return yKoordinate; }
            });
    }
    
    /**
     * @brief Funktion f&uuml;r die Beschriftung der Balken.
     * @description An das SVG-Element wird ein per CSS-Klasse gekennzeichnetes Text-Element angeh&auml;ngt, dann der Datensatz &uuml;bergeben.
     * Die Attribute x und y-Werte  werden entsprechend der L&auml;nder-Koordianten gespeichert und die Breite in x wie bei den Balken 
     * verschoben berechnet.
     * Es wird die Schriftart, die Gr&ouml;&szlig;e und die Farbe definiert. Die Gr&ouml;&szlig;e wird zun&auml;chst auf 0 gesetzt, 
     * da es erst definiert wird, wenn die Maus das Land ber&uuml;hrt. Der Text wird aus den Daten &uuml;bergeben. 
     */
    DiaState.prototype.makeTextDia = function(){
        
        var me = this;
        
        svg.selectAll(".text")
            .data(me.data)
            .enter().append("text")
            .attr("class", function(){ return "textDia " + me.name; })
            .attr("x", function(d, a){ return me.x + TEXT_MARGIN * a; })
            .attr("y",function(){ return me.y; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "0px")
            .attr("fill", "white")
            .text(function(d) { return d; });
    };
    
    /**
     * @brief Funktion f&uuml;r die Beschriftung der unteren Achse.
     * @description An das SVG-Element wird ein per CSS-Klasse gekennzeichnetes Text-Element angeh&auml;ngt, dann der Datensatz &uuml;bergeben. 
     * Die Attribute x und y-Werte  werden entsprechend der L&auml;nder-Koordianten gespeichert und die Breite in x wie bei den Balken 
     * verschoben berechnet.
     * Es wird die Schriftart, die Gr&ouml;&szlig;e und die Farbe definiert. Die Gr&ouml;&szlig;e wird zun&auml;chst auf 0 gesetzt, 
     * da es erst definiert wird, wenn die Maus das Land ber&uuml;hrt. Der Text wird aus den Daten &uuml;bergeben. 
     * @param {Array} labels - Datensatz des Diagramms.
     */
    DiaState.prototype.makeTextBase = function(labels){
        
        var me = this;
        
        svg.selectAll(".text")
            .data(labels)
            .enter().append("text")
            .attr("class", function(){ return "textBase " + me.name; })
            .attr("x", function(d, a){ return me.x + TEXT_MARGIN * a; })
            .attr("y",function(){ return me.y + 10; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .attr("fill","black")
            .text(function(d){ return d; });
    };
}

/**
 * @brief Startet die Applikation.
 * @description Erst wird die JSON-Datei mit den Daten ausgelesen, danach die Karte gezeichnet.
 */ 
function main(){

    /*
     * Laden der JSON_Datei mit den Verteilungen der Vokale.
     * Bei Erfolg werden die Daten aus der JSON-Datei der Funktion zum Zeichnen der Karte uebergeben.
     * Bei Misserfolg wird der Fehler auf der Konsole ausgegeben.
     */
    $.getJSON(document.getElementsByTagName("head")[0].getAttribute("data-params"))
        .done(function(data) {
            drawMap(convertToArray(data.languages), Object.keys(data.languages[Object.keys(data.languages)[0]]));
        })
        .fail(function(unused, textStatus, error) {
            console.log("Request Failed: " + textStatus + ", " + error);
        });
}

main();
