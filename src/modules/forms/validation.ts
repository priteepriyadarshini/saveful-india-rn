import { ErrorOption } from 'react-hook-form';
import { Alert } from 'react-native';

export interface ValidationErrors {
  [field: string]: string[] | ValidationErrors;
}

export function getValidationErrorsFromError(e: unknown) {

  if (
    Object.prototype.hasOwnProperty.call(e, 'status') &&
    Object.prototype.hasOwnProperty.call(e, 'data')
  ) {
    const error = e as { data: { errors: ValidationErrors } };
    return error.data.errors;
  }

  return undefined;
}

export function getFetchErrorFromException(e: unknown) {
  if (
    Object.prototype.hasOwnProperty.call(e, 'status') &&
    Object.prototype.hasOwnProperty.call(e, 'error')
  ) {
    return e as { error: string; status: string };
  }

  return undefined;
}


export function getSafeErrorMessage(
  error: any,
  fallback: string = 'An error occurred'
): string {

  if (error?.data?.message) {
    const message = error.data.message;
    if (Array.isArray(message)) {
      return message.join('. ');
    }
    if (typeof message === 'string') {
      return message;
    }
  }
  
  if (error?.message) {
    const message = error.message;
    if (Array.isArray(message)) {
      return message.join('. ');
    }
    if (typeof message === 'string') {
      return message;
    }
  }
  
  return fallback;
}

export function toastErrorMessageFromException(
  e: unknown,
  fallbackMessage = 'An error ocurred. Please try again',
): string {
  const fetchError = getFetchErrorFromException(e);
  if (fetchError) {
    return `An error ocurred. (${fetchError.status}})`;
  }
  
  return getSafeErrorMessage(e, fallbackMessage);
}


export function addNestedServerErrors<
  T,

 >(
  setError: (key: keyof T, error: ErrorOption) => void,
  errors?: ValidationErrors, // E
  pathPrefix: string[] = [],
): void {
  if (!errors) {
  }

  Object.keys(errors ?? []).forEach(field => {

    const errorKey = [...(pathPrefix ?? []), field].join('.') as keyof T;

    const fieldError = errors?.[field];

    if (Array.isArray(fieldError)) {
      setError(errorKey, {
        type: 'server',
        message: fieldError?.join('\n'),
      });
    } else {
      addNestedServerErrors(setError, fieldError, [...pathPrefix, field]);
    }
  });
}

export function handleFormSubmitException<T>(
  e: unknown,
  setError: (key: keyof T, error: ErrorOption) => void,
) {
  const validationErrors = getValidationErrorsFromError(e);
  if (validationErrors) {
    return addNestedServerErrors(setError, validationErrors);
  } else {
    Alert.alert(toastErrorMessageFromException(e));
  }
}

export function addServerErrors<T>(
  errors: { [P in keyof T]?: string[] | string },
  setError: (
    fieldName: keyof T,
    error: { type: string; message: string },
  ) => void,
) {
  return Object.keys(errors).forEach(key => {
    const errorValue = errors[key as keyof T];
    const message = Array.isArray(errorValue) 
      ? errorValue.join('.\r\n') 
      : typeof errorValue === 'string' 
      ? errorValue 
      : '';
    
    setError(key as keyof T, {
      type: 'server',
      message,
    });
  });
}
