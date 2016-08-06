var express = require('express')
var nunjucks = require('nunjucks')
var multer  = require('multer')
var app = express();
var upload = multer({ dest: 'uploads/' })
var path = require('path')
var mysql = require('mysql');
var csv = require('csv-parser')
var fs = require('fs')
var mysqlConfig = {
  host     : 'localhost',
  user     : 'root',
  password : 'jeremybaugh',
  database : 'testsite'
};

var connection = mysql.createConnection(mysqlConfig)


connection.connect();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/data', function(req, res){
  connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
    if (err) throw err;
    console.log(rows)
    console.log('The solution is: ', rows[0].solution);
    res.send(rows)
  });
});


app.get('/import', function(req, res){
  res.render('import.html')
});

app.post('/import', upload.single('csv'), function (req, res, next) {
    // req.file is the `avatar` file
    console.log(req.file)
    // req.body will contain the text fields, if there were any
    console.log(req.body)
    var query = ""
    // req.file.path is where the file is saved
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', function(data) {
        console.log('row', data)
      })
      .on('end', function() {
        res.redirect('back')
      })
      .on('headers', function(headers) {
        console.log('headers', headers)
        query += `CREATE TABLE ${req.body.tablename} ( `
        headers.forEach(function(header, i) {
          // headers = [ "name", "age", "sex", "location" ]
          // headers = all the columns ("or headers") in the spreadsheet
          // i = [ 0, 1, 2, 3 ]
          if (i === headers.length - 1) {
            // when it hits "location", i is 3, so 3 === 4 - 3... so 3 = 3 and that's true
            query += `${header} varchar(255)`;
          } else {
            query += `${header} varchar(255),`;
          }

        });
        query += " );"
        console.log(query)
        connection.query(query, function(err, rows, fields){
          console.log(err,rows,fields)
        })

      })
})

app.get('/', function(req, res){
  res.render('index.html');
});

nunjucks.configure('views', {
    autoescape: true,
    express: app
});


app.listen(8080);
