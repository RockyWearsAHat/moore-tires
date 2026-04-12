import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = { Home: '◌', Jobs: '◈', Book: '+' };
  return (
    <Text style={{ fontSize: 18, color: focused ? '#FF5500' : '#6B6860' }}>
      {icons[label] ?? '○'}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#131318', borderTopColor: '#1D1D26', borderTopWidth: 1 },
        tabBarActiveTintColor: '#FF5500',
        tabBarInactiveTintColor: '#6B6860',
        headerStyle: { backgroundColor: '#0C0C12' },
        headerTintColor: '#FFFCF8',
        headerTitleStyle: { fontWeight: '700' as const },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="jobs"
        options={{ title: 'My Jobs', tabBarIcon: ({ focused }) => <TabIcon label="Jobs" focused={focused} /> }}
      />
      <Tabs.Screen
        name="book"
        options={{ title: 'Book', tabBarIcon: ({ focused }) => <TabIcon label="Book" focused={focused} /> }}
      />
    </Tabs>
  );
}
