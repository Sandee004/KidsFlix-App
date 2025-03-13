import React, { useState, useCallback } from "react";
import { Text, View, Image, FlatList, Alert, ActivityIndicator } from "react-native";
import tw from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

interface Movie {
  id: number;
  title: string;
  poster_path?: string;
  overview?: string;
}

const TMDB_API_KEY = "ceba03f56c18f997a242eb118d552605";

export default function FavoriteScreen() {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Please login to see favorites");
        return;
      }

      const response = await fetch(
        "https://app-backend-2l6q.onrender.com/api/favorites",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        const moviesWithDetails = await Promise.all(
          data.favorites.map(async (fav: Movie) => {
            const tmdbResponse = await fetch(
              `https://api.themoviedb.org/3/movie/${fav.id}?api_key=${TMDB_API_KEY}`
            );
            const movieDetails = await tmdbResponse.json();
            return {
              id: fav.id,
              title: fav.title,
              poster_path: movieDetails.poster_path,
              overview: movieDetails.overview,
            };
          })
        );
        setFavorites(moviesWithDetails);
      } else {
        Alert.alert("Error", data.error || "Failed to fetch favorites");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      Alert.alert("Error", "Failed to load favorites. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Movie }) => (
    <View
      style={tw`bg-white w-[95%] mx-auto rounded-md flex-row items-center gap-4 p-4 mb-4`}
    >
      {item.poster_path ? (
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          }}
          style={tw`w-16 h-24 rounded-md`}
        />
      ) : (
        <View style={tw`w-16 h-24 bg-gray-300 rounded-md`} />
      )}
      <View style={tw`flex-1`}>
        <Text style={tw`text-black text-lg font-bold`} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={tw`text-gray-600`} numberOfLines={2}>
          {item.overview || "No description available."}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-[#373b69] p-4`}>
      <Text style={tw`text-white text-2xl font-bold mb-4`}>Your Favorites</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#C8A2C8" />
      ) : favorites.length === 0 ? (
        <Text style={tw`text-white text-center`}>No favorites added yet.</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
