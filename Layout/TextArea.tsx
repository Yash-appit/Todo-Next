/* eslint-disable react/jsx-props-no-spreading */
import { forwardRef } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  error?: {
    message?: string;
  };
  icon?: React.ReactNode;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error, icon, ...restProps }, ref) => {
    const errorClassName = 'border-danger';
    return (
      <>
        <div className='d-grid'>
          <div className="input-group">
            {/* <span className="input-group-text">{icon}</span> */}
            <textarea
              className={`px-3 py-2 m-0 form-control border border-secondary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary ${className} ${error && errorClassName
              }`}
              {...restProps}
              ref={ref}
            />
          </div>
          {error?.message && <p className="text-error small font-weight-medium pt-1">{error.message}</p>}
        </div>
      </>
    );
  }
);

TextArea.displayName = 'TextArea';
export default TextArea;