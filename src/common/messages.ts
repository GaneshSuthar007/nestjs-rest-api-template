/**
 * Every user-facing string in the API lives here, namespaced per feature.
 * Services and controllers NEVER hardcode message strings — this keeps
 * copy consistent, greppable, and ready for i18n later.
 */
export const messages = {
  common: {
    invalidApiKey: "Invalid or missing API key.",
    somethingWentWrong: "Something went wrong. Please try again.",
  },
  auth: {
    registeredSuccessfully: "Account created successfully.",
    loggedInSuccessfully: "Logged in successfully.",
    emailAlreadyExists: "An account with this email already exists.",
    invalidCredentials: "Invalid email or password.",
    unauthorized: "You are not authorized to perform this action.",
  },
  todo: {
    createdSuccessfully: "Todo created successfully.",
    fetchedSuccessfully: "Todos fetched successfully.",
    fetchedOneSuccessfully: "Todo fetched successfully.",
    updatedSuccessfully: "Todo updated successfully.",
    deletedSuccessfully: "Todo deleted successfully.",
    notFound: "Todo not found.",
  },
};
