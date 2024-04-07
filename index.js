const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs')

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/compile', (req, res) => {
  const { code } = req.body;
  console.log("req received");
  // Write the code to a file
  fs.writeFileSync('hello.cpp', code, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Failed to write file');
      return;
    }
  });

  exec('docker build -t my-compiler . && docker run --rm my-compiler', (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.send(stdout);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
