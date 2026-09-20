import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.spendwise.expensetracker',
  appName: 'SpendWise',
  webDir: 'dist',
  backgroundColor: '#030805',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#030805',
  },
};

export default config;
