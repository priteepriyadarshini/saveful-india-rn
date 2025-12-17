import { Mixpanel } from 'mixpanel-react-native';
import { User } from '../../../modules/analytics/analytics';
import { useGetCurrentUserQuery } from '../../../modules/auth/api';
import useEnvironment from '../../../modules/environment/hooks/useEnvironment';
import { useGetUserOnboardingQuery } from '../../../modules/intro/api/api';
import { useGetStatsQuery } from '../../../modules/track/api/api';
import React, { useEffect, useRef } from 'react';

interface Props {
  children: React.ReactNode;
}

const trackAutomaticEvents = true;

const MixPanelContext = React.createContext<[Mixpanel | undefined]>([
  undefined,
]);

const MixPanelContextProvider: React.FC<Props> = ({ children }) => {
  const { data: user } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: stats } = useGetStatsQuery();

  const { data: userOnboarding } = useGetUserOnboardingQuery();

  const mixPanelRef = useRef<Mixpanel | undefined>(undefined);
  const env = useEnvironment();
  // const auth = useAuth();

  function unixTimestampToDate(timestamp: any) {
    const milliseconds = timestamp * 1000; // Convert the Unix timestamp to milliseconds

    // Create a Date object
    const date = new Date(milliseconds);

    return date;
  }

  const setAnalyticsUserID = (
    user_id: string | null,
    userProperties?: User | null,
  ) => {
    // Mixpanel
    if (user_id && userProperties) {
      mixPanelRef.current?.identify(user_id);
      mixPanelRef.current?.getPeople().set({
        $name: userProperties.first_name,
        $first_name: userProperties.first_name,
        $email: userProperties.email,
        has_logged_into_saveful_app: true,
        email_verified: userProperties.email_verified,
        id: userProperties.id,
        last_name: userProperties.last_name,
        phone_number: userProperties.phone_number,
        completed_onboarding: !!userOnboarding,
        account_status: 'active',
        app_joined_at: unixTimestampToDate(userProperties.app_joined_at),
      });
      if (stats) {
        mixPanelRef.current?.getPeople().set({
          total_cooked: stats?.completed_meals_count ?? 0,
          total_cost_savings: `$${stats?.total_cost_savings ?? 0}`,
          best_co2_savings:
            `${Number(stats?.best_co2_savings ?? 0).toFixed(1)}kg`,
          best_cost_savings: `$${stats?.best_cost_savings ?? 0}` ,
          best_food_savings:
            `${Number(stats?.best_food_savings ?? 0).toFixed(1)}kg`,
          food_savings_user:
            `${Number(stats?.food_savings_user ?? 0).toFixed(1)}kg`,
          total_co2_savings:
            `${Number(stats?.total_co2_savings ?? 0).toFixed(1)}kg` ,
          food_savings_all_users:
            `${Number(stats?.food_savings_all_users ?? 0).toFixed(1)}kg` ,
          total_cost_savings_value: Number(stats?.total_cost_savings ?? 0),
        });
      }
    }
  };

  // const sendMixPanelResetEvent = () => {
  //   mixPanelRef.current?.reset();
  // };

  useEffect(() => {
    const token = env?.configuration?.mixpanelToken; // 👈 safe access
  if (token) {
    console.debug('Initialising MixPanel for env', env.environment);

    mixPanelRef.current = new Mixpanel(token, trackAutomaticEvents);
    void mixPanelRef.current.init();
  } else {
    console.debug('MixPanel not configured for env', env.environment);
  }
}, [env?.configuration?.mixpanelToken, env?.environment]);

  useEffect(() => {
    if (user) {
      setAnalyticsUserID(user.id, user);
    } else {
      setAnalyticsUserID(null);
      // mixPanelRef.current?.track(mixpanelEventName.userSignedout);
      // sendMixPanelResetEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userOnboarding]);

  return (
    <MixPanelContext.Provider value={[mixPanelRef.current]}>
      {children}
    </MixPanelContext.Provider>
  );
};

export { MixPanelContext, MixPanelContextProvider };
