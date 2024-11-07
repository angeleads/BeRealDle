import { Tabs } from "expo-router";
import { FontAwesome, Entypo } from "@expo/vector-icons";
import "../global.css";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#000000",
          height: 100,
          borderRadius: 20,
        },
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#808080",
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: -5,
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="wordle"
        options={{
          title: "Wordle",
          headerTitle: "BeRealDle",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="puzzle-piece" color={color} size={30} />
          ),
          headerStyle: {
            backgroundColor: "#000000",
            borderRadius: 20,
            height: 120,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 30,
          },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "search",
          headerTitle: "BeRealDle",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="search" color={color} size={30} />
          ),
          headerStyle: {
            backgroundColor: "#000000",
            borderRadius: 20,
            height: 120,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 30,
          },
        }}
        />
      <Tabs.Screen
        name="bereal"
        options={{
          title: "BeReal",
          headerTitle: "BeRealDle",
          tabBarIcon: ({ color }) => (
            <Entypo name="camera" color={color} size={30} />
          ),
          headerStyle: {
            backgroundColor: "#000000",
            height: 120,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: "#ffffff",
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 30,
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" color={color} size={30} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
