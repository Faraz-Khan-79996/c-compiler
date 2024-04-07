# Use the official gcc image as the base image
FROM gcc:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the C++ program into the container
COPY hello.cpp .

# Compile the C++ program
RUN g++ -o hello hello.cpp

# Set the command to run when the container starts
CMD ["./hello"]