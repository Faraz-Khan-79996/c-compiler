const { exec } = require('child_process');

// // Define the Dockerfile content
// const dockerfileContent = `
// FROM gcc:latest
// WORKDIR /usr/src/app
// COPY hello.cpp .
// CMD ["sh", "-c", "gcc -o app hello.cpp && ./app"]
// `;

// Write the Dockerfile to a file
// const fs = require('fs');
// fs.writeFileSync('Dockerfile', dockerfileContent);

// Build the Docker image
exec('docker build -t my-cpp-app .', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error building Docker image: ${error}`);
    return;
  }
//   console.log(stdout);
//   console.error(stderr);

  // Run the Docker container
  exec('docker run my-cpp-app', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running Docker container: ${error}`);
      return;
    }
    console.log(stdout);
    console.error(stderr);
  });
});
