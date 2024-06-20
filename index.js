const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs')
const path = require('path')
const { v4 : uuidv4 } = require('uuid');
const {
  details,
  killContainer,
  execute,
  compile,
  createContainer
} = require('./contianerController')
const mongoose = require('mongoose');
const {addJobToQueue}= require('./executionQueue')
const Result = require('./model/result')

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/dockerCompiler');
  console.log('database connected');
}


const app = express();
const PORT = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('index');
});



app.post('/compile', async(req, res , next) => {
  const { code } = req.body;
  console.log("req received");

  const file_name = uuidv4()

  // Write the code to a file
  fs.writeFileSync(`code/${file_name}.cpp`, code, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Failed to write file');
      return;
    }
  });

  try {
    const id = await createContainer({ image : "gcc:latest"})
    const name_of_file = await compile(id , `${file_name}.cpp` , "cpp")
    const result = await execute(id , name_of_file , "cpp")
    await killContainer(id)
    console.log("completed");
    res.send(result)
  } catch (error) {
    next(error)
  }


  // exec('docker build -t my-compiler . && docker run --rm my-compiler', (err, stdout, stderr) => {
  //   if (err) {
  //     console.error(err);
  //     res.status(500).send('Internal Server Error');
  //     return;
  //   }
  //   res.send(stdout);
  // });

//   exec(`docker exec ${containerId} ${command}`, (error, stdout, stderr) => {
//     error && reject({ msg: 'on error', error, stderr });
//     stderr && reject({ msg: 'on stderr', stderr });
//     resolve(id);
// });

});


app.post('/run' , async( req , res)=>{
  try {

    const { code } = req.body;
    console.log("req received at /run");
  
    //create a result in database
    const resultDoc = await Result.create({status:"pending" , output:null});
    const file_name = resultDoc._id;
    // console.log(resultDoc);    
  
    // Write the code to a file
    fs.writeFileSync(`code/${file_name}.cpp`, code, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Failed to write file');
        return;
      }
    });
  
    addJobToQueue(resultDoc._id)
    res.json(resultDoc)

  } catch (error) {
    
  }
})

app.get('/status' , async(req , res )=>{
  const {id} = req.query;
  console.log("req at /status");
  const userDoc = await Result.findById(id)
  res.json(userDoc)
})

app.use((err , req , res , next)=>{
  console.log(err);
  res.json(err)
})

app.listen(PORT, () => {
  console.log(`http://localhost:5000/`);
});
