import { useEffect, useState } from "react";
import axios from "axios";
import type { QuestionModel } from "./model/QuestionModel.ts";
import { DefaultUserDetails, type UserDetails } from "./model/UserDetailsModel.ts";
import { useParams } from "react-router-dom";
import type { CategoryEnum } from "./model/CategoryEnum.ts";
import { categoryEnumImages } from "./utils/CategoryEnumImages.ts";
import "./styles/Details.css";

type DetailsProps = {
    user: string;
    favorites: string[];
    toggleFavorite: (questionId: string) => void;
};

export default function Details(props: Readonly<DetailsProps>) {
    const [question, setQuestion] = useState<QuestionModel | null>(null);
    const [githubUser, setGithubUser] = useState<UserDetails>(DefaultUserDetails);
    const [loading, setLoading] = useState(true);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!id) return;

        setLoading(true);

        axios
            .get(`/api/word-link-hub/${id}`)
            .then((response) => {
                setQuestion(response.data);
            })
            .catch((error) => {
                console.error("Error fetching Question details", error);
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (question?.githubId) {
            axios
                .get(`https://api.github.com/user/${question.githubId}`)
                .then((response) => setGithubUser(response.data))
                .catch((error) => {
                    console.error("Error fetching Github user", error);
                });
        }
    }, [question?.githubId]);

    if (loading) {
        return <div>Loading question details...</div>;
    }

    if (!question) {
        return <div>No question found.</div>;
    }

    const isFavorite = props.favorites.includes(question.id);

    return (
        <>
            <div className="details-container">
                <h2>{question.title}</h2>
                <p>
                    <strong>Category:</strong> {question.categoryEnum}
                </p>
                <p>
                    <strong>Clue Words:</strong> {question.clueWords.join(", ")}
                </p>
                <p>
                    <strong>Solution Word:</strong> {question.solutionWord}
                </p>
                <p>
                    <strong>Answer Explanation:</strong>{" "}
                    {question.answerExplanation ?? "No explanation available"}
                </p>

                <img
                    className="details-image"
                    src={
                        question.imageUrl
                            ? question.imageUrl
                            : categoryEnumImages[question.categoryEnum as CategoryEnum]
                    }
                    alt={question.title}
                />

                {props.user !== "anonymousUser" && (
                    <div>
                        <button
                            className={`button-group-button margin-top-20 ${
                                isFavorite ? "favorite-on" : "favorite-off"
                            }`}
                            onClick={() => props.toggleFavorite(question.id)}
                        >
                            ♥
                        </button>
                    </div>
                )}
            </div>
            <div>
                <h3>Added by User</h3>
                <p>
                    <strong>Github-User:</strong> {githubUser.login}
                </p>
                <p>
                    <strong>GitHub Profile:</strong>{" "}
                    <a href={githubUser.html_url} target="_blank" rel="noopener noreferrer">
                        Visit Profile
                    </a>
                </p>
                <img
                    className="profile-container-img"
                    src={githubUser.avatar_url}
                    alt={`${githubUser.login}'s avatar`}
                />
            </div>
        </>
    );
}
