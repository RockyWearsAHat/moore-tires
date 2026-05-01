import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const SCREENS: Array<{
  name: string;
  title: string;
  icon: IoniconName;
  iconAlt: IoniconName;
}> = [
  { name: 'index',   title: 'Home',    icon: 'home',       iconAlt: 'home-outline' },
  { name: 'tires',   title: 'Tires',   icon: 'car',        iconAlt: 'car-outline' },
  { name: 'jobs',    title: 'My Jobs', icon: 'briefcase',  iconAlt: 'briefcase-outline' },
  { name: 'book',    title: 'Book',    icon: 'calendar',   iconAlt: 'calendar-outline' },
  { name: 'account', title: 'Account', icon: 'person',     iconAlt: 'person-outline' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.onyx[800],
          borderTopColor: colors.onyx[700],
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 82 : 62,
          paddingBottom: Platform.OS === 'ios' ? 22 : 6,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.flame[500],
        tabBarInactiveTintColor: colors.platinum[600],
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600' as const,
          letterSpacing: 0.5,
        },
        headerStyle: { backgroundColor: colors.onyx[900] },
        headerTintColor: colors.platinum[50],
        headerTitleStyle: { fontWeight: '800' as const, fontSize: 16 },
        headerShadowVisible: false,
      }}
    >
      {SCREENS.map(({ name, title, icon, iconAlt }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name={focused ? icon : iconAlt}
                size={22}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
