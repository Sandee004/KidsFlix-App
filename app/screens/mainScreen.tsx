import { useEffect, useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from "react-native";
import tw from "twrnc";
import SingleMovieScreen from "./singleMovieScreen";

interface Movie {
  title: string;
  poster_path: string | null;
  overview: string;
  isLiked: boolean;
  id: number;
}

const apiKey = "ceba03f56c18f997a242eb118d552605";
const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=16`;

export default function MainScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const moviesWithNumberId = data.results.map((movie: Movie) => ({
          ...movie,
          id: Number(movie.id),
        }));
        setMovies(moviesWithNumberId);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <SafeAreaView style={tw`flex-1`}>
      <View style={tw`flex-1`}>
        {loading ? (
          <ActivityIndicator size="large" color="#C8A2C8" />
        ) : (
          <FlatList
            data={movies}
            keyExtractor={(item: { id: number }) => item.id.toString()}
            renderItem={({ item }) => <SingleMovieScreen movie={item} />}
            numColumns={2}
            contentContainerStyle={tw`pb-20`}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
