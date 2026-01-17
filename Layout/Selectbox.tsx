import { forwardRef } from 'react';
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  OutlinedInput,
  IconButton,
  InputAdornment
} from '@mui/material';
import { MdClear } from "react-icons/md";


interface SelectBoxProps {
  className?: string;
  name: string;
  error?: {
    message?: string;
  };
  options: {
    value: any;
    disabled?: boolean;
  }[];
  label?: string;
  value?: any;
  onChange?: (event: any) => void;
  onClear?: () => void;
  disabled?: boolean;
}

const SelectBox = forwardRef<HTMLSelectElement, SelectBoxProps>(
  ({ className, error, options, label, value, onChange, onClear, disabled, ...restProps }, ref) => {
    // Handler for clearing the select value
    const handleClearClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      // Stop propagation to prevent the select from opening
      event.stopPropagation();
      
      if (onClear) {
        // Use provided onClear callback if available
        onClear();
      } else if (onChange) {
        // Otherwise simulate a change event with empty value
        const fakeEvent = {
          target: { value: '', name: restProps.name },
        };
        onChange(fakeEvent);
      }
    };

    return (
      <FormControl fullWidth error={!!error} className={className}>
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          inputRef={ref}
          input={
            <OutlinedInput
              label={label}
              endAdornment={
                value && !disabled ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear value"
                      onClick={handleClearClick}
                      edge="end"
                      size="small"
                      className='clear-button'
                    >
                      <MdClear fontSize="small" className='mx-4' />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }
            />
          }
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...restProps}
        >
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.value}
            </MenuItem>
          ))}
        </Select>
        {error?.message && (
          <FormHelperText>{error.message}</FormHelperText>
        )}
      </FormControl>
    );
  }
);

SelectBox.displayName = 'SelectBox';
export default SelectBox;