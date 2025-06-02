import React, { useEffect, useState } from "react";Add commentMore actions

import { useQuery } from "@tanstack/react-query";

import ReactPaginate from "react-paginate";
import { Toaster, toast } from "react-hot-toast";
import "modern-normalize/modern-normalize.css";



import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

import { Movie } from "../../types/movie";
import { fetchMovies, MoviesResponse } from "../../services/movieService";

import css from "./App.module.css";

export default function App(): JSX.Element {
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);



  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery<MoviesResponse, Error>({
 
    queryKey: ["movies", query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: !!query,
    placeholderData: (prev) => prev, // цього достатньо
    
  });
  

  useEffect(() => {
    if (data && data.results.length === 0 && !isFetching) {
    
      toast("Фільми не знайдено.");
    }
  }, [data, isFetching]);
 

  const handleSearch = (searchTerm: string): void => {
    if (!searchTerm.trim()) {
      toast.error("Please enter your search query.");
      return;
    }
    setQuery(searchTerm);
  
    setPage(1);
  };



  const handlePageChange = (selectedItem: { selected: number }): void => {
    setPage(selectedItem.selected + 1);
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
          {data && data.total_pages > 1 && (
            <ReactPaginate
              pageCount={data.total_pages}
              pageRangeDisplayed={5}
              marginPagesDisplayed={1}
              onPageChange={handlePageChange}
              forcePage={page - 1}
              containerClassName={css.pagination}
              activeClassName={css.active}
              nextLabel="→"
              previousLabel="←"
            />
          )}

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
