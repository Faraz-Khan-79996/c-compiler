const Queue = require("bull");
const {
  details,
  killContainer,
  execute,
  compile,
  createContainer
} = require('./contianerController');
const Result = require("./model/result");

const jobQueue = new Queue("job-runner-queue");
const NUM_WORKERS = 5;

jobQueue.process(NUM_WORKERS, async ({ data }) => {
  const file_name = data.id;
  
  if (file_name === undefined) {
    throw Error(`cannot find Job with id ${file_name}`);
  } 
  try {

    const id = await createContainer({ image : "gcc:latest"})
    const name_of_file = await compile(id , `${file_name}.cpp` , "cpp")
    const result = await execute(id , name_of_file , "cpp")
    await killContainer(id);

    await Result.findByIdAndUpdate(file_name , {status : "completed" , output : result})
    return true

  } catch (err) {
    await Result.findByIdAndUpdate(file_name , {status : "completed" , output : null , error : JSON.stringify(err)})
    throw Error(JSON.stringify(err));
  }
});

jobQueue.on("failed", (error) => {
  console.error(error.data.id, error.failedReason);
});

const addJobToQueue = async (jobId) => {
  jobQueue.add({
    id: jobId,
  });
};

module.exports = {
  addJobToQueue,
};
