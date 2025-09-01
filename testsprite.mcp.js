export default {
  name: "Casino Royal",
  version: "1.0.0",
  mcp: {
    server: "localhost:3000",
    protocol: "http"
  },
  tests: [
    {
      name: "Authentication Flow",
      type: "mcp",
      context: "@App.tsx",
      assertion: "Should handle user login/logout"
    },
    {
      name: "Wallet Integration", 
      type: "mcp",
      context: "@Wallet.tsx",
      assertion: "Should manage balance operations"
    },
    {
      name: "Route Navigation",
      type: "mcp", 
      context: "@workspace",
      assertion: "Should navigate between pages"
    }
  ]
};