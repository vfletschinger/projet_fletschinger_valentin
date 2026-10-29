export interface Environment {
  production: boolean;
  apiBaseUrl: string;
  /** Simule `/auth/signup` : l'API n'expose pas encore cette route. */
  useSignupApiMock: boolean;
  /** Simule `/pollutions` à la place de l'API (utile hors ligne ou si l'API est en panne). */
  usePollutionApiMock: boolean;
}
