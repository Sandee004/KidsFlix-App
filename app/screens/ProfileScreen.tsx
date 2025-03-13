import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import tw from "twrnc";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  interface User {
    username: string;
    email: string;
    phone?: string;
    profile_picture?: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load user data from storage
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setUsername(parsedUser.username);
          setEmail(parsedUser.email);
          setPhone(parsedUser.phone || "");
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      }
    };
    loadUserData();
  }, []);

  const handleSignUp = async () => {
    if (!username || !email) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);

    try {
      const body = JSON.stringify({ username, email, phone: phone || "" });
      console.log("Request Body:", body);

      const response = await fetch(
        "https://app-backend-2l6q.onrender.com/api/auth",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body,
        }
      );

      const data = await response.json();
      console.log("Response Data:", data);

      if (response.ok) {
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({ username, email, phone })
        );
        await AsyncStorage.setItem("token", data.access_token);
        setUser({ username, email, phone });
        Alert.alert("Success", data.message || "Signed up successfully");
      } else {
        Alert.alert("Error", data.message || "Failed to sign up");
      }
    } catch (error) {
      console.error("Sign up failed", error);
      Alert.alert("Error", "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async () => {
    if (!username || !email) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      console.log(token);
      if (!token) {
        Alert.alert("Error", "Pls sign up and try again");
        return;
      }

      const response = await fetch(
        "https://app-backend-2l6q.onrender.com/api/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username, email, phone }),
        }
      );

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        const updatedUser = { username, email, phone };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        Alert.alert("Success", "Details updated successfully");
      } else {
        Alert.alert("Error", data.message || "Failed to update details");
      }
    } catch (error) {
      console.error("Update failed", error);
      Alert.alert("Error", "Failed to update details");
    } finally {
      setLoading(false);
    }
  };

  const [profilePic, setProfilePic] = useState<string | null>(
    user?.profile_picture || null
  );

  {
    /*
  const handleChoosePhoto = () => {
    launchImageLibrary(
      { mediaType: "photo", quality: 0.7 },
      async (response) => {
        if (response.didCancel) return;
        if (response.errorMessage) {
          Alert.alert("Error", response.errorMessage);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0];
          setProfilePic(selectedImage.uri || null);

          if (selectedImage.uri) {
            uploadProfilePicture(selectedImage.uri);
          }
        }
      }
    );
  };

  
  const uploadProfilePicture = async (uri: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      const fileName = uri.split("/").pop() || "profile.jpg";
      const fileType = uri.split(".").pop() || "jpeg";

      const filePath = Platform.OS === "android" ? uri : `file://${uri}`;
      const fileData = await RNFS.readFile(filePath, "base64");

      const formData = new FormData();
      const file = new File([fileData], fileName, {
        type: `image/${fileType}`,
      });
      formData.append("profile_picture", file);

      const response = await fetch("https://app-backend-2l6q.onrender.com/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Profile picture updated successfully!");
        setUser((prev: any) => ({
          ...prev,
          profile_picture: data.profile_picture, // Assuming the API returns the new URL
        }));
      } else {
        Alert.alert("Error", data.error || "Failed to upload profile picture");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      Alert.alert(
        "Error",
        "Failed to upload profile picture. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };*/
  }

  if (!user) {
    return (
      <>
        {loading ? (
          <ActivityIndicator size="large" color="#C8A2C8" />
        ) : (
          <View style={tw`flex-1 items-center bg-[#373b69] p-6`}>
            <Text style={tw`text-white text-2xl font-bold mb-4`}>
              Sign Up/Login
            </Text>
            <TextInput
              style={tw`w-full bg-white/10 text-white px-4 py-3 rounded-md mb-3`}
              placeholder="Username"
              placeholderTextColor="#ccc"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={tw`w-full bg-white/10 text-white px-4 py-3 rounded-md mb-3`}
              placeholder="Email"
              placeholderTextColor="#ccc"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={tw`w-full bg-white/10 text-white px-4 py-3 rounded-md mb-3`}
              placeholder="Phone (Optional)"
              placeholderTextColor="#ccc"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={tw`bg-[#C8A2C8] w-full items-center py-3 mt-6 rounded-md`}
              onPress={handleSignUp}
            >
              <Text style={tw`text-white text-lg`}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  }

  return (
    <View style={tw`flex-1 items-center bg-[#373b69] p-6`}>
      {!isEditing ? (
        <>
          <TouchableOpacity style={tw`mb-4`}>
            <Image
              source={
                profilePic
                  ? { uri: profilePic }
                  : require("../assets/profilepic.jpg")
              }
              style={tw`h-40 w-40 rounded-full`}
            />
            <View
              style={tw`absolute bottom-0 right-0 bg-white p-1 rounded-full`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#373b69" />
              ) : (
                <FontAwesome name="pencil" size={20} color="#373b69" />
              )}
            </View>
          </TouchableOpacity>

          <Text style={tw`text-white text-2xl font-bold`}>
            {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
          </Text>
          <Text style={tw`text-gray-400 text-lg`}>{user.email}</Text>
          <Text style={tw`text-gray-400 text-lg mb-4`}>
            {user.phone || "No phone number"}
          </Text>

          <TouchableOpacity
            style={tw`bg-[#C8A2C8] w-full py-3 rounded-md mb-4`}
            onPress={() => setIsEditing(true)}
          >
            <Text style={tw`text-white text-lg text-center`}>
              Update Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-red-500 w-full py-3 rounded-md`}
            onPress={async () => {
              await AsyncStorage.removeItem("user");
              setUser(null);
            }}
          >
            <Text style={tw`text-white text-lg text-center`}>Log Out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={tw`w-full bg-white/10 text-white px-4 py-3 rounded-md mb-3`}
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            style={tw`w-full bg-white/10 text-white px-4 py-3 rounded-md mb-3`}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={tw`w-full bg-white/10 text-white px-4 py-3 rounded-md mb-3`}
            value={phone}
            onChangeText={setPhone}
          />
          <View style={tw`flex flex-row justify-between w-full mt-2`}>
            <TouchableOpacity
              style={tw`bg-gray-400 py-3 w-[48%] rounded-md`}
              onPress={() => setIsEditing(false)}
            >
              <Text style={tw`text-white text-lg text-center`}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={updateUser}
              style={tw`bg-[#C8A2C8] py-3 w-[48%] rounded-md`}
            >
              <Text style={tw`text-white text-lg text-center`}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
