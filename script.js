// script.js

// =========================
// Common Functionalities
// =========================

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');

// Function to toggle theme
function toggleTheme() {
    // Create the expanding circle
    const circle = document.createElement('span');
    circle.classList.add('theme-transition-circle');
    body.appendChild(circle);

    // Toggle the light mode
    body.classList.toggle('light-mode');
    body.classList.toggle('dark-mode'); // Ensure to toggle both classes

    // Update theme icon
    if (body.classList.contains('light-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
    }

    // Remove the circle after animation
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
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        body.classList.add('dark-mode'); // Default to dark mode if not set
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
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
                            <span class="tab active">Project</span>
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
            Prism.highlightAll();
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

    // Initialize CodeMirror Editors
    const jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {
        lineNumbers: true,
        mode: "javascript",
        theme: "dracula",
        viewportMargin: Infinity
    });

    const pyEditor = CodeMirror.fromTextArea(document.getElementById('py-code'), {
        lineNumbers: true,
        mode: "python",
        theme: "dracula",
        viewportMargin: Infinity
    });

    // Language Selection Tabs
    const languageTabs = document.querySelectorAll('.lang-tab');

    languageTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            languageTabs.forEach(t => t.classList.remove('active'));
            // Add active class to the clicked tab
            tab.classList.add('active');

            // Show corresponding runner section
            const selectedLanguage = tab.textContent.toLowerCase();
            document.querySelectorAll('.runner-section').forEach(section => {
                if (section.id === `runner-${selectedLanguage}`) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });
    });

    // Real-Time Code Execution with Debounce
    let jsTimeout, pyTimeout;

    jsEditor.on("change", () => {
        clearTimeout(jsTimeout);
        jsTimeout = setTimeout(runJavaScript, 500); // Runs after 500ms of inactivity
    });

    pyEditor.on("change", () => {
        clearTimeout(pyTimeout);
        pyTimeout = setTimeout(runPython, 500); // Runs after 500ms of inactivity
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

    // JavaScript Runner Function with Enhanced Error Handling
    function runJavaScript() {
        const code = jsEditor.getValue();
        const iframe = document.getElementById('js-output-frame');
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
        if (!pyodideReady) {
            alert("Loading Python environment, please wait...");
            return;
        }
        const code = pyEditor.getValue();
        const output = document.getElementById('py-output');
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

    // Save code on editor changes
    jsEditor.on("change", () => {
        saveCode(jsEditor, 'js-code');
    });

    pyEditor.on("change", () => {
        saveCode(pyEditor, 'py-code');
    });

    // Load code on initialization
    loadCode(jsEditor, 'js-code');
    loadCode(pyEditor, 'py-code');
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
