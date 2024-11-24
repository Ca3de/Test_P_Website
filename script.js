// script.js

// Toggle Navigation Menu on Hamburger Click or Keypress
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

// Load saved theme on page load
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
});

// Scroll to Projects Section when Scroll Indicator is clicked
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
        window.scrollTo({
            top: document.getElementById('projects-page').offsetTop - 70, // Adjust based on nav height
            behavior: 'smooth'
        });
    });
}

// Fetch and display projects from projects.json
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
                codeLines.forEach((line, index) => {
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
