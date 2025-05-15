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

FormInput.displayName = 'FormInput';

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

FormTextarea.displayName = 'FormTextarea';

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

FormSelect.displayName = 'FormSelect';

export { FormInput, FormTextarea, FormSelect }; 