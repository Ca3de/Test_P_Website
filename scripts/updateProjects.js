// scripts/updateProjects.js

const fs = require('fs');
const path = require('path');

const descriptionsPath = path.join(__dirname, '..', 'descriptions.txt');
const projectsFolder = path.join(__dirname, '..', 'projects');
const projectsJsonPath = path.join(__dirname, '..', 'projects.json');

// Function to parse descriptions.txt
function parseDescriptions() {
    const data = fs.readFileSync(descriptionsPath, 'utf-8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const projects = [];

    lines.forEach(line => {
        // Regex to parse each line
        const regex = /^\d+\.\s+(.+?):\s+"(.+?)";\s+(.+)$/;
        const match = line.match(regex);
        if (match) {
            const [_, fileName, description, link] = match;
            projects.push({ fileName, description, link });
        }
    });

    return projects;
}

// Function to scan projects folder
function scanProjectsFolder() {
    const files = fs.readdirSync(projectsFolder);
    return files.filter(file => {
        // Consider only .py, .js, .java files for this example
        return file.endsWith('.py') || file.endsWith('.js') || file.endsWith('.java');
    });
}

// Function to generate projects.json
function generateProjectsJson(projectsData, projectFiles) {
    const projects = [];

    projectsData.forEach(item => {
        if (projectFiles.includes(item.fileName)) {
            const filePath = path.join(projectsFolder, item.fileName);
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            const language = path.extname(item.fileName).substring(1); // 'py', 'js', 'java'

            projects.push({
                title: item.fileName,
                description: item.description,
                link: item.link,
                main_file: item.fileName,
                files: {
                    [item.fileName]: fileContent
                },
                language: language === 'py' ? 'python' : (language === 'js' ? 'javascript' : language)
            });
        }
    });

    fs.writeFileSync(projectsJsonPath, JSON.stringify({ projects }, null, 4));
    console.log('projects.json has been updated.');
}

// Main Execution
const descriptions = parseDescriptions();
const projectFiles = scanProjectsFolder();
generateProjectsJson(descriptions, projectFiles);
