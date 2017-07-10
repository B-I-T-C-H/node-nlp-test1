var natural = require('natural');
var parse = require('csv-parse');
var fs = require('fs');
require('should');

var http = require('http')
var fs = require('fs')
var formidable = require('formidable')
var util = require('util')
var snoowrap = require('snoowrap')

var classifier = new natural.BayesClassifier();
var input = fs.readFileSync('twitter-hate.csv', 'utf8');


//Loads a classifier as saved.
natural.BayesClassifier.load('classifier.json', null, function(err, classifierLoad) {
    if (classifierLoad != undefined) {
        classifier = classifierLoad;
        onTrained();
    }
    else { trainData(); }
});

function trainData() {
    parse(input, {comment: '#'}, function(err, output){
        console.log("Loading files");
        for (i = 1; i < 14500; i++) {
            if (i % 1000 == 0) { console.log(i); }

            classifier.addDocument(String(output[i][19]), String(output[i][5]));
        }

        console.log("Training files");
        classifier.train();

        onTrained();
    });
}

function onTrained() {
     //Outputs "not hate"
     // var testPhrase1 = "The world is a beautiful place."
     // console.log(classifier.classify(testPhrase1));
     // console.log(classifier.getClassifications(testPhrase1));

     // //Outputs "hate"
     // var testPhrase2 = "Suck my cock, you Nazi."
     // console.log(classifier.classify(testPhrase2));
     // console.log(classifier.getClassifications(testPhrase2));

     // //Use this to save the classifier for later use
     // classifier.save('classifier.json', function(err, classifier) {
     //     // the classifier is saved to the classifier.json file!
     //     console.log("Classifier saved!");
     // });
     console.log("on pause")
}


//Use this to have it report each time a document is trained
classifier.events.on('trainedWithDocument', function (obj) {
    if (obj["index"] % 1000 == 0) {
        console.log(obj["index"]);
    }

    //Data format
    /* {
    *   total: 23 // There are 23 total documents being trained against
    *   index: 12 // The index/number of the document that's just been trained against
    *   doc: {...} // The document that has just been indexed
    *  }
    */
});


// SERVER PART STARTS HERE

var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get'){
        webcontent(res)
    }
    else if (req.method.toLowerCase() == 'post'){
        processinput(req, res)
    }
})

function webcontent(res){
    fs.readFile('index.html', function(err, data){
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': data.length
        })
        res.write(data)
        res.end()
    })
}

// SNOOWRAP API HERE
const r = new snoowrap({
  userAgent: '',
  clientId: '',
  clientSecret: '',
  username: '',
  password: ''
});

function processUser(string) {
    text = ""

    for (i = 0; i < string.length; i++){
        text += string[i]["body"]
    }

    text = String(text).substring(0, 1000)
    console.log(text)
    console.log(classifier.classify(text));
    console.log(classifier.getClassifications(text));

     //Use this to save the classifier for later use
     classifier.save('classifier.json', function(err, classifier) {
         // the classifier is saved to the classifier.json file!
         console.log("Classifier saved!");
     });
}

function processinput(req, res){
    var fields = []
    var form = new formidable.IncomingForm()

    form.on('field', function(field, value){
        console.log(field)
        console.log(value)
        fields[field] = value
        //.then takes a function that is applied to the result of r.getUser
        r.getUser(value).getOverview().then(processUser)
    })

    form.on('end', function(){
        res.writeHead(200, {
            'content-type': 'text/plain'
        })
        res.write('received the data:\n\n')
        res.end(util.inspect({
            fields: fields
        }))
    })
    form.parse(req)
}

server.listen(8080)