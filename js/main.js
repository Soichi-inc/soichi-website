// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // Hero Section Animation
    const heroTimeline = gsap.timeline();
    heroTimeline.from('.hero-title', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.2
    })
        .from('.hero-subtitle', {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.8');

    // GSAP Animations for GO Inc Style

    // Hero Text Reveal (Staggered)
    const heroText = document.querySelectorAll('.hero-title span');
    if (heroText.length > 0) {
        gsap.to(heroText, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.1,
            ease: "power4.out",
            delay: 0.5
        });
    }

    // Section Title Reveal
    const sectionTitles = document.querySelectorAll('.section-title span');
    sectionTitles.forEach(title => {
        gsap.to(title, {
            scrollTrigger: {
                trigger: title,
                start: "top 80%",
            },
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out"
        });
    });

    // Content Fade Up
    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => {
        gsap.fromTo(el,
            { y: 50, opacity: 0 },
            {
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                },
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power2.out"
            }
        );
    });

    // Parallax for Images
    const parallaxImages = document.querySelectorAll('.parallax-img');
    parallaxImages.forEach(img => {
        gsap.to(img, {
            scrollTrigger: {
                trigger: img,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            },
            y: -50,
            ease: "none"
        });
    });

});
