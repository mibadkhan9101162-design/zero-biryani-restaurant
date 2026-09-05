/**
 * Vercel Web Analytics Integration
 * 
 * This script initializes Vercel Web Analytics for the Zero Biryani website.
 * It automatically tracks page views and provides custom event tracking capabilities.
 * 
 * When deployed to Vercel, this will automatically start tracking:
 * - Page views
 * - User interactions
 * - Traffic sources
 * 
 * In development mode, tracking is disabled.
 */

(function() {
  // Initialize the analytics queue
  window.va = window.va || function() {
    (window.vaq = window.vaq || []).push(arguments);
  };

  // Detect environment - only track in production on Vercel
  function detectEnvironment() {
    // Check if we're on Vercel deployment
    if (window.location.hostname.includes('vercel.app') || 
        window.location.hostname.includes('vercel.com') ||
        window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'production';
    }
    return 'development';
  }

  const mode = detectEnvironment();
  window.vam = mode;

  // Only inject the script in production
  if (mode === 'production') {
    // Create and inject the Vercel Analytics script
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    
    // Append to head
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    console.log('Vercel Web Analytics initialized');
  } else {
    console.log('Vercel Web Analytics: Development mode - tracking disabled');
  }
})();
