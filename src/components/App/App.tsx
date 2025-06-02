import React from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { Movie, MoviesResponse } from "../../types/movie";
import { useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import "modern-normalize/modern-normalize.css";
import css from "./App.module.css";

export default function App(): JSX.Element {
  const [query, setQuery] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(1);
  const [selectedMovie, setSelectedMovie] = React.useState<Movie | null>(null);

  const fetchMovies: () => Promise<MoviesResponse> = async () => {
    if (!query.trim()) {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
    const response = await axios.get("https://api.themoviedb.org/3/search/movie", {
      params: { query, page },
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`
      }
    });
    return response.data;
  };

  const { data, isLoading, isError, error } = useQuery<MoviesResponse, Error>({
    queryKey: ["movies", query, page],
    queryFn: fetchMovies,
    enabled: !!query
  });

  const handleSearch = (searchTerm: string): void => {
    if (!searchTerm.trim()) {
      toast.error("Please enter your search query.");
      return;
    }
    setQuery(searchTerm);
    setPage(1);
  };

  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleSearch} />

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <ErrorMessage message={error.message} />
      ) : (
        <>
          {/* Пагинация сверху */}
          {data && data.total_pages > 1 && (
            <ReactPaginate
              pageCount={data.total_pages}
              pageRangeDisplayed={5}
              marginPagesDisplayed={1}
              onPageChange={({ selected }) => setPage(selected + 1)}
              forcePage={page - 1}
              containerClassName={css.pagination}
              activeClassName={css.active}
              nextLabel="→"
              previousLabel="←"
            />
          )}

          {/* Список фильмов */}
          <MovieGrid movies={data?.results || []} onSelect={setSelectedMovie} />
        </>
      )}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}

      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
