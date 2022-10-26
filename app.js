const express = require('express');
const app = express();
const port = 8080;

const fs = require('fs');
const path = require('path');
const codes = require('rescode');

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

var genBarcode = function (code, filename, callback) {
    codes.loadModules(["code128"], { "includetext": true, "guardwhitespace": false, "inkspread": 0, scaleX: 4.16260162602, scaleY: 2, textyoffset: 5 });

    var barcode = codes.create("code128", code);

    fs.writeFile(filename, barcode, function (err) {
        if (err) {
            console.log('++++++++ err ' + code + ' +++++++++');
            console.log(err);
            genBarcode(code, filename, callback);
            return;
        }
        callback();
    });
};

var genSyn = function (prefix, length, start, end, callback) {
    var code = prefix + String(start).padStart(length, '0');
    genBarcode(code, "download/" + code + ".png", function () {
        console.log('done ' + code);
        if (start < end) {
            genSyn(prefix, length, start + 1, end, callback)
            return;
        }
        callback()
    });
};

app.get('/', function (_req, res) {
    res.send('<h2>Free Online Barcode Generator</h2>');
});

app.get('/gen', function (req, res) {
    var code = req.query.code || "unknown";
    res.status(200).render('', { code });
});

app.get('/download-promotion-code', function (req, res) {
    var prefix = req.query.prefix;
    var length = req.query.length;
    var start = req.query.start;
    var end = req.query.end;

    if (!prefix || !length || !start || !end) {
        var sample_url = req.protocol + "://" + req.get('host') + req.path + "?prefix=GMVN&length=5&start=1&end=999";
        res.send("<h2>Free Online Barcode Generator - Error</h2><h4>Sample: <a href='" + sample_url + "'>" + sample_url + "</a></h4>");
        return;
    }

    genSyn(prefix, Number(length), Number(start), Number(end), function () {
        console.log('++++++++ done all +++++++++');
    });
    res.send("<h2>Free Online Barcode Generator - Downloading</h2>");
});

app.listen(port, function () {
    console.log("Your app running on port " + port);
});