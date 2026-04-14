// This file is kept for compatibility but expo-router handles routing
// The actual root layout is in app/_layout.tsx
import { registerRootComponent } from 'expo';
import ExpoRouterApp from './app/_layout';

registerRootComponent(ExpoRouterApp);
