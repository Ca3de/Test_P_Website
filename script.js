// Toggle Navigation Menu on Hamburger Click
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    // Create the expanding circle
    const circle = document.createElement('span');
    circle.classList.add('theme-transition-circle');
    body.appendChild(circle);

    // Toggle the light mode
    body.classList.toggle('light-mode');
    body.classList.toggle('dark-mode'); // Ensure to toggle both classes

    // Save the theme preference
    if (body.classList.contains('light-mode')) {
        localStorage.setItem('theme', 'light');
    } else {
        localStorage.setItem('theme', 'dark');
    }

    // Remove the circle after animation
    circle.addEventListener('animationend', () => {
        circle.remove();
    });
});

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
    } else {
        body.classList.add('dark-mode'); // Default to dark mode if not set
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
    .then(response => response.json())
    .then(data => {
        const projectsContainer = document.getElementById('projects-container');
        data.projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.classList.add('project-card');
            projectCard.setAttribute('data-aos', 'fade-up');

            // Construct code lines with animation
            let codeContent = '';
            const codeLines = project.files[project.main_file].split('\n');
            codeLines.forEach((line, index) => {
                codeContent += `<span class="code-line" data-aos="fade-up" data-aos-delay="${index * 100}">${escapeHtml(line)}</span>\n`;
            });

            projectCard.innerHTML = `
                <div class="project-code" data-aos="fade-up">
                    <pre><code class="language-${project.language}">
${codeContent.trim()}
                    </code></pre>
                </div>
                <div class="project-description" data-aos="fade-up" data-aos-delay="${codeLines.length * 100}">
                    <p>${project.description}</p>
                    <a href="${project.link}" class="btn" target="_blank">View Project</a>
                </div>
            `;
            projectsContainer.appendChild(projectCard);
        });
        // After adding all projects, highlight the code
        Prism.highlightAll();
    })
    .catch(error => console.error('Error loading projects:', error));

// Function to escape HTML to prevent rendering issues
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
