export default {
  // Project configuration
  name: "Casino Royal",
  framework: "react",
  language: "typescript",
  
  // Test directories
  testDir: "./src/__tests__",
  sourceDir: "./src",
  
  // Test patterns
  testMatch: [
    "**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "**/*.{test,spec}.{js,jsx,ts,tsx}"
  ],
  
  // Coverage settings
  coverage: {
    enabled: true,
    threshold: 70,
    include: ["src/**/*.{js,jsx,ts,tsx}"],
    exclude: [
      "src/**/*.d.ts",
      "src/main.tsx",
      "src/vite-env.d.ts"
    ]
  },
  
  // Environment setup
  setupFiles: ["./src/__tests__/setup.ts"],
  
  // Mock patterns
  mocks: {
    supabase: "./src/__tests__/mocks/supabase.ts",
    router: "./src/__tests__/mocks/router.ts"
  }
};