import React from 'react';

// This component adds proper form attributes to fix HTML validation issues
export const FormInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(({ id, name, label, autoComplete, ...props }, ref) => {
  // Generate a unique ID if not provided
  const inputId = id || `input-${name || Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input
        ref={ref}
        id={inputId}
        name={name || inputId}
        autoComplete={autoComplete || 'on'}
        {...props}
      />
    </div>
  );
});

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }
>(({ id, name, label, autoComplete, ...props }, ref) => {
  // Generate a unique ID if not provided
  const inputId = id || `textarea-${name || Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div>
      {label && <label htmlFor={inputId}>{label}</label>}
      <textarea
        ref={ref}
        id={inputId}
        name={name || inputId}
        autoComplete={autoComplete || 'on'}
        {...props}
      />
    </div>
  );
});

export const FormSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; options: { value: string; label: string }[] }
>(({ id, name, label, options, ...props }, ref) => {
  // Generate a unique ID if not provided
  const inputId = id || `select-${name || Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div>
      {label && <label htmlFor={inputId}>{label}</label>}
      <select
        ref={ref}
        id={inputId}
        name={name || inputId}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

// Add proper cache control headers
export const CacheControlHeaders = () => {
  React.useEffect(() => {
    // This is a client-side component, so we can't directly set HTTP headers
    // In a real application, you would configure this on the server
    // This is just a placeholder to remind you to configure headers on the server
    console.log('Remember to configure proper cache-control headers on the server');
  }, []);
  
  return null;
};

// Fix for content-type header
export const ContentTypeHeaders = () => {
  React.useEffect(() => {
    // This is a client-side component, so we can't directly set HTTP headers
    // In a real application, you would configure this on the server
    console.log('Remember to configure proper content-type headers on the server');
  }, []);
  
  return null;
};

// Fix for security headers
export const SecurityHeaders = () => {
  React.useEffect(() => {
    // This is a client-side component, so we can't directly set HTTP headers
    // In a real application, you would configure this on the server
    console.log('Remember to configure proper security headers on the server');
  }, []);
  
  return null;
};

// Fix for cookie security
export const SecureCookies = () => {
  React.useEffect(() => {
    // This is a client-side component, so we can't directly set HTTP headers
    // In a real application, you would configure this on the server
    console.log('Remember to configure secure cookies on the server');
  }, []);
  
  return null;
};

export default {
  FormInput,
  FormTextarea,
  FormSelect,
  CacheControlHeaders,
  ContentTypeHeaders,
  SecurityHeaders,
  SecureCookies
};
