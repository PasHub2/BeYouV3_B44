import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "688a7106ff906c0b1a5b18bb", 
  requiresAuth: true // Ensure authentication is required for all operations
});
