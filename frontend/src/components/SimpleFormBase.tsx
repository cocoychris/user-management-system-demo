import {Button, TextField} from '@mui/material';
import {Message, MessageProps} from './Message';
import {ZodSchema} from 'zod';
import {useState} from 'react';
import './SimpleFormBase.css';

export interface SimpleFormBaseProps {
  className?: string;
  onSubmit: (
    formData: SimpleFormData,
    setIsSubmitDisabled: (isDisabled: boolean) => void,
    setIsFormDisabled: (isDisabled: boolean) => void
  ) => void;
  messageProps?: MessageProps;
  fieldConfigDict?: FieldConfigDict;
  buttonConfigDict?: ButtonConfigDict;
}
export interface FieldConfig {
  label: string;
  type?: React.HTMLInputTypeAttribute;
  defaultValue?: string;
  required?: boolean;
  schema?: ZodSchema;
  validator?: (value: string, formData: SimpleFormData) => null | string;
}
export interface ButtonConfig {
  label: string;
  type: 'submit' | 'button';
  disabled?: boolean;
  onClick?: () => void;
}
export type SimpleFormData = Partial<Record<string, string>>;
export type FieldConfigDict = Partial<Record<string, FieldConfig>>;
export type ButtonConfigDict = Partial<Record<string, ButtonConfig>>;
type FieldErrorDict = Partial<Record<string, string>>;
/**
 * Generates a simple form with text fields and buttons.
 *
 * It does the following things for you automatically:
 * - Field validation: will validate fields based on the provided schema and validator.
 * - Submit button disabling: will disable the submit button if there are any invalid fields.
 * - Error message display: will display error messages for invalid fields.
 *
 * The only thing you need to do is:
 * - Define the fields and buttons using the fieldConfigDict and buttonConfigDict props.
 * - Provide the onSubmit function to handle the form submission.
 *
 * @autor Andrash Yang cocoychris@gmail.com
 */
export function SimpleFormBase({
  onSubmit,
  messageProps,
  fieldConfigDict = {},
  className,
  buttonConfigDict = {},
}: SimpleFormBaseProps) {
  const [formData, setFormData] = useState<SimpleFormData>(
    readDefaultValues(fieldConfigDict)
  );
  const [fieldErrorDict, setFieldErrorDict] = useState<FieldErrorDict>({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  function parseFieldValue(
    id: string,
    value: string,
    newFormData: SimpleFormData = formData
  ): {value: string; errorMessage: string | null} {
    const fieldConfig = fieldConfigDict[id];
    if (!fieldConfig) {
      return {value, errorMessage: null};
    }
    if (!value) {
      if (!fieldConfig.required) {
        return {value, errorMessage: null};
      }
      return {
        value,
        errorMessage: 'This field is required',
      };
    }
    if (fieldConfig.schema) {
      const result = fieldConfig.schema.safeParse(value);
      if (!result.success) {
        return {
          value,
          errorMessage: result.error.errors[0].message,
        };
      }
      value = result.data;
    }
    if (fieldConfig.validator) {
      return {
        value,
        errorMessage: fieldConfig.validator(value, newFormData),
      };
    }
    return {value, errorMessage: null};
  }
  function updateErrorDisplay(id: string, errorMessage: string | null): void {
    setFieldErrorDict((fieldErrorDict: FieldErrorDict) => {
      const newErrorDict = {...fieldErrorDict};
      if (errorMessage) {
        newErrorDict[id] = errorMessage;
      } else {
        delete newErrorDict[id];
      }
      return newErrorDict;
    });
  }
  function onFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(formData, setIsSubmitDisabled, setIsFormDisabled);
  }
  function onFieldChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const currentId = event.target.id;
    const currentValue = event.target.value;
    // Update current field value and error display
    const {value: newValue, errorMessage} = parseFieldValue(
      currentId,
      currentValue
    );
    updateErrorDisplay(currentId, errorMessage);
    setFormData((prev: SimpleFormData) => ({...prev, [currentId]: newValue}));
    // Check current field for errors
    let hasError: boolean = errorMessage !== null;
    // Check other fields for errors
    if (!hasError) {
      hasError = Object.keys(fieldConfigDict).some(id => {
        if (id === currentId) {
          return false;
        }
        const value = formData[id] || '';
        const {errorMessage} = parseFieldValue(id, value, {
          ...formData,
          [currentId]: newValue,
        });
        updateErrorDisplay(id, errorMessage);
        return errorMessage !== null;
      });
    }
    setIsSubmitDisabled(hasError);
  }
  return (
    <form
      className={['simple-form-base', className].join(' ').trim()}
      onSubmit={onFormSubmit}
    >
      {Object.keys(fieldConfigDict).map(key => {
        const fieldConfig = fieldConfigDict[key] as FieldConfig;
        return (
          <TextField
            key={key}
            id={key}
            label={fieldConfig.label}
            variant="outlined"
            onChange={onFieldChange}
            onBlur={onFieldChange}
            type={fieldConfig.type}
            defaultValue={fieldConfig.defaultValue}
            required={fieldConfig.required}
            helperText={fieldErrorDict[key]}
            error={fieldErrorDict[key] !== undefined}
            disabled={isFormDisabled}
          />
        );
      })}
      <Message {...messageProps} />
      {Object.keys(buttonConfigDict).map(key => {
        const buttonConfig = buttonConfigDict[key] as ButtonConfig;
        return (
          <Button
            key={key}
            variant="contained"
            color="primary"
            type={buttonConfig.type}
            onClick={buttonConfig.onClick}
            disabled={
              isFormDisabled ||
              buttonConfig.disabled ||
              (buttonConfig.type === 'submit' && isSubmitDisabled)
            }
          >
            {buttonConfig.label}
          </Button>
        );
      })}
    </form>
  );
}

function readDefaultValues(fieldConfigDict: FieldConfigDict): SimpleFormData {
  const formData: SimpleFormData = {};
  Object.keys(fieldConfigDict).forEach(key => {
    const fieldConfig = fieldConfigDict[key] as FieldConfig;
    formData[key] = fieldConfig.defaultValue || '';
  });
  return formData;
}
