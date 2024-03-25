import {useState} from 'react';
import {MessageProps} from '../components/Message';
import {
  SimpleFormData,
  SimpleFormBase,
  FieldConfigDict,
  ButtonConfigDict,
} from '../components/SimpleFormBase';
import {nameSchema} from '../schema';
import {userApi} from '../utils/api';
import {
  ErrorSchema,
  GetMyProfile200Response,
  ResponseError,
  UpdateMyProfileRequest,
} from '../openapi';
import {assertIsError} from '../utils/error';
import {UserProfile} from '../openapi/models/UserProfile';
import {useAuthContext} from '../hooks/useAuthContext';

export default function EditProfileForm({
  onSubmitSuccess,
  onCanceled,
}: {
  onSubmitSuccess: (userProfile: UserProfile) => void;
  onCanceled?: () => void;
}) {
  const authContext = useAuthContext();
  const [messageProps, setMessageProps] = useState<MessageProps>({});

  const fieldConfigDict: FieldConfigDict = {
    name: {
      label: 'Name',
      required: true,
      schema: nameSchema,
      defaultValue: authContext.userProfile?.name || '',
    },
  };
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
      if (!authContext.authStatus) {
        throw new Error('Auth status is not set');
      }
      const data: GetMyProfile200Response = await userApi.updateMyProfile({
        updateMyProfileRequest: {
          name: formData.name,
        } as UpdateMyProfileRequest,
        xCsrfToken: authContext.authStatus?.csrfToken,
      });
      setMessageProps({
        type: 'success',
        message: `Updated successfully`,
      });
      setIsFormDisabled(true);
      onSubmitSuccess(data.userProfile);
    } catch (error) {
      assertIsError(error);
      let message: string = error.message;
      if (error instanceof ResponseError) {
        const data = await error.response.json() as ErrorSchema;
        message = data.message || error.response.statusText;
      }
      setMessageProps({
        type: 'error',
        message: `Failed to update. ${message}`,
      });
      setIsSubmitDisabled(false);
    }
  }
  return (
    <SimpleFormBase
      className="edit-profile-form"
      onSubmit={onSubmit}
      fieldConfigDict={fieldConfigDict}
      buttonConfigDict={buttonConfigDict}
      messageProps={messageProps}
    />
  );
}
