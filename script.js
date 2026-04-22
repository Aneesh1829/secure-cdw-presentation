document.addEventListener('DOMContentLoaded', () => {
    // Custom Cursor Glow Effect
    const cursorGlow = document.getElementById('cursor-glow');
    
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    // Interactive element hover effect for cursor
    const interactiveElements = document.querySelectorAll('a, .glass');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorGlow.style.background = 'radial-gradient(circle, var(--glow-purple) 0%, transparent 70%)';
            cursorGlow.style.transform = 'translate(-50%, -50%) scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorGlow.style.background = 'radial-gradient(circle, var(--glow-cyan) 0%, transparent 70%)';
            cursorGlow.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    });

    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    
    // Trigger once on load
    revealOnScroll();

    // Glitch Text Effect
    const glitchText = document.querySelector('.glitch');
    
    setInterval(() => {
        if(Math.random() > 0.95) {
            glitchText.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
            glitchText.style.textShadow = `
                ${Math.random() * 10 - 5}px 0 rgba(0, 240, 255, 0.5),
                ${Math.random() * 10 - 5}px 0 rgba(138, 43, 226, 0.5)
            `;
            
            setTimeout(() => {
                glitchText.style.transform = 'translate(0, 0)';
                glitchText.style.textShadow = 'none';
            }, 100);
        }
    }, 100);
});
