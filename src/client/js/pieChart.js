// --------------------
// Darstellung der Kreisdiagramme.
// --------------------

/**
 * @class PieChart-Klasse.
 * @brief Beschreibt ein Kreisdiagramm zu der Statistik eines Landes.
 * @param {String} language - der Sprachcode nach ISO 639-1.
 * @param {int} width - die Breite des SVGElements.
 * @param {int} height - die H&ouml;he des SVGElements.
 * @param {int} radius - der Kreisradius des Diagramms.
 */
function PieChart(language, width, height, radius){
    
    this.language = language || null;
    this.width = width || 300;
    this.height = height || 300;
    this.radius = radius || 100;
    this.color = d3.scale.category10();
}

/**
 * @brief Liefert die Amtssprache zu einem bestimmten Sprachcode nach ISO 639-1.
 * @param {String} id - die gegebene L&auml;nderkennzeichnung. 
 * @returns einen String, der die Amtssprache beinhaltet.
 */
PieChart.prototype.fromLanguage = function(id){
    
    switch(id){
        case "de": return "Deutsch";
        case "en": return "Englisch";
        case "es": return "Spanisch";
        case "fr": return "Französisch";
        case "it": return "Italienisch";
        case "pt": return "Portugiesisch";
        case "sv": return "Schwedisch";
        default: return "";
    }
};

/**
 * Funktion zum Zeichnen des Diagramms.
 * @param {Object} data - das Datenobjekt.
 */
PieChart.prototype.drawChart = function(data){
        
        var me = this;
        
        // Gesamtanzahl der Buchstaben
        var sum = 0;
        for(var prop in data)
            if(data.hasOwnProperty(prop))
                sum += data[prop];        
    
        // Berechnung der prozentualen Verteilung
        var daten = [];
        var i = 0;
        for(var prop in data)
            daten[i++] = {"label": prop, "value": parseInt(Math.round((100 * data[prop])/sum), 10) };        
    
        // Diagrammueberschrift    
        var title = document.createElement("h4");
        title.appendChild(document.createTextNode(this.fromLanguage(this.language)));
        document.getElementById(this.language).appendChild(title);     
    
        /*
         * In das HTMLDivElement mit der ID #pieGerman wird ein SVG-Element eingefuegt, dazu die
         * vorher definierte Breite, Hoehe, sowie die Daten (%).
         * Ausserdem wird eine Gruppe eingefuegt und der Kreismittelpunkt auf (radius, radius) verschoben.
         */
        var chart = d3.select("#" + this.language)
            .append("svg:svg")
            .data([daten])
            .attr("width", this.width)
            .attr("height", this.height)
            .append("svg:g")
            .attr("transform", "translate(" + this.radius + "," + this.radius + ")");
    
        // Es wird ein Pfad-Element generiert, welches arc-Daten mit dem Radius verarbeitet
        var arc = d3.svg.arc().outerRadius(this.radius);
         
        // Es wird auf ein Layout eines Kreis-Diagramms zugegriffen, um die Werte fuer jedes Element auszulesen.
        var pie = d3.layout.pie().value(function(d) { return d.value; });
    
        /*
         * Es werden alle Gruppen-Elemente als Teile des Kuchens gesucht und diesen die Daten uebergeben.
         * Jedem Stueck wird eine Gruppe zugewiesen, die die Pfad- und Text-Elemente enthalten, sowie eine Stylesheet-Klasse.
         */
        var arcs = chart.selectAll("g.slice")
            .data(pie)
            .enter()
            .append("svg:g")
            .attr("class", "slice");
        
        // Jedem Stueck als Pfad wird eine Farbe zugewiesen und das arc uebergeben.
        arcs.append("svg:path")
            .attr("fill", function(d, i) { return me.color(i); })
            .attr("d", arc); 
         
        // Jedes Stueck wird beschriftet, die Beschriftung zentriert
        arcs.append("svg:text")
            .attr("transform", function(d) {
                d.innerRadius = 0;
                d.outerRadius = me.radius;
                return "translate(" + arc.centroid(d) + ")"; 
            })
            .attr("text-anchor", "middle")
            .text(function(d, i) { return daten[i].label; }); 
};

/**
 * @brief L&auml;dt die notwendigen Daten aus der JSON-Datenbank und l&auml;sst das  
 * dazugeh&ouml;rige Diagramm zeichnen.
 */
function main(){
    
    $.getJSON(document.getElementsByTagName("head")[0].getAttribute("data-params")).done(function(data){
            
            // nur Diagramme zeichnen, denen ein passendens HTMLDIVElement mit passender ID 
            // zugeordnet werden kann
            var possibles = Object.keys(data.languages);
            var children = document.getElementById("Pie").childNodes;
            for(var i = 0; children.length > i; ++i)
                if("DIV" === children[i].tagName)
                    if(-1 !== $.inArray(children[i].getAttribute("id"), possibles)){
                        var chart = new PieChart(children[i].getAttribute("id"));
                        chart.drawChart(data.languages[chart.language]);
                    }
    })
    .fail(function(unused, textStatus, error){
        console.log("Request Failed: " + textStatus + ", " + error);
    });
}

main();
