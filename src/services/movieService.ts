import {MoviesRepository} from "../application/jsondb/moviesRepository";
import {DBMovie} from "../models/DBMovie";
import {Movie} from "../models/Movie";

const RandomMovie = (movies: Movie[]): Movie => movies[Math.floor((Math.random() * movies.length))];

export class MovieService {
    constructor(private readonly moviesRepository: MoviesRepository) {
    }

    public async getRandomMovie(duration?: number): Promise<DBMovie> {
        const movies = await this.moviesRepository.all();

        if (duration) {
            const moviesWithinDuration = movies.filter((movie) => +movie.runtime > duration - 10 && +movie.runtime < +duration + 10);

            return RandomMovie(moviesWithinDuration);
        }

        return RandomMovie(movies);
    }

    public async find(genresList?: string[], duration?: number): Promise<DBMovie[]> {
        const movies = await this.moviesRepository.all();

        if (!genresList && !duration) {
            return movies;
        }

        const filteredMovies = movies
            .map(movie => {
                const matchingGenresCount = movie.genres.filter((genre) => genresList.includes(genre)).length;
                const withinDurationLimit = !duration
                    ? true
                    : +movie.runtime > duration - 10 && +movie.runtime < +duration + 10;

                if (matchingGenresCount > 0 && withinDurationLimit) {
                    return {
                        ...movie,
                    }
                }
                }
            )
            .filter((movie) => movie !== undefined);

        this.sortByMatchingGenres(filteredMovies, genresList);

        return this.retrieveUniqueMovies(filteredMovies);
    }

    sortByMatchingGenres(movies: Movie[], genresList: string[]) {
        movies.sort((movie1, movie2) => {
            const m1 = movie1.genres.filter((genre) => genresList.includes(genre)).length;
            const m2 = movie2.genres.filter((genre) => genresList.includes(genre)).length;

            return m2 - m1;
        });
    }

    retrieveUniqueMovies(movies: Movie[]): Movie[] {
        const map = new Map();

        for (const movie of movies) {
            map.set(movie.title, movie);
        }

        return [...map.values()];
    }
}
