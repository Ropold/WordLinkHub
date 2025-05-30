import {useEffect, useState} from "react";
import axios from "axios";
import {DefaultQuestion, type QuestionModel} from "./model/QuestionModel.ts";
import {DefaultUserDetails, type UserDetails} from "./model/UserDetailsModel.ts";
import {useParams} from "react-router-dom";
import type {CategoryEnum} from "./model/CategoryEnum.ts";
import {categoryEnumImages} from "./utils/CategoryEnumImages.ts";

type DetailsProps = {
    user: string;
    favorites: string[];
    toggleFavorite: (questionId: string) => void;
}

export default function Details(props: Readonly<DetailsProps>) {
    const [questions, setQuestions] = useState<QuestionModel>(DefaultQuestion);
    const [githubUser, setGithubUser] = useState<UserDetails>(DefaultUserDetails);
    const {id} = useParams<{ id: string }>();

    useEffect(() => {
        if (!id) return;
        axios
            .get(`/api/quiz-hub/${id}`)
            .then((response) => setQuestions(response.data))
            .catch((error) => console.error("Error fetching Question details", error));
    }, [id]);

    const fetchGithubUsername = async () => {
        try {
            const response = await axios.get(`https://api.github.com/user/${questions.githubId}`);
            setGithubUser(response.data);
        } catch (error) {
            console.error("Error fetching Github-User", error);
        }
    };

    useEffect(() => {
        if (questions.githubId) {
            fetchGithubUsername();
        }
    }, [questions.githubId]);

    const isFavorite = props.favorites.includes(questions.id);

    return (
        <>
            <div className="details-container">
                <h2>{questions.title}</h2>
                <p><strong>Category:</strong> {questions.categoryEnum}</p>
                <p><strong>Solution Word:</strong> {questions.solutionWord}</p>
                <p><strong>Answer Explanation:</strong> {questions.answerExplanation}</p>
                <p><strong>clueWords:</strong> {questions.clueWords.join(", ")}</p>
                <p><strong>Explanation:</strong> {questions.answerExplanation || "No explanation available"}</p>

                <img
                    className="details-image"
                    src={questions.imageUrl ? questions.imageUrl : categoryEnumImages[questions.categoryEnum as CategoryEnum]}
                    alt={questions.title}
                />


                {props.user !== "anonymousUser" && (
                    <div>
                        <button
                            className={`button-group-button margin-top-20 ${isFavorite ? "favorite-on" : "favorite-off"}`}
                            onClick={() => props.toggleFavorite(questions.id)}
                        >
                            ♥
                        </button>
                    </div>
                )}
            </div>
            <div>
                <h3>Added by User</h3>
                <p><strong>Github-User</strong> {githubUser.login} </p>
                <p><strong>GitHub Profile</strong> <a href={githubUser.html_url} target="_blank"
                                                      rel="noopener noreferrer">Visit Profile</a></p>
                <img className="profile-container-img" src={githubUser.avatar_url}
                     alt={`${githubUser.login}'s avatar`}/>
            </div>
        </>
    )
}