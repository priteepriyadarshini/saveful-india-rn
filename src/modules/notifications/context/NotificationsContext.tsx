// NotificationContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useGetCurrentUserQuery,
  useUpdateCurrentUserTimezoneMutation,
} from '../../../modules/auth/api';
import React, { createContext, useEffect, useState } from 'react';

export interface NotificationsState {
  showNotifications?: boolean;
  isListenersSet?: boolean;
}

const defaultState: NotificationsState = {
  showNotifications: true,
  isListenersSet: false,
};

export const NotificationsContext = createContext<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [NotificationsState, (newState: NotificationsState) => void]
>([defaultState, () => {}]);

// export const useNotification = () => useContext(NotificationsContext);

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<NotificationsState>(defaultState);

  const { data: user } = useGetCurrentUserQuery();
  const [updateUserTimezone] = useUpdateCurrentUserTimezoneMutation();

  const persistanceKey = `${user?.id || ''}-notifications-data`;

  const persistState = async (newState: NotificationsState) => {
    await AsyncStorage.setItem(persistanceKey, JSON.stringify(newState));
  };

  const setAndPersistState = (newState: NotificationsState) => {
    persistState(newState).finally(() => {
      setState(newState);
    });
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!user.timezone || user.timezone !== timezone) {
      updateUserTimezone({
        ...user,
        ...{ timezone },
      });
    }

    AsyncStorage.getItem(persistanceKey)
      .then(stateString => {
        if (stateString) {
          const loadedState = JSON.parse(stateString) as NotificationsState;

          setState(loadedState);
        } else {
          persistState(state).finally(() => {});
        }
      })
      .finally(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, persistanceKey]);

  return (
    <NotificationsContext.Provider value={[state, setAndPersistState]}>
      {children}
    </NotificationsContext.Provider>
  );
};
