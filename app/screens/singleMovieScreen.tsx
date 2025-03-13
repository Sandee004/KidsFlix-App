import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "./StackNavigator";
import tw from "twrnc";

interface Movie {
  title: string;
  poster_path: string | null;
  overview: string;
  isLiked: boolean;
  id: number | string;
}

const SingleMovieScreen: React.FC<{ movie: Movie }> = ({ movie }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const imageUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("MovieDetailScreen", { movie })}
    >
      <View style={tw`bg-white rounded-md shadow-lg m-2`}>
        <Image
          source={{ uri: imageUrl }}
          style={tw`w-[160px] h-[240px] rounded-t-md`}
          resizeMode="cover"
        />
        <View style={tw`p-3 w-[160px] h-[73px]`}>
          <Text
            style={tw`text-base font-semibold text-gray-800 text-center`}
            numberOfLines={2}
          >
            {movie.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SingleMovieScreen;
