import { ErrorOption } from 'react-hook-form';
import { Alert } from 'react-native';

export interface ValidationErrors {
  [field: string]: string[] | ValidationErrors;
}

export function getValidationErrorsFromError(e: unknown) {
  // console.debug({ e });

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
  // console.debug(e);
  if (
    Object.prototype.hasOwnProperty.call(e, 'status') &&
    Object.prototype.hasOwnProperty.call(e, 'error')
  ) {
    return e as { error: string; status: string };
  }

  return undefined;
}

export function toastErrorMessageFromException(
  e: unknown,
  fallbackMessage = 'An error ocurred. Please try again',
) {
  const fetchError = getFetchErrorFromException(e);
  if (fetchError) {
    return `An error ocurred. (${fetchError.status}})`;
  } else {
    return fallbackMessage;
  }
}

// Takes a `setError` function from a redux-hook-form, and a Record<string, any> object
// and applies the errors for the form
// e.g. addNestedFormErrors(setError, errors)
export function addNestedServerErrors<
  T,
  // E extends Record<string, string[] | Record<string, string[]>>,
>(
  setError: (key: keyof T, error: ErrorOption) => void,
  errors?: ValidationErrors, // E
  pathPrefix: string[] = [],
): void {
  if (!errors) {
  }

  Object.keys(errors ?? []).forEach(field => {
    // Build the current error key from the list of prefixes and the current field name
    // e.g. ['profile'] + 'first_name' => 'profile.first_name'
    const errorKey = [...(pathPrefix ?? []), field].join('.') as keyof T;

    // Get the error
    const fieldError = errors?.[field];

    if (Array.isArray(fieldError)) {
      // If its an array, its a list of errrors for this field
      setError(errorKey, {
        type: 'server',
        message: fieldError?.join('\n'),
      });
    } else {
      // If it isn't an array, its a nested error object, so recurse into that
      addNestedServerErrors(setError, fieldError, [...pathPrefix, field]);
    }
  });
}
// Set errors if we can (changeset errors from the server),
// or show a toast, if we cant
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

// This one is simpler, but doesn't work with nested values
export function addServerErrors<T>(
  errors: { [P in keyof T]?: string[] },
  setError: (
    fieldName: keyof T,
    error: { type: string; message: string },
  ) => void,
) {
  return Object.keys(errors).forEach(key => {
    setError(key as keyof T, {
      type: 'server',
      message: (errors[key as keyof T] ?? []).join('.\r\n'),
    });
  });
}
