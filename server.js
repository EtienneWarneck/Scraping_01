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
var PORT = 3000;
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
mongoose.connect("mongodb://localhost/packt_db", { useNewUrlParser: true });

// Routes
app.get("/scrape", function (req, res) {
    axios.get("https://www.packtpub.com/").then(function (response) {
        var $ = cheerio.load(response.data);
        $("h3").each(function (i, element) {
            var result = {};
            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");
            result.imgLink = $(this)
                .children("a")
                .attr("src");
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

//------------------------

//get img from website + src + alt
// $("img").each(function (i, element) {

//     var imgLink = $(element).attr("src");
//     var title = $(element).attr("alt");

//     console.log(imgLink)
//     console.log(title)

//     // results.push({
//     //     mgLink: imgLink, title: title
//     // });

//     db.scrapedData.insert({ imgLink: imgLink, title: title })
// });
//----------------------------


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
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  