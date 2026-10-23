import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, View } from "react-native";
import DashboardScreen from "../screens/DashboardScreen";
import HistoryScreen from "../screens/HistoryScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AddBillScreen from "../screens/AddBillScreen";
import BillDetailsScreen from "../screens/BillDetailsScreen";
import LockScreen from "../screens/LockScreen";
import { useApp } from "../context/AppContext";
import { colors } from "../theme/colors";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bg,
    primary: colors.primary,
    text: colors.white,
    border: colors.border
  }
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#121214",
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8
        },
        tabBarActiveTintColor: colors.primarySoft,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => {
          const map = {
            Home: "wallet-outline",
            History: "stats-chart-outline",
            Settings: "settings-outline"
          };
          return <Ionicons name={map[route.name]} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ title: "Contas" }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: "Historico" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Ajustes" }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { ready, unlocked, settings } = useApp();

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {settings.lockEnabled && !unlocked ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Lock" component={LockScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="AddBill" component={AddBillScreen} />
          <Stack.Screen name="BillDetails" component={BillDetailsScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
