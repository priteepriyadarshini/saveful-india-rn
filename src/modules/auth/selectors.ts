import { RootState } from "../../store/store";

export const selectRefreshToken = (state: RootState) =>
  state.session.refresh_token;
export const selectAccessToken = (state: RootState) =>
  state.session.access_token;
