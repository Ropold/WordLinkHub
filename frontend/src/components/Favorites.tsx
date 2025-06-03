import {useEffect, useState} from "react";
import type {QuestionModel} from "./model/QuestionModel.ts";
import axios from "axios";
import QuestionCard from "./QuestionCard.tsx";

type FavoritesProps = {
    user: string;
    favorites: string[];
    toggleFavorite: (questionId: string) => void;
}

export default function Favorites(props: Readonly<FavoritesProps>) {
    const [favoritesQuestions, setFavoritesQuestions] = useState<QuestionModel[]>([]);

    useEffect(() => {
        axios
            .get(`/api/users/favorites`)
            .then((response) => {
                setFavoritesQuestions(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [props.user, props.favorites]);

    return (
        <div className="question-card-container">
            {favoritesQuestions.length > 0 ? (
                favoritesQuestions.map((a) => (  // ← Korrekte Syntax mit `r`
                    <QuestionCard
                        key={a.id}
                        question={a}
                        user={props.user}
                        favorites={props.favorites}
                        toggleFavorite={props.toggleFavorite}
                    />
                ))
            ) : (
                <p>No Word-Cards in favorites</p>
            )}
        </div>
    )
}