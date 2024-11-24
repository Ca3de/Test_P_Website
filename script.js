// Toggle Navigation Menu on Hamburger Click
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Toggle ARIA attribute for accessibility
    const expanded = hamburger.getAttribute('aria-expanded') === 'true' || false;
    hamburger.setAttribute('aria-expanded', !expanded);
});

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const themeIcon = themeToggle.querySelector('i');

// Initialize AOS
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
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

// Theme Toggle Event Listener
themeToggle.addEventListener('click', () => {
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
            if (project.files && project.main_file && project.files[project.main_file]) {
                const codeLines = project.files[project.main_file].split('\n');
                codeLines.forEach((line, index) => {
                    codeContent += `<span class="code-line" data-aos="fade-up" data-aos-delay="${index * 100}">${escapeHtml(line)}</span>\n`;
                });
            } else {
                codeContent = `<span class="code-line">No code available.</span>`;
            }

            // Handle project image if available
            const projectImage = project.image ? `<img src="${project.image}" alt="${escapeHtml(project.title)} Image" class="project-image" data-aos="fade-up">` : '';

            projectCard.innerHTML = `
                ${projectImage}
                <div class="project-code" data-aos="fade-up">
                    <pre><code class="language-${project.language}">
${codeContent.trim()}
                    </code></pre>
                </div>
                <div class="project-description" data-aos="fade-up" data-aos-delay="${codeContent.split('\n').length * 100}">
                    <h3>${escapeHtml(project.title)}</h3>
                    <p>${escapeHtml(project.description)}</p>
                    <a href="${project.link}" class="btn" target="_blank" rel="noopener noreferrer">View Project</a>
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
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
