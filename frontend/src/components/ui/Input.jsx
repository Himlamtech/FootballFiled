import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      name,
      id,
      type = 'text',
      placeholder,
      error,
      className = '',
      required = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="mb-4">
        {label && (
          <label
            htmlFor={id || name}
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            {label}
            {required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          id={id || name}
          name={name}
          placeholder={placeholder}
          className={`
            px-3 py-2 w-full text-gray-700 bg-white border rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 