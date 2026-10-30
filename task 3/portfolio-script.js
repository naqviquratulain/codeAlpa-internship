/**
 * TASK 3: Portfolio Script
 * Adds active class to navbar links based on scroll position
 */

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        // Check if we are currently inside this section
        if (scrollY >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
            link.style.color = 'var(--primary)'; // Highlight active link
        } else {
            link.style.color = ''; // Reset others
        }
    });
});