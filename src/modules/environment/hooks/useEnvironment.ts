import { useContext } from 'react';

import { EnvironmentContext } from '../context/EnvironmentContext';

export default function useEnvironment() {
  const environment = useContext(EnvironmentContext);
  return environment;
}
