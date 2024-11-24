const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, 'projects_data');
const outputFile = path.join(__dirname, 'projects.json');

let projects = [];

try {
    const files = fs.readdirSync(projectsDir);

    files.forEach(file => {
        if (path.extname(file) === '.json') {
            const filePath = path.join(projectsDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            try {
                const projectData = JSON.parse(fileContent);

                // Validate required fields
                const requiredFields = ['title', 'description', 'link', 'main_file', 'files', 'language'];
                const hasAllFields = requiredFields.every(field => field in projectData);

                if (hasAllFields) {
                    projects.push(projectData);
                } else {
                    console.warn(`Skipping ${file}: Missing required fields.`);
                }
            } catch (parseError) {
                console.error(`Error parsing ${file}:`, parseError);
            }
        }
    });

    // Write to projects.json
    const output = { projects };
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 4));
    console.log('projects.json has been updated.');
} catch (err) {
    console.error('Error processing projects:', err);
    process.exit(1);  // Exit with failure
}
