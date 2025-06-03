import type {QuestionModel} from "./model/QuestionModel.ts";
import {useNavigate} from "react-router-dom";
import {categoryEnumImages} from "./utils/CategoryEnumImages.ts";
import "./styles/QuestionCard.css"

type QuestionCardProps = {
    question: QuestionModel;
    user: string;
    favorites: string[];
    toggleFavorite: (animalId: string) => void;
    showButtons?: boolean;
    handleEditToggle?: (id: string) => void;
    handleDeleteClick?: (id: string) => void;
    handleToggleActiveStatus?: (id: string) => void;
}

export default function QuestionCard(props: Readonly<QuestionCardProps>) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/question/${props.question.id}`);
    }

    const isFavorite = props.favorites.includes(props.question.id);

    return (
        <div className="question-card" onClick={handleCardClick}>
            <h3>{props.question.title}</h3>
            <img
                src={props.question.imageUrl ? props.question.imageUrl : categoryEnumImages[props.question.categoryEnum]}
                alt={props.question.title}
                className="question-card-image"
            />

            {props.user !== "anonymousUser" && (
                <button
                    id="button-favorite-question-card"
                    onClick={(event) => {
                        event.stopPropagation(); // Verhindert die Weitergabe des Klicks an die Karte
                        props.toggleFavorite(props.question.id);
                    }}
                    className={isFavorite ? "favorite-on" : "favorite-off"}
                >
                    ♥
                </button>
            )}

            {props.showButtons && (
                <div className="space-between">
                    <button
                        id={props.question.isActive ? "active-button-my-questions" : "button-is-inactive"}
                        onClick={(e) => {
                            e.stopPropagation();
                            props.handleToggleActiveStatus?.(props.question.id);
                        }}
                    >
                        {props.question.isActive ? "Active" : "Inactive"}
                    </button>
                    <button
                        className="button-group-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            props.handleEditToggle?.(props.question.id);
                        }}
                    >
                        Edit
                    </button>
                    <button
                        id="button-delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            props.handleDeleteClick?.(props.question.id);
                        }}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    )
}