var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");
// Require all models
var db = require("./models");
var PORT = process.env.PORT || 3000;
// Initialize Express
var app = express();
// Configure middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));
// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/packt_db", { useNewUrlParser: true });
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/packt_db";

// mongoose.connect("mongodb://heroku_ntzq8k8d:n65ik1cl6malct8e06p80jqt8b@ds213209.mlab.com:13209/heroku_ntzq8k8d");
mongoose.connect(MONGODB_URI);

// Routes
app.get("/scrape", function (req, res) {
    axios.get("https://www.packtpub.com/").then(function (response) {
        var $ = cheerio.load(response.data);
        // $("div.bs_item").each(function (i, element) {
        $("div.bs_item").each(function (i, element) {

            console.log($(this).children("a").attr("href"));
            console.log($(this).children("a").children("img").attr("src"));
            console.log($(this).children("a").children("img").attr("alt"));

            // console.log(element);

            var result = {};
            // result.title = $(this).children("a").text();
          //  var title = $(element).attr("alt");

            result.link = $(this)
                .children("a")
                .attr("href");

            result.title = $(this)
                .children("a")
                .children("img")
                .attr("alt")

            result.image = $(this)
                .children("a")
                .children("img")
                .attr("src")

          //    var imgLink = $(element).attr("src");

          //   result.push({
          //  imgLink: imgLink, title: title
          //   })
  
            // db.Book.insert({ imgLink: imgLink, title: title })

            // Create a new Book using the `result` object built from scraping
            db.Book.create(result)
                .then(function (dbBook) {
                    // View the added result in the console
                    console.log(dbBook);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });
        // Send a message to the client
        res.send("Scrape Complete");
    });
});


//PREVIOUS TECHNIQUE WORKING
//------------------------
//get img from website + src + alt
// $("img").each(function (i, element) {

//     var imgLink = $(element).attr("src");
//     var title = $(element).attr("alt");

//     console.log(imgLink)
//     console.log(title)

//     // results.push({
//     //     imgLink: imgLink, title: title
//     // });

//     db.scrapedData.insert({ imgLink: imgLink, title: title })
// });
//----------------------------
// app.get('/', function(req, res) {
//   return 'hello world'
// })

// Route for getting all Articles from the db
app.get("/books", function(req, res) {
    // Grab every document in the Articles collection
    db.Book.find({})
      .then(function(dbBook) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbBook);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/books/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Book.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbBook) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbBook);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  // Route for saving/updating an Article's associated Note
  app.post("/books/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        return db.Book.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbBook) {
        console.log(dbBook)
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbBook);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  