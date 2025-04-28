import { useEffect, useState } from 'react';

import { useQuery, keepPreviousData } from 'react-query';
import toast, { Toaster } from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import SearchBar from '../SearchBar/SearchBar';
import MovieGrid from '../MovieGrid/MovieGrid';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { fetchMovies } from '../../services/movieService';
import MovieModal from '../MovieModal/MovieModal';
import { Movie } from '../../types/movie';
import css from './App.module.css';

export default function App() {
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);


    const { data, isLoading, error } = useQuery(
        ['movies', query, page],
        () => fetchMovies(query, page),
        {
            enabled: query !== '',
            keepPreviousData: true,
        }
    );

    const totalPages = data?.total_pages ?? 0;

    const handleSearch = (newQuery: string) => {
        setPage(1);
        setQuery(newQuery);
    };


    const selectMovie = (movie: Movie) => {
        setSelectedMovie(movie);
    };

    const closeModal = () => {
        setSelectedMovie(null);
    };

    useEffect(() => {
        if (data && data.results.length === 0) {
            toast.error('No movies found for your request.');
        }
    }, [data]);

    return (
        <div className={css.app}>
            <SearchBar onSubmit={handleSearch} />
            {error && <ErrorMessage />}
            {data && totalPages > 1 && (
                <ReactPaginate
                    pageCount={totalPages}
                    pageRangeDisplayed={5}
                    marginPagesDisplayed={1}
                    onPageChange={({ selected }) => setPage(selected + 1)}
                    forcePage={page - 1}
                    containerClassName={css.pagination}
                    activeClassName={css.active}
                    nextLabel=""→""
                    previousLabel=""←""
                />
            )}
            {query !== '' && isLoading && <Loader />}
            {data && data.results.length > 0 && (
                <MovieGrid movies={data.results} onSelect={selectMovie} />
            )}
            {selectedMovie && (
                <MovieModal
                    movie={selectedMovie}
                    onClose={closeModal}
                />
            )}
            <Toaster position="top-center" />
        </div>
    );
}
