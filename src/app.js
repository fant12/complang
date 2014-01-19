// Includes
var express = require("express");
var fs = require("fs");
var http = require("http");

// languages enum

var languages = { 
    "Deutsch" : "de",
    "Englisch" : "en",
    "Französisch" : "fr",
    "Spanisch" : "es",
    "Portugiesisch": "pt",
    "Italienisch": "it",
    "Schwedisch": "sv"
};

const DEF_TEXT = "Leise rieselt der Schnee, Still und starr liegt der See, Weihnachtlich glänzet der Wald. "
                + "Freue Dich, Christkind kommt bald. In den Herzen ist's warm, Still schweigt Kummer und Harm, Sorge des Lebens verhallt. "
                + "Freue Dich, Christkind kommt bald. "
                + "Bald ist heilige Nacht, Chor der Engel erwacht, Horch nur, wie lieblich es schallt, Freue Dich, Christkind kommt bald."; 
const DEF_LANGUAGE = languages[Object.keys(languages)[0]];

/**
 * @class TextAnalyzer Objekt-Prototyp.
 * @brief Analysiert Text auf seine Bestandteile bzw. Vorkommen an Vokalen in verschiedenen Fremdsprachen.
 * @description Dazu wird ein Text als Anfrage an Google Translate geschickt, das folgende Ergebnis 
 * gelesen und analysiert. Nach der Analyse wird das Resultat als JSON-Objekt serialisiert.
 * @param {String} content - der Text.
 * @param {Enum} contentLanguage - die Textsprache.
 * @param {String} jsonFile - die JSON-Datei, die die Analyse-Ergebnisse speichert.
 */ 
function TextAnalyzer(content, contentLanguage, jsonFile){
    this.content = content || "";
    this.contentLanguage = contentLanguage || languages[Object.keys(languages)[0]];
    this.numOfSuccessfulTranslations = 0;
    this.numOfTranslations = Object.keys(languages).length;
    this.jsonFileSavedTo = jsonFile || null;
}

/**
 * @brief Analysiert den Ergebnisstring aus einer Anfrage an Google Translate.
 * @param {String} text - der Ergebnisstring.
 * @param {Enum} to - das Enum-Objekt, welches die Zielsprache für die &Uuml;bersetzung festlegt.
 * @param {Object} obj - das Objekt, welches das Ergebnis speichert.
 */ 
TextAnalyzer.prototype.analyzeResult = function(text, to, obj){
    
    //count sentence number
    var countSentence = this.content.match(/[\.]/g);
    countSentence = (null !== countSentence) ? countSentence.length : 1;
    
    //get string between [[[ ]]
    text = text.substring(3, text.search(/\]\]/));

    //read specific sentences
    var result = "";
    while(countSentence > 0){
        result += text.substring(1+text.search(/\"/), text.search(/(\",)/));
        text = text.substring(1+text.search(/(\[\")/), text.length);
        --countSentence;
    }
    
    this.saveAsJSON(result, to, obj);
};

/**
 * @brief Liefert die Anzahl an Vorkommen eines bestimmten Zeichens in einem String.
 * @param {String} haystack - der String, der gepr&uuml;ft wird.
 * @param {String} needle - das Zeichen, welches gesucht wird.
 * @returns eine Zahl, die Anzahl an Vorkommen beschreibt.
 */ 
TextAnalyzer.prototype.countChars = function(haystack, needle){
    return (haystack.match(new RegExp(needle, "g")) || []).length;
};

/**
 * @brief Liefert eine f&uuml;r die Anfrage pr&auml;parierte URL.
 * @param {String} url - die Basis-URL.
 * @param {Enum} to - das Enum-Objekt, welches die Zielsprache für die &Uuml;bersetzung festlegt.
 * @param {String} text - der Text, der &uuml;bersetzt werden soll.
 * @returns ein String, der die neue URL-Adresse enth&auml;lt.
 */ 
TextAnalyzer.prototype.prepareURL = function(url, to, text){
    
    text = text.replace(/[\s^\n]/g, "%20");
    text = text.replace(/[,]/g, "%2C");
    console.log("Debug: url = " + url + "/translate_a/t?client=t&sl=" + this.language + "&tl=" + to + "&hl=" + this.language + "&ie=UTF-8&oe=UTF-8&oc=2&otf=1&ssel=5&tsel=5&pc=1&q=" + text);
    return url + "/translate_a/t?client=t&sl=" + this.language + "&tl=" + to + "&hl=" + this.language + "&ie=UTF-8&oe=UTF-8&oc=2&otf=1&ssel=5&tsel=5&pc=1&q=" + text;
};

/**
 * @brief Speichert das Analyse-Ergebnis in einem JSON-Objekt.
 * @param {String} text - der Ergebnisstring.
 * @param {Enum} to - das Enum-Objekt, welches die Zielsprache für die &Uuml;bersetzung festlegt.
 * @param {Object} obj - das Objekt, welches das Ergebnis speichert.
 */ 
TextAnalyzer.prototype.saveAsJSON = function(text, to, obj){
    
    var data = [];
    
    //ersetze alle umlaute (erst jetzt, da erst jetzt übersetzt)
    text = text.replace(/ä/g,"ae")
                .replace(/æ/g, "ae")
                .replace(/ö/g,"oe")
                .replace(/ü/g,"ue")
                .replace(/Ä/g,"Ae")
                .replace(/Ö/g,"Oe")
                .replace(/Ü/g,"Ue");
    
    var vocals = [
                        ["a", "à", "á", "â", "A", "À", "Á", "Â"],
                        ["e", "è", "é", "ê", "E", "È", "É", "Ê"],
                        ["i", "ì", "í", "î", "I", ,"Ì", "Í", "Î"],
                        ["o", "ò", "ó", "ô", "O", "Ò", "Ó", "Ô", "ø"],
                        ["u", "ù", "ú", "û", "U", "Ù", "Ú", "Û"]
                    ];
 
    for(var i = 0; vocals.length > i; ++i)
        for(var j = 0; vocals[i].length > j; ++j){
            if(0 === j) 
                data[vocals[i][0]] = 0;
            data[vocals[i][0]] += this.countChars(text, vocals[i][j]);
        }
        
    obj.languages[to] = this.toObject(data);
    ++this.numOfSuccessfulTranslations;
    
    if(this.numOfTranslations === this.numOfSuccessfulTranslations)
        fs.writeFile(this.jsonFileSavedTo, JSON.stringify(obj), function(err){
            console.log('ready');
        });
};

/**
 * @brief Konvertiert ein assoziatives Array in ein Objekt.
 * @param {Array} arr - das assoziative Array.
 */ 
TextAnalyzer.prototype.toObject = function(arr){
    
    var obj = {};
    for (var item in arr)
        if(undefined !== item) 
            obj[item] = arr[item];
    return obj;
};

/**
 * @brief Sendet eine Anfrage an Google Translate. Das Ergebnis wird danach weiterverarbeitet.
 * @param {Enum} to - das Enum-Objekt, welches die Zielsprache für die &Uuml;bersetzung festlegt.
 * @param {Object} obj - das Objekt, welches das Ergebnis speichert.
 */ 
TextAnalyzer.prototype.translate = function(to, obj){
    
    var el = this;
    
    http.get(this.prepareURL("http://translate.google.de", to, this.content), function(result) {
        
        result.setEncoding('utf8');
        result.on("data", function(chunk) {
            el.analyzeResult(chunk, to, obj);
        });
    });
};

/**
 * @brief Startet die Anfrage, l&auml;dt also die notwendigen Daten.
 * @param {String} data - der zu &uuml;bersetzende Text.
 * @param {String} language - die Sprache des Textes.
 */
function loadData(data, language){
    
    var jsonFile = "data/statistics.json";
    
    var usedText = new TextAnalyzer(
        (undefined === data || null === data || "" === data) ? DEF_TEXT : data,
        (undefined === language || null === language || "" === language) ? DEF_LANGUAGE : language,
        jsonFile);
        
    var obj = {"languages":{}};
    
    for(var key in languages){
        if(usedText.contentLanguage === languages[key])
            usedText.saveAsJSON(usedText.content, languages[key], obj);
        else
            usedText.translate(languages[key], obj);
}}

// -----------------------------------------------------------------------------
// Starte den Express-Server, lade die Webseite und reagiere auf Anfragen (GET, POST)

var app = express();

// Configuration und Setup der Middleware
app.use(express.static(__dirname));
app.use(express.urlencoded());
app.use(express.cookieParser());
app.use(express.session({secret: "mietzekatze"}));
app.use(express.errorHandler());
app.use(express.methodOverride());
app.use(express.favicon());
app.use(app.router);
app.set('view engine', 'jade');

// Daten (einmal!) laden
loadData();

// GET
app.get('/', function(request, response) {
    
    response.render("index", { 
        languageCode: request.body.langCode,
        possibleLanguages: languages,
        translated: "Bitte tragen Sie hier Ihren eigenen Text ein.",
    });    
});

// POST
app.post('/', function(request, response) {
    
    console.log("Debug: request =" + request.body.textToTranslate);
    loadData(request.body.textToTranslate, request.body.langCode);
    
    response.render("index", { 
        languageCode: request.body.langCode,
        possibleLanguages: languages,
        translated: ("" !== request.body.textToTranslate) ? request.body.textToTranslate : DEF_TEXT,
    });
});

app.listen(process.env.PORT || 3000);
