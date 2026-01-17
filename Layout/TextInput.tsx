/* eslint-disable react/jsx-props-no-spreading */
import { forwardRef } from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  type?: string;
  error?: {
    message?: string;
  };
  icon?: React.ReactNode;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, type, error, icon, ...restProps }, ref) => {
    const errorClassName = 'border-danger';
    return (
      <>
        

        <div className='d-grid'>

          <div className="input-group">
            {/* <span className="input-group-text">{icon}</span> */}
            <input type={type || 'text'} className={`px-3 py-2 form-control border border-secondary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary ${className} ${error && errorClassName
              }`}

              {...restProps}
              ref={ref} />
          </div>
          {error?.message && <p className="text-error small font-weight-medium pt-1">{error.message}</p>}
        </div>
      </>
    );
  }
);

TextInput.displayName = 'TextInput';
export default TextInput;
