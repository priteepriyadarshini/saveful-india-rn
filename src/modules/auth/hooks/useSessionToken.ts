import { selectAccessToken, selectRefreshToken } from '../selectors';
import { useAppSelector } from '../../../store/hooks';

export default function useAccessToken() {
  return useAppSelector(selectAccessToken);
}

export function useRefreshToken() {
  return useAppSelector(selectRefreshToken);
}
