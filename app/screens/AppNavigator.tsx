import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import tw from "twrnc";
import StackNavigator from "./StackNavigator";
import FavoriteScreen from "./FavoriteScreen";
import ProfileScreen from "./ProfileScreen";

const Tab = createBottomTabNavigator();

function CustomHeader() {
  return (
    <View style={tw`bg-[#373b69] pt-8 pb-4 px-4 text-center items-center`}>
      <Text style={tw`text-[#cccccc] text-xl font-bold`}>KidsFlix</Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <CustomHeader />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: "home" | "star" | "user" | undefined;

            if (route.name === "Home") {
              iconName = "home";
            } else if (route.name === "Favorites") {
              iconName = "star";
            } else if (route.name === "Profile") {
              iconName = "user";
            }

            return (
              <FontAwesome
                name={iconName}
                size={size}
                color={focused ? "#cccccc" : "#C8A2C8"}
              />
            );
          },
          tabBarActiveTintColor: "#cccccc",
          tabBarInactiveTintColor: "#C8A2C8",
          tabBarStyle: tw`bg-[#373b69] pb-4 h-14`,
          headerShown: true,
        })}
      >
        <Tab.Screen
          name="Home"
          component={StackNavigator}
          options={{
            headerShown: false,
          }}
        />
        <Tab.Screen name="Favorites" component={FavoriteScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
