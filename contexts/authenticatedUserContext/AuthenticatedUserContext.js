import React from "react";

// simple react context to hold a user info that can be used
// throughout app
export const AuthenticatedUserContext = React.createContext(null);

export default AuthenticatedUserContext;
