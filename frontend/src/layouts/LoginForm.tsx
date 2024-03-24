import {useState} from 'react';
import {MessageProps} from '../components/Message';
import {
  SimpleFormData,
  SimpleFormBase,
  FieldConfigDict,
  ButtonConfigDict,
} from '../components/SimpleFormBase';
import {emailSchema, passwordSchema} from '../schema';
import {authApi} from '../utils/api';
import {Login200Response, LoginRequest, ResponseError} from '../openapi';
import {useAuthContext} from '../hooks/useAuthContext';
import {assertIsError} from '../utils/error';

const fieldConfigDict: FieldConfigDict = {
  email: {
    label: 'Email',
    required: true,
    schema: emailSchema,
  },
  password: {
    label: 'Password',
    type: 'password',
    required: true,
    schema: passwordSchema,
  },
};
const buttonConfigDict: ButtonConfigDict = {
  submit: {
    label: 'Login',
    type: 'submit',
  },
};
export default function LoginForm({
  onSubmitSuccess,
}: {
  onSubmitSuccess: () => void;
}) {
  const authContext = useAuthContext();
  const [messageProps, setMessageProps] = useState<MessageProps>({});
  async function onSubmit(
    formData: SimpleFormData,
    setIsSubmitDisabled: (isDisabled: boolean) => void,
    setIsFormDisabled: (isDisabled: boolean) => void
  ) {
    // Disable the submit button
    setIsSubmitDisabled(true);
    setMessageProps({
      type: 'info',
      message: 'Logging in...',
    });
    try {
      const data: Login200Response = await authApi.login({
        loginRequest: {
          email: formData.email,
          password: formData.password,
        } as LoginRequest,
      });
      setMessageProps({type: 'success', message: 'Login successful'});
      authContext.setAuthStatus({
        isAuthenticated: true,
        isEmailVerified: data.isEmailVerified,
      });      
      authContext.setUserProfile(data.userProfile);
      setIsFormDisabled(true);
      onSubmitSuccess();
    } catch (error) {
      assertIsError(error, ResponseError);
      const data = await error.response.json();
      setMessageProps({
        type: 'error',
        message: data.message || error.response.statusText,
      });

      // Enable the submit button
      setIsSubmitDisabled(false);
    }
  }
  return (
    <SimpleFormBase
      className="login-form"
      onSubmit={onSubmit}
      fieldConfigDict={fieldConfigDict}
      buttonConfigDict={buttonConfigDict}
      messageProps={messageProps}
    />
  );
}
