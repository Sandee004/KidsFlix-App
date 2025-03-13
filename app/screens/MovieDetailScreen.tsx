import React, { useState, useEffect } from "react";
import { View, Text, Image, Alert, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import tw from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  route: {
    params: {
      movie: {
        id: number | string;
        title: string;
        overview: string;
        poster_path: string;
      };
    };
  };
}

export default function MovieDetailScreen({ route }: Props) {
  const { movie } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfFavorite();
  }, []);

  const checkIfFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `https://app-backend-2l6q.onrender.com/api/check_favorite?movie_id=${movie.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setIsFavorite(data.is_favorite);
    } catch (error) {
      console.error("Failed to check favorite status:", error);
    }
  };

  const toggleFavorite = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Sign in to add movies to favourites");
        return;
      }

      const response = await fetch(
        "https://app-backend-2l6q.onrender.com/api/toogle_favorites",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            movie_id: movie.id,
            title: movie.title,
          }),
        }
      );

      const data = await response.json();
      console.log("Response Data:", data);

      if (data.action === "added") {
        setIsFavorite(true);
      } else if (data.action === "removed") {
        setIsFavorite(false);
      }
    } catch (error) {
      console.error("Couldn't update favorite status:", error);
      Alert.alert("Error", "Failed to update favorite status. Try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`p-4 bg-[#373b69] flex-1`}>
      <Image
        source={{
          uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }}
        style={tw`w-full h-80 rounded-lg`}
      />
      <View style={tw`flex flex-row items-center justify-between pr-2`}>
        <Text style={tw`text-white text-2xl font-bold mt-4`}>
          {movie.title}
        </Text>
        <TouchableOpacity onPress={toggleFavorite} disabled={loading}>
          <FontAwesome
            name="heart"
            size={24}
            color={isFavorite ? "#9b59b6" : "#cccccc"}
          />
        </TouchableOpacity>
      </View>
      <Text style={tw`text-gray-300 mt-2`}>{movie.overview}</Text>
    </View>
  );
}
