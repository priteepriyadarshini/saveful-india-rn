interface OneSignalPayload {
  notification_settings: {
    id: string;
    email: string;
    firstName: string;
    oneSignalId: string | null;
  };
}

export { OneSignalPayload };
