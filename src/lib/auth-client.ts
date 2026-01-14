import { createAuthClient } from "better-auth/react"
import { apiKeyClient } from "better-auth/client/plugins"
// export const authClient = createAuthClient({
//     /** the base url of the server (optional if you're using the same domain) */
//     baseURL: "http://localhost:3000"
// })
export const authClient = createAuthClient({
  plugins: [
    apiKeyClient(),
  ],
}); // defaults to the current domain