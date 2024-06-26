import {useState} from 'react';
import {MessageProps} from '../components/Message';
import {
  SimpleFormData,
  SimpleFormBase,
  FieldConfigDict,
  ButtonConfigDict,
} from '../components/SimpleFormBase';
import {
  emailSchema,
  nameSchema,
  newPasswordSchema,
  passwordSchema,
} from '../schema';
import {userApi} from '../utils/api';
// import {delay} from '../utils/api';
import {
  CreateUser201Response,
  CreateUserRequest,
  ErrorSchema,
  ResponseError,
} from '../openapi';
import {useAuthContext} from '../hooks/useAuthContext';
import {assertIsError} from '../utils/error';

const fieldConfigDict: FieldConfigDict = {
  name: {
    label: 'Name',
    required: true,
    schema: nameSchema,
  },
  email: {
    label: 'Email',
    required: true,
    schema: emailSchema,
  },
  password: {
    label: 'Password',
    type: 'password',
    required: true,
    schema: newPasswordSchema,
  },
  confirmPassword: {
    label: 'Confirm Password',
    type: 'password',
    required: true,
    schema: passwordSchema,
    validator: (value, formData) => {
      if (value !== formData.password) {
        return 'Password does not match';
      }
      return null;
    },
  },
};
const buttonConfigDict: ButtonConfigDict = {
  submit: {
    label: 'Sign Up',
    type: 'submit',
  },
};
export default function SignUpForm({
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
    try {
      setIsSubmitDisabled(true);
      setMessageProps({
        type: 'info',
        message: `Signing up...`,
      });

      const data: CreateUser201Response = await userApi.createUser({
        createUserRequest: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        } as CreateUserRequest,
      });
      setMessageProps({
        type: 'success',
        message: `Sign up succeeded.`,
      });
      authContext.setAuthStatus({
        isAuthenticated: data.isAuthenticated,
        isEmailVerified: data.isEmailVerified,
        authStrategy: data.authStrategy,
        csrfToken: data.csrfToken || '',
      });
      authContext.setUserProfile(data.userProfile);
      setIsFormDisabled(true);
      onSubmitSuccess();
    } catch (error) {
      assertIsError(error);
      let message: string = error.message;
      if (error instanceof ResponseError) {
        const data = (await error.response.json()) as ErrorSchema;
        message = data.message || error.response.statusText;
      }
      setMessageProps({
        type: 'error',
        message,
      });
      setIsSubmitDisabled(false);
    }
  }
  return (
    <SimpleFormBase
      className="sign-up-form"
      onSubmit={onSubmit}
      fieldConfigDict={fieldConfigDict}
      buttonConfigDict={buttonConfigDict}
      messageProps={messageProps}
    />
  );
}
