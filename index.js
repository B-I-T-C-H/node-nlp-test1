var natural = require('natural');
var parse = require('csv-parse');
var fs = require('fs');
var http = require('http')
var formidable = require('formidable')
var util = require('util')
var snoowrap = require('snoowrap')
require('should');

const cred = require('DEV-API-CRED')

// SNOOWRAP API HERE - LOADS FROM DEV-API-CRED
const r = new snoowrap({
  userAgent: cred.userAgent,
  clientId: cred.clientId,
  clientSecret: cred.clientSecret,
  username: cred.username,
  password: cred.password
});


var classifier = new natural.BayesClassifier();
var input = fs.readFileSync('twitter-hate.csv', 'utf8');

//Loads a classifier as saved.
natural.BayesClassifier.load('classifier.json', null, function(err, classifierLoad) {
    if (classifierLoad != undefined) {
        classifier = classifierLoad;
        
        console.log("on pause")
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
        console.log("Finished training");
        
        console.log("on pause")
    });
}

// SERVER PART STARTS HERE

var server = http.createServer(function (req, res) {
    if (req.method.toLowerCase() == 'get'){
        webcontent(res)
    }
    else if (req.method.toLowerCase() == 'post'){
        processInput(req, res)
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

function processOverview(string) {
    var comments = []
    for (i = 0; i < string.length; i++){
        comments.push(string[i]['body'])
    }

    var text = ''
    var bitchIndex = 0

    for (i = 0; i < comments.length; i++){
        text = String(comments[i]).substring(0,1000)

        /* If a user quotes someone who is using hate speech, they are not
         penalized for hate speech. Currently fails the edge case of
         multiple paragraphs in one quote. Quotation notation in Reddit is
         '>' */
        text = text.split('\n')
        for (j = 0; j < text.length; j++){
            if (text[j][0] === '>'){
                text[j] = ''
            }
        }
        text = text.join(' ')

        console.log(text)
        console.log(classifier.classify(text))

        //Increment Bitch Index
        if (classifier.classify(text) === 'The tweet contains hate speech'){
            bitchIndex ++
        }

        console.log(classifier.getClassifications(text))


         //Use this to save the classifier for later use
         classifier.save('classifier.json', function(err, classifier) {
             // the classifier is saved to the classifier.json file!
             console.log("Classifier saved!");
        })
    }
    console.log('Naive Bayes Bitch Index: ' + (bitchIndex/string.length).toString())
}

function processInput(req, res){
    var fields = []
    var form = new formidable.IncomingForm()

    form.on('field', function(field, value){
        console.log(field)
        console.log(value)
        fields[field] = value
        //.then takes a function that is applied to the result of r.getUser
        r.getUser(value).getComments().then(processOverview)
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
