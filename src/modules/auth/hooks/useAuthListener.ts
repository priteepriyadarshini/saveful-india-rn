import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { selectAccessToken, selectRefreshToken } from '../selectors';
import { clearSessionData } from '../sessionSlice';


export default function useAuthListener() {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const refreshToken = useAppSelector(selectRefreshToken);

  useEffect(() => {
    if (!accessToken && !refreshToken) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Intro' as never }],
        })
      );
    }
  }, [accessToken, refreshToken, navigation, dispatch]);

  useEffect(() => {
    if (!accessToken) return;

    const validateToken = async () => {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expirationTime = payload.exp * 1000; 
        const currentTime = Date.now();

        if (currentTime >= expirationTime && !refreshToken) {
          console.log('Token expired and no refresh token available - logging out');
          await dispatch(clearSessionData());
        }
      } catch (error) {
        console.error('Error validating token:', error);
        await dispatch(clearSessionData());
      }
    };

    validateToken();

    const interval = setInterval(validateToken, 60000);

    return () => clearInterval(interval);
  }, [accessToken, refreshToken, dispatch]);
}
