import {useState} from 'react';
import {MessageProps} from '../components/Message';
import {
  SimpleFormData,
  SimpleFormBase,
  FieldConfigDict,
  ButtonConfigDict,
} from '../components/SimpleFormBase';
import {newPasswordSchema, passwordSchema} from '../schema';
import {userApi} from '../utils/api';
import {ResetPasswordRequest, ResponseError} from '../openapi';
import {assertIsError} from '../utils/error';

const fieldConfigDict: FieldConfigDict = {
  oldPassword: {
    label: 'Old Password',
    required: true,
    type: 'password',
    schema: passwordSchema,
  },
  newPassword: {
    label: 'New Password',
    required: true,
    type: 'password',
    schema: newPasswordSchema,
    validator: (value, formData) => {
      if (value === formData.oldPassword) {
        return 'New password must be different from old password';
      }
      return null;
    },
  },
  confirmPassword: {
    label: 'Confirm Password',
    required: true,
    type: 'password',
    schema: passwordSchema,
    validator: (value, formData) => {
      if (value !== formData.newPassword) {
        return 'Passwords do not match';
      }
      return null;
    },
  },
};
export default function ResetPasswordForm({
  onSubmitSuccess,
  onCanceled,
}: {
  onSubmitSuccess: () => void;
  onCanceled?: () => void;
}) {
  const [messageProps, setMessageProps] = useState<MessageProps>({});
  const buttonConfigDict: ButtonConfigDict = {
    submit: {
      label: 'Update',
      type: 'submit',
    },
    cancel: {
      label: 'Cancel',
      type: 'button',
      onClick: () => {
        if (onCanceled) {
          onCanceled();
        }
      },
    },
  };
  async function onSubmit(
    formData: SimpleFormData,
    setIsSubmitDisabled: (isDisabled: boolean) => void,
    setIsFormDisabled: (isDisabled: boolean) => void
  ) {
    try {
      setIsSubmitDisabled(true);
      setMessageProps({
        type: 'info',
        message: `Updating...`,
      });
      await userApi.resetPassword({
        resetPasswordRequest: {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        } as ResetPasswordRequest,
      });
      setMessageProps({
        type: 'success',
        message: `Updated successfully`,
      });
      setIsFormDisabled(true);
      onSubmitSuccess();
    } catch (error) {
      assertIsError(error, ResponseError);
      const data = await error.response.json();
      setMessageProps({
        type: 'error',
        message: data.message || error.response.statusText,
      });
      setIsSubmitDisabled(false);
    }
  }
  return (
    <SimpleFormBase
      className="reset-password-form"
      onSubmit={onSubmit}
      fieldConfigDict={fieldConfigDict}
      buttonConfigDict={buttonConfigDict}
      messageProps={messageProps}
    />
  );
}
