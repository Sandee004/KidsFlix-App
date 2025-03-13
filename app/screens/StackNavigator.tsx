import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScreen from "./mainScreen";
import MovieDetailScreen from "./MovieDetailScreen";
import ProfileScreen from "./ProfileScreen";
import tw from "twrnc";

export type RootStackParamList = {
  MainScreen: undefined;
  MovieDetailScreen: { movie: any };
  ProfileScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainScreen"
        component={MainScreen}
        options={{
          title: "Home",
          headerShown: true,
          headerStyle: tw`bg-white`,
          headerTitleStyle: tw.style("text-[22px]"),
        }}
      />

      <Stack.Screen
        name="MovieDetailScreen"
        component={MovieDetailScreen}
        options={{
          headerShown: true,
          title: "Movie Details",
        }}
      />
      <Stack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: "Profile",
        }}
      />
    </Stack.Navigator>
  );
}
