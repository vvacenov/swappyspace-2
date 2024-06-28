export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export enum SiteNavigation {
  //auth
  home = "/",
  signUp = "/sign-up",
  logIn = "/log-in",
  forgotPassword = "/forgot-password",
  resetPassword = "/auth/reset", // I should not forget to add baseURL infront this one, goes to server action
  confirmThankYou = "/confirmed", // goes to callback
  errorAuthCallbacks = "/auth/error",
  confirmEmailSent = "/check-your-email",
}

export enum ProtectedSiteNavigation {
  _DASHBOARD_ = "/dashboard",
  _UPDATE_PASSWORD_ = "/a/update-password",
}
