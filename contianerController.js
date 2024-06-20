const { exec } = require('child_process');
const path = require('path')


const details = {
    'cpp': {
        compilerCmd: id => `g++ ./codeFiles/${id}.cpp -o ./codeFiles/${id}.out`,
        executorCmd: id => `./codeFiles/${id}.out`,
    },
};

const createContainer = async ({ image }) => {
    const codeDirectory = path.join(__dirname, "code");
    return new Promise((resolve, reject) => {
        exec(`docker run -i -d --rm --mount type=bind,src="${codeDirectory}",dst=/codeFiles ${image}`, (error, stdout, stderr) => {
            if (error || stderr) {
                reject(error || stderr);
            } else {
                const containerId = `${stdout}`.trim();
                resolve(containerId);
            }
        });
    });
}

const compile = (containerId, filename, language) => {
    const id = filename.split(".")[0];
    const command = details[language].compilerCmd ? details[language].compilerCmd(id) : null;
    return new Promise((resolve, reject) => {
        if (!command) return resolve(filename);
        exec(`docker exec ${containerId} ${command}`, (error, stdout, stderr) => {
            if (error || stderr) {
                // reject(error || stderr)
                reject(stderr)
            }
            resolve(id);
        });
    });
}

const execute = (containerId, filename, language) => {
    const id = filename.split(".")[0];
    const command = details[language].executorCmd ? details[language].executorCmd(id) : null;
    return new Promise((resolve, reject) => {
        if (!command) return resolve(filename);
        exec(`docker exec ${containerId} ${command}`, (error, stdout, stderr) => {
            if (error || stderr) {
                reject(error || stderr)
            }
            resolve(stdout.trim());
        });
    });
}

const killContainer = container_id_name => {
    return new Promise((resolve) => {
        exec(`docker kill ${container_id_name}`, (error, stdout, stderr) => {
            resolve(container_id_name);
        });
    });
}

module.exports = {
    details,
    killContainer,
    execute,
    compile,
    createContainer
}