// script.js

// =========================
// Common Functionalities
// =========================

// Theme Toggle and Theme Selector
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');

// References to CodeMirror instances
let jsEditor, pyEditor;

// Function to dynamically load a CSS file
function loadThemeCSS(themeName) {
    return new Promise((resolve, reject) => {
        const existingLink = document.getElementById(`cm-theme-${themeName}`);
        if (existingLink) {
            // Theme CSS already loaded
            resolve();
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `assets/codemirror/theme/${themeName}.css`; // Ensure correct path
        link.id = `cm-theme-${themeName}`;

        link.onload = () => {
            console.log(`Theme '${themeName}' loaded successfully.`);
            resolve();
        };

        link.onerror = () => {
            console.error(`Failed to load theme '${themeName}'.`);
            reject(new Error(`Failed to load theme '${themeName}'.`));
        };

        document.head.appendChild(link);
    });
}

// Function to apply a theme to CodeMirror editors
async function applyTheme(themeName) {
    try {
        await loadThemeCSS(themeName);
        if (jsEditor) jsEditor.setOption('theme', themeName);
        if (pyEditor) pyEditor.setOption('theme', themeName);
        console.log(`Theme '${themeName}' applied to editors.`);
    } catch (error) {
        console.error(error);
    }
}

// Function to toggle between light and dark themes
function toggleTheme() {
    // Create the expanding circle for visual effect
    const circle = document.createElement('span');
    circle.classList.add('theme-transition-circle');
    body.appendChild(circle);

    // Toggle the light and dark mode classes
    body.classList.toggle('light-mode');
    body.classList.toggle('dark-mode'); // Ensure to toggle both classes

    // Determine the new theme based on the current mode
    const newTheme = body.classList.contains('light-mode') ? 'eclipse' : 'dracula';

    // Update theme icon
    if (body.classList.contains('light-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'eclipse'); // Save the selected theme
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dracula'); // Save the selected theme
    }

    // Apply the new theme to CodeMirror editors
    applyTheme(newTheme);

    // Remove the expanding circle after animation
    circle.addEventListener('animationend', () => {
        circle.remove();
    });
}

// Event listeners for theme toggle
themeToggle.addEventListener('click', toggleTheme);
themeToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
    }
});

// Initialize Theme on Page Load
document.addEventListener('DOMContentLoaded', async () => {
    const savedTheme = localStorage.getItem('theme') || 'dracula'; // Default to 'dracula' if not set

    if (savedTheme === 'eclipse') {
        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }

    // Initialize CodeMirror Editors with the saved theme
    const initialTheme = savedTheme;

    // Apply the saved theme to ensure it's loaded
    await applyTheme(initialTheme);

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: false,
            mirror: false
        });
    }

    // Initialize Navigation for Mobile
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    function toggleNav() {
        navLinks.classList.toggle('active');
        // Toggle ARIA attribute for accessibility
        const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
        hamburger.setAttribute('aria-expanded', !expanded);
    }

    hamburger.addEventListener('click', toggleNav);
    hamburger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleNav();
        }
    });
    
    jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {
        lineNumbers: true,
        mode: "javascript",
        theme: initialTheme,
        viewportMargin: Infinity
    });

    pyEditor = CodeMirror.fromTextArea(document.getElementById('py-code'), {
        lineNumbers: true,
        mode: "python",
        theme: initialTheme,
        viewportMargin: Infinity
    });

    // Initialize Code Playground Features
    initializeCodePlayground();
});

// Scroll to Projects Section when Scroll Indicator is clicked (Projects Page Only)
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
        const targetSection = document.getElementById('projects-page');
        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop - 70, // Adjust based on nav height
                behavior: 'smooth'
            });
        }
    });
}

// =========================
// Projects Page Functionalities
// =========================

// Fetch and display projects from projects.json (Projects Page Only)
if (document.getElementById('projects-container')) {
    fetch('projects.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const projectsContainer = document.getElementById('projects-container');
            data.projects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.classList.add('project-card');
                projectCard.setAttribute('data-aos', 'fade-up');

                // Construct code lines with animation
                let codeContent = '';
                if (project.files && project.main_file && project.files[project.main_file]) {
                    const codeLines = project.files[project.main_file].split('\n');
                    codeLines.forEach((line) => {
                        codeContent += `<span class="code-line">${escapeHtml(line)}</span>\n`;
                    });
                } else {
                    codeContent = `<span class="code-line">No code available.</span>`;
                }

                // Handle project image if available
                const projectImage = project.image ? `<img src="${project.image}" alt="${escapeHtml(project.title)} Image" class="project-image" loading="lazy" data-aos="fade-up">` : '';

                // Create the inner HTML of the project card
                projectCard.innerHTML = `
                    <div class="atom-header">
                        <div class="tabs">
                            <span class="tab active">${escapeHtml(project.title)}</span>
                            <span class="tab">File</span>
                            <span class="tab">Edit</span>
                        </div>
                        <div class="window-controls">
                            <span class="control close"></span>
                            <span class="control minimize"></span>
                            <span class="control maximize"></span>
                        </div>
                    </div>
                    <div class="atom-content">
                        ${projectImage}
                        <pre><code class="language-${project.language}">
${codeContent.trim()}
                        </code></pre>
                    </div>
                    <div class="atom-footer">
                        <span>Project Loaded</span>
                    </div>
                    <div class="project-description" data-aos="fade-up">
                        <h3>${escapeHtml(project.title)}</h3>
                        <p>${escapeHtml(project.description)}</p>
                        <a href="${project.link}" class="btn" target="_blank" rel="noopener noreferrer">View Project</a>
                    </div>
                `;
                projectsContainer.appendChild(projectCard);

                // Animate code lines after appending to DOM
                const codeElement = projectCard.querySelector('code');
                animateCodeLines(codeElement);
            });
            // After adding all projects, highlight the code
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }
        })
        .catch(error => {
            const projectsContainer = document.getElementById('projects-container');
            projectsContainer.innerHTML = `<p class="error">Failed to load projects. Please try again later.</p>`;
            console.error('Error loading projects:', error);
        });
}

// =========================
// Code Playground Functionalities
// =========================

function initializeCodePlayground() {
    // Check if the current page is Code Playground
    const codePlaygroundSection = document.getElementById('code-playground');
    if (!codePlaygroundSection) return;

    // Theme Selector Setup
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.value = localStorage.getItem('theme') || 'dracula'; // Set the selector to the saved theme

        themeSelect.addEventListener('change', (event) => {
            const selectedTheme = event.target.value;
            localStorage.setItem('theme', selectedTheme);
            applyTheme(selectedTheme);
        });
    }

    // Language Selection Tabs
    const langJsBtn = document.getElementById('lang-js');
    const langPyBtn = document.getElementById('lang-py');

    langJsBtn.addEventListener('click', () => {
        // Remove active class from all tabs
        langJsBtn.classList.add('active');
        langPyBtn.classList.remove('active');

        // Show JavaScript runner and hide Python runner
        document.getElementById('runner-javascript').style.display = 'block';
        document.getElementById('runner-python').style.display = 'none';
    });

    langPyBtn.addEventListener('click', () => {
        // Remove active class from all tabs
        langPyBtn.classList.add('active');
        langJsBtn.classList.remove('active');

        // Show Python runner and hide JavaScript runner
        document.getElementById('runner-python').style.display = 'block';
        document.getElementById('runner-javascript').style.display = 'none';
    });

    // JavaScript Runner Button
    const runJsBtn = document.getElementById('run-js-btn');
    if (runJsBtn) {
        runJsBtn.addEventListener('click', runJavaScript);
    }

    // Python Runner Button
    const runPyBtn = document.getElementById('run-py-btn');
    if (runPyBtn) {
        runPyBtn.addEventListener('click', runPython);
    }

    // Real-Time Code Execution with Debounce (Optional)
    /*
    let jsTimeout, pyTimeout;

    jsEditor.on("change", () => {
        clearTimeout(jsTimeout);
        jsTimeout = setTimeout(runJavaScript, 500); // Runs after 500ms of inactivity
    });

    pyEditor.on("change", () => {
        clearTimeout(pyTimeout);
        pyTimeout = setTimeout(runPython, 500); // Runs after 500ms of inactivity
    });
    */
}

// =========================
// Utility Functions
// =========================

// Function to escape HTML to prevent rendering issues
function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Function to animate code lines
function animateCodeLines(codeElement) {
    const lines = codeElement.querySelectorAll('.code-line');
    lines.forEach((line, index) => {
        setTimeout(() => {
            line.classList.add('visible');
        }, index * 100); // Adjust delay as needed
    });
}

// JavaScript Runner Function with Enhanced Error Handling
function runJavaScript() {
    const code = jsEditor.getValue();
    const iframe = document.getElementById('js-output-frame');

    if (!iframe) {
        console.error("Iframe with ID 'js-output-frame' not found.");
        return;
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    // Clear previous content
    iframeDoc.open();
    iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head><title>JavaScript Output</title></head>
        <body>
            <pre id="output" style="background-color: #1e1e1e; color: #abb2bf; padding: 10px; border-radius: 5px;"></pre>
            <script>
                (function() {
                    const output = document.getElementById('output');
                    const originalConsoleLog = console.log;
                    console.log = function(message) {
                        output.textContent += message + '\\n';
                        originalConsoleLog.apply(console, arguments);
                    };
                    try {
                        ${code}
                    } catch (error) {
                        output.textContent = 'Error: ' + error.message;
                    }
                })();
            <\/script>
        </body>
        </html>
    `);
    iframeDoc.close();
}

// Initialize Pyodide for Python Execution
let pyodideReady = false;
let pyodide = null;

async function loadPyodideAndPackages() {
    try {
        pyodide = await loadPyodide();
        pyodideReady = true;
        console.log("Pyodide loaded successfully.");
    } catch (error) {
        console.error("Failed to load Pyodide:", error);
    }
}

loadPyodideAndPackages();

// Python Runner Function with Enhanced Error Handling
async function runPython() {
    const output = document.getElementById('py-output');
    if (!output) {
        console.error("Element with ID 'py-output' not found.");
        return;
    }

    if (!pyodideReady) {
        alert("Loading Python environment, please wait...");
        await loadPyodideAndPackages();
        if (!pyodideReady) {
            alert("Failed to load Python environment.");
            return;
        }
    }

    const code = pyEditor.getValue();
    output.textContent = ''; // Clear previous output

    try {
        // Redirect print to capture output
        pyodide.globals.set("print", (text) => {
            output.textContent += text + '\n';
        });
        await pyodide.runPythonAsync(code);
    } catch (error) {
        output.textContent = `Error: ${error.message}`;
    }
}

// Persisting User Code with localStorage
// Save Code Function
function saveCode(editorInstance, key) {
    const code = editorInstance.getValue();
    localStorage.setItem(key, code);
}

// Load Code Function
function loadCode(editorInstance, key) {
    const code = localStorage.getItem(key);
    if (code) {
        editorInstance.setValue(code);
    }
}

// Save code on editor changes (Optional)
/*
jsEditor.on("change", () => {
    saveCode(jsEditor, 'js-code');
});

pyEditor.on("change", () => {
    saveCode(pyEditor, 'py-code');
});
*/

// Load code on initialization
function loadSavedCode() {
    loadCode(jsEditor, 'js-code');
    loadCode(pyEditor, 'py-code');
}

document.addEventListener('DOMContentLoaded', () => {
    // Load saved code after initializing CodeMirror editors
    loadSavedCode();
});