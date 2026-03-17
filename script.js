// Tailwind Configuration
tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                spring: '#6db33f',
                springDark: '#5fa134'
            }
        }
    }
};

    // Lightbox Functionality
    const createLightbox = () => {
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.className = 'fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center opacity-0 pointer-events-none transition-all duration-500 p-4 md:p-8';
        lightbox.innerHTML = `
            <button class="absolute top-6 right-6 text-white text-3xl hover:text-spring transition-colors z-[110] p-2 focus:outline-none">
                <i class="fa-solid fa-xmark"></i>
            </button>
            <div class="relative max-w-5xl max-h-[90vh] flex items-center justify-center transform transition-all duration-500 scale-95 opacity-0">
                <img src="" alt="Lightbox" class="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/20 object-contain" />
                <div class="absolute -bottom-10 left-0 right-0 text-center text-white/50 text-xs font-medium tracking-widest uppercase pointer-events-none">
                    Interactive Preview
                </div>
            </div>
        `;
        document.body.appendChild(lightbox);

        lightbox.addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target === lightbox) {
                closeLightbox();
            }
        });

        return lightbox;
    };

    const lightbox = createLightbox();
    const lightboxImg = lightbox.querySelector('img');
    const lightboxContent = lightbox.querySelector('div:has(img)');

    const openLightbox = (src) => {
        lightboxImg.src = src;
        lightbox.classList.remove('opacity-0', 'pointer-events-none');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            lightboxContent.classList.remove('scale-95', 'opacity-0');
        }, 10);
    };

    const closeLightbox = () => {
        lightboxContent.classList.add('scale-95', 'opacity-0');
        lightbox.classList.add('opacity-0', 'pointer-events-none');
        document.body.style.overflow = '';
    };

    // Attach lightbox listeners to images
    const initLightboxForImages = () => {
        document.querySelectorAll('img:not(.no-lightbox)').forEach(img => {
            if (!img.dataset.lightboxAttached) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => openLightbox(img.src));
                img.dataset.lightboxAttached = 'true';
            }
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        initLightboxForImages();

    // Dark Mode Toggle
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');

    // Check for saved theme preference or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        html.classList.remove('dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            html.classList.toggle('dark');
            if (html.classList.contains('dark')) {
                localStorage.theme = 'dark';
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            } else {
                localStorage.theme = 'light';
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            }
        });
    }

    // Restore sidebar state
    const savedSection = localStorage.getItem('lastSection');
    if (savedSection) {
        showSection(savedSection, false); // Pass false to prevent scroll-to-top on reload if desired, but user said "reading last time"
    }

    const savedSubmenus = JSON.parse(localStorage.getItem('openSubmenus') || '[]');
    // First clear any default 'open' classes if we have a saved state
    if (savedSubmenus.length > 0 || localStorage.getItem('openSubmenus')) {
        document.querySelectorAll('.submenu-container').forEach(el => el.classList.remove('open'));
        document.querySelectorAll('.chevron-icon').forEach(el => el.classList.remove('rotate'));
        
        savedSubmenus.forEach(id => {
            const submenu = document.getElementById(id);
            if (submenu) {
                submenu.classList.add('open');
                const trigger = document.querySelector(`[onclick*="toggleSubMenu('${id}'"]`);
                if (trigger) {
                    const chevron = trigger.querySelector('.chevron-icon');
                    if (chevron) chevron.classList.add('rotate');
                }
            }
        });
    }

    // Load external content
    loadExternalContent('how-it-works', 'how-it-works.html');
    loadExternalContent('microservices', 'microservices.html');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
            sidebar.classList.toggle('hidden');
            sidebar.classList.toggle('absolute');
            sidebar.classList.toggle('z-40');
            sidebar.classList.toggle('bg-white');
            if (html.classList.contains('dark')) {
                sidebar.classList.toggle('dark:bg-slate-900');
            }
        });
    }
});

async function loadExternalContent(containerId, filePath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(filePath);
        if (response.ok) {
            const content = await response.text();
            container.innerHTML = content;
            initLightboxForImages();

            
            // Check if we need to jump to a hash within this loaded content
            if (window.location.hash) {
                const target = container.querySelector(window.location.hash);
                if (target) {
                    target.scrollIntoView();
                }
            }
        } else {
            container.innerHTML = `<p class="text-rose-500">Error loading content: ${response.statusText}</p>`;
        }
    } catch (error) {
        container.innerHTML = `<p class="text-rose-500">Fetch error: ${error.message}</p>`;
    }
}

// Main navigation logic
function showSection(sectionId, shouldScroll = true) {
    localStorage.setItem('lastSection', sectionId);
    
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.remove('active');
    });
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
        if (shouldScroll) {
            const main = document.querySelector('main');
            if (main) main.scrollTop = 0;
        }
    }

    // Update active state in sidebar
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick')?.includes(`showSection('${sectionId}')`)) {
            item.classList.add('active');
        }
    });

    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth < 768 && sidebar) {
        sidebar.classList.add('-translate-x-full', 'hidden');
    }
}

// Sub-menu toggle logic
function toggleSubMenu(submenuId, button) {
    const submenu = document.getElementById(submenuId);
    if (submenu) {
        const chevron = button.querySelector('.chevron-icon');
        
        submenu.classList.toggle('open');
        if (chevron) {
            chevron.classList.toggle('rotate');
        }
        
        // Save state
        const openSubmenus = Array.from(document.querySelectorAll('.submenu-container.open'))
            .map(el => el.id);
        localStorage.setItem('openSubmenus', JSON.stringify(openSubmenus));
    }
}
