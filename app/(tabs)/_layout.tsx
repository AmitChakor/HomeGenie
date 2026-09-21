/**
 * What this does:
 * Bottom tab navigator with 5 tabs: Home, Vendors, Schedule, Grocery, Settings.
 * Uses Ionicons from @expo/vector-icons.
 */

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Colors, Typography } from '../../constants/theme';

type TabIcon = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: {
  name: string;
  title: string;
  icon: TabIcon;
  iconFocused: TabIcon;
}[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconFocused: 'home' },
  {
    name: 'vendors',
    title: 'Vendors',
    icon: 'people-outline',
    iconFocused: 'people',
  },
  {
    name: 'schedule',
    title: 'Schedule',
    icon: 'calendar-outline',
    iconFocused: 'calendar',
  },
  {
    name: 'grocery',
    title: 'Grocery',
    icon: 'cart-outline',
    iconFocused: 'cart',
  },
  {
    name: 'settings',
    title: 'Settings',
    icon: 'settings-outline',
    iconFocused: 'settings',
  },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: Typography.caption.fontSize,
          fontWeight: '500',
        },
        tabBarStyle: {
          borderTopColor: Colors.borderLight,
          backgroundColor: Colors.background,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconFocused : tab.icon}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
