import type {QuestionData, QuestionModel} from "./model/QuestionModel.ts";
import {useState} from "react";
import {ALL_CATEGORIES, type NullableCategoryEnum} from "./model/CategoryEnum.ts";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import "./styles/AddQuestionCard.css"
import {formatEnumDisplayName} from "./utils/formatEnumDisplayName.ts";

type AddQuestionCardProps = {
    user: string;
    handleNewQuestionSubmit: (newQuestion: QuestionModel) => void;
}


export default function AddQuestionCard(props:Readonly<AddQuestionCardProps>){
    const [title, setTitle] = useState<string>("");
    const [categoryEnum, setCategoryEnum] = useState<NullableCategoryEnum>("");
    const [clueWords, setClueWords] = useState<string[]>(["", "", "", ""]);
    const [solutionWord, setSolutionWord] = useState<string>("")
    const [answerExplanation, setAnswerExplanation] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");

    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [showPopup, setShowPopup] = useState(false);

    const navigate = useNavigate();

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const questionData: QuestionData = {
            title,
            categoryEnum,
            clueWords,
            solutionWord,
            answerExplanation,
            isActive: true,
            githubId: props.user,
            imageUrl: imageUrl
        };

        const data = new FormData();

        if (image) {
            data.append("image", image);
        }

        data.append("questionModelDto", new Blob([JSON.stringify(questionData)], { type: "application/json" }));

        axios
            .post("/api/word-link-hub", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                navigate(`/question/${response.data.id}`);
            })
            .catch((error) => {
                if (error.response && error.response.status === 400 && error.response.data) {
                    const errorMessages = error.response.data;
                    const errors: string[] = [];
                    Object.keys(errorMessages).forEach((field) => {
                        errors.push(`${field}: ${errorMessages[field]}`);
                    });

                    setErrorMessages(errors);
                    setShowPopup(true);
                } else {
                    alert("An unexpected error occurred. Please try again.");
                }
            });
    }

    function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if(e.target.files){
            const file = e.target.files[0];
            setImage(file);
            setImageUrl("temp-image")
        }
    }

    function handleClosePopup() {
        setShowPopup(false);
        setErrorMessages([]);
    }

    return (
        <div className="edit-form">
            <form onSubmit={handleSubmit}>
                <label>
                    Title:
                    <input
                        className="input-small"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </label>

                <label className="add-question-label">
                    Category:
                    <select
                        className="input-small"
                        value={categoryEnum}
                        onChange={(e) => setCategoryEnum(e.target.value as NullableCategoryEnum)}
                        required
                    >
                        <option value="">Please select a category</option>
                        {ALL_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {formatEnumDisplayName(category)}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="add-question-label">
                    Clue Words:
                    <div className="clue-word-grid">
                        {clueWords.map((word, index) => (
                            <input
                                key={index}
                                type="text"
                                className="input-small"
                                placeholder={`Clue word ${index + 1}`}
                                value={word}
                                onChange={(e) => {
                                    const updated = [...clueWords];
                                    updated[index] = e.target.value;
                                    setClueWords(updated);
                                }}
                            />
                        ))}
                    </div>

                    <div className="space-between">
                        <button
                            className="button-group-button margin-top-10"
                            type="button"
                            onClick={() => setClueWords([...clueWords, ""])}
                        >
                            + Add Clue Word
                        </button>
                    </div>
                </label>


                <label>
                    Solution Word:
                    <input
                        className="input-small"
                        type="text"
                        value={solutionWord}
                        onChange={(e) => setSolutionWord(e.target.value)}
                    />
                </label>

                <label>
                    Answer Explanation:
                    <textarea
                        className="textarea-large"
                        value={answerExplanation}
                        onChange={(e) => setAnswerExplanation(e.target.value)}
                    />
                </label>

                <label>
                    Image:
                    <input
                        type="file"
                        onChange={onFileChange}
                    />
                </label>

                {image && (
                    <img
                        src={URL.createObjectURL(image)}
                        className="add-question-card-image"
                        alt="Preview"
                    />
                )}

                <div className="space-between">
                    <button className="button-group-button margin-top-20" type="submit">
                        Add Question Card
                    </button>
                </div>
            </form>

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Validation Errors</h3>
                        <ul>
                            {errorMessages.map((msg, index) => (
                                <li key={index}>{msg}</li>
                            ))}
                        </ul>
                        <div className="popup-actions">
                            <button className="popup-cancel" onClick={handleClosePopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

}