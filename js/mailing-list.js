/**
 * Paint Factor Mailing List Script
 * Version 1.1.0
 * 
 * This script handles the validation and submission of the mailing list subscription form.
 * Updated to work with Netlify Forms.
 */

(function() {
    'use strict';
    
    // Configuration
    const config = {
        analyticsEnabled: true,
        debugMode: false // Set to true for additional console logging
    };
    
    // DOM elements
    const form = document.getElementById('subscriptionForm');
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const submitLoader = document.getElementById('submitLoader');
    const successMessage = document.getElementById('successMessage');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    // Validation patterns
    const patterns = {
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    };
    
    /**
     * Initialize the form and event listeners
     */
    function init() {
        if (!form) {
            console.error('Subscription form not found on page.');
            return;
        }
        
        // Event listeners
        form.addEventListener('submit', handleSubmit);
        emailInput.addEventListener('blur', validateEmail);
        nameInput.addEventListener('blur', validateName);
        
        // Setup user type tracking for analytics
        setupUserTypeTracking();
        
        logDebug('Mailing list form initialized.');
    }
    
    /**
     * Handle form submission
     * @param {Event} event - The submit event
     */
    async function handleSubmit(event) {
        event.preventDefault();
        
        // Reset error states
        resetErrors();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show loader
        showLoader();
        
        // Gather form data
        const formData = getFormData();
        
        try {
            // Submit form data
            const response = await submitForm(formData);
            
            if (response.success) {
                // Show success message
                showSuccess();
                
                // Track successful subscription
                if (config.analyticsEnabled && window.gtag) {
                    gtag('event', 'subscribe', {
                        'event_category': 'mailing_list',
                        'event_label': formData.userType
                    });
                }
                
                // Reset form
                form.reset();
            } else {
                // Show error message
                showError(response.message || 'Error submitting form. Please try again.');
            }
        } catch (error) {
            // Show error message
            showError('Connection error. Please check your internet connection and try again.');
            logDebug('Submission error:', error);
        }
        
        // Hide loader
        hideLoader();
    }
    
    /**
     * Validate the entire form
     * @returns {boolean} Whether the form is valid
     */
    function validateForm() {
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        
        return isNameValid && isEmailValid;
    }
    
    /**
     * Validate the name field
     * @returns {boolean} Whether the name is valid
     */
    function validateName() {
        const value = nameInput.value.trim();
        
        if (value === '') {
            nameError.textContent = 'Please enter your name';
            return false;
        }
        
        if (value.length < 2) {
            nameError.textContent = 'Name must be at least 2 characters';
            return false;
        }
        
        nameError.textContent = '';
        return true;
    }
    
    /**
     * Validate the email field
     * @returns {boolean} Whether the email is valid
     */
    function validateEmail() {
        const value = emailInput.value.trim();
        
        if (value === '') {
            emailError.textContent = 'Please enter your email address';
            return false;
        }
        
        if (!patterns.email.test(value)) {
            emailError.textContent = 'Please enter a valid email address';
            return false;
        }
        
        emailError.textContent = '';
        return true;
    }
    
    /**
     * Get form data as an object
     * @returns {Object} The form data
     */
    function getFormData() {
        const userType = document.querySelector('input[name="userType"]:checked').value;
        
        const preferences = {
            productUpdates: document.getElementById('prefProductUpdates').checked,
            earlyAccess: document.getElementById('prefEarlyAccess').checked
        };
        
        return {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            userType: userType,
            preferences: preferences,
            source: {
                page: window.location.pathname,
                referrer: document.referrer,
                timestamp: new Date().toISOString()
            }
        };
    }
    
    /**
     * Submit form data using Netlify Forms
     * @param {Object} data - The form data
     * @returns {Promise<Object>} The submission result
     */
    async function submitForm(data) {
        try {
            // For Netlify Forms, we'll let the native form submission handle the data
            // This function is still useful for client-side validation and success handling
            
            // Create a FormData object from the actual form
            const formData = new FormData(form);
            
            // Add the JSON data as a hidden field for additional processing if needed
            formData.append('form-data-json', JSON.stringify(data));
            
            // Submit the form data to Netlify
            await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });
            
            // If we get here, the submission was successful
            return { success: true, message: 'Subscription successful' };
        } catch (error) {
            logDebug('Form submission error:', error);
            return { success: false, message: 'Error submitting form. Please try again.' };
        }
    }
    
    /**
     * Reset error messages
     */
    function resetErrors() {
        nameError.textContent = '';
        emailError.textContent = '';
        errorContainer.style.display = 'none';
        successMessage.style.display = 'none';
    }
    
    /**
     * Show loader
     */
    function showLoader() {
        submitLoader.style.display = 'block';
        form.querySelector('.submit-btn').disabled = true;
    }
    
    /**
     * Hide loader
     */
    function hideLoader() {
        submitLoader.style.display = 'none';
        form.querySelector('.submit-btn').disabled = false;
    }
    
    /**
     * Show success message
     */
    function showSuccess() {
        successMessage.style.display = 'flex';
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    /**
     * Show error message
     * @param {string} message - The error message
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.style.display = 'flex';
        
        // Scroll to error message
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    /**
     * Setup tracking for user type selection
     */
    function setupUserTypeTracking() {
        const userTypeOptions = document.querySelectorAll('input[name="userType"]');
        
        userTypeOptions.forEach(option => {
            option.addEventListener('change', function() {
                if (config.analyticsEnabled && window.gtag) {
                    gtag('event', 'select_user_type', {
                        'event_category': 'mailing_list',
                        'event_label': this.value
                    });
                }
                
                logDebug('User type selected:', this.value);
            });
        });
    }
    
    /**
     * Log debug messages if debug mode is enabled
     * @param  {...any} args - Arguments to log
     */
    function logDebug(...args) {
        if (config.debugMode) {
            console.log('[Mailing List]', ...args);
        }
    }
    
    // Initialize the script on DOM load
    document.addEventListener('DOMContentLoaded', init);
})();
