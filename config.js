// Ndzalama AI - Configuration File
// By Brilliant Mashele - BubbleRoot Studios

const CONFIG = {
    // API Endpoints
    apis: {
        // Primary image generation API (Hugging Face)
        huggingface: {
            endpoint: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
            token: 'hf_demo', // Replace with your own token for production
            model: 'stabilityai/stable-diffusion-xl-base-1.0'
        },
        
        // Alternative image generation API (Pollinations.ai)
        pollinations: {
            endpoint: 'https://image.pollinations.ai/prompt/',
            baseParams: {
                width: 512,
                height: 512,
                nologo: true
            }
        },
        
        // Future video generation APIs
        video: {
            // RunwayML API (when available)
            runwayml: {
                endpoint: 'https://api.runwayml.com/v1/generate',
                token: null // Add your token when ready
            },
            
            // Stability AI Video (when available)
            stability: {
                endpoint: 'https://api.stability.ai/v1/video/generate',
                token: null // Add your token when ready
            }
        }
    },
    
    // Default settings
    defaults: {
        image: {
            style: 'realistic',
            size: '512x512',
            negativePrompt: 'blurry, bad quality, distorted',
            steps: 20,
            guidanceScale: 7.5
        },
        
        video: {
            duration: 5,
            quality: '720p',
            fps: 24
        }
    },
    
    // UI Configuration
    ui: {
        maxPromptLength: 500,
        showAdvancedOptions: false,
        enableOfflineMode: true,
        autoSaveResults: true
    },
    
    // Error messages
    messages: {
        errors: {
            noPrompt: 'Please enter a description for your {type}.',
            apiError: 'Failed to generate {type}. This might be due to API limits or server issues. Please try again later.',
            networkError: 'Network error. Please check your internet connection.',
            rateLimited: 'API rate limit exceeded. Please wait a moment before trying again.',
            invalidResponse: 'Received invalid response from API.'
        },
        
        success: {
            imageGenerated: 'Image generated successfully!',
            videoGenerated: 'Video generated successfully!'
        },
        
        info: {
            processing: 'Generating your {type}...',
            offline: "You're offline. Some features may not work properly.",
            demoMode: 'This is a demonstration. In the full version, this would be an actual AI-generated video.'
        }
    },
    
    // Feature flags
    features: {
        imageGeneration: true,
        videoGeneration: true, // Currently demo only
        batchProcessing: false,
        userAccounts: false,
        socialSharing: false,
        advancedControls: false
    },
    
    // Performance settings
    performance: {
        maxConcurrentRequests: 3,
        requestTimeout: 60000, // 60 seconds
        retryAttempts: 3,
        retryDelay: 2000 // 2 seconds
    },
    
    // Analytics (optional)
    analytics: {
        enabled: false,
        trackGenerations: false,
        trackErrors: false
    }
};

// Utility functions for configuration
const ConfigUtils = {
    // Get API endpoint for specific service
    getApiEndpoint(service, type = 'image') {
        if (type === 'video') {
            return CONFIG.apis.video[service]?.endpoint || null;
        }
        return CONFIG.apis[service]?.endpoint || null;
    },
    
    // Get default settings for type
    getDefaults(type) {
        return CONFIG.defaults[type] || {};
    },
    
    // Check if feature is enabled
    isFeatureEnabled(feature) {
        return CONFIG.features[feature] || false;
    },
    
    // Get error message
    getErrorMessage(key, type = 'content') {
        const message = CONFIG.messages.errors[key] || 'An error occurred.';
        return message.replace('{type}', type);
    },
    
    // Get success message
    getSuccessMessage(key) {
        return CONFIG.messages.success[key] || 'Operation completed successfully.';
    },
    
    // Get info message
    getInfoMessage(key, type = 'content') {
        const message = CONFIG.messages.info[key] || 'Processing...';
        return message.replace('{type}', type);
    },
    
    // Update configuration at runtime
    updateConfig(path, value) {
        const keys = path.split('.');
        let current = CONFIG;
        
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
    }
};

// Export for use in other files (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ConfigUtils };
}
