/***********************************************************

/ ----------------- complang -------------------------------

/ @author Christian Kusan
/ @author Lisa Manthei
/ @date T2014-01-19T04:44:00+02:00

***********************************************************/

Is a NodeJS project with integrated d3 library on client side.
On main webpage the user can see a map of europe with several bar charts, which represents the proportion of vowels in specific languages. A form below the map offers the possibility to send own text data to server for analyzing this text. At default, a christmas song ('snow falls soft in the night') will be used.
Each text data will be send to Google Translate to translating in several languages (svedish, english, french, portuguese, spanish, italian and german). The result of request will be scraped and analyzed on all occurs of vowel letters.

/ --------------------
Modules and libraries:

- expressJS 3.2.6
- jade
- jQuery
- d3
- d3-topojson

The frontend will be produced with HTML5, CSS3 and JavaScript.
