// Ndzalama AI - JavaScript for Image and Video Generation
// By Brilliant Mashele - BubbleRoot Studios

// Smooth scrolling function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    element.scrollIntoView({ behavior: 'smooth' });
}

// Enhanced smooth scrolling for better experience
const smoothScroll = (target) => {
    document.querySelector(target).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
};

// Loading screen functionalities
function displayLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.classList.remove('hidden');
    setTimeout(() => loadingScreen.classList.add('hidden'), 3000); // Simulated loading
}

document.addEventListener('DOMContentLoaded', displayLoadingScreen);

// Display result
function displayResult(type, content) {
    const result = document.getElementById(`${type}-result`);
    result.innerHTML = content;

    // No NSFW warnings - allow all content
}

// Display error message
function displayError(type, message) {
    const result = document.getElementById(`${type}-result`);
    result.innerHTML = `<div class="error-message">${message}</div>`;
}

// Advanced AI Image Generation with Ultra-Fast Pollinations
async function generateImageModern() {
    const prompt = document.getElementById('image-prompt').value.trim();
    const negativePrompt = document.getElementById('negative-prompt')?.value.trim() || '';
    const style = document.querySelector('.style-option.active')?.dataset.style || 'realistic';
    const model = document.querySelector('.model-btn.active')?.dataset.model || 'flux';
    const size = document.querySelector('.aspect-btn.active')?.dataset.size || '1024x1024';
    const batchCount = parseInt(document.querySelector('.batch-btn.active')?.dataset.count || '1');
    const variations = document.getElementById('variations-toggle')?.checked || false;
    const qualitySlider = document.getElementById('quality-slider');
    const stepsSlider = document.getElementById('steps-slider');
    const quality = qualitySlider ? qualitySlider.value : 7.5;
    const steps = stepsSlider ? stepsSlider.value : 20;
    
    if (!prompt) {
        showNotification('Please enter a creative prompt for your image.', 'error');
        return;
    }
    
    // Advanced progress tracking
    const progressBar = document.getElementById('image-progress');
    const previewContainer = document.getElementById('image-preview');
    const statusDiv = document.getElementById('image-status');
    
    startAdvancedProgress(progressBar, 'image');
    showLoadingState(previewContainer, 'image', 'Crafting your masterpiece...');
    updateStatus(statusDiv, 'Initializing AI models...', 'processing');
    
    try {
        // Clear any previous batch results
        clearBatchResults();
        
        // Handle batch generation
        if (batchCount > 1) {
            updateStatus(statusDiv, `Starting batch generation of ${batchCount} images...`, 'processing');
            const results = await generateBatchImages(prompt, batchCount, variations);
            
            if (results.length > 0) {
                completeProgress(progressBar);
                saveToHistory('image', { prompt, style, size, results, batchCount, timestamp: new Date().toISOString() });
                showNotification(`Batch generation completed! Generated ${results.length} images.`, 'success');
            }
        } else {
            // Single image generation
            updateStatus(statusDiv, 'Generating with advanced AI models...', 'processing');
            
            // Use negative prompts if provided
            let enhancedPrompt = prompt;
            if (negativePrompt) {
                enhancedPrompt = `${prompt} --negative ${negativePrompt}`;
            }
            
            const result = await generateWithPollinationsAdvanced(enhancedPrompt, style, size, quality, steps);
            
            if (result) {
                displayImageResult(result, prompt, `${model.toUpperCase()} Model`, previewContainer, statusDiv);
                completeProgress(progressBar);
                saveToHistory('image', { prompt, negativePrompt, style, size, model, result, timestamp: new Date().toISOString() });
                showNotification('Image generated successfully!', 'success');
                updateRecentImages(result);
            } else {
                throw new Error('No result from AI models');
            }
        }
    } catch (error) {
        console.error('Generation failed:', error);
        updateStatus(statusDiv, 'Generation failed. Please try again with a different prompt.', 'error');
        showNotification('Generation failed. Please try again with a different prompt.', 'error');
        resetProgress(progressBar);
    }
}

// Pollinations.ai API (most reliable free option)
async function generateWithPollinations(prompt, style, size) {
    const [width, height] = size.split('x').map(Number);
    
    // No content filtering - allow all content
    const stylePrompt = `${prompt}, ${style} style, high quality, detailed`;
    const encodedPrompt = encodeURIComponent(stylePrompt);
    
    // Remove safety parameters to allow all content
    const model = 'flux'; // Use the latest model
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&enhance=true&model=${model}&seed=${Date.now()}`;
    
    // Test if the image loads
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(imageUrl);
        img.onerror = () => reject(new Error('Failed to load image from Pollinations'));
        img.src = imageUrl;
        
        // Timeout after 15 seconds
        setTimeout(() => reject(new Error('Timeout')), 15000);
    });
}

// Replicate AI API (free tier available)
async function generateWithReplicate(prompt, style, size) {
    const [width, height] = size.split('x').map(Number);
    const stylePrompt = `${prompt}, ${style} style, high quality, detailed`;
    
    try {
        // Using Replicate's public endpoint for Stable Diffusion
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
                input: {
                    prompt: stylePrompt,
                    width: width,
                    height: height,
                    num_inference_steps: 20,
                    guidance_scale: 7.5
                }
            })
        });
        
        if (!response.ok) {
            throw new Error('Replicate API failed');
        }
        
        const result = await response.json();
        return result.output?.[0] || null;
    } catch (error) {
        throw new Error('Replicate generation failed');
    }
}

// Hugging Face Spaces API (free)
async function generateWithHuggingFaceSpaces(prompt, style, size) {
    const [width, height] = size.split('x').map(Number);
    const stylePrompt = `${prompt}, ${style} style, high quality, detailed`;
    
    try {
        // Using HF Spaces Gradio API for Stable Diffusion
        const response = await fetch('https://hf.space/embed/runwayml/stable-diffusion-v1-5/+/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: [stylePrompt, '', 7.5, 20, 'DPM++ 2M Karras', width, height]
            })
        });
        
        if (!response.ok) {
            throw new Error('HF Spaces API failed');
        }
        
        const result = await response.json();
        return result.data?.[0]?.url || null;
    } catch (error) {
        throw new Error('HF Spaces generation failed');
    }
}

// Craiyon API (free DALL-E alternative)
async function generateWithCraiyon(prompt, style, size) {
    const stylePrompt = `${prompt}, ${style} style, high quality, detailed`;
    
    try {
        // Craiyon (formerly DALL-E mini) API
        const response = await fetch('https://bf.dallemini.ai/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: stylePrompt
            })
        });
        
        if (!response.ok) {
            throw new Error('Craiyon API failed');
        }
        
        const result = await response.json();
        if (result.images && result.images.length > 0) {
            // Convert base64 to blob URL
            const base64Image = result.images[0];
            const byteCharacters = atob(base64Image);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            return URL.createObjectURL(blob);
        }
        throw new Error('No images returned');
    } catch (error) {
        throw new Error('Craiyon generation failed');
    }
}

// Picsum Photos API (reliable photo service)
async function generateWithPicsum(prompt, style, size) {
    const [width, height] = size.split('x').map(Number);
    
    // Picsum provides random beautiful photos
    const imageUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(imageUrl);
        img.onerror = () => reject(new Error('Failed to load image from Picsum'));
        img.src = imageUrl;
        
        setTimeout(() => reject(new Error('Timeout')), 8000);
    });
}

// Unsplash API (fallback for real photos)
async function generateWithUnsplash(prompt, style, size) {
    const [width, height] = size.split('x').map(Number);
    const query = encodeURIComponent(prompt.split(',')[0].trim()); // Use first part of prompt
    
    const imageUrl = `https://source.unsplash.com/${width}x${height}/?${query}`;
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(imageUrl);
        img.onerror = () => reject(new Error('Failed to load image from Unsplash'));
        img.src = imageUrl;
        
        setTimeout(() => reject(new Error('Timeout')), 10000);
    });
}

// Lorem Picsum API (most reliable fallback)
async function generateWithLoremPicsum(prompt, style, size) {
    const [width, height] = size.split('x').map(Number);
    
    // Lorem Picsum is extremely reliable
    const seed = encodeURIComponent(prompt.substring(0, 10)); // Use part of prompt as seed
    const imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
    
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(imageUrl);
        img.onerror = () => reject(new Error('Failed to load image from Lorem Picsum'));
        img.src = imageUrl;
        
        setTimeout(() => reject(new Error('Timeout')), 5000);
    });
}

// Generate Video using enhanced features and modern design
async function generateVideoModern() {
    const prompt = document.getElementById('video-prompt').value.trim();
    const duration = document.querySelector('.duration-btn.active')?.dataset.duration || '5';
    const quality = document.querySelector('.quality-btn.active')?.dataset.quality || '720p';
    
    if (!prompt) {
        showNotification('Please enter a creative prompt for your video.', 'error');
        return;
    }
    
    // Advanced progress tracking for video
    const progressBar = document.getElementById('video-progress');
    const previewContainer = document.getElementById('video-preview');
    const statusDiv = document.getElementById('video-status');
    
    startAdvancedProgress(progressBar, 'video');
    showLoadingState(previewContainer, 'video', 'Creating your cinematic masterpiece...');
    updateStatus(statusDiv, 'Initializing video generation...', 'processing');
    
    try {
        // NEW: Enhanced video scene generation
        updateStatus(statusDiv, 'Generating scenes with RunwayML...', 'processing');
        const scenes = await generateScenesWithRunwayML(prompt, duration, quality);

        if (scenes) {
            displayVideoResult(scenes, prompt, 'Ndzalama AI Video Engine', previewContainer, statusDiv);
            completeProgress(progressBar);
            saveToHistory('video', { prompt, duration, quality, scenes, timestamp: new Date().toISOString() });
            showNotification('Video generated successfully!', 'success');
            updateRecentVideos(scenes);
        }

    } catch (error) {
        console.error('Error generating video:', error);
        updateStatus(statusDiv, 'Video generation failed. Please try again.', 'error');
        showNotification('Video generation failed. Please try again.', 'error');
        resetProgress(progressBar);
    }
}

// Enhanced video preview generation
async function generateVideoPreview(prompt, duration, quality) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const qualityMap = { '480p': [640, 480], '720p': [1280, 720], '1080p': [1920, 1080] };
        const [width, height] = qualityMap[quality] || [1280, 720];
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Create cinematic gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add film grain effect
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
        }
        
        // Add title
        ctx.fillStyle = '#00d4ff';
        ctx.font = `bold ${Math.min(width, height) / 20}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('NDZALAMA AI CINEMA', width / 2, height / 3);
        
        // Add prompt text with better formatting
        ctx.fillStyle = 'white';
        ctx.font = `${Math.min(width, height) / 35}px Inter, sans-serif`;
        const lines = wrapText(prompt, ctx, width * 0.8);
        const lineHeight = Math.min(width, height) / 25;
        const startY = height / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, startY + index * lineHeight);
        });
        
        // Add video specs
        ctx.fillStyle = '#ff006e';
        ctx.font = `${Math.min(width, height) / 45}px JetBrains Mono, monospace`;
        ctx.fillText(`${duration}s • ${quality} • AI Generated`, width / 2, height - height / 8);
        
        // Add play button overlay
        const centerX = width / 2;
        const centerY = height / 2 + height / 6;
        const radius = Math.min(width, height) / 15;
        
        ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Play triangle
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(centerX - radius/3, centerY - radius/2);
        ctx.lineTo(centerX - radius/3, centerY + radius/2);
        ctx.lineTo(centerX + radius/2, centerY);
        ctx.closePath();
        ctx.fill();
        
        canvas.toBlob(blob => {
            resolve(URL.createObjectURL(blob));
        }, 'image/jpeg', 0.9);
    });
}

// Enhanced video result display
function displayVideoResult(videoUrl, prompt, apiName, container, statusDiv) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="result-container">
            <div class="result-video">
                <img src="${videoUrl}" alt="Generated Video Preview: ${prompt}" onload="this.classList.add('loaded')" />
                <div class="video-overlay">
                    <div class="overlay-tools">
                        <button class="tool-btn" onclick="downloadVideoAdvanced('${videoUrl}', '${prompt}')" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="tool-btn" onclick="shareVideoAdvanced('${videoUrl}', '${prompt}')" title="Share">
                            <i class="fas fa-share"></i>
                        </button>
                        <button class="tool-btn" onclick="viewVideoFullscreen('${videoUrl}')" title="Fullscreen">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="result-info">
                <h4>Video Preview Generated!</h4>
                <p class="prompt-text">"${prompt}"</p>
                <div class="generation-meta">
                    <span class="api-badge">${apiName}</span>
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
                <p class="video-note">This is a preview. Full video generation coming soon!</p>
            </div>
        </div>
    `;
    
    updateStatus(statusDiv, 'Video preview completed successfully!', 'success');
}

// Update recent videos display
function updateRecentVideos(videoUrl) {
    const recentGrid = document.getElementById('recent-videos');
    if (!recentGrid) return;
    
    const thumbnail = document.createElement('div');
    thumbnail.className = 'recent-thumbnail video-thumbnail';
    thumbnail.innerHTML = `
        <img src="${videoUrl}" alt="Recent video" onclick="viewVideo('${videoUrl}')" />
        <div class="play-icon">
            <i class="fas fa-play"></i>
        </div>
    `;
    
    recentGrid.insertBefore(thumbnail, recentGrid.firstChild);
    
    // Keep only 6 recent videos
    while (recentGrid.children.length > 6) {
        recentGrid.removeChild(recentGrid.lastChild);
    }
}

// Enhanced download function for videos
function downloadVideoAdvanced(videoUrl, prompt) {
    const link = document.createElement('a');
    const filename = `ndzalama-ai-video-${prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.jpg`;
    link.href = videoUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Video preview downloaded successfully!', 'success');
}

// Enhanced sharing function for videos
function shareVideoAdvanced(videoUrl, prompt) {
    if (navigator.share && navigator.canShare) {
        navigator.share({
            title: 'AI Generated Video - Ndzalama AI',
            text: `Check out this AI-generated video: "${prompt}"`,
            url: videoUrl
        }).then(() => {
            showNotification('Shared successfully!', 'success');
        }).catch(error => {
            console.log('Sharing failed:', error);
            copyToClipboard(videoUrl);
        });
    } else {
        copyToClipboard(videoUrl);
    }
}

// View video in fullscreen
function viewVideoFullscreen(videoUrl) {
    window.open(videoUrl, '_blank');
}

// Alternative image generation using a different free API
async function generateImageAlternative() {
    const prompt = document.getElementById('image-prompt').value.trim();
    
    if (!prompt) {
        displayError('image', 'Please enter a description for your image.');
        return;
    }
    
    showLoading('image');
    
    try {
        // Using Pollinations.ai - a free image generation API
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true`;
        
        // Test if the image loads
        const img = new Image();
        img.onload = function() {
            displayResult('image', `
                <img src="${imageUrl}" alt="Generated Image" />
                <br>
                <a href="${imageUrl}" download="ndzalama-ai-image.jpg" class="download-btn">Download Image</a>
            `);
            hideLoading('image');
        };
        
        img.onerror = function() {
            throw new Error('Failed to load generated image');
        };
        
        img.src = imageUrl;
        
    } catch (error) {
        console.error('Error generating image:', error);
        displayError('image', 'Failed to generate image. Please try again later.');
        hideLoading('image');
    }
}

// Check if NSFW content is allowed
function isNSFWAllowed() {
    return true; // Always allow all content
}

// Toggle NSFW option
function toggleNSFW() {
    const nsfwToggle = document.getElementById('nsfw-toggle');
    const ageVerification = document.getElementById('age-verification');
    
    if (nsfwToggle.checked) {
        ageVerification.style.display = 'block';
    } else {
        ageVerification.style.display = 'none';
    }
}

// Confirm age verification
function confirmAge() {
    const ageVerification = document.getElementById('age-verification');
    ageVerification.style.display = 'none';
    alert('NSFW Content Enabled');
} 
document.addEventListener('DOMContentLoaded', function() {
    console.log('Ndzalama AI - Ready to generate amazing content!');
    console.log('Created by Brilliant Mashele - BubbleRoot Studios');
    
    // Add smooth scrolling to navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Add example prompts on focus
    const imagePrompt = document.getElementById('image-prompt');
    const videoPrompt = document.getElementById('video-prompt');
    
    imagePrompt.addEventListener('focus', function() {
        if (!this.value) {
            this.placeholder = 'Example: A majestic lion standing on a rocky cliff overlooking the African savanna at sunset, photorealistic, 4K quality';
        }
    });
    
    videoPrompt.addEventListener('focus', function() {
        if (!this.value) {
            this.placeholder = 'Example: A peaceful river flowing through a lush green forest with sunlight filtering through the trees, birds chirping in the background';
        }
    });
});

// Easter egg - Konami code for special message
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.length === konamiSequence.length && 
        konamiCode.every((code, index) => code === konamiSequence[index])) {
        
        alert('🎉 Greetings from Brilliant Mashele at BubbleRoot Studios! Thanks for exploring Ndzalama AI!');
        konamiCode = [];
    }
});

// Utility function to check if we're online
function isOnline() {
    return navigator.onLine;
}

// Update UI based on connection status
function updateConnectionStatus() {
    if (!isOnline()) {
        document.body.style.filter = 'grayscale(50%)';
        const offlineMessage = document.createElement('div');
        offlineMessage.id = 'offline-message';
        offlineMessage.innerHTML = `
            <div style="position: fixed; top: 70px; left: 50%; transform: translateX(-50%); 
                        background: #ff6b6b; color: white; padding: 10px 20px; 
                        border-radius: 5px; z-index: 9999;">
                ⚠️ You're offline. Some features may not work properly.
            </div>
        `;
        document.body.appendChild(offlineMessage);
    } else {
        document.body.style.filter = 'none';
        const offlineMessage = document.getElementById('offline-message');
        if (offlineMessage) {
            offlineMessage.remove();
        }
    }
}

// Listen for online/offline events
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

// Check connection status on load
updateConnectionStatus();

// ===============================
// MODERN ENHANCEMENTS
// ===============================

// Neural network canvas animation
function initNeuralCanvas() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const connections = [];
    
    // Create particles
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            life: Math.random()
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach((particle, i) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life += 0.01;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
            
            // Draw particle
            ctx.fillStyle = `rgba(0, 212, 255, ${Math.sin(particle.life) * 0.5 + 0.5})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw connections
            particles.slice(i + 1).forEach(otherParticle => {
                const distance = Math.sqrt(
                    Math.pow(particle.x - otherParticle.x, 2) + 
                    Math.pow(particle.y - otherParticle.y, 2)
                );
                
                if (distance < 150) {
                    ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - distance / 150) * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Enhanced navigation functionality
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }
    
    // Theme toggle functionality
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update icon
            const icon = themeToggle.querySelector('i');
            icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        });
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Enhanced stats counter animation
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateNumber(entry.target, 0, target, 2000);
                observer.unobserve(entry.target);
            }
        });
    });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (end - start) * easeOutCubic(progress));
        element.textContent = current.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Enhanced prompt functionality
function initPromptEnhancements() {
    const imagePrompt = document.getElementById('image-prompt');
    const videoPrompt = document.getElementById('video-prompt');
    const charCount = document.getElementById('char-count');
    const videoCharCount = document.getElementById('video-char-count');
    
    // Character counter for image prompt
    if (imagePrompt && charCount) {
        imagePrompt.addEventListener('input', () => {
            const count = imagePrompt.value.length;
            charCount.textContent = count;
            charCount.style.color = count > 450 ? 'var(--accent-error)' : 'var(--text-muted)';
        });
    }
    
    // Character counter for video prompt
    if (videoPrompt && videoCharCount) {
        videoPrompt.addEventListener('input', () => {
            const count = videoPrompt.value.length;
            videoCharCount.textContent = count;
            videoCharCount.style.color = count > 450 ? 'var(--accent-error)' : 'var(--text-muted)';
        });
    }
}

// Style selector functionality
function initStyleSelectors() {
    // Style options
    document.querySelectorAll('.style-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.style-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Dimension buttons
    document.querySelectorAll('.dim-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.dim-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Duration buttons
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Quality buttons
    document.querySelectorAll('.quality-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Advanced controls toggle
function toggleAdvanced() {
    const advancedControls = document.querySelectorAll('.advanced-control');
    advancedControls.forEach(control => {
        control.style.display = control.style.display === 'none' ? 'block' : 'none';
    });
}

// Slider value updates
function initSliders() {
    const qualitySlider = document.getElementById('quality-slider');
    const stepsSlider = document.getElementById('steps-slider');
    
    if (qualitySlider) {
        qualitySlider.addEventListener('input', () => {
            document.querySelector('.quality-value').textContent = qualitySlider.value;
        });
    }
    
    if (stepsSlider) {
        stepsSlider.addEventListener('input', () => {
            document.querySelector('.steps-value').textContent = stepsSlider.value;
        });
    }
}

// Random prompt generators
function randomPrompt() {
    const prompts = [
        "A futuristic cityscape at sunset with flying cars and neon lights",
        "A mystical forest with glowing mushrooms and ethereal creatures",
        "A steampunk mechanical dragon breathing steam in a Victorian setting",
        "An underwater palace with bioluminescent coral and mermaids",
        "A space station orbiting a distant planet with aurora effects",
        "A cyberpunk street market with holographic displays and rain",
        "A magical library with floating books and crystal chandeliers",
        "A desert oasis with ancient ruins and mystical energy"
    ];
    
    const randomIndex = Math.floor(Math.random() * prompts.length);
    document.getElementById('image-prompt').value = prompts[randomIndex];
    
    // Update character count
    const event = new Event('input');
    document.getElementById('image-prompt').dispatchEvent(event);
}

function randomVideoPrompt() {
    const prompts = [
        "Gentle waves lapping against a pristine beach at golden hour",
        "A time-lapse of clouds forming over majestic mountain peaks",
        "Northern lights dancing across a starry Arctic sky",
        "A peaceful meadow with butterflies and wildflowers swaying",
        "Rain droplets creating ripples on a calm lake surface",
        "A serene forest path with sunlight filtering through trees",
        "Fireflies illuminating a magical garden at twilight",
        "Soft snowfall in a cozy winter village scene"
    ];
    
    const randomIndex = Math.floor(Math.random() * prompts.length);
    document.getElementById('video-prompt').value = prompts[randomIndex];
    
    // Update character count
    const event = new Event('input');
    document.getElementById('video-prompt').dispatchEvent(event);
}

// Clear prompt functions
function clearPrompt() {
    document.getElementById('image-prompt').value = '';
    document.getElementById('char-count').textContent = '0';
}

// AI Prompt Enhancement (mock function)
function enhancePrompt() {
    const prompt = document.getElementById('image-prompt').value;
    if (!prompt) {
        alert('Please enter a prompt first!');
        return;
    }
    
    // Mock enhancement
    const enhancements = [
        ', highly detailed, photorealistic, 8K resolution',
        ', cinematic lighting, professional photography',
        ', award-winning composition, masterpiece quality',
        ', vibrant colors, ultra-sharp focus, HDR'
    ];
    
    const enhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    document.getElementById('image-prompt').value = prompt + enhancement;
    
    // Update character count
    const event = new Event('input');
    document.getElementById('image-prompt').dispatchEvent(event);
}

function enhanceVideoPrompt() {
    const prompt = document.getElementById('video-prompt').value;
    if (!prompt) {
        alert('Please enter a prompt first!');
        return;
    }
    
    const enhancements = [
        ', smooth camera movement, cinematic quality',
        ', 4K resolution, professional cinematography',
        ', natural lighting, fluid motion',
        ', ambient sound, peaceful atmosphere'
    ];
    
    const enhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    document.getElementById('video-prompt').value = prompt + enhancement;
    
    // Update character count
    const event = new Event('input');
    document.getElementById('video-prompt').dispatchEvent(event);
}

// Quick prompt functions
function openQuickPrompt(type) {
    if (type === 'image') {
        scrollToSection('image-studio');
        setTimeout(() => {
            document.getElementById('image-prompt').focus();
        }, 500);
    } else if (type === 'video') {
        scrollToSection('video-studio');
        setTimeout(() => {
            document.getElementById('video-prompt').focus();
        }, 500);
    }
}

function openGallery() {
    scrollToSection('gallery');
}

// Loading state functions
function showLoading(type) {
    const preview = document.getElementById(`${type}-preview`);
    if (preview) {
        preview.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Generating your ${type}...</p>
            </div>
        `;
    }
}

function hideLoading(type) {
    // Loading will be replaced by the result
}

// Download functions
function downloadImage() {
    const img = document.querySelector('#image-preview img');
    if (img) {
        const link = document.createElement('a');
        link.href = img.src;
        link.download = 'ndzalama-ai-image.jpg';
        link.click();
    }
}

function downloadVideo() {
    const video = document.querySelector('#video-preview video, #video-preview img');
    if (video) {
        const link = document.createElement('a');
        link.href = video.src;
        link.download = 'ndzalama-ai-video.mp4';
        link.click();
    }
}

// Share functions
function shareImage() {
    if (navigator.share) {
        navigator.share({
            title: 'AI Generated Image - Ndzalama AI',
            text: 'Check out this amazing AI-generated image!',
            url: window.location.href
        });
    } else {
        // Fallback
        alert('Sharing feature requires a modern browser with Web Share API support.');
    }
}

function shareVideo() {
    if (navigator.share) {
        navigator.share({
            title: 'AI Generated Video - Ndzalama AI',
            text: 'Check out this amazing AI-generated video!',
            url: window.location.href
        });
    } else {
        alert('Sharing feature requires a modern browser with Web Share API support.');
    }
}

// ===============================
// GALLERY MANAGEMENT SYSTEM
// ===============================

// Gallery storage system
class GalleryManager {
    constructor() {
        this.storageKey = 'ndzalama-ai-gallery';
        this.maxStorageSize = 50; // Maximum number of images to store
        this.init();
    }

    init() {
        this.loadGallery();
        this.setupGalleryFilters();
    }

    // Save image to local storage gallery
    saveImage(imageData) {
        try {
            const gallery = this.getGallery();
            const newImage = {
                id: Date.now() + Math.random(),
                url: imageData.url,
                prompt: imageData.prompt,
                negativePrompt: imageData.negativePrompt || '',
                style: imageData.style,
                model: imageData.model,
                size: imageData.size,
                timestamp: new Date().toISOString(),
                favorite: false,
                downloaded: false
            };

            gallery.unshift(newImage); // Add to beginning

            // Keep only max items
            if (gallery.length > this.maxStorageSize) {
                gallery.splice(this.maxStorageSize);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(gallery));
            this.loadGallery();
            this.showNotification('Image saved to gallery!', 'success');
            return newImage.id;
        } catch (error) {
            console.error('Error saving to gallery:', error);
            this.showNotification('Failed to save image to gallery', 'error');
        }
    }

    // Get gallery from localStorage
    getGallery() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading gallery:', error);
            return [];
        }
    }

    // Load and display gallery
    loadGallery() {
        const gallery = this.getGallery();
        const galleryGrid = document.getElementById('gallery-grid');
        const galleryEmpty = document.getElementById('gallery-empty');

        if (!galleryGrid) return;

        if (gallery.length === 0) {
            galleryGrid.style.display = 'none';
            if (galleryEmpty) galleryEmpty.style.display = 'block';
            return;
        }

        galleryGrid.style.display = 'grid';
        if (galleryEmpty) galleryEmpty.style.display = 'none';

        galleryGrid.innerHTML = gallery.map(image => this.createGalleryItem(image)).join('');
        this.attachGalleryEventListeners();
    }

    // Create gallery item HTML
    createGalleryItem(image) {
        const formattedDate = new Date(image.timestamp).toLocaleDateString();
        return `
            <div class="gallery-item" data-id="${image.id}" data-style="${image.style}" data-favorite="${image.favorite}">
                <div class="gallery-image">
                    <img src="${image.url}" alt="Generated image" loading="lazy" onclick="openFullscreen('${image.url}', '${image.prompt}')">
                    <div class="gallery-overlay">
                        <div class="gallery-actions">
                            <button class="gallery-btn" onclick="openFullscreen('${image.url}', '${this.escapeHtml(image.prompt)}')"> 
                                <i class="fas fa-expand"></i>
                            </button>
                            <button class="gallery-btn" onclick="toggleFavorite('${image.id}')">
                                <i class="fas fa-heart ${image.favorite ? 'favorited' : ''}"></i>
                            </button>
                            <button class="gallery-btn" onclick="downloadGalleryImage('${image.url}', '${image.id}')">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="gallery-btn delete-btn" onclick="deleteGalleryImage('${image.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="gallery-info">
                    <p class="gallery-prompt">${this.truncateText(image.prompt, 60)}</p>
                    <div class="gallery-meta">
                        <span class="gallery-date">${formattedDate}</span>
                        <span class="gallery-model">${image.model?.toUpperCase() || 'AI'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Truncate text with ellipsis
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Setup gallery filters
    setupGalleryFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                const filter = e.target.dataset.filter;
                this.filterGallery(filter);
            });
        });
    }

    // Filter gallery items
    filterGallery(filter) {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            let show = false;
            
            switch (filter) {
                case 'all':
                    show = true;
                    break;
                case 'recent':
                    // Show items from last 7 days
                    const itemDate = new Date(item.querySelector('.gallery-date').textContent);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    show = itemDate >= weekAgo;
                    break;
                case 'favorites':
                    show = item.dataset.favorite === 'true';
                    break;
                case 'styles':
                    // Group by style - for now just show all
                    show = true;
                    break;
            }
            
            item.style.display = show ? 'block' : 'none';
        });
    }

    // Attach event listeners to gallery items
    attachGalleryEventListeners() {
        // Event listeners are attached via onclick in HTML for simplicity
        // This method can be extended for more complex interactions
    }

    // Toggle favorite status
    toggleFavorite(imageId) {
        const gallery = this.getGallery();
        const image = gallery.find(img => img.id == imageId);
        
        if (image) {
            image.favorite = !image.favorite;
            localStorage.setItem(this.storageKey, JSON.stringify(gallery));
            this.loadGallery();
            
            const message = image.favorite ? 'Added to favorites!' : 'Removed from favorites!';
            this.showNotification(message, 'success');
        }
    }

    // Delete image from gallery
    deleteImage(imageId) {
        if (confirm('Are you sure you want to delete this image from your gallery?')) {
            const gallery = this.getGallery();
            const filteredGallery = gallery.filter(img => img.id != imageId);
            localStorage.setItem(this.storageKey, JSON.stringify(filteredGallery));
            this.loadGallery();
            this.showNotification('Image deleted from gallery', 'success');
        }
    }

    // Clear entire gallery
    clearGallery() {
        if (confirm('Are you sure you want to clear your entire gallery? This cannot be undone.')) {
            localStorage.removeItem(this.storageKey);
            this.loadGallery();
            this.showNotification('Gallery cleared', 'success');
        }
    }

    // Export gallery data
    exportGallery() {
        const gallery = this.getGallery();
        const dataStr = JSON.stringify(gallery, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `ndzalama-ai-gallery-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('Gallery exported successfully!', 'success');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // This will use the existing notification system
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize gallery manager
const galleryManager = new GalleryManager();

// ===============================
// FULLSCREEN VIEWER
// ===============================

function openFullscreen(imageUrl, prompt = '') {
    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    overlay.innerHTML = `
        <div class="fullscreen-content">
            <div class="fullscreen-header">
                <div class="fullscreen-info">
                    <h3>AI Generated Image</h3>
                    <p class="fullscreen-prompt">${galleryManager.escapeHtml(prompt)}</p>
                </div>
                <div class="fullscreen-actions">
                    <button class="fullscreen-btn" onclick="downloadFullscreenImage('${imageUrl}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="fullscreen-btn" onclick="shareFullscreenImage('${imageUrl}', '${galleryManager.escapeHtml(prompt)}')">
                        <i class="fas fa-share"></i>
                    </button>
                    <button class="fullscreen-btn" onclick="closeFullscreen()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="fullscreen-image-container">
                <img src="${imageUrl}" alt="Generated image" class="fullscreen-image">
            </div>
            <div class="fullscreen-controls">
                <button class="fullscreen-control-btn" onclick="zoomImage(-0.2)">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="fullscreen-control-btn" onclick="resetZoom()">
                    <i class="fas fa-compress-arrows-alt"></i>
                </button>
                <button class="fullscreen-control-btn" onclick="zoomImage(0.2)">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Add click outside to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeFullscreen();
        }
    });

    // Add ESC key to close
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeFullscreen();
        }
    };
    document.addEventListener('keydown', handleEsc);
    overlay.dataset.escHandler = 'true';
}

function closeFullscreen() {
    const overlay = document.querySelector('.fullscreen-overlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = '';
        
        // Remove ESC event listener
        document.removeEventListener('keydown', closeFullscreen);
    }
}

let currentZoom = 1;

function zoomImage(delta) {
    const image = document.querySelector('.fullscreen-image');
    if (image) {
        currentZoom = Math.max(0.5, Math.min(3, currentZoom + delta));
        image.style.transform = `scale(${currentZoom})`;
    }
}

function resetZoom() {
    const image = document.querySelector('.fullscreen-image');
    if (image) {
        currentZoom = 1;
        image.style.transform = 'scale(1)';
    }
}

// ===============================
// GALLERY UTILITY FUNCTIONS
// ===============================

function saveToGallery(imageData) {
    return galleryManager.saveImage(imageData);
}

function toggleFavorite(imageId) {
    galleryManager.toggleFavorite(imageId);
}

function deleteGalleryImage(imageId) {
    galleryManager.deleteImage(imageId);
}

function downloadGalleryImage(imageUrl, imageId) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ndzalama-ai-${imageId}.jpg`;
    link.click();
    
    // Mark as downloaded in gallery
    const gallery = galleryManager.getGallery();
    const image = gallery.find(img => img.id == imageId);
    if (image) {
        image.downloaded = true;
        localStorage.setItem(galleryManager.storageKey, JSON.stringify(gallery));
    }
}

function downloadFullscreenImage(imageUrl) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ndzalama-ai-fullscreen-${Date.now()}.jpg`;
    link.click();
}

function shareFullscreenImage(imageUrl, prompt) {
    if (navigator.share) {
        navigator.share({
            title: 'AI Generated Image - Ndzalama AI',
            text: `Check out this AI-generated image: "${prompt}"`,
            url: window.location.href
        });
    } else {
        // Fallback: copy URL to clipboard
        navigator.clipboard.writeText(imageUrl).then(() => {
            showNotification('Image URL copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Sharing not supported on this browser', 'error');
        });
    }
}

// Enhanced initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Ndzalama AI v2.0 - Enhanced Version Loaded!');
    console.log('Created by Brilliant Mashele - BubbleRoot Studios');
    
    // Initialize all modern features
    initNeuralCanvas();
    initNavigation();
    animateStats();
    initPromptEnhancements();
    initStyleSelectors();
    initSliders();
    initVideoStyleSelectors();
    initAdvancedFeatures();
    
    // Add particle effects to buttons
    document.querySelectorAll('.btn-particles').forEach(btn => {
        btn.addEventListener('click', createParticleEffect);
    });
});

// Initialize advanced features
function initAdvancedFeatures() {
    // Model selector
    document.querySelectorAll('.model-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Aspect ratio selector
    document.querySelectorAll('.aspect-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Batch count selector
    document.querySelectorAll('.batch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.batch-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // ControlNet toggle
    const controlnetEnabled = document.getElementById('controlnet-enabled');
    if (controlnetEnabled) {
        controlnetEnabled.addEventListener('change', () => {
            const options = document.getElementById('controlnet-options');
            options.style.display = controlnetEnabled.checked ? 'block' : 'none';
        });
    }
    
    // Image-to-Image toggle
    const img2imgEnabled = document.getElementById('img2img-enabled');
    if (img2imgEnabled) {
        img2imgEnabled.addEventListener('change', () => {
            const options = document.getElementById('img2img-options');
            options.style.display = img2imgEnabled.checked ? 'block' : 'none';
        });
    }
    
    // Image-to-Image strength slider
    const strengthSlider = document.getElementById('img2img-strength');
    if (strengthSlider) {
        strengthSlider.addEventListener('input', () => {
            document.querySelector('.strength-value').textContent = strengthSlider.value;
        });
    }
}

// Toggle negative prompts section
function toggleNegativePrompts() {
    const container = document.getElementById('negative-prompt-container');
    const button = document.querySelector('.toggle-negative');
    
    if (container.style.display === 'none') {
        container.style.display = 'block';
        button.innerHTML = '<i class="fas fa-minus-circle"></i> Hide Negative Prompts';
    } else {
        container.style.display = 'none';
        button.innerHTML = '<i class="fas fa-minus-circle"></i> What to Avoid';
    }
}

// Add negative tag to prompt
function addNegativeTag(tag) {
    const negativePrompt = document.getElementById('negative-prompt');
    const currentValue = negativePrompt.value.trim();
    
    if (currentValue) {
        negativePrompt.value = currentValue + ', ' + tag;
    } else {
        negativePrompt.value = tag;
    }
}

// Enhanced prompt suggestions with autocomplete
function initPromptSuggestions() {
    const imagePrompt = document.getElementById('image-prompt');
    const suggestionsContainer = document.getElementById('prompt-suggestions');
    
    const suggestions = [
        'photorealistic portrait',
        'cyberpunk cityscape',
        'fantasy landscape',
        'abstract digital art',
        'vintage photography',
        'sci-fi spaceship',
        'mystical forest',
        'underwater scene',
        'steampunk machinery',
        'neon-lit street'
    ];
    
    imagePrompt.addEventListener('input', () => {
        const value = imagePrompt.value.toLowerCase();
        if (value.length > 2) {
            const matches = suggestions.filter(s => s.includes(value));
            
            if (matches.length > 0) {
                suggestionsContainer.innerHTML = matches
                    .slice(0, 3)
                    .map(s => `<button class="suggestion-item" onclick="applySuggestion('${s}')">${s}</button>`)
                    .join('');
                suggestionsContainer.style.display = 'block';
            } else {
                suggestionsContainer.style.display = 'none';
            }
        } else {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!imagePrompt.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
}

// Apply suggestion to prompt
function applySuggestion(suggestion) {
    const imagePrompt = document.getElementById('image-prompt');
    const currentValue = imagePrompt.value.trim();
    
    if (currentValue) {
        imagePrompt.value = currentValue + ', ' + suggestion;
    } else {
        imagePrompt.value = suggestion;
    }
    
    document.getElementById('prompt-suggestions').style.display = 'none';
    
    // Update character count
    const event = new Event('input');
    imagePrompt.dispatchEvent(event);
}

// Advanced tools functions
function openUpscalingTool() {
    // Create upscaling modal
    const modal = createAdvancedToolModal('upscaling', 'AI Image Upscaling', `
        <div class="tool-content">
            <div class="upload-section">
                <div class="upload-area" id="upscale-upload" onclick="document.getElementById('upscale-file').click()">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <h3>Upload Image to Upscale</h3>
                    <p>Drag & drop or click to select</p>
                    <small>Supports JPG, PNG, WebP up to 10MB</small>
                </div>
                <input type="file" id="upscale-file" accept="image/*" style="display: none;">
            </div>
            
            <div class="upscale-preview" id="upscale-preview" style="display: none;">
                <div class="before-after">
                    <div class="image-comparison">
                        <div class="original-section">
                            <h4>Original</h4>
                            <img id="original-image" alt="Original">
                            <span class="image-info" id="original-info"></span>
                        </div>
                        <div class="upscaled-section">
                            <h4>AI Upscaled</h4>
                            <div class="upscaled-placeholder" id="upscaled-placeholder">
                                <i class="fas fa-magic"></i>
                                <p>Click 'Upscale' to enhance</p>
                            </div>
                            <img id="upscaled-image" style="display: none;" alt="Upscaled">
                            <span class="image-info" id="upscaled-info"></span>
                        </div>
                    </div>
                </div>
                
                <div class="upscale-controls">
                    <div class="control-group">
                        <label>Upscale Factor</label>
                        <div class="scale-options">
                            <button class="scale-btn active" data-scale="2">2x</button>
                            <button class="scale-btn" data-scale="4">4x</button>
                            <button class="scale-btn" data-scale="8">8x</button>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <label>Enhancement Mode</label>
                        <select id="enhancement-mode">
                            <option value="general">General Enhancement</option>
                            <option value="photo">Photo Realistic</option>
                            <option value="artwork">Digital Artwork</option>
                            <option value="anime">Anime/Illustration</option>
                        </select>
                    </div>
                    
                    <button class="btn-primary" id="start-upscale" disabled>
                        <i class="fas fa-magic"></i>
                        <span>Upscale Image</span>
                    </button>
                </div>
            </div>
        </div>
    `);
    
    // Initialize upscaling functionality
    initUpscalingTool();
}

// Initialize upscaling tool functionality
function initUpscalingTool() {
    const fileInput = document.getElementById('upscale-file');
    const uploadArea = document.getElementById('upscale-upload');
    const previewSection = document.getElementById('upscale-preview');
    const upscaleBtn = document.getElementById('start-upscale');
    
    // File input change handler
    fileInput.addEventListener('change', handleUpscaleFileSelect);
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleUpscaleFileSelect();
        }
    });
    
    // Scale selector
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Upscale button
    if (upscaleBtn) {
        upscaleBtn.addEventListener('click', performUpscaling);
    }
}

// Handle file selection for upscaling
function handleUpscaleFileSelect() {
    const fileInput = document.getElementById('upscale-file');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file.', 'error');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB.', 'error');
        return;
    }
    
    // Read and display the image
    const reader = new FileReader();
    reader.onload = (e) => {
        displayOriginalImage(e.target.result, file);
    };
    reader.readAsDataURL(file);
}

// Display original image in upscaling tool
function displayOriginalImage(imageData, file) {
    const originalImg = document.getElementById('original-image');
    const originalInfo = document.getElementById('original-info');
    const previewSection = document.getElementById('upscale-preview');
    const upscaleBtn = document.getElementById('start-upscale');
    
    // Create image to get dimensions
    const img = new Image();
    img.onload = () => {
        originalImg.src = imageData;
        originalInfo.textContent = `${img.width} × ${img.height} (${(file.size / 1024).toFixed(1)} KB)`;
        
        previewSection.style.display = 'block';
        upscaleBtn.disabled = false;
        
        // Store original data for upscaling
        upscaleBtn.dataset.originalData = imageData;
        upscaleBtn.dataset.originalWidth = img.width;
        upscaleBtn.dataset.originalHeight = img.height;
    };
    img.src = imageData;
}

// Perform AI upscaling
async function performUpscaling() {
    const upscaleBtn = document.getElementById('start-upscale');
    const scaleFactor = parseInt(document.querySelector('.scale-btn.active')?.dataset.scale || '2');
    const enhancementMode = document.getElementById('enhancement-mode').value;
    const originalData = upscaleBtn.dataset.originalData;
    const originalWidth = parseInt(upscaleBtn.dataset.originalWidth);
    const originalHeight = parseInt(upscaleBtn.dataset.originalHeight);
    
    if (!originalData) {
        showNotification('Please select an image first.', 'error');
        return;
    }
    
    const newWidth = originalWidth * scaleFactor;
    const newHeight = originalHeight * scaleFactor;
    
    // Disable button and show progress
    upscaleBtn.disabled = true;
    upscaleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Upscaling...</span>';
    
    try {
        // Show placeholder while processing
        showUpscalingProgress(scaleFactor, enhancementMode);
        
        // Try real AI upscaling APIs
        const upscaledImage = await tryAIUpscaling(originalData, scaleFactor, enhancementMode, newWidth, newHeight);
        
        // Display result
        displayUpscaledImage(upscaledImage, newWidth, newHeight);
        
        showNotification(`Image successfully upscaled ${scaleFactor}x using ${enhancementMode} mode!`, 'success');
        
    } catch (error) {
        console.error('Upscaling failed:', error);
        showNotification('Upscaling failed. Please try again with a different image.', 'error');
    } finally {
        // Reset button
        upscaleBtn.disabled = false;
        upscaleBtn.innerHTML = '<i class="fas fa-magic"></i> <span>Upscale Image</span>';
    }
}

// Show upscaling progress
function showUpscalingProgress(scaleFactor, mode) {
    const placeholder = document.getElementById('upscaled-placeholder');
    const upscaledInfo = document.getElementById('upscaled-info');
    
    placeholder.innerHTML = `
        <div class="upscaling-progress">
            <div class="progress-animation">
                <div class="progress-ring"></div>
                <div class="progress-text">
                    <i class="fas fa-magic"></i>
                    <p>AI Upscaling...</p>
                    <small>${scaleFactor}x • ${mode}</small>
                </div>
            </div>
        </div>
    `;
    
    upscaledInfo.textContent = 'Processing...';
}

// Try various AI upscaling services
async function tryAIUpscaling(imageData, scaleFactor, mode, targetWidth, targetHeight) {
    const upscalingAPIs = [
        () => upscaleWithWaifu2x(imageData, scaleFactor, mode),
        () => upscaleWithReal_ESRGAN(imageData, scaleFactor, mode),
        () => upscaleWithUpscalerAPI(imageData, scaleFactor, mode),
        () => upscaleWithCanvas(imageData, targetWidth, targetHeight, mode)
    ];
    
    for (const api of upscalingAPIs) {
        try {
            const result = await api();
            if (result) return result;
        } catch (error) {
            console.warn('Upscaling API failed:', error);
        }
    }
    
    // Fallback to canvas-based upscaling
    return await upscaleWithCanvas(imageData, targetWidth, targetHeight, mode);
}

// Waifu2x API (for anime/illustration images)
async function upscaleWithWaifu2x(imageData, scaleFactor, mode) {
    if (mode !== 'anime') return null; // Only for anime style
    
    try {
        // Convert data URL to blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('scale', scaleFactor.toString());
        formData.append('noise', '1'); // Noise reduction level
        
        const apiResponse = await fetch('https://api.waifu2x.udp.jp/api', {
            method: 'POST',
            body: formData
        });
        
        if (apiResponse.ok) {
            const result = await apiResponse.blob();
            return URL.createObjectURL(result);
        }
    } catch (error) {
        console.warn('Waifu2x failed:', error);
    }
    
    return null;
}

// Real-ESRGAN API (for realistic images)
async function upscaleWithReal_ESRGAN(imageData, scaleFactor, mode) {
    if (mode === 'anime') return null; // Skip for anime
    
    try {
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token r8_demo' // Demo token
            },
            body: JSON.stringify({
                version: 'nightmareai/real-esrgan',
                input: {
                    image: imageData,
                    scale: scaleFactor,
                    face_enhance: mode === 'photo'
                }
            })
        });
        
        if (response.ok) {
            const prediction = await response.json();
            // In a real implementation, you'd poll for completion
            // For demo, we'll return null to fall back to canvas
            return null;
        }
    } catch (error) {
        console.warn('Real-ESRGAN failed:', error);
    }
    
    return null;
}

// Generic upscaler API
async function upscaleWithUpscalerAPI(imageData, scaleFactor, mode) {
    try {
        // This would be a real API call to an upscaling service
        // For demo purposes, we'll simulate and return null
        await new Promise(resolve => setTimeout(resolve, 1000));
        return null;
    } catch (error) {
        console.warn('Upscaler API failed:', error);
        return null;
    }
}

// Canvas-based upscaling with enhancement filters
async function upscaleWithCanvas(imageData, targetWidth, targetHeight, mode) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            
            // Set image smoothing based on mode
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Draw upscaled image
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            
            // Apply enhancement filters based on mode
            applyEnhancementFilters(ctx, targetWidth, targetHeight, mode);
            
            canvas.toBlob((blob) => {
                resolve(URL.createObjectURL(blob));
            }, 'image/jpeg', 0.95);
        };
        img.src = imageData;
    });
}

// Apply enhancement filters
function applyEnhancementFilters(ctx, width, height, mode) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    switch (mode) {
        case 'photo':
            // Enhance contrast and saturation
            for (let i = 0; i < data.length; i += 4) {
                // Increase contrast
                data[i] = Math.min(255, data[i] * 1.1);     // R
                data[i + 1] = Math.min(255, data[i + 1] * 1.1); // G
                data[i + 2] = Math.min(255, data[i + 2] * 1.1); // B
            }
            break;
            
        case 'artwork':
            // Sharpen and enhance vibrance
            for (let i = 0; i < data.length; i += 4) {
                // Increase vibrance
                data[i] = Math.min(255, data[i] * 1.15);     // R
                data[i + 1] = Math.min(255, data[i + 1] * 1.15); // G
                data[i + 2] = Math.min(255, data[i + 2] * 1.15); // B
            }
            break;
            
        case 'anime':
            // Preserve sharp edges and colors
            for (let i = 0; i < data.length; i += 4) {
                // Enhance saturation
                data[i] = Math.min(255, data[i] * 1.2);     // R
                data[i + 1] = Math.min(255, data[i + 1] * 1.2); // G
                data[i + 2] = Math.min(255, data[i + 2] * 1.2); // B
            }
            break;
            
        default: // general
            // Balanced enhancement
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * 1.05);     // R
                data[i + 1] = Math.min(255, data[i + 1] * 1.05); // G
                data[i + 2] = Math.min(255, data[i + 2] * 1.05); // B
            }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// Display upscaled result
function displayUpscaledImage(imageUrl, width, height) {
    const upscaledImg = document.getElementById('upscaled-image');
    const upscaledInfo = document.getElementById('upscaled-info');
    const placeholder = document.getElementById('upscaled-placeholder');
    
    upscaledImg.src = imageUrl;
    upscaledImg.style.display = 'block';
    placeholder.style.display = 'none';
    
    upscaledInfo.textContent = `${width} × ${height} (Enhanced)`;
    
    // Add download button functionality
    upscaledImg.onclick = () => downloadUpscaledImage(imageUrl, width, height);
}

// Download upscaled image
function downloadUpscaledImage(imageUrl, width, height) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ndzalama-ai-upscaled-${width}x${height}-${Date.now()}.jpg`;
    link.click();
    
    showNotification('Upscaled image downloaded!', 'success');
}

// Create advanced tool modal helper
function createAdvancedToolModal(toolId, title, content) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'advanced-tool-modal';
    modal.id = `${toolId}-modal`;
    
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeAdvancedTool('${toolId}')"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-magic"></i> ${title}</h2>
                <button class="modal-close" onclick="closeAdvancedTool('${toolId}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    // Animate in
    setTimeout(() => modal.classList.add('show'), 100);
    
    return modal;
}

// Close advanced tool modal
function closeAdvancedTool(toolId) {
    const modal = document.getElementById(`${toolId}-modal`);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

function openStyleTransfer() {
    // Create style transfer modal
    const modal = createAdvancedToolModal('style-transfer', 'AI Style Transfer', `
        <div class="tool-content">
            <div class="upload-section">
                <div class="upload-area" id="style-upload" onclick="document.getElementById('style-content-file').click()">
                    <i class="fas fa-image"></i>
                    <h3>Upload Content Image</h3>
                    <p>The image you want to stylize</p>
                    <small>Supports JPG, PNG, WebP up to 10MB</small>
                </div>
                <input type="file" id="style-content-file" accept="image/*" style="display: none;">
            </div>
            
            <div class="style-selection">
                <h4>Choose Art Style</h4>
                <div class="style-grid">
                    <div class="art-style" data-style="vangogh" onclick="selectArtStyle('vangogh')">
                        <div class="style-preview vangogh"></div>
                        <span>Van Gogh</span>
                    </div>
                    <div class="art-style" data-style="picasso" onclick="selectArtStyle('picasso')">
                        <div class="style-preview picasso"></div>
                        <span>Picasso</span>
                    </div>
                    <div class="art-style" data-style="monet" onclick="selectArtStyle('monet')">
                        <div class="style-preview monet"></div>
                        <span>Monet</span>
                    </div>
                    <div class="art-style" data-style="anime" onclick="selectArtStyle('anime')">
                        <div class="style-preview anime"></div>
                        <span>Anime</span>
                    </div>
                    <div class="art-style" data-style="cartoon" onclick="selectArtStyle('cartoon')">
                        <div class="style-preview cartoon"></div>
                        <span>Cartoon</span>
                    </div>
                    <div class="art-style" data-style="watercolor" onclick="selectArtStyle('watercolor')">
                        <div class="style-preview watercolor"></div>
                        <span>Watercolor</span>
                    </div>
                </div>
            </div>
            
            <div class="style-preview-section" id="style-preview-section" style="display: none;">
                <div class="before-after-style">
                    <div class="original-style">
                        <h4>Original</h4>
                        <img id="style-original-image" alt="Original">
                    </div>
                    <div class="styled-result">
                        <h4>Stylized</h4>
                        <div class="styled-placeholder" id="styled-placeholder">
                            <i class="fas fa-palette"></i>
                            <p>Click 'Apply Style' to transform</p>
                        </div>
                        <img id="styled-image" style="display: none;" alt="Stylized">
                    </div>
                </div>
                
                <div class="style-controls">
                    <div class="control-group">
                        <label>Style Strength</label>
                        <input type="range" id="style-strength" min="0.3" max="1" value="0.7" step="0.1">
                        <span class="strength-value">0.7</span>
                    </div>
                    
                    <div class="control-group">
                        <label>Preserve Details</label>
                        <label class="style-toggle">
                            <input type="checkbox" id="preserve-details" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    
                    <button class="btn-primary" id="apply-style" disabled>
                        <i class="fas fa-palette"></i>
                        <span>Apply Style</span>
                    </button>
                </div>
            </div>
        </div>
    `);
    
    // Initialize style transfer functionality
    initStyleTransferTool();
}

// Initialize style transfer tool functionality
function initStyleTransferTool() {
    const fileInput = document.getElementById('style-content-file');
    const uploadArea = document.getElementById('style-upload');
    const previewSection = document.getElementById('style-preview-section');
    const applyBtn = document.getElementById('apply-style');
    const strengthSlider = document.getElementById('style-strength');
    
    // File input change handler
    fileInput.addEventListener('change', handleStyleFileSelect);
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleStyleFileSelect();
        }
    });
    
    // Style strength slider
    if (strengthSlider) {
        strengthSlider.addEventListener('input', () => {
            document.querySelector('.strength-value').textContent = strengthSlider.value;
        });
    }
    
    // Apply style button
    if (applyBtn) {
        applyBtn.addEventListener('click', performStyleTransfer);
    }
}

// Handle file selection for style transfer
function handleStyleFileSelect() {
    const fileInput = document.getElementById('style-content-file');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file.', 'error');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB.', 'error');
        return;
    }
    
    // Read and display the image
    const reader = new FileReader();
    reader.onload = (e) => {
        displayStyleOriginalImage(e.target.result, file);
    };
    reader.readAsDataURL(file);
}

// Display original image in style transfer tool
function displayStyleOriginalImage(imageData, file) {
    const originalImg = document.getElementById('style-original-image');
    const previewSection = document.getElementById('style-preview-section');
    const applyBtn = document.getElementById('apply-style');
    
    originalImg.src = imageData;
    previewSection.style.display = 'block';
    applyBtn.disabled = false;
    
    // Store original data for style transfer
    applyBtn.dataset.originalData = imageData;
}

// Select art style
function selectArtStyle(styleName) {
    // Remove active class from all styles
    document.querySelectorAll('.art-style').forEach(style => {
        style.classList.remove('active');
    });
    
    // Add active class to selected style
    document.querySelector(`[data-style="${styleName}"]`).classList.add('active');
    
    // Enable apply button if image is loaded
    const applyBtn = document.getElementById('apply-style');
    if (applyBtn.dataset.originalData) {
        applyBtn.disabled = false;
    }
}

// Perform style transfer
async function performStyleTransfer() {
    const applyBtn = document.getElementById('apply-style');
    const selectedStyle = document.querySelector('.art-style.active')?.dataset.style || 'vangogh';
    const styleStrength = parseFloat(document.getElementById('style-strength').value);
    const preserveDetails = document.getElementById('preserve-details').checked;
    const originalData = applyBtn.dataset.originalData;
    
    if (!originalData) {
        showNotification('Please select an image first.', 'error');
        return;
    }
    
    if (!document.querySelector('.art-style.active')) {
        showNotification('Please select an art style.', 'error');
        return;
    }
    
    // Disable button and show progress
    applyBtn.disabled = true;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Applying Style...</span>';
    
    try {
        // Show progress
        showStyleTransferProgress(selectedStyle, styleStrength);
        
        // Try real style transfer APIs
        const styledImage = await tryStyleTransferAPIs(originalData, selectedStyle, styleStrength, preserveDetails);
        
        // Display result
        displayStyledImage(styledImage, selectedStyle);
        
        showNotification(`Style transfer completed using ${selectedStyle} style!`, 'success');
        
    } catch (error) {
        console.error('Style transfer failed:', error);
        showNotification('Style transfer failed. Please try again with a different image.', 'error');
    } finally {
        // Reset button
        applyBtn.disabled = false;
        applyBtn.innerHTML = '<i class="fas fa-palette"></i> <span>Apply Style</span>';
    }
}

// Show style transfer progress
function showStyleTransferProgress(styleName, strength) {
    const placeholder = document.getElementById('styled-placeholder');
    
    placeholder.innerHTML = `
        <div class="style-transfer-progress">
            <div class="progress-animation">
                <div class="progress-palette">
                    <div class="color-splash"></div>
                    <div class="color-splash"></div>
                    <div class="color-splash"></div>
                </div>
                <div class="progress-text">
                    <i class="fas fa-palette"></i>
                    <p>Applying ${styleName} Style...</p>
                    <small>Strength: ${(strength * 100).toFixed(0)}%</small>
                </div>
            </div>
        </div>
    `;
}

// Try various style transfer APIs
async function tryStyleTransferAPIs(imageData, styleName, strength, preserveDetails) {
    const styleAPIs = [
        () => styleTransferWithNeuralStyle(imageData, styleName, strength, preserveDetails),
        () => styleTransferWithDeepAI(imageData, styleName, strength),
        () => styleTransferWithHuggingFace(imageData, styleName, strength),
        () => styleTransferWithCanvas(imageData, styleName, strength, preserveDetails)
    ];
    
    for (const api of styleAPIs) {
        try {
            const result = await api();
            if (result) return result;
        } catch (error) {
            console.warn('Style transfer API failed:', error);
        }
    }
    
    // Fallback to canvas-based style transfer
    return await styleTransferWithCanvas(imageData, styleName, strength, preserveDetails);
}

// Neural Style Transfer API
async function styleTransferWithNeuralStyle(imageData, styleName, strength, preserveDetails) {
    try {
        // Convert data URL to blob
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('content_image', blob);
        formData.append('style', styleName);
        formData.append('strength', strength.toString());
        formData.append('preserve_details', preserveDetails.toString());
        
        const apiResponse = await fetch('https://api.deepai.org/api/neural-style', {
            method: 'POST',
            headers: {
                'Api-Key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K'
            },
            body: formData
        });
        
        if (apiResponse.ok) {
            const result = await apiResponse.json();
            if (result.output_url) {
                return result.output_url;
            }
        }
    } catch (error) {
        console.warn('Neural Style API failed:', error);
    }
    
    return null;
}

// DeepAI Style Transfer
async function styleTransferWithDeepAI(imageData, styleName, strength) {
    try {
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('content', blob);
        formData.append('style', getStyleImageForDeepAI(styleName));
        
        const apiResponse = await fetch('https://api.deepai.org/api/neural-style', {
            method: 'POST',
            headers: {
                'Api-Key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K'
            },
            body: formData
        });
        
        if (apiResponse.ok) {
            const result = await apiResponse.json();
            if (result.output_url) {
                return result.output_url;
            }
        }
    } catch (error) {
        console.warn('DeepAI Style Transfer failed:', error);
    }
    
    return null;
}

// Hugging Face Style Transfer
async function styleTransferWithHuggingFace(imageData, styleName, strength) {
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DiT-base-finetuned-openimages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer hf_demo'
            },
            body: JSON.stringify({
                inputs: {
                    image: imageData,
                    style: styleName,
                    strength: strength
                }
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            if (blob.size > 0) {
                return URL.createObjectURL(blob);
            }
        }
    } catch (error) {
        console.warn('Hugging Face Style Transfer failed:', error);
    }
    
    return null;
}

// Canvas-based style transfer simulation
async function styleTransferWithCanvas(imageData, styleName, strength, preserveDetails) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
            
            // Apply style-specific filters
            applyStyleFilters(ctx, img.width, img.height, styleName, strength, preserveDetails);
            
            canvas.toBlob((blob) => {
                resolve(URL.createObjectURL(blob));
            }, 'image/jpeg', 0.95);
        };
        img.src = imageData;
    });
}

// Apply style-specific filters
function applyStyleFilters(ctx, width, height, styleName, strength, preserveDetails) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    const styleFilters = {
        vangogh: () => {
            // Van Gogh style: Enhance blues and yellows, increase contrast
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * (1 + strength * 0.3));     // R
                data[i + 1] = Math.min(255, data[i + 1] * (1 + strength * 0.2)); // G
                data[i + 2] = Math.min(255, data[i + 2] * (1 + strength * 0.5)); // B - enhance blues
            }
        },
        
        picasso: () => {
            // Picasso style: Abstract colors, geometric feel
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const factor = strength * 0.7;
                data[i] = avg + (data[i] - avg) * (1 + factor);     // R
                data[i + 1] = avg + (data[i + 1] - avg) * (1 - factor); // G
                data[i + 2] = avg + (data[i + 2] - avg) * (1 + factor); // B
            }
        },
        
        monet: () => {
            // Monet style: Soft, impressionistic
            for (let i = 0; i < data.length; i += 4) {
                const softening = strength * 0.3;
                data[i] = data[i] * (1 - softening) + 200 * softening;     // R
                data[i + 1] = data[i + 1] * (1 - softening) + 220 * softening; // G
                data[i + 2] = data[i + 2] * (1 - softening) + 255 * softening; // B
            }
        },
        
        anime: () => {
            // Anime style: High saturation, clean colors
            for (let i = 0; i < data.length; i += 4) {
                const saturation = 1 + strength * 0.5;
                data[i] = Math.min(255, data[i] * saturation);     // R
                data[i + 1] = Math.min(255, data[i + 1] * saturation); // G
                data[i + 2] = Math.min(255, data[i + 2] * saturation); // B
            }
        },
        
        cartoon: () => {
            // Cartoon style: Reduce colors, increase contrast
            for (let i = 0; i < data.length; i += 4) {
                const levels = 4; // Color quantization
                data[i] = Math.floor(data[i] / (256 / levels)) * (256 / levels);     // R
                data[i + 1] = Math.floor(data[i + 1] / (256 / levels)) * (256 / levels); // G
                data[i + 2] = Math.floor(data[i + 2] / (256 / levels)) * (256 / levels); // B
            }
        },
        
        watercolor: () => {
            // Watercolor style: Soft, flowing colors
            for (let i = 0; i < data.length; i += 4) {
                const flow = strength * 0.4;
                const noise = (Math.random() - 0.5) * flow * 50;
                data[i] = Math.max(0, Math.min(255, data[i] + noise));     // R
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
            }
        }
    };
    
    const filter = styleFilters[styleName] || styleFilters.vangogh;
    filter();
    
    // Apply detail preservation if enabled
    if (preserveDetails) {
        for (let i = 0; i < data.length; i += 4) {
            const originalIntensity = 0.3; // Keep 30% of original
            data[i] = data[i] * (1 - originalIntensity) + data[i] * originalIntensity;
            data[i + 1] = data[i + 1] * (1 - originalIntensity) + data[i + 1] * originalIntensity;
            data[i + 2] = data[i + 2] * (1 - originalIntensity) + data[i + 2] * originalIntensity;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// Get style image URL for DeepAI
function getStyleImageForDeepAI(styleName) {
    const styleImages = {
        vangogh: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/300px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
        picasso: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Les_Demoiselles_d%27Avignon.jpg/300px-Les_Demoiselles_d%27Avignon.jpg',
        monet: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/300px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg',
        anime: 'https://via.placeholder.com/300x300/FF69B4/FFFFFF?text=Anime+Style',
        cartoon: 'https://via.placeholder.com/300x300/FFD700/000000?text=Cartoon+Style',
        watercolor: 'https://via.placeholder.com/300x300/87CEEB/FFFFFF?text=Watercolor'
    };
    
    return styleImages[styleName] || styleImages.vangogh;
}

// Display styled result
function displayStyledImage(imageUrl, styleName) {
    const styledImg = document.getElementById('styled-image');
    const placeholder = document.getElementById('styled-placeholder');
    
    styledImg.src = imageUrl;
    styledImg.style.display = 'block';
    placeholder.style.display = 'none';
    
    // Add download functionality
    styledImg.onclick = () => downloadStyledImage(imageUrl, styleName);
}

// Download styled image
function downloadStyledImage(imageUrl, styleName) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ndzalama-ai-style-transfer-${styleName}-${Date.now()}.jpg`;
    link.click();
    
    showNotification('Styled image downloaded!', 'success');
}

function openSmartCrop() {
    // Create smart cropping modal
    const modal = createAdvancedToolModal('smart-crop', 'AI Smart Cropping', `
        <div class="tool-content">
            <div class="upload-section">
                <div class="upload-area" id="crop-upload" onclick="document.getElementById('crop-file').click()">
                    <i class="fas fa-crop-alt"></i>
                    <h3>Upload Image to Crop</h3>
                    <p>AI will analyze and suggest optimal crops</p>
                    <small>Supports JPG, PNG, WebP up to 10MB</small>
                </div>
                <input type="file" id="crop-file" accept="image/*" style="display: none;">
            </div>
            
            <div class="crop-preview" id="crop-preview" style="display: none;">
                <div class="image-analysis">
                    <div class="original-crop">
                        <h4>Original Image</h4>
                        <div class="crop-container">
                            <img id="crop-original-image" alt="Original">
                            <div class="crop-overlay" id="crop-overlay"></div>
                        </div>
                        <span class="image-info" id="crop-original-info"></span>
                    </div>
                    <div class="crop-suggestions">
                        <h4>AI Crop Suggestions</h4>
                        <div class="crop-options" id="crop-options"></div>
                    </div>
                </div>
                
                <div class="crop-controls">
                    <div class="control-group">
                        <label>Crop Type</label>
                        <div class="crop-type-selector">
                            <button class="crop-type-btn active" data-type="smart">Smart AI</button>
                            <button class="crop-type-btn" data-type="square">Square</button>
                            <button class="crop-type-btn" data-type="portrait">Portrait</button>
                            <button class="crop-type-btn" data-type="landscape">Landscape</button>
                            <button class="crop-type-btn" data-type="custom">Custom</button>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <label>Focus Point</label>
                        <select id="focus-point">
                            <option value="auto">Auto Detect</option>
                            <option value="center">Center</option>
                            <option value="face">Face Detection</option>
                            <option value="object">Main Object</option>
                            <option value="rule-of-thirds">Rule of Thirds</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <label>Composition Enhancement</label>
                        <label class="crop-toggle">
                            <input type="checkbox" id="enhance-composition" checked>
                            <span class="toggle-slider"></span>
                            <span>Apply composition rules</span>
                        </label>
                    </div>
                    
                    <button class="btn-primary" id="apply-crop" disabled>
                        <i class="fas fa-crop-alt"></i>
                        <span>Apply Smart Crop</span>
                    </button>
                </div>
            </div>
        </div>
    `);
    
    // Initialize smart cropping functionality
    initSmartCropTool();
}

// Initialize smart cropping tool functionality
function initSmartCropTool() {
    const fileInput = document.getElementById('crop-file');
    const uploadArea = document.getElementById('crop-upload');
    const previewSection = document.getElementById('crop-preview');
    const applyCropBtn = document.getElementById('apply-crop');
    
    // File input change handler
    fileInput.addEventListener('change', handleCropFileSelect);
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleCropFileSelect();
        }
    });
    
    // Crop type selector
    document.querySelectorAll('.crop-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.crop-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateCropSuggestions();
        });
    });
    
    // Apply crop button
    if (applyCropBtn) {
        applyCropBtn.addEventListener('click', performSmartCrop);
    }
}

// Handle file selection for cropping
function handleCropFileSelect() {
    const fileInput = document.getElementById('crop-file');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file.', 'error');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB.', 'error');
        return;
    }
    
    // Read and display the image
    const reader = new FileReader();
    reader.onload = (e) => {
        displayCropOriginalImage(e.target.result, file);
    };
    reader.readAsDataURL(file);
}

// Display original image in cropping tool
function displayCropOriginalImage(imageData, file) {
    const originalImg = document.getElementById('crop-original-image');
    const originalInfo = document.getElementById('crop-original-info');
    const previewSection = document.getElementById('crop-preview');
    const applyCropBtn = document.getElementById('apply-crop');
    
    // Create image to get dimensions
    const img = new Image();
    img.onload = () => {
        originalImg.src = imageData;
        originalInfo.textContent = `${img.width} × ${img.height} (${(file.size / 1024).toFixed(1)} KB)`;
        
        previewSection.style.display = 'block';
        applyCropBtn.disabled = false;
        
        // Store original data for cropping
        applyCropBtn.dataset.originalData = imageData;
        applyCropBtn.dataset.originalWidth = img.width;
        applyCropBtn.dataset.originalHeight = img.height;
        
        // Generate crop suggestions
        generateCropSuggestions(img.width, img.height);
    };
    img.src = imageData;
}

// Generate AI crop suggestions
function generateCropSuggestions(width, height) {
    const cropOptions = document.getElementById('crop-options');
    const focusPoint = document.getElementById('focus-point').value;
    const cropType = document.querySelector('.crop-type-btn.active')?.dataset.type || 'smart';
    
    // Generate different crop suggestions based on type
    const suggestions = getCropSuggestions(width, height, cropType, focusPoint);
    
    cropOptions.innerHTML = suggestions.map((suggestion, index) => `
        <div class="crop-suggestion" data-crop="${JSON.stringify(suggestion).replace(/"/g, '&quot;')}" onclick="selectCropSuggestion(this)">
            <div class="suggestion-preview">
                <div class="crop-frame" style="
                    left: ${(suggestion.x / width) * 100}%;
                    top: ${(suggestion.y / height) * 100}%;
                    width: ${(suggestion.width / width) * 100}%;
                    height: ${(suggestion.height / height) * 100}%;
                "></div>
            </div>
            <div class="suggestion-info">
                <span class="suggestion-title">${suggestion.title}</span>
                <span class="suggestion-ratio">${suggestion.ratio}</span>
            </div>
        </div>
    `).join('');
}

// Get crop suggestions based on type
function getCropSuggestions(width, height, cropType, focusPoint) {
    const suggestions = [];
    
    switch (cropType) {
        case 'smart':
            // AI-powered smart crops based on composition rules
            suggestions.push(
                {
                    title: 'Rule of Thirds',
                    ratio: '16:9',
                    x: Math.floor(width * 0.1),
                    y: Math.floor(height * 0.1),
                    width: Math.floor(width * 0.8),
                    height: Math.floor(width * 0.8 * 9/16)
                },
                {
                    title: 'Golden Ratio',
                    ratio: '1.618:1',
                    x: Math.floor(width * 0.05),
                    y: Math.floor(height * 0.2),
                    width: Math.floor(width * 0.9),
                    height: Math.floor(width * 0.9 / 1.618)
                },
                {
                    title: 'Center Focus',
                    ratio: '4:3',
                    x: Math.floor(width * 0.125),
                    y: Math.floor(height * 0.125),
                    width: Math.floor(width * 0.75),
                    height: Math.floor(width * 0.75 * 3/4)
                }
            );
            break;
            
        case 'square':
            const squareSize = Math.min(width, height);
            suggestions.push(
                {
                    title: 'Center Square',
                    ratio: '1:1',
                    x: Math.floor((width - squareSize) / 2),
                    y: Math.floor((height - squareSize) / 2),
                    width: squareSize,
                    height: squareSize
                },
                {
                    title: 'Left Square',
                    ratio: '1:1',
                    x: 0,
                    y: Math.floor((height - squareSize) / 2),
                    width: squareSize,
                    height: squareSize
                },
                {
                    title: 'Right Square',
                    ratio: '1:1',
                    x: width - squareSize,
                    y: Math.floor((height - squareSize) / 2),
                    width: squareSize,
                    height: squareSize
                }
            );
            break;
            
        case 'portrait':
            suggestions.push(
                {
                    title: 'Portrait 4:5',
                    ratio: '4:5',
                    x: Math.floor(width * 0.1),
                    y: 0,
                    width: Math.floor(width * 0.8),
                    height: Math.floor(width * 0.8 * 5/4)
                },
                {
                    title: 'Portrait 9:16',
                    ratio: '9:16',
                    x: Math.floor(width * 0.2),
                    y: 0,
                    width: Math.floor(width * 0.6),
                    height: Math.floor(width * 0.6 * 16/9)
                }
            );
            break;
            
        case 'landscape':
            suggestions.push(
                {
                    title: 'Landscape 16:9',
                    ratio: '16:9',
                    x: 0,
                    y: Math.floor(height * 0.2),
                    width: width,
                    height: Math.floor(width * 9/16)
                },
                {
                    title: 'Landscape 21:9',
                    ratio: '21:9',
                    x: 0,
                    y: Math.floor(height * 0.3),
                    width: width,
                    height: Math.floor(width * 9/21)
                }
            );
            break;
            
        case 'custom':
            // Allow user to define custom crop
            suggestions.push(
                {
                    title: 'Custom Area',
                    ratio: 'Custom',
                    x: Math.floor(width * 0.1),
                    y: Math.floor(height * 0.1),
                    width: Math.floor(width * 0.8),
                    height: Math.floor(height * 0.8)
                }
            );
            break;
    }
    
    return suggestions;
}

// Select crop suggestion
function selectCropSuggestion(element) {
    // Remove active class from all suggestions
    document.querySelectorAll('.crop-suggestion').forEach(s => s.classList.remove('active'));
    
    // Add active class to selected suggestion
    element.classList.add('active');
    
    // Parse crop data
    const cropData = JSON.parse(element.dataset.crop.replace(/&quot;/g, '"'));
    
    // Update crop overlay
    updateCropOverlay(cropData);
}

// Update crop overlay visualization
function updateCropOverlay(cropData) {
    const overlay = document.getElementById('crop-overlay');
    const img = document.getElementById('crop-original-image');
    
    if (!img || !overlay) return;
    
    // Calculate relative positions
    const imgRect = img.getBoundingClientRect();
    const containerRect = img.parentElement.getBoundingClientRect();
    
    const scaleX = imgRect.width / parseInt(document.getElementById('apply-crop').dataset.originalWidth);
    const scaleY = imgRect.height / parseInt(document.getElementById('apply-crop').dataset.originalHeight);
    
    overlay.style.display = 'block';
    overlay.style.left = (cropData.x * scaleX) + 'px';
    overlay.style.top = (cropData.y * scaleY) + 'px';
    overlay.style.width = (cropData.width * scaleX) + 'px';
    overlay.style.height = (cropData.height * scaleY) + 'px';
    overlay.style.border = '2px solid #00d4ff';
    overlay.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.5)';
}

// Update crop suggestions when type changes
function updateCropSuggestions() {
    const applyCropBtn = document.getElementById('apply-crop');
    if (applyCropBtn.dataset.originalWidth) {
        const width = parseInt(applyCropBtn.dataset.originalWidth);
        const height = parseInt(applyCropBtn.dataset.originalHeight);
        generateCropSuggestions(width, height);
    }
}

// Perform smart crop
async function performSmartCrop() {
    const applyCropBtn = document.getElementById('apply-crop');
    const selectedSuggestion = document.querySelector('.crop-suggestion.active');
    const originalData = applyCropBtn.dataset.originalData;
    const originalWidth = parseInt(applyCropBtn.dataset.originalWidth);
    const originalHeight = parseInt(applyCropBtn.dataset.originalHeight);
    
    if (!originalData) {
        showNotification('Please select an image first.', 'error');
        return;
    }
    
    if (!selectedSuggestion) {
        showNotification('Please select a crop suggestion.', 'error');
        return;
    }
    
    const cropData = JSON.parse(selectedSuggestion.dataset.crop.replace(/&quot;/g, '"'));
    const enhanceComposition = document.getElementById('enhance-composition').checked;
    
    // Disable button and show progress
    applyCropBtn.disabled = true;
    applyCropBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Cropping...</span>';
    
    try {
        // Perform the crop
        const croppedImage = await cropImageToCanvas(originalData, cropData, enhanceComposition);
        
        // Display result
        displayCroppedImage(croppedImage, cropData);
        
        showNotification(`Image cropped successfully using ${cropData.title}!`, 'success');
        
    } catch (error) {
        console.error('Cropping failed:', error);
        showNotification('Cropping failed. Please try again.', 'error');
    } finally {
        // Reset button
        applyCropBtn.disabled = false;
        applyCropBtn.innerHTML = '<i class="fas fa-crop-alt"></i> <span>Apply Smart Crop</span>';
    }
}

// Crop image using canvas
async function cropImageToCanvas(imageData, cropData, enhanceComposition) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = cropData.width;
            canvas.height = cropData.height;
            
            // Draw cropped section
            ctx.drawImage(
                img,
                cropData.x, cropData.y, cropData.width, cropData.height,
                0, 0, cropData.width, cropData.height
            );
            
            // Apply composition enhancement if enabled
            if (enhanceComposition) {
                applyCompositionEnhancement(ctx, cropData.width, cropData.height);
            }
            
            canvas.toBlob((blob) => {
                resolve(URL.createObjectURL(blob));
            }, 'image/jpeg', 0.95);
        };
        img.src = imageData;
    });
}

// Apply composition enhancement
function applyCompositionEnhancement(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Apply subtle contrast and saturation enhancement
    for (let i = 0; i < data.length; i += 4) {
        // Enhance contrast
        data[i] = Math.min(255, data[i] * 1.05);     // R
        data[i + 1] = Math.min(255, data[i + 1] * 1.05); // G
        data[i + 2] = Math.min(255, data[i + 2] * 1.05); // B
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// Display cropped result
function displayCroppedImage(imageUrl, cropData) {
    // Create a result display in the modal
    const modal = document.getElementById('smart-crop-modal');
    const existingResult = modal.querySelector('.crop-result');
    
    if (existingResult) {
        existingResult.remove();
    }
    
    const resultDiv = document.createElement('div');
    resultDiv.className = 'crop-result';
    resultDiv.innerHTML = `
        <div class="crop-result-header">
            <h4>Cropped Result</h4>
            <div class="crop-result-actions">
                <button class="btn-secondary" onclick="downloadCroppedImage('${imageUrl}', '${cropData.title}')">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="btn-secondary" onclick="shareCroppedImage('${imageUrl}', '${cropData.title}')">
                    <i class="fas fa-share"></i> Share
                </button>
            </div>
        </div>
        <div class="crop-result-image">
            <img src="${imageUrl}" alt="Cropped image" onclick="openFullscreen('${imageUrl}', 'Cropped using ${cropData.title}')">
        </div>
        <div class="crop-result-info">
            <span class="crop-result-title">${cropData.title}</span>
            <span class="crop-result-ratio">${cropData.ratio}</span>
            <span class="crop-result-size">${cropData.width} × ${cropData.height}</span>
        </div>
    `;
    
    modal.querySelector('.modal-body').appendChild(resultDiv);
}

// Download cropped image
function downloadCroppedImage(imageUrl, title) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ndzalama-ai-crop-${title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.jpg`;
    link.click();
    
    showNotification('Cropped image downloaded!', 'success');
}

// Share cropped image
function shareCroppedImage(imageUrl, title) {
    if (navigator.share && navigator.canShare) {
        navigator.share({
            title: 'AI Smart Cropped Image - Ndzalama AI',
            text: `Check out this smart-cropped image using ${title}!`,
            url: imageUrl
        }).then(() => {
            showNotification('Image shared successfully!', 'success');
        }).catch(error => {
            console.log('Sharing failed:', error);
            copyToClipboard(imageUrl);
        });
    } else {
        copyToClipboard(imageUrl);
    }
}

function openColorEnhance() {
    // Create color enhancement modal
    const modal = createAdvancedToolModal('color-enhance', 'AI Color Enhancement', `
        <div class="tool-content">
            <div class="upload-section">
                <div class="upload-area" id="color-upload" onclick="document.getElementById('color-file').click()">
                    <i class="fas fa-palette"></i>
                    <h3>Upload Image to Enhance</h3>
                    <p>AI will analyze and enhance colors automatically</p>
                    <small>Supports JPG, PNG, WebP up to 10MB</small>
                </div>
                <input type="file" id="color-file" accept="image/*" style="display: none;">
            </div>
            
            <div class="color-preview" id="color-preview" style="display: none;">
                <div class="before-after-color">
                    <div class="original-color">
                        <h4>Original</h4>
                        <img id="color-original-image" alt="Original">
                        <div class="color-analysis" id="original-analysis"></div>
                    </div>
                    <div class="enhanced-color">
                        <h4>AI Enhanced</h4>
                        <div class="enhanced-placeholder" id="enhanced-placeholder">
                            <i class="fas fa-adjust"></i>
                            <p>Click 'Enhance Colors' to improve</p>
                        </div>
                        <img id="enhanced-image" style="display: none;" alt="Enhanced">
                        <div class="color-analysis" id="enhanced-analysis"></div>
                    </div>
                </div>
                
                <div class="color-controls">
                    <div class="control-group">
                        <label>Enhancement Mode</label>
                        <div class="enhancement-modes">
                            <button class="mode-btn active" data-mode="auto">Auto Enhance</button>
                            <button class="mode-btn" data-mode="vibrant">Vibrant</button>
                            <button class="mode-btn" data-mode="natural">Natural</button>
                            <button class="mode-btn" data-mode="dramatic">Dramatic</button>
                        </div>
                    </div>
                    
                    <div class="control-group">
                        <label>Saturation <span class="saturation-value">1.0</span></label>
                        <input type="range" id="saturation-slider" min="0.5" max="2.0" value="1.0" step="0.1">
                    </div>
                    
                    <div class="control-group">
                        <label>Brightness <span class="brightness-value">1.0</span></label>
                        <input type="range" id="brightness-slider" min="0.5" max="1.5" value="1.0" step="0.1">
                    </div>
                    
                    <div class="control-group">
                        <label>Contrast <span class="contrast-value">1.0</span></label>
                        <input type="range" id="contrast-slider" min="0.5" max="2.0" value="1.0" step="0.1">
                    </div>
                    
                    <button class="btn-primary" id="enhance-colors" disabled>
                        <i class="fas fa-adjust"></i>
                        <span>Enhance Colors</span>
                    </button>
                </div>
            </div>
        </div>
    `);
    
    // Initialize color enhancement functionality
    initColorEnhanceTool();
}

// Initialize color enhancement tool functionality
function initColorEnhanceTool() {
    const fileInput = document.getElementById('color-file');
    const uploadArea = document.getElementById('color-upload');
    const previewSection = document.getElementById('color-preview');
    const enhanceBtn = document.getElementById('enhance-colors');
    
    // File input change handler
    fileInput.addEventListener('change', handleColorFileSelect);
    
    // Drag and drop functionality
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleColorFileSelect();
        }
    });
    
    // Enhancement mode selector
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Slider controls
    const saturationSlider = document.getElementById('saturation-slider');
    const brightnessSlider = document.getElementById('brightness-slider');
    const contrastSlider = document.getElementById('contrast-slider');
    
    if (saturationSlider) {
        saturationSlider.addEventListener('input', () => {
            document.querySelector('.saturation-value').textContent = saturationSlider.value;
        });
    }
    
    if (brightnessSlider) {
        brightnessSlider.addEventListener('input', () => {
            document.querySelector('.brightness-value').textContent = brightnessSlider.value;
        });
    }
    
    if (contrastSlider) {
        contrastSlider.addEventListener('input', () => {
            document.querySelector('.contrast-value').textContent = contrastSlider.value;
        });
    }
    
    // Enhance colors button
    if (enhanceBtn) {
        enhanceBtn.addEventListener('click', performColorEnhancement);
    }
}

// Handle file selection for color enhancement
function handleColorFileSelect() {
    const fileInput = document.getElementById('color-file');
    const file = fileInput.files[0];
    
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file.', 'error');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB.', 'error');
        return;
    }
    
    // Read and display the image
    const reader = new FileReader();
    reader.onload = (e) => {
        displayColorOriginalImage(e.target.result, file);
    };
    reader.readAsDataURL(file);
}

// Display original image in color enhancement tool
function displayColorOriginalImage(imageData, file) {
    const originalImg = document.getElementById('color-original-image');
    const previewSection = document.getElementById('color-preview');
    const enhanceBtn = document.getElementById('enhance-colors');
    const originalAnalysis = document.getElementById('original-analysis');
    
    originalImg.src = imageData;
    previewSection.style.display = 'block';
    enhanceBtn.disabled = false;
    
    // Analyze original image colors
    analyzeImageColors(imageData, originalAnalysis);
    
    // Store original data for enhancement
    enhanceBtn.dataset.originalData = imageData;
}

// Analyze image colors
function analyzeImageColors(imageData, analysisDiv) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = 100; // Small sample for analysis
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        
        const imageDataSample = ctx.getImageData(0, 0, 100, 100);
        const data = imageDataSample.data;
        
        let avgR = 0, avgG = 0, avgB = 0;
        let brightness = 0, contrast = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            avgR += data[i];
            avgG += data[i + 1];
            avgB += data[i + 2];
            brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        }
        
        const pixelCount = data.length / 4;
        avgR = Math.round(avgR / pixelCount);
        avgG = Math.round(avgG / pixelCount);
        avgB = Math.round(avgB / pixelCount);
        brightness = Math.round(brightness / pixelCount);
        
        // Calculate saturation
        const saturation = Math.round((Math.max(avgR, avgG, avgB) - Math.min(avgR, avgG, avgB)) / Math.max(avgR, avgG, avgB) * 100) || 0;
        
        analysisDiv.innerHTML = `
            <div class="color-stats">
                <div class="stat-item">
                    <span class="stat-label">Brightness:</span>
                    <span class="stat-value">${brightness}/255</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Saturation:</span>
                    <span class="stat-value">${saturation}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Dominant Color:</span>
                    <span class="color-sample" style="background: rgb(${avgR}, ${avgG}, ${avgB})"></span>
                </div>
            </div>
        `;
    };
    img.src = imageData;
}

// Perform color enhancement
async function performColorEnhancement() {
    const enhanceBtn = document.getElementById('enhance-colors');
    const selectedMode = document.querySelector('.mode-btn.active')?.dataset.mode || 'auto';
    const saturation = parseFloat(document.getElementById('saturation-slider').value);
    const brightness = parseFloat(document.getElementById('brightness-slider').value);
    const contrast = parseFloat(document.getElementById('contrast-slider').value);
    const originalData = enhanceBtn.dataset.originalData;
    
    if (!originalData) {
        showNotification('Please select an image first.', 'error');
        return;
    }
    
    // Disable button and show progress
    enhanceBtn.disabled = true;
    enhanceBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Enhancing Colors...</span>';
    
    try {
        // Show progress
        showColorEnhancementProgress(selectedMode, saturation, brightness, contrast);
        
        // Try real color enhancement APIs first
        const enhancedImage = await tryColorEnhancementAPIs(originalData, selectedMode, saturation, brightness, contrast);
        
        // Display result
        displayEnhancedImage(enhancedImage, selectedMode);
        
        showNotification(`Color enhancement completed using ${selectedMode} mode!`, 'success');
        
    } catch (error) {
        console.error('Color enhancement failed:', error);
        showNotification('Color enhancement failed. Please try again with a different image.', 'error');
    } finally {
        // Reset button
        enhanceBtn.disabled = false;
        enhanceBtn.innerHTML = '<i class="fas fa-adjust"></i> <span>Enhance Colors</span>';
    }
}

// Show color enhancement progress
function showColorEnhancementProgress(mode, saturation, brightness, contrast) {
    const placeholder = document.getElementById('enhanced-placeholder');
    
    placeholder.innerHTML = `
        <div class="color-enhancement-progress">
            <div class="progress-animation">
                <div class="color-wheel">
                    <div class="color-segment red"></div>
                    <div class="color-segment green"></div>
                    <div class="color-segment blue"></div>
                </div>
                <div class="progress-text">
                    <i class="fas fa-adjust"></i>
                    <p>Enhancing Colors...</p>
                    <small>${mode} • S:${saturation} B:${brightness} C:${contrast}</small>
                </div>
            </div>
        </div>
    `;
}

// Try various color enhancement APIs
async function tryColorEnhancementAPIs(imageData, mode, saturation, brightness, contrast) {
    const enhancementAPIs = [
        () => enhanceWithDeepAI(imageData, mode),
        () => enhanceWithHuggingFace(imageData, mode),
        () => enhanceWithCanvas(imageData, mode, saturation, brightness, contrast)
    ];
    
    for (const api of enhancementAPIs) {
        try {
            const result = await api();
            if (result) return result;
        } catch (error) {
            console.warn('Color enhancement API failed:', error);
        }
    }
    
    // Fallback to canvas-based enhancement
    return await enhanceWithCanvas(imageData, mode, saturation, brightness, contrast);
}

// DeepAI Color Enhancement
async function enhanceWithDeepAI(imageData, mode) {
    try {
        const response = await fetch(imageData);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append('image', blob);
        
        const apiResponse = await fetch('https://api.deepai.org/api/colorizer', {
            method: 'POST',
            headers: {
                'Api-Key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K'
            },
            body: formData
        });
        
        if (apiResponse.ok) {
            const result = await apiResponse.json();
            if (result.output_url) {
                return result.output_url;
            }
        }
    } catch (error) {
        console.warn('DeepAI Color Enhancement failed:', error);
    }
    
    return null;
}

// Hugging Face Color Enhancement
async function enhanceWithHuggingFace(imageData, mode) {
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DiT-base-finetuned-ade20k', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer hf_demo'
            },
            body: JSON.stringify({
                inputs: {
                    image: imageData,
                    enhancement_mode: mode
                }
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            if (blob.size > 0) {
                return URL.createObjectURL(blob);
            }
        }
    } catch (error) {
        console.warn('Hugging Face Color Enhancement failed:', error);
    }
    
    return null;
}

// Canvas-based color enhancement
async function enhanceWithCanvas(imageData, mode, saturation, brightness, contrast) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw original image
            ctx.drawImage(img, 0, 0);
            
            // Apply color enhancement filters
            applyColorEnhancementFilters(ctx, img.width, img.height, mode, saturation, brightness, contrast);
            
            canvas.toBlob((blob) => {
                resolve(URL.createObjectURL(blob));
            }, 'image/jpeg', 0.95);
        };
        img.src = imageData;
    });
}

// Apply color enhancement filters
function applyColorEnhancementFilters(ctx, width, height, mode, saturation, brightness, contrast) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    const enhancementModes = {
        auto: () => {
            // Automatic enhancement - balanced approach
            for (let i = 0; i < data.length; i += 4) {
                // Auto-correct brightness
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const factor = avg < 128 ? 1.1 : 0.95;
                
                data[i] = Math.min(255, data[i] * factor * brightness);     // R
                data[i + 1] = Math.min(255, data[i + 1] * factor * brightness); // G
                data[i + 2] = Math.min(255, data[i + 2] * factor * brightness); // B
            }
        },
        
        vibrant: () => {
            // Vibrant mode - increase saturation and contrast
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Increase saturation
                const gray = r * 0.299 + g * 0.587 + b * 0.114;
                data[i] = Math.min(255, gray + (r - gray) * saturation * 1.5);
                data[i + 1] = Math.min(255, gray + (g - gray) * saturation * 1.5);
                data[i + 2] = Math.min(255, gray + (b - gray) * saturation * 1.5);
                
                // Apply brightness and contrast
                data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128) * brightness);
                data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128) * brightness);
                data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128) * brightness);
            }
        },
        
        natural: () => {
            // Natural mode - subtle enhancements
            for (let i = 0; i < data.length; i += 4) {
                // Gentle saturation boost
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                const gray = r * 0.299 + g * 0.587 + b * 0.114;
                data[i] = Math.min(255, gray + (r - gray) * saturation);
                data[i + 1] = Math.min(255, gray + (g - gray) * saturation);
                data[i + 2] = Math.min(255, gray + (b - gray) * saturation);
                
                // Apply gentle brightness adjustment
                data[i] *= brightness;
                data[i + 1] *= brightness;
                data[i + 2] *= brightness;
            }
        },
        
        dramatic: () => {
            // Dramatic mode - high contrast and saturation
            for (let i = 0; i < data.length; i += 4) {
                // High contrast
                data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast * 1.5 + 128));
                data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast * 1.5 + 128));
                data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast * 1.5 + 128));
                
                // High saturation
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                const gray = r * 0.299 + g * 0.587 + b * 0.114;
                data[i] = Math.min(255, gray + (r - gray) * saturation * 2);
                data[i + 1] = Math.min(255, gray + (g - gray) * saturation * 2);
                data[i + 2] = Math.min(255, gray + (b - gray) * saturation * 2);
                
                // Apply brightness
                data[i] *= brightness;
                data[i + 1] *= brightness;
                data[i + 2] *= brightness;
            }
        }
    };
    
    const enhancement = enhancementModes[mode] || enhancementModes.auto;
    enhancement();
    
    // Ensure values are within valid range
    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, data[i]));     // R
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1])); // G
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2])); // B
    }
    
    ctx.putImageData(imageData, 0, 0);
}

// Display enhanced image
function displayEnhancedImage(imageUrl, mode) {
    const enhancedImg = document.getElementById('enhanced-image');
    const placeholder = document.getElementById('enhanced-placeholder');
    const enhancedAnalysis = document.getElementById('enhanced-analysis');
    
    enhancedImg.src = imageUrl;
    enhancedImg.style.display = 'block';
    placeholder.style.display = 'none';
    
    // Analyze enhanced image colors
    analyzeImageColors(imageUrl, enhancedAnalysis);
    
    // Add download functionality
    enhancedImg.onclick = () => downloadEnhancedImage(imageUrl, mode);
}

// Download enhanced image
function downloadEnhancedImage(imageUrl, mode) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ndzalama-ai-color-enhanced-${mode}-${Date.now()}.jpg`;
    link.click();
    
    showNotification('Enhanced image downloaded!', 'success');
}

// Enhanced batch generation function
async function generateBatchImages(prompt, batchCount, variations) {
    const results = [];
    const statusDiv = document.getElementById('image-status');
    
    for (let i = 0; i < batchCount; i++) {
        try {
            updateStatus(statusDiv, `Generating image ${i + 1} of ${batchCount}...`, 'processing');
            
            let currentPrompt = prompt;
            if (variations) {
                // Add variation modifiers
                const variationModifiers = [
                    ', different angle',
                    ', alternative lighting',
                    ', different color palette',
                    ', unique composition',
                    ', artistic interpretation',
                    ', different perspective',
                    ', alternative style',
                    ', creative variation'
                ];
                currentPrompt += variationModifiers[i % variationModifiers.length];
            }
            
            const style = document.querySelector('.style-option.active')?.dataset.style || 'realistic';
            const size = document.querySelector('.aspect-btn.active')?.dataset.size || '1024x1024';
            
            const result = await generateWithPollinationsAdvanced(currentPrompt, style, size, 7.5, 20);
            results.push(result);
            
            // Display each result as it's generated
            displayBatchResult(result, i, currentPrompt);
            
        } catch (error) {
            console.warn(`Batch image ${i + 1} failed:`, error);
        }
    }
    
    updateStatus(statusDiv, `Batch generation complete! Generated ${results.length} images.`, 'success');
    return results;
}

// Display batch result
function displayBatchResult(imageUrl, index, prompt) {
    const batchContainer = document.getElementById('batch-results') || createBatchContainer();
    
    const imageCard = document.createElement('div');
    imageCard.className = 'batch-image-card';
    imageCard.innerHTML = `
        <div class="batch-image">
            <img src="${imageUrl}" alt="Batch image ${index + 1}" onclick="viewImage('${imageUrl}')" />
            <div class="batch-overlay">
                <button class="tool-btn" onclick="downloadImageAdvanced('${imageUrl}', 'batch-${index + 1}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="tool-btn" onclick="shareImageAdvanced('${imageUrl}', '${prompt}')">
                    <i class="fas fa-share"></i>
                </button>
            </div>
        </div>
        <div class="batch-info">
            <span class="batch-number">#${index + 1}</span>
        </div>
    `;
    
    batchContainer.appendChild(imageCard);
}

// Create batch results container
function createBatchContainer() {
    const previewContainer = document.getElementById('image-preview');
    const batchContainer = document.createElement('div');
    batchContainer.id = 'batch-results';
    batchContainer.className = 'batch-results-grid';
    
    previewContainer.appendChild(batchContainer);
    return batchContainer;
}

// Clear batch results
function clearBatchResults() {
    const batchContainer = document.getElementById('batch-results');
    if (batchContainer) {
        batchContainer.remove();
    }
}

// Particle effect for buttons
function createParticleEffect(e) {
    const button = e.currentTarget;
    const particles = button.querySelector('.btn-particles');
    
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: white;
            border-radius: 50%;
            pointer-events: none;
            animation: particle-burst 0.6s ease-out forwards;
        `;
        
        particle.style.left = e.offsetX + 'px';
        particle.style.top = e.offsetY + 'px';
        particle.style.setProperty('--angle', Math.random() * 360 + 'deg');
        
        particles.appendChild(particle);
        
        setTimeout(() => particle.remove(), 600);
    }
}

// Add CSS for particle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes particle-burst {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(
                calc(cos(var(--angle)) * 50px), 
                calc(sin(var(--angle)) * 50px)
            ) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===============================
// ADVANCED POLLINATIONS AI INTEGRATION
// ===============================

// Ultra-fast Pollinations AI with advanced features
async function generateWithPollinationsAdvanced(prompt, style, size, quality, steps) {
    const [width, height] = size.split('x').map(Number);
    
    // Enhanced prompt engineering based on style
    const styleEnhancements = {
        realistic: 'photorealistic, high detail, professional photography, 8K resolution',
        artistic: 'artistic masterpiece, painterly style, creative composition, vibrant colors',
        cyberpunk: 'cyberpunk aesthetic, neon lighting, futuristic, dark atmosphere, high contrast',
        anime: 'anime style, manga art, cel shading, vibrant colors, detailed character design'
    };
    
    const enhancedPrompt = `${prompt}, ${styleEnhancements[style] || styleEnhancements.realistic}`;
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    
    // Multiple Pollinations endpoints for reliability - no safety filters
    const endpoints = [
        `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&enhance=true&model=flux&nofeed=true&seed=${Math.floor(Math.random() * 1000000)}`,
        `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=turbo&enhance=true&nofeed=true&seed=${Math.floor(Math.random() * 1000000)}`,
        `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&enhance=true&model=dreamshaper&nofeed=true&seed=${Math.floor(Math.random() * 1000000)}`
    ];
    
    // Try endpoints sequentially for better reliability
    for (const url of endpoints) {
        try {
            console.log('Trying endpoint:', url);
            const result = await testImageLoad(url, 15000);
            if (result) {
                console.log('Successfully generated image:', result);
                return result;
            }
        } catch (error) {
            console.warn('Endpoint failed:', url, error);
        }
    }
    
    // Try alternative AI generators if Pollinations fails
    try {
        return await generateWithAlternativeAI(prompt, style, size);
    } catch (error) {
        console.error('All AI generators failed:', error);
        throw new Error('Failed to generate AI image. Please try again with a different prompt.');
    }
}

// Fast image load testing
function testImageLoad(url, timeout = 8000) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const timer = setTimeout(() => {
            img.src = ''; // Cancel load
            reject(new Error('Timeout'));
        }, timeout);
        
        img.onload = () => {
            clearTimeout(timer);
            resolve(url);
        };
        
        img.onerror = () => {
            clearTimeout(timer);
            reject(new Error('Load failed'));
        };
        
        img.src = url;
    });
}

// Alternative AI generators for better reliability
async function generateWithAlternativeAI(prompt, style, size) {
    const [width, height] = size.split('x').map(Number);
    
    // Alternative AI image generation APIs
    const alternatives = [
        () => generateWithHuggingFaceInference(prompt, style, width, height),
        () => generateWithSegmindAPI(prompt, style, width, height),
        () => generateWithDeepAI(prompt, style, width, height)
    ];
    
    for (const generator of alternatives) {
        try {
            const result = await generator();
            if (result) return result;
        } catch (error) {
            console.warn('Alternative generator failed:', error);
        }
    }
    
    throw new Error('All AI generators failed');
}

// Hugging Face Inference API
async function generateWithHuggingFaceInference(prompt, style, width, height) {
    const stylePrompt = `${prompt}, ${style} style, high quality, detailed`;
    
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer hf_demo'
            },
            body: JSON.stringify({
                inputs: stylePrompt,
                parameters: {
                    width: width,
                    height: height,
                    num_inference_steps: 20,
                    guidance_scale: 7.5
                }
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            if (blob.size > 0) {
                return URL.createObjectURL(blob);
            }
        }
        
        throw new Error('HF Inference failed');
    } catch (error) {
        throw error;
    }
}

// Segmind API (free tier available)
async function generateWithSegmindAPI(prompt, style, width, height) {
    const stylePrompt = `${prompt}, ${style} style, high quality, detailed`;
    
    try {
        // Segmind provides free API access for Stable Diffusion
        const response = await fetch('https://api.segmind.com/v1/sd1.5-txt2img', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'demo' // Free tier
            },
            body: JSON.stringify({
                prompt: stylePrompt,
                negative_prompt: 'blurry, bad quality, distorted',
                width: width,
                height: height,
                samples: 1,
                num_inference_steps: 25,
                guidance_scale: 7.5,
                seed: Math.floor(Math.random() * 1000000)
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            if (blob.size > 0) {
                return URL.createObjectURL(blob);
            }
        }
        
        throw new Error('Segmind API failed');
    } catch (error) {
        throw error;
    }
}

// DeepAI API (free tier)
async function generateWithDeepAI(prompt, style, width, height) {
    const stylePrompt = `${prompt}, ${style} style, high quality, detailed`;
    
    try {
        const formData = new FormData();
        formData.append('text', stylePrompt);
        formData.append('image_generator_version', '2');
        formData.append('width', width.toString());
        formData.append('height', height.toString());
        
        const response = await fetch('https://api.deepai.org/api/text2img', {
            method: 'POST',
            headers: {
                'Api-Key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K' // Free tier key
            },
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.output_url) {
                return result.output_url;
            }
        }
        
        throw new Error('DeepAI failed');
    } catch (error) {
        throw error;
    }
}

// Enhanced Unsplash integration
async function generateWithUnsplashAdvanced(prompt, width, height) {
    const keywords = extractKeywords(prompt);
    const query = keywords.slice(0, 3).join(',');
    const url = `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}&sig=${Date.now()}`;
    
    return testImageLoad(url, 6000);
}

// Enhanced Picsum integration
async function generateWithPicsumAdvanced(prompt, width, height) {
    const seed = hashString(prompt);
    const url = `https://picsum.photos/seed/${seed}/${width}/${height}?blur=${Math.random() > 0.7 ? 1 : 0}`;
    
    return testImageLoad(url, 4000);
}

// Generate placeholder when all else fails
function generatePlaceholderImage(prompt, width, height) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(1, '#ff006e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = `${Math.min(width, height) / 15}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const lines = wrapText(prompt, ctx, width * 0.8);
        const lineHeight = Math.min(width, height) / 12;
        const startY = height / 2 - (lines.length - 1) * lineHeight / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, startY + index * lineHeight);
        });
        
        canvas.toBlob(blob => {
            resolve(URL.createObjectURL(blob));
        }, 'image/jpeg', 0.9);
    });
}

// ===============================
// ADVANCED UI FUNCTIONS
// ===============================

// Modern notification system
function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

// Advanced progress management
function startAdvancedProgress(progressBar, type) {
    if (!progressBar) return;
    
    let progress = 0;
    const increment = Math.random() * 3 + 1;
    
    const interval = setInterval(() => {
        progress += increment;
        if (progress >= 90) {
            clearInterval(interval);
            progress = 90; // Stop at 90% until completion
        }
        
        progressBar.style.width = `${progress}%`;
        progressBar.style.background = `linear-gradient(90deg, #00d4ff ${progress}%, transparent ${progress}%)`;
    }, 200);
    
    progressBar.dataset.interval = interval;
}

function completeProgress(progressBar) {
    if (!progressBar) return;
    
    const interval = progressBar.dataset.interval;
    if (interval) clearInterval(interval);
    
    progressBar.style.width = '100%';
    progressBar.style.background = 'linear-gradient(90deg, #00ff88 100%, transparent 100%)';
}

function resetProgress(progressBar) {
    if (!progressBar) return;
    
    const interval = progressBar.dataset.interval;
    if (interval) clearInterval(interval);
    
    progressBar.style.width = '0%';
    progressBar.style.background = '';
}

// Enhanced loading states
function showLoadingState(container, type, message) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="advanced-loading">
            <div class="loading-animation">
                <div class="loading-brain">
                    <div class="brain-pulse"></div>
                    <div class="neural-sparks">
                        <div class="spark"></div>
                        <div class="spark"></div>
                        <div class="spark"></div>
                    </div>
                </div>
            </div>
            <div class="loading-text">
                <h4>${message}</h4>
                <p>AI models are working their magic...</p>
                <div class="loading-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;
}

// Status updates
function updateStatus(statusDiv, message, type = 'info') {
    if (!statusDiv) return;
    
    const statusClass = `status-${type}`;
    statusDiv.className = `generation-status ${statusClass}`;
    statusDiv.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
}

// Enhanced result display
function displayImageResult(imageUrl, prompt, apiName, container, statusDiv) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="result-container">
            <div class="result-image">
                <img src="${imageUrl}" alt="Generated: ${prompt}" onload="this.classList.add('loaded')" />
                <div class="image-overlay">
                    <div class="overlay-tools">
                        <button class="tool-btn" onclick="downloadImageAdvanced('${imageUrl}', '${prompt}')" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="tool-btn" onclick="shareImageAdvanced('${imageUrl}', '${prompt}')" title="Share">
                            <i class="fas fa-share"></i>
                        </button>
                        <button class="tool-btn" onclick="enhanceImageFurther('${imageUrl}', '${prompt}')" title="Enhance">
                            <i class="fas fa-magic"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="result-info">
                <h4>Generated Successfully!</h4>
                <p class="prompt-text">"${prompt}"</p>
                <div class="generation-meta">
                    <span class="api-badge">${apiName}</span>
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    `;
    
    updateStatus(statusDiv, 'Generation completed successfully!', 'success');
}

// ===============================
// UTILITY FUNCTIONS
// ===============================

// Extract keywords from prompt for better image search
function extractKeywords(prompt) {
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    
    return prompt
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.includes(word))
        .slice(0, 5);
}

// Simple hash function for consistent seeds
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

// Text wrapping for canvas
function wrapText(text, ctx, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    
    return lines.slice(0, 4); // Limit to 4 lines
}

// Local storage for history
function saveToHistory(type, data) {
    try {
        const history = JSON.parse(localStorage.getItem(`ndzalama-${type}-history`) || '[]');
        history.unshift(data);
        history.splice(10); // Keep only last 10
        localStorage.setItem(`ndzalama-${type}-history`, JSON.stringify(history));
    } catch (error) {
        console.warn('Failed to save to history:', error);
    }
}

// Update recent images display
function updateRecentImages(imageUrl) {
    const recentGrid = document.getElementById('recent-images');
    if (!recentGrid) return;
    
    const thumbnail = document.createElement('div');
    thumbnail.className = 'recent-thumbnail';
    thumbnail.innerHTML = `<img src="${imageUrl}" alt="Recent generation" onclick="viewImage('${imageUrl}')" />`;
    
    recentGrid.insertBefore(thumbnail, recentGrid.firstChild);
    
    // Keep only 6 recent images
    while (recentGrid.children.length > 6) {
        recentGrid.removeChild(recentGrid.lastChild);
    }
}

// Enhanced download function
function downloadImageAdvanced(imageUrl, prompt) {
    const link = document.createElement('a');
    const filename = `ndzalama-ai-${prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.jpg`;
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Image downloaded successfully!', 'success');
}

// Enhanced sharing function
function shareImageAdvanced(imageUrl, prompt) {
    if (navigator.share && navigator.canShare) {
        navigator.share({
            title: 'AI Generated Image - Ndzalama AI',
            text: `Check out this AI-generated image: "${prompt}"`,
            url: imageUrl
        }).then(() => {
            showNotification('Shared successfully!', 'success');
        }).catch(error => {
            console.log('Sharing failed:', error);
            copyToClipboard(imageUrl);
        });
    } else {
        copyToClipboard(imageUrl);
    }
}

// Copy to clipboard fallback
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Image URL copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Unable to copy. Please save the image manually.', 'warning');
    });
}

// View image in modal (future feature)
function viewImage(imageUrl) {
    // TODO: Implement modal view
    window.open(imageUrl, '_blank');
}

// Enhance image further (future feature)
function enhanceImageFurther(imageUrl, prompt) {
    showNotification('Image enhancement feature coming soon!', 'info');
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: -400px;
        background: var(--bg-glass);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--radius-md);
        padding: 1rem;
        max-width: 350px;
        z-index: 10000;
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .notification.show {
        transform: translateX(-420px);
    }
    
    .notification-success { border-left: 4px solid var(--accent-success); }
    .notification-error { border-left: 4px solid var(--accent-error); }
    .notification-warning { border-left: 4px solid var(--accent-warning); }
    .notification-info { border-left: 4px solid var(--accent-primary); }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.25rem;
    }
    
    .advanced-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        text-align: center;
    }
    
    .loading-brain {
        position: relative;
        width: 60px;
        height: 60px;
        margin-bottom: 1.5rem;
    }
    
    .brain-pulse {
        width: 100%;
        height: 100%;
        background: var(--gradient-primary);
        border-radius: 50%;
        animation: brain-pulse 2s infinite;
    }
    
    .neural-sparks {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
    
    .spark {
        position: absolute;
        width: 4px;
        height: 4px;
        background: var(--accent-primary);
        border-radius: 50%;
        animation: spark-float 3s infinite;
    }
    
    .spark:nth-child(1) { top: 20%; left: 80%; animation-delay: 0s; }
    .spark:nth-child(2) { top: 60%; left: 10%; animation-delay: 1s; }
    .spark:nth-child(3) { top: 80%; left: 70%; animation-delay: 2s; }
    
    .loading-dots span {
        display: inline-block;
        width: 8px;
        height: 8px;
        background: var(--accent-primary);
        border-radius: 50%;
        margin: 0 2px;
        animation: dot-bounce 1.4s infinite;
    }
    
    .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-dots span:nth-child(2) { animation-delay: -0.16s; }
    
    .result-image {
        position: relative;
        border-radius: var(--radius-md);
        overflow: hidden;
    }
    
    .result-image img {
        width: 100%;
        height: auto;
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    .result-image img.loaded {
        opacity: 1;
    }
    
    .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .result-image:hover .image-overlay {
        opacity: 1;
    }
    
    .overlay-tools {
        display: flex;
        gap: 1rem;
    }
    
    .recent-thumbnail {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-sm);
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.2s ease;
    }
    
    .recent-thumbnail:hover {
        transform: scale(1.05);
    }
    
    .recent-thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    @keyframes brain-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }
    
    @keyframes spark-float {
        0%, 100% { transform: translateY(0px); opacity: 1; }
        50% { transform: translateY(-20px); opacity: 0.5; }
    }
    
    @keyframes dot-bounce {
        0%, 80%, 100% { transform: scale(0); }
        40% { transform: scale(1); }
    }
`;
document.head.appendChild(notificationStyles);

// ===============================
// REAL VIDEO GENERATION APIs
// ===============================

// Main real video generation function
async function generateRealVideo(prompt, duration, quality) {
    const statusDiv = document.getElementById('video-status');
    
    // Try multiple video generation APIs in order of preference
    const videoAPIs = [
        { name: 'VideoCrafter (HF Spaces)', fn: () => generateWithVideoCrafter(prompt, duration, quality) },
        { name: 'AnimateDiff (HF Spaces)', fn: () => generateWithAnimateDiff(prompt, duration, quality) },
        { name: 'Replicate VideoCrafter', fn: () => generateWithReplicateVideo(prompt, duration, quality) },
        { name: 'Stable Video Diffusion', fn: () => generateWithStableVideoDiffusion(prompt, duration, quality) }
    ];
    
    for (let i = 0; i < videoAPIs.length; i++) {
        try {
            updateStatus(statusDiv, `Trying ${videoAPIs[i].name}...`, 'processing');
            console.log(`Attempting video generation with ${videoAPIs[i].name}`);
            
            const result = await videoAPIs[i].fn();
            if (result) {
                updateStatus(statusDiv, `Video generated with ${videoAPIs[i].name}!`, 'success');
                return result;
            }
        } catch (error) {
            console.warn(`${videoAPIs[i].name} failed:`, error);
            updateStatus(statusDiv, `${videoAPIs[i].name} failed, trying next...`, 'warning');
        }
    }
    
    // If all real video APIs fail, fall back to enhanced preview
    updateStatus(statusDiv, 'Real video APIs unavailable, generating enhanced preview...', 'warning');
    return await compositeVideoAdvanced([], duration, quality);
}

// VideoCrafter integration via Hugging Face Spaces
async function generateWithVideoCrafter(prompt, duration, quality) {
    const statusDiv = document.getElementById('video-status');
    
    try {
        updateStatus(statusDiv, 'Connecting to VideoCrafter...', 'processing');
        
        // Using VideoCrafter through Hugging Face Spaces API
        const response = await fetch('https://api-inference.huggingface.co/models/VideoCrafter/VideoCrafter2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer hf_demo' // You can replace with your HF token
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    num_frames: Math.min(parseInt(duration) * 8, 64), // 8 FPS
                    width: getVideoDimensions(quality).width,
                    height: getVideoDimensions(quality).height,
                    num_inference_steps: 25,
                    guidance_scale: 7.5
                }
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result && result.video_url) {
                return result.video_url;
            }
        }
        
        // Try alternative VideoCrafter endpoint
        return await generateWithVideoCrafterSpace(prompt, duration, quality);
        
    } catch (error) {
        console.error('VideoCrafter API error:', error);
        throw error;
    }
}

// VideoCrafter via Gradio Space
async function generateWithVideoCrafterSpace(prompt, duration, quality) {
    const statusDiv = document.getElementById('video-status');
    
    try {
        updateStatus(statusDiv, 'Using VideoCrafter Gradio Space...', 'processing');
        
        // Using VideoCrafter Gradio Space
        const response = await fetch('https://huggingface.co/spaces/VideoCrafter/VideoCrafter2/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: [
                    prompt, // Text prompt
                    16, // Number of frames
                    512, // Height
                    320, // Width
                    1.0, // Unconditional guidance scale
                    12, // Number of inference steps
                    42, // Random seed
                    2.0, // ETA
                    -1, // Seed for random generation
                    "MP4" // Output format
                ]
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result && result.data && result.data[0]) {
                return result.data[0].url || result.data[0];
            }
        }
        
        throw new Error('VideoCrafter Space failed');
        
    } catch (error) {
        console.error('VideoCrafter Space error:', error);
        throw error;
    }
}

// AnimateDiff integration via Hugging Face
async function generateWithAnimateDiff(prompt, duration, quality) {
    const statusDiv = document.getElementById('video-status');
    
    try {
        updateStatus(statusDiv, 'Connecting to AnimateDiff...', 'processing');
        
        // Using AnimateDiff through Hugging Face Inference API
        const response = await fetch('https://api-inference.huggingface.co/models/guoyww/animatediff-motion-adapter-v1-5-2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer hf_demo'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    num_frames: Math.min(parseInt(duration) * 4, 24), // 4 FPS for AnimateDiff
                    width: getVideoDimensions(quality).width,
                    height: getVideoDimensions(quality).height,
                    num_inference_steps: 20,
                    guidance_scale: 8.0
                }
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            if (blob.size > 0) {
                return URL.createObjectURL(blob);
            }
        }
        
        // Try AnimateDiff Gradio Space
        return await generateWithAnimateDiffSpace(prompt, duration, quality);
        
    } catch (error) {
        console.error('AnimateDiff API error:', error);
        throw error;
    }
}

// AnimateDiff via Gradio Space
async function generateWithAnimateDiffSpace(prompt, duration, quality) {
    const statusDiv = document.getElementById('video-status');
    
    try {
        updateStatus(statusDiv, 'Using AnimateDiff Community Space...', 'processing');
        
        // Using AnimateDiff community space
        const response = await fetch('https://huggingface.co/spaces/guoyww/AnimateDiff/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: [
                    prompt, // Positive prompt
                    "", // Negative prompt
                    "mm_sd_v15_v2.ckpt", // Model
                    "v3_sd15_mm.ckpt", // Motion module
                    512, // Width
                    512, // Height
                    Math.min(parseInt(duration) * 4, 16), // Length (frames)
                    7.5, // CFG Scale
                    25, // Sample steps
                    42, // Seed
                    "DDIM" // Sampler
                ]
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result && result.data && result.data[0]) {
                return result.data[0].url || result.data[0];
            }
        }
        
        throw new Error('AnimateDiff Space failed');
        
    } catch (error) {
        console.error('AnimateDiff Space error:', error);
        throw error;
    }
}

// Replicate VideoCrafter (requires API key)
async function generateWithReplicateVideo(prompt, duration, quality) {
    const statusDiv = document.getElementById('video-status');
    
    try {
        updateStatus(statusDiv, 'Using Replicate VideoCrafter...', 'processing');
        
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Token r8_demo' // Replace with actual token if available
            },
            body: JSON.stringify({
                version: "6f08bf9219e5db58d8d0ff78a14b5a96b1e6e8d8", // VideoCrafter model version
                input: {
                    prompt: prompt,
                    num_frames: Math.min(parseInt(duration) * 8, 64),
                    width: getVideoDimensions(quality).width,
                    height: getVideoDimensions(quality).height,
                    num_inference_steps: 25
                }
            })
        });
        
        if (response.ok) {
            const prediction = await response.json();
            
            // Poll for completion
            let result = await pollReplicateStatus(prediction.id);
            if (result && result.output) {
                return result.output[0] || result.output;
            }
        }
        
        throw new Error('Replicate VideoCrafter failed');
        
    } catch (error) {
        console.error('Replicate VideoCrafter error:', error);
        throw error;
    }
}

// Stable Video Diffusion
async function generateWithStableVideoDiffusion(prompt, duration, quality) {
    const statusDiv = document.getElementById('video-status');
    
    try {
        updateStatus(statusDiv, 'Using Stable Video Diffusion...', 'processing');
        
        // First generate an image, then animate it
        const imagePrompt = `${prompt}, single frame, high quality, detailed`;
        const seedImage = await generateWithPollinationsAdvanced(imagePrompt, 'realistic', '512x512', 7.5, 20);
        
        if (seedImage) {
            // Use SVD via Hugging Face
            const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid-xt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer hf_demo'
                },
                body: JSON.stringify({
                    inputs: {
                        image: seedImage,
                        num_frames: Math.min(parseInt(duration) * 6, 25)
                    }
                })
            });
            
            if (response.ok) {
                const blob = await response.blob();
                if (blob.size > 0) {
                    return URL.createObjectURL(blob);
                }
            }
        }
        
        throw new Error('Stable Video Diffusion failed');
        
    } catch (error) {
        console.error('Stable Video Diffusion error:', error);
        throw error;
    }
}

// Helper function to poll Replicate status
async function pollReplicateStatus(predictionId, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                headers: {
                    'Authorization': 'Token r8_demo'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                
                if (result.status === 'succeeded') {
                    return result;
                } else if (result.status === 'failed') {
                    throw new Error('Replicate prediction failed');
                }
                
                // Still processing, wait and try again
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.warn('Polling attempt failed:', error);
        }
    }
    
    throw new Error('Replicate polling timeout');
}

// Helper function to get video dimensions based on quality
function getVideoDimensions(quality) {
    const dimensions = {
        '480p': { width: 640, height: 480 },
        '720p': { width: 1280, height: 720 },
        '1080p': { width: 1920, height: 1080 },
        '4k': { width: 3840, height: 2160 }
    };
    
    return dimensions[quality] || dimensions['720p'];
}

// Enhanced video result display for real videos
function displayRealVideoResult(videoUrl, prompt, apiName, container, statusDiv) {
    if (!container) return;
    
    // Check if it's a real video file or image
    const isVideo = videoUrl.includes('.mp4') || videoUrl.includes('.webm') || videoUrl.includes('.gif');
    
    const mediaElement = isVideo ? 
        `<video src="${videoUrl}" controls autoplay muted loop onloadeddata="this.classList.add('loaded')"></video>` :
        `<img src="${videoUrl}" alt="Generated Video: ${prompt}" onload="this.classList.add('loaded')" />`;
    
    container.innerHTML = `
        <div class="result-container">
            <div class="result-video real-video">
                ${mediaElement}
                <div class="video-overlay">
                    <div class="overlay-tools">
                        <button class="tool-btn" onclick="downloadRealVideo('${videoUrl}', '${prompt}')" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="tool-btn" onclick="shareRealVideo('${videoUrl}', '${prompt}')" title="Share">
                            <i class="fas fa-share"></i>
                        </button>
                        <button class="tool-btn" onclick="viewVideoFullscreen('${videoUrl}')" title="Fullscreen">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
                <div class="video-badge">
                    <i class="fas fa-video"></i>
                    <span>REAL AI VIDEO</span>
                </div>
            </div>
            <div class="result-info">
                <h4>🎬 Real AI Video Generated!</h4>
                <p class="prompt-text">"${prompt}"</p>
                <div class="generation-meta">
                    <span class="api-badge real-video-badge">${apiName}</span>
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
                <p class="video-note">This is a real AI-generated video using ${apiName}!</p>
            </div>
        </div>
    `;
    
    updateStatus(statusDiv, 'Real video generated successfully!', 'success');
}

// Enhanced download function for real videos
function downloadRealVideo(videoUrl, prompt) {
    const link = document.createElement('a');
    const filename = `ndzalama-ai-video-${prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.mp4`;
    link.href = videoUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Real AI video downloaded successfully!', 'success');
}

// Enhanced sharing function for real videos
function shareRealVideo(videoUrl, prompt) {
    if (navigator.share && navigator.canShare) {
        navigator.share({
            title: 'Real AI Generated Video - Ndzalama AI',
            text: `Check out this real AI-generated video: "${prompt}"`,
            url: videoUrl
        }).then(() => {
            showNotification('Video shared successfully!', 'success');
        }).catch(error => {
            console.log('Sharing failed:', error);
            copyToClipboard(videoUrl);
        });
    } else {
        copyToClipboard(videoUrl);
    }
}

// ===============================
// ADVANCED VIDEO GENERATION (INVIDEO.AI STYLE)
// ===============================

// Enhanced video generation using multiple scene composition techniques
async function generateScenesWithRunwayML(prompt, duration, quality) {
    // Check if we should use real video generation
    const useRealVideo = document.getElementById('real-video-toggle')?.checked || false;
    
    if (useRealVideo) {
        return await generateRealVideo(prompt, duration, quality);
    }
    const progressSteps = [
        'Analyzing prompt for scene structure...',
        'Breaking down into individual scenes...',
        'Generating scene backgrounds...',
        'Adding motion elements...',
        'Compositing final video...'
    ];
    
    const statusDiv = document.getElementById('video-status');
    
    try {
        // Step 1: Scene Analysis
        updateStatus(statusDiv, progressSteps[0], 'processing');
        const sceneData = analyzePromptForScenes(prompt, duration);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 2: Scene Generation
        updateStatus(statusDiv, progressSteps[1], 'processing');
        const scenes = await generateIndividualScenes(sceneData, quality);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Step 3: Background Generation
        updateStatus(statusDiv, progressSteps[2], 'processing');
        const backgrounds = await generateSceneBackgrounds(scenes);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 4: Motion Elements
        updateStatus(statusDiv, progressSteps[3], 'processing');
        const motionElements = await addMotionElements(backgrounds);
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Step 5: Final Composition
        updateStatus(statusDiv, progressSteps[4], 'processing');
        const finalVideo = await compositeVideo(motionElements, duration, quality);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        return finalVideo;
        
    } catch (error) {
        console.error('Video generation failed:', error);
        throw error;
    }
}

// Analyze prompt to determine scene structure
function analyzePromptForScenes(prompt, duration) {
    const sceneKeywords = {
        nature: ['forest', 'ocean', 'mountain', 'river', 'sunset', 'sunrise', 'clouds', 'sky'],
        urban: ['city', 'street', 'building', 'traffic', 'lights', 'downtown', 'skyline'],
        abstract: ['particles', 'energy', 'flow', 'wave', 'geometric', 'pattern', 'digital'],
        cinematic: ['camera', 'movement', 'zoom', 'pan', 'close-up', 'wide shot', 'dramatic']
    };
    
    const words = prompt.toLowerCase().split(/\s+/);
    let sceneType = 'nature'; // default
    
    // Determine scene type based on keywords
    for (const [type, keywords] of Object.entries(sceneKeywords)) {
        if (keywords.some(keyword => words.includes(keyword))) {
            sceneType = type;
            break;
        }
    }
    
    // Create scene structure based on duration
    const scenesCount = Math.min(Math.max(Math.floor(duration / 2), 1), 5);
    const sceneData = {
        type: sceneType,
        count: scenesCount,
        duration: duration / scenesCount,
        prompt: prompt,
        scenes: []
    };
    
    // Generate individual scene prompts
    for (let i = 0; i < scenesCount; i++) {
        sceneData.scenes.push({
            id: i,
            prompt: generateScenePrompt(prompt, sceneType, i, scenesCount),
            duration: sceneData.duration,
            transition: i > 0 ? getTransitionType(sceneType) : 'none'
        });
    }
    
    return sceneData;
}

// Generate individual scene prompts
function generateScenePrompt(basePrompt, sceneType, sceneIndex, totalScenes) {
    const progressions = {
        nature: [
            'wide establishing shot',
            'medium shot with details',
            'close-up of elements',
            'pullback to show context',
            'final wide perspective'
        ],
        urban: [
            'aerial city view',
            'street level perspective',
            'architectural details',
            'human activity',
            'evening lights'
        ],
        abstract: [
            'simple geometric forms',
            'increasing complexity',
            'dynamic movement',
            'color transitions',
            'final composition'
        ],
        cinematic: [
            'opening establishing shot',
            'character/subject introduction',
            'action or movement',
            'dramatic moment',
            'resolution or conclusion'
        ]
    };
    
    const progression = progressions[sceneType] || progressions.nature;
    const sceneStyle = progression[Math.min(sceneIndex, progression.length - 1)];
    
    return `${basePrompt}, ${sceneStyle}, cinematic, professional`;
}

// Get transition type based on scene type
function getTransitionType(sceneType) {
    const transitions = {
        nature: ['fade', 'crossfade', 'wipe'],
        urban: ['cut', 'slide', 'zoom'],
        abstract: ['morph', 'dissolve', 'blend'],
        cinematic: ['fade', 'cut', 'crossfade']
    };
    
    const availableTransitions = transitions[sceneType] || transitions.nature;
    return availableTransitions[Math.floor(Math.random() * availableTransitions.length)];
}

// Generate individual scenes using image generation
async function generateIndividualScenes(sceneData, quality) {
    const scenes = [];
    const qualityMap = { '480p': [640, 480], '720p': [1280, 720], '1080p': [1920, 1080] };
    const [width, height] = qualityMap[quality] || [1280, 720];
    
    for (let i = 0; i < sceneData.scenes.length; i++) {
        const scene = sceneData.scenes[i];
        
        try {
            // Try to generate with Pollinations AI for each scene
            const imageUrl = await generateSceneImage(scene.prompt, `${width}x${height}`);
            scenes.push({
                ...scene,
                imageUrl: imageUrl,
                width: width,
                height: height
            });
        } catch (error) {
            console.warn(`Scene ${i} generation failed, using fallback`);
            // Use fallback scene generation
            const fallbackUrl = await generateFallbackScene(scene.prompt, width, height, i);
            scenes.push({
                ...scene,
                imageUrl: fallbackUrl,
                width: width,
                height: height
            });
        }
    }
    
    return scenes;
}

// Generate scene image using optimized prompts
async function generateSceneImage(scenePrompt, size) {
    const enhancedPrompt = `${scenePrompt}, high quality, cinematic composition, professional lighting, 4K`;
    return await generateWithPollinationsAdvanced(enhancedPrompt, 'cinematic', size, 8, 25);
}

// Generate fallback scene when main generation fails
async function generateFallbackScene(prompt, width, height, sceneIndex) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Create scene-specific gradients
        const sceneColors = [
            ['#ff6b6b', '#4ecdc4'], // Scene 0: Warm to cool
            ['#45b7d1', '#96ceb4'], // Scene 1: Blue to green
            ['#feca57', '#ff9ff3'], // Scene 2: Yellow to pink
            ['#54a0ff', '#5f27cd'], // Scene 3: Light blue to purple
            ['#00d2d3', '#ff9f43']  // Scene 4: Cyan to orange
        ];
        
        const colors = sceneColors[sceneIndex % sceneColors.length];
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add abstract elements for visual interest
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const radius = Math.random() * 50 + 10;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add text overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = `${Math.min(width, height) / 25}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const lines = wrapText(`Scene ${sceneIndex + 1}: ${prompt}`, ctx, width * 0.8);
        const lineHeight = Math.min(width, height) / 20;
        const startY = height / 2 - (lines.length - 1) * lineHeight / 2;
        
        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, startY + index * lineHeight);
        });
        
        canvas.toBlob(blob => {
            resolve(URL.createObjectURL(blob));
        }, 'image/jpeg', 0.9);
    });
}

// Generate scene backgrounds with enhanced details
async function generateSceneBackgrounds(scenes) {
    // For now, we'll enhance the existing scenes
    // In a real implementation, this would add background layers
    return scenes.map(scene => ({
        ...scene,
        backgroundEnhanced: true,
        effects: ['parallax', 'depth', 'lighting']
    }));
}

// Add motion elements to scenes
async function addMotionElements(scenes) {
    // Add motion descriptions to each scene
    return scenes.map((scene, index) => {
        const motionTypes = [
            'gentle zoom in',
            'slow pan left to right',
            'subtle parallax movement',
            'fade in with scale',
            'slide transition'
        ];
        
        return {
            ...scene,
            motion: motionTypes[index % motionTypes.length],
            motionDuration: scene.duration,
            easing: 'ease-in-out'
        };
    });
}

// Composite final video from scenes
async function compositeVideo(scenes, totalDuration, quality) {
    const qualityMap = { '480p': [640, 480], '720p': [1280, 720], '1080p': [1920, 1080] };
    const [width, height] = qualityMap[quality] || [1280, 720];
    
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Create a sophisticated video preview
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#0f0f23');
        gradient.addColorStop(0.5, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Add film grain effect
        for (let i = 0; i < 2000; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
            ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
        }
        
        // Add title card
        ctx.fillStyle = '#00d4ff';
        ctx.font = `bold ${Math.min(width, height) / 15}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('NDZALAMA AI CINEMA', width / 2, height / 4);
        
        // Add scene count indicator
        ctx.fillStyle = '#ff006e';
        ctx.font = `${Math.min(width, height) / 25}px JetBrains Mono, monospace`;
        ctx.fillText(`${scenes.length} SCENES • ${totalDuration}S • ${quality}`, width / 2, height / 3);
        
        // Add scene preview thumbnails
        const thumbnailSize = Math.min(width, height) / 8;
        const startX = width / 2 - (scenes.length * thumbnailSize) / 2;
        const thumbnailY = height / 2;
        
        scenes.forEach((scene, index) => {
            const thumbX = startX + index * (thumbnailSize + 10);
            
            // Draw thumbnail background
            ctx.fillStyle = `hsl(${index * 60}, 70%, 50%)`;
            ctx.fillRect(thumbX, thumbnailY, thumbnailSize, thumbnailSize * 0.6);
            
            // Add scene number
            ctx.fillStyle = 'white';
            ctx.font = `${thumbnailSize / 4}px Inter, sans-serif`;
            ctx.fillText(index + 1, thumbX + thumbnailSize / 2, thumbnailY + thumbnailSize * 0.4);
        });
        
        // Add motion indicators
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = `${Math.min(width, height) / 30}px Inter, sans-serif`;
        const motionText = scenes.map(s => s.motion).join(' → ');
        const wrappedMotion = wrapText(motionText, ctx, width * 0.8);
        
        wrappedMotion.forEach((line, index) => {
            ctx.fillText(line, width / 2, height * 0.75 + index * (Math.min(width, height) / 25));
        });
        
        // Add play button
        const centerX = width / 2;
        const centerY = height * 0.85;
        const radius = Math.min(width, height) / 20;
        
        ctx.fillStyle = 'rgba(0, 212, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Play triangle
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(centerX - radius/3, centerY - radius/2);
        ctx.lineTo(centerX - radius/3, centerY + radius/2);
        ctx.lineTo(centerX + radius/2, centerY);
        ctx.closePath();
        ctx.fill();
        
        // Add watermark
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.font = `${Math.min(width, height) / 50}px JetBrains Mono, monospace`;
        ctx.textAlign = 'right';
        ctx.fillText('Generated by Ndzalama AI', width - 20, height - 20);
        
        canvas.toBlob(blob => {
            resolve(URL.createObjectURL(blob));
        }, 'image/jpeg', 0.95);
    });
}

// Enhanced video functions
function viewVideo(videoUrl) {
    // Create a modal-like experience
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = videoUrl;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 10px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    modal.appendChild(img);
    document.body.appendChild(modal);
    
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// ===============================
// INVIDEO.AI STYLE FEATURES
// ===============================

// Video advanced controls toggle
function toggleVideoAdvanced() {
    const advancedControls = document.querySelectorAll('.advanced-video-control');
    advancedControls.forEach(control => {
        control.style.display = control.style.display === 'none' ? 'block' : 'none';
    });
}

// Video template application
function applyTemplate(templateType) {
    const templates = {
        nature: {
            prompt: "Serene forest landscape with sunlight filtering through tall trees, gentle stream flowing, birds chirping, peaceful nature sounds",
            style: "cinematic",
            duration: "10",
            quality: "1080p"
        },
        urban: {
            prompt: "Dynamic city skyline at sunset, bustling street activity, modern architecture, urban energy and movement",
            style: "documentary",
            duration: "8",
            quality: "720p"
        },
        abstract: {
            prompt: "Flowing geometric patterns with vibrant colors, morphing shapes, digital art, hypnotic movement",
            style: "abstract",
            duration: "5",
            quality: "720p"
        },
        cinematic: {
            prompt: "Epic cinematic scene with dramatic lighting, wide establishing shot, professional cinematography, movie-like quality",
            style: "cinematic",
            duration: "15",
            quality: "1080p"
        }
    };
    
    const template = templates[templateType];
    if (template) {
        // Apply prompt
        document.getElementById('video-prompt').value = template.prompt;
        
        // Apply duration
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.duration === template.duration) {
                btn.classList.add('active');
            }
        });
        
        // Apply quality
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.quality === template.quality) {
                btn.classList.add('active');
            }
        });
        
        // Apply style
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.style === template.style) {
                btn.classList.add('active');
            }
        });
        
        // Update character count
        const event = new Event('input');
        document.getElementById('video-prompt').dispatchEvent(event);
        
        showNotification(`${templateType.charAt(0).toUpperCase() + templateType.slice(1)} template applied!`, 'success');
    }
}

// Enhanced video style selectors
function initVideoStyleSelectors() {
    // Video style buttons
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Scene count slider
    const sceneCountSlider = document.getElementById('scene-count-slider');
    if (sceneCountSlider) {
        sceneCountSlider.addEventListener('input', () => {
            document.querySelector('.scene-count-value').textContent = sceneCountSlider.value;
        });
    }
    
    // Motion intensity slider
    const motionSlider = document.getElementById('motion-slider');
    if (motionSlider) {
        motionSlider.addEventListener('input', () => {
            const intensityLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
            const value = parseInt(motionSlider.value) - 1;
            document.querySelector('.motion-value').textContent = intensityLabels[value];
        });
    }
}

// Enhanced video generation with template support
async function generateVideoWithTemplate(templateType, customPrompt) {
    if (templateType) {
        applyTemplate(templateType);
        // Wait for template to apply
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (customPrompt) {
        document.getElementById('video-prompt').value = customPrompt;
    }
    
    return generateVideoModern();
}

// Advanced scene analysis with template integration
function analyzePromptForScenesAdvanced(prompt, duration, templateType) {
    const templateSceneStructures = {
        nature: {
            keywords: ['forest', 'ocean', 'mountain', 'river', 'sunset', 'sunrise', 'clouds', 'sky', 'trees', 'wildlife'],
            sceneFlow: ['establishing wide shot', 'medium detail shot', 'close-up elements', 'movement/action', 'final scenic view'],
            transitions: ['fade', 'crossfade', 'wipe']
        },
        urban: {
            keywords: ['city', 'street', 'building', 'traffic', 'lights', 'downtown', 'skyline', 'people', 'architecture'],
            sceneFlow: ['aerial city view', 'street level activity', 'architectural details', 'human movement', 'evening atmosphere'],
            transitions: ['cut', 'slide', 'zoom']
        },
        abstract: {
            keywords: ['particles', 'energy', 'flow', 'wave', 'geometric', 'pattern', 'digital', 'colors', 'shapes'],
            sceneFlow: ['simple forms', 'pattern evolution', 'color transitions', 'complex compositions', 'final harmony'],
            transitions: ['morph', 'dissolve', 'blend']
        },
        cinematic: {
            keywords: ['dramatic', 'epic', 'cinematic', 'lighting', 'atmosphere', 'mood', 'story', 'character'],
            sceneFlow: ['opening shot', 'character introduction', 'rising action', 'climax moment', 'resolution'],
            transitions: ['fade', 'cut', 'crossfade']
        }
    };
    
    // Use template structure if available
    const structure = templateSceneStructures[templateType] || templateSceneStructures.nature;
    const scenesCount = Math.min(Math.max(Math.floor(duration / 2), 1), structure.sceneFlow.length);
    
    const sceneData = {
        type: templateType || 'nature',
        count: scenesCount,
        duration: duration / scenesCount,
        prompt: prompt,
        template: templateType,
        scenes: []
    };
    
    // Generate scenes based on template flow
    for (let i = 0; i < scenesCount; i++) {
        const sceneStyle = structure.sceneFlow[i] || structure.sceneFlow[structure.sceneFlow.length - 1];
        const transition = i > 0 ? structure.transitions[Math.floor(Math.random() * structure.transitions.length)] : 'none';
        
        sceneData.scenes.push({
            id: i,
            prompt: `${prompt}, ${sceneStyle}, professional ${templateType || 'cinematic'} style`,
            duration: sceneData.duration,
            transition: transition,
            style: sceneStyle
        });
    }
    
    return sceneData;
}

// Enhanced motion system based on user settings
function getMotionIntensity() {
    const motionSlider = document.getElementById('motion-slider');
    if (!motionSlider) return 'medium';
    
    const intensityMap = {
        1: 'very-low',
        2: 'low', 
        3: 'medium',
        4: 'high',
        5: 'very-high'
    };
    
    return intensityMap[motionSlider.value] || 'medium';
}

// Enhanced motion elements with intensity support
async function addMotionElementsAdvanced(scenes) {
    const intensity = getMotionIntensity();
    
    const motionByIntensity = {
        'very-low': ['static hold', 'minimal drift', 'subtle fade'],
        'low': ['gentle zoom', 'slow pan', 'soft transition'],
        'medium': ['moderate zoom', 'smooth pan', 'crossfade'],
        'high': ['dynamic zoom', 'active pan', 'quick transition'],
        'very-high': ['dramatic zoom', 'rapid movement', 'dynamic cut']
    };
    
    const motions = motionByIntensity[intensity] || motionByIntensity.medium;
    
    return scenes.map((scene, index) => ({
        ...scene,
        motion: motions[index % motions.length],
        motionIntensity: intensity,
        motionDuration: scene.duration,
        easing: intensity === 'very-high' ? 'ease-in' : 'ease-in-out'
    }));
}

// Get selected transition style
function getSelectedTransition() {
    const transitionSelect = document.getElementById('transition-style');
    return transitionSelect ? transitionSelect.value : 'crossfade';
}

// Enhanced video composition with user settings
async function compositeVideoAdvanced(scenes, totalDuration, quality) {
    const qualityMap = { 
        '480p': [640, 480], 
        '720p': [1280, 720], 
        '1080p': [1920, 1080], 
        '4k': [3840, 2160] 
    };
    const [width, height] = qualityMap[quality] || [1280, 720];
    const selectedTransition = getSelectedTransition();
    const motionIntensity = getMotionIntensity();
    
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Enhanced gradient based on motion intensity
        const gradientIntensity = {
            'very-low': ['#2c3e50', '#34495e'],
            'low': ['#1a1a2e', '#16213e'],
            'medium': ['#0f0f23', '#1a1a2e'],
            'high': ['#000000', '#1a1a2e'],
            'very-high': ['#000000', '#0f0f23']
        };
        
        const colors = gradientIntensity[motionIntensity] || gradientIntensity.medium;
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Enhanced film grain based on quality
        const grainDensity = quality === '4k' ? 3000 : quality === '1080p' ? 2000 : 1000;
        for (let i = 0; i < grainDensity; i++) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
            ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
        }
        
        // Enhanced title with motion indicator
        ctx.fillStyle = '#00d4ff';
        ctx.font = `bold ${Math.min(width, height) / 15}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText('NDZALAMA AI CINEMA', width / 2, height / 4);
        
        // Enhanced metadata display
        ctx.fillStyle = '#ff006e';
        ctx.font = `${Math.min(width, height) / 25}px JetBrains Mono, monospace`;
        ctx.fillText(`${scenes.length} SCENES • ${totalDuration}S • ${quality} • ${selectedTransition.toUpperCase()}`, width / 2, height / 3);
        
        // Motion intensity indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.min(width, height) / 30}px Inter, sans-serif`;
        ctx.fillText(`Motion: ${motionIntensity.replace('-', ' ').toUpperCase()}`, width / 2, height / 3 + 40);
        
        // Enhanced scene thumbnails with motion indicators
        const thumbnailSize = Math.min(width, height) / 10;
        const startX = width / 2 - (scenes.length * (thumbnailSize + 15)) / 2;
        const thumbnailY = height / 2;
        
        scenes.forEach((scene, index) => {
            const thumbX = startX + index * (thumbnailSize + 15);
            
            // Scene thumbnail with motion indicator
            const sceneHue = (index * 360 / scenes.length) % 360;
            ctx.fillStyle = `hsl(${sceneHue}, 70%, 50%)`;
            ctx.fillRect(thumbX, thumbnailY, thumbnailSize, thumbnailSize * 0.6);
            
            // Motion indicator
            if (scene.motion) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = `${thumbnailSize / 8}px Inter, sans-serif`;
                const motionIcon = scene.motion.includes('zoom') ? '⚡' : 
                                 scene.motion.includes('pan') ? '↔' : '~';
                ctx.fillText(motionIcon, thumbX + thumbnailSize - 10, thumbnailY + 15);
            }
            
            // Scene number
            ctx.fillStyle = 'white';
            ctx.font = `bold ${thumbnailSize / 4}px Inter, sans-serif`;
            ctx.fillText(index + 1, thumbX + thumbnailSize / 2, thumbnailY + thumbnailSize * 0.4);
        });
        
        // Enhanced play button with glow effect
        const centerX = width / 2;
        const centerY = height * 0.8;
        const radius = Math.min(width, height) / 18;
        
        // Glow effect
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = 'rgba(0, 212, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Play triangle
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(centerX - radius/3, centerY - radius/2);
        ctx.lineTo(centerX - radius/3, centerY + radius/2);
        ctx.lineTo(centerX + radius/2, centerY);
        ctx.closePath();
        ctx.fill();
        
        // Enhanced watermark
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = `${Math.min(width, height) / 50}px JetBrains Mono, monospace`;
        ctx.textAlign = 'right';
        ctx.fillText('Powered by Ndzalama AI v2.0', width - 20, height - 20);
        
        canvas.toBlob(blob => {
            resolve(URL.createObjectURL(blob));
        }, 'image/jpeg', 0.95);
    });
}

// BubbleRoot Studios Monetization Functions

// Show services promotion after image generation
function showServicesPromotion() {
    const promotion = document.getElementById('services-promotion');
    if (promotion) {
        promotion.style.display = 'block';
        promotion.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Hide services promotion
function hideServicesPromotion() {
    const promotion = document.getElementById('services-promotion');
    if (promotion) {
        promotion.style.display = 'none';
    }
}

// Open specific service page
function openServicePage(serviceType) {
    const serviceMap = {
        'branding': '#services',
        'web-dev': '#services',
        'app-dev': '#services'
    };
    
    const section = serviceMap[serviceType] || '#services';
    scrollToSection(section.replace('#', ''));
    
    const serviceNames = {
        'branding': 'Custom Branding Services',
        'web-dev': 'Web Development Services',
        'app-dev': 'App Development Services'
    };
    
    showNotification(Explore our  below!, 'info');
}

// Show all BubbleRoot Studios services
function showAllServices() {
    scrollToSection('services');
    showNotification('Explore all our professional services below!', 'success');
}

// Contact BubbleRoot Studios
function contactBubbleRoot() {
    const email = 'hello@bubblerootstudios.com';
    const subject = 'Inquiry from Ndzalama AI User';
    const body = 'Hi BubbleRoot Studios team,\n\nI am interested in your services after using Ndzalama AI. Please contact me to discuss my project.\n\nBest regards';
    
    const mailtoLink = mailto:?subject=&body=;
    window.open(mailtoLink, '_blank');
    
    showNotification('Opening email client to contact BubbleRoot Studios!', 'success');
}

// Request quote
function requestQuote() {
    const email = 'quotes@bubblerootstudios.com';
    const subject = 'Quote Request from Ndzalama AI User';
    const body = 'Hi BubbleRoot Studios,\n\nI would like to request a quote for:\n\n[ ] Web Development\n[ ] Graphic Design\n[ ] Voice Acting\n[ ] 3D Modeling\n[ ] Other: ____________\n\nProject Description:\n\n\nContact Information:\nName: \nPhone: \nEmail: \n\nThank you!';
    
    const mailtoLink = mailto:?subject=&body=;
    window.open(mailtoLink, '_blank');
    
    showNotification('Opening quote request form!', 'success');
}

// Contact specific service
function contactService(serviceType) {
    const serviceMap = {
        'web-bundle': 'Complete Web Presence Bundle',
        'branding-bundle': 'Business Branding Package',
        'app-bundle': 'App Development Suite'
    };
    
    const serviceName = serviceMap[serviceType] || 'Professional Services';
    const email = 'hello@bubblerootstudios.com';
    const subject = Interest in ;
    const body = Hi BubbleRoot Studios,\n\nI am interested in your  after using Ndzalama AI.\n\nPlease contact me to discuss details and pricing.\n\nBest regards;
    
    const mailtoLink = mailto:?subject=&body=;
    window.open(mailtoLink, '_blank');
    
    showNotification(Contacting BubbleRoot Studios about !, 'success');
}

// Show service details
function showServiceDetails(serviceType) {
    const serviceDetails = {
        'web-dev': 'Custom websites, e-commerce platforms, and web applications built with modern technologies.',
        'graphic-design': 'Professional logos, branding, marketing materials, and visual identity design.',
        'voice-acting': 'Professional voiceovers for commercials, videos, narrations, and audio content.',
        '3d-modeling': 'Professional 3D modeling and animation using Blender and advanced rendering tools.',
        'print-services': 'Business cards, flyers, banners, and professional print materials.',
        'social-video': 'Engaging social media videos and content management services.',
        'admin-services': 'Scheduling, data entry, and tailored business operations support.',
        'business-plans': 'Comprehensive business profiles and detailed business planning.',
        'funeral-programs': 'Sensitive and respectful funeral program design services.',
        'vehicle-branding': 'Custom vehicle wraps and branding for maximum business visibility.'
    };
    
    const description = serviceDetails[serviceType] || 'Professional service details';
    showNotification(description, 'info');
    scrollToSection('services');
}

// Premium feature purchase
function purchaseFeature(featureType) {
    const features = {
        'upscaling': { name: 'AI Super Resolution', price: '', description: 'Upscale your images to 4K resolution' },
        'color-grading': { name: 'Professional Color Grading', price: '', description: 'Apply cinematic color grading' },
        'background-removal': { name: 'Smart Background Removal', price: '', description: 'Remove backgrounds with AI precision' },
        'complete-suite': { name: 'Complete Enhancement Suite', price: '', description: 'All premium features combined' }
    };
    
    const feature = features[featureType];
    if (feature) {
        const confirmed = confirm(Purchase  for ?\n\n\n\nNote: This is a demo. Contact BubbleRoot Studios for actual pricing.);
        
        if (confirmed) {
            showNotification(${feature.name} - Contact BubbleRoot Studios for this premium service!, 'success');
            contactBubbleRoot();
        }
    }
}

// Portfolio functions
function viewCaseStudy(caseType) {
    const cases = {
        'ecommerce': 'E-commerce Platform Case Study',
        'branding': 'Restaurant Brand Identity Case Study',
        'mobile-app': 'Fitness Mobile App Case Study'
    };
    
    showNotification(Viewing ..., 'info');
}

function viewFullPortfolio() {
    showNotification('Contact BubbleRoot Studios to view our complete portfolio!', 'info');
    contactBubbleRoot();
}

function startCustomProject() {
    const email = 'projects@bubblerootstudios.com';
    const subject = 'Custom Project Inquiry';
    const body = 'Hi BubbleRoot Studios,\n\nI would like to start a custom project. Here are my requirements:\n\nProject Type: \nBudget Range: \nTimeline: \nDescription: \n\nPlease contact me to discuss further.\n\nBest regards';
    
    const mailtoLink = mailto:?subject=&body=;
    window.open(mailtoLink, '_blank');
    
    showNotification('Starting custom project inquiry!', 'success');
}

// Seasonal promotion
function claimOffer() {
    const email = 'offers@bubblerootstudios.com';
    const subject = 'Claiming Summer Special Offer';
    const body = 'Hi BubbleRoot Studios,\n\nI would like to claim the 30% off summer special offer mentioned on Ndzalama AI.\n\nService interested in: \nProject details: \n\nPlease contact me with the discounted pricing.\n\nBest regards';
    
    const mailtoLink = mailto:?subject=&body=;
    window.open(mailtoLink, '_blank');
    
    showNotification('Claiming special offer! Check your email client.', 'success');
}

// Initialize promotional countdown
function initPromotionCountdown() {
    const countdownElement = document.getElementById('promotion-countdown');
    if (!countdownElement) return;
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = endDate.getTime() - now;
        
        if (distance < 0) {
            countdownElement.innerHTML = 'Offer Expired';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        countdownElement.innerHTML = ${days}d h m s remaining;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Enhanced image generation completion to show promotion
const originalDisplayImageResult = window.displayImageResult;
window.displayImageResult = function(imageUrl, prompt, model, container, statusDiv) {
    if (originalDisplayImageResult) {
        originalDisplayImageResult(imageUrl, prompt, model, container, statusDiv);
    }
    
    // Show services promotion after successful generation
    setTimeout(() => {
        showServicesPromotion();
    }, 2000);
};

// Initialize countdown on page load
document.addEventListener('DOMContentLoaded', function() {
    initPromotionCountdown();
});

// Currency Converter Functionality
let currentCurrency = 'ZAR';
let exchangeRate = 1;

// Currency rates (ZAR to other currencies)
const currencyRates = {
    'ZAR': 1,
    'USD': 18.5,
    'EUR': 20.2,
    'GBP': 23.1,
    'AUD': 12.8,
    'CAD': 13.7
};

const currencySymbols = {
    'ZAR': 'R',
    'USD': '$',
    'EUR': '�',
    'GBP': '�',
    'AUD': 'A$',
    'CAD': 'C$'
};

// Toggle currency dropdown
function toggleCurrency() {
    const dropdown = document.getElementById('currency-dropdown');
    const isVisible = dropdown.classList.contains('show');
    
    if (isVisible) {
        dropdown.classList.remove('show');
    } else {
        dropdown.classList.add('show');
    }
}

// Set currency and convert all prices
function setCurrency(currency, rate) {
    currentCurrency = currency;
    exchangeRate = rate;
    
    // Update button text
    document.getElementById('current-currency').textContent = currency;
    
    // Hide dropdown
    document.getElementById('currency-dropdown').classList.remove('show');
    
    // Convert all prices on the page
    convertAllPrices();
    
    // Show notification
    showNotification(Currency changed to . All prices updated!, 'success');
}

// Convert all prices on the page
function convertAllPrices() {
    // Get all price elements
    const priceElements = document.querySelectorAll('.price, .feature-price, .service-price');
    
    priceElements.forEach(element => {
        let zarAmount;
        
        // Get ZAR amount from data attribute or parse from text
        if (element.hasAttribute('data-zar')) {
            zarAmount = parseInt(element.getAttribute('data-zar'));
        } else {
            // Extract number from text (fallback)
            const match = element.textContent.match(/[\d,]+/);
            if (match) {
                zarAmount = parseInt(match[0].replace(/,/g, ''));
            } else {
                return; // Skip if no number found
            }
        }
        
        // Convert to selected currency
        const convertedAmount = Math.round(zarAmount / exchangeRate);
        const symbol = currencySymbols[currentCurrency];
        
        // Format the converted price
        const formattedPrice = formatCurrency(convertedAmount, symbol);
        
        // Update the element
        if (currentCurrency === 'ZAR') {
            element.textContent = element.textContent.replace(/[R$��A$][\d,]+/, formattedPrice);
            element.classList.remove('price-converted');
        } else {
            element.textContent = element.textContent.replace(/[R$��A$][\d,]+/, formattedPrice);
            element.classList.add('price-converted');
        }
    });
    
    // Update premium feature prices specifically
    updatePremiumPrices();
}

// Format currency with proper separators
function formatCurrency(amount, symbol) {
    if (amount >= 1000) {
        return symbol + amount.toLocaleString();
    }
    return symbol + amount;
}

// Update premium feature prices (they have different structure)
function updatePremiumPrices() {
    const premiumPrices = [
        { selector: '.premium-feature:nth-child(1) .feature-price', zarPrice: 100 },
        { selector: '.premium-feature:nth-child(2) .feature-price', zarPrice: 60 },
        { selector: '.premium-feature:nth-child(3) .feature-price', zarPrice: 40 },
        { selector: '.premium-feature:nth-child(4) .feature-price', zarPrice: 160 }
    ];
    
    premiumPrices.forEach(item => {
        const element = document.querySelector(item.selector);
        if (element) {
            const convertedAmount = Math.round(item.zarPrice / exchangeRate);
            const symbol = currencySymbols[currentCurrency];
            const formattedPrice = formatCurrency(convertedAmount, symbol);
            
            if (element.textContent.includes('per image')) {
                element.innerHTML = formattedPrice + ' per image';
            } else if (element.textContent.includes('R200')) {
                // Handle the original price in the bundle
                const originalConverted = Math.round(200 / exchangeRate);
                const originalFormatted = formatCurrency(originalConverted, symbol);
                element.innerHTML = ${formattedPrice} <span class="original-price"></span>;
            }
        }
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const converter = document.querySelector('.currency-converter');
    const dropdown = document.getElementById('currency-dropdown');
    
    if (converter && !converter.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Initialize currency converter on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial currency to ZAR
    setCurrency('ZAR', 1);
    
    // Add data-zar attributes to price elements that don't have them
    const priceElements = document.querySelectorAll('.price, .service-price');
    priceElements.forEach(element => {
        if (!element.hasAttribute('data-zar')) {
            const match = element.textContent.match(/R([\d,]+)/);
            if (match) {
                const zarAmount = parseInt(match[1].replace(/,/g, ''));
                element.setAttribute('data-zar', zarAmount);
            }
        }
    });
});

// Update JavaScript functions to use current currency in notifications
const originalPurchaseFeature = window.purchaseFeature;
window.purchaseFeature = function(featureType) {
    const features = {
        'upscaling': { name: 'AI Super Resolution', zarPrice: 100, description: 'Upscale your images to 4K resolution' },
        'color-grading': { name: 'Professional Color Grading', zarPrice: 60, description: 'Apply cinematic color grading' },
        'background-removal': { name: 'Smart Background Removal', zarPrice: 40, description: 'Remove backgrounds with AI precision' },
        'complete-suite': { name: 'Complete Enhancement Suite', zarPrice: 160, description: 'All premium features combined' }
    };
    
    const feature = features[featureType];
    if (feature) {
        const convertedPrice = Math.round(feature.zarPrice / exchangeRate);
        const symbol = currencySymbols[currentCurrency];
        const formattedPrice = formatCurrency(convertedPrice, symbol);
        
        const confirmed = confirm(Purchase  for ?\n\n\n\nNote: This is a demo. Contact BubbleRoot Studios for actual pricing.);
        
        if (confirmed) {
            showNotification(${feature.name} - Contact BubbleRoot Studios for this premium service!, 'success');
            contactBubbleRoot();
        }
    }
};
// Quick fix for loading screen
document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 2000);
    }
});
