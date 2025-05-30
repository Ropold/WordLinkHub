import type {QuestionData, QuestionModel} from "./model/QuestionModel.ts";
import {useState} from "react";
import type {NullableCategoryEnum} from "./model/CategoryEnum.ts";
import {useNavigate} from "react-router-dom";
import axios from "axios";

type AddQuestionCardProps = {
    user: string;
    handleNewQuestionSubmit: (newQuestion: QuestionModel) => void;
}

class NullableDifficultyEnum {
}

export default function AddQuestionCard(props:Readonly<AddQuestionCardProps>){
    const [title, setTitle] = useState<string>("");
    const [categoryEnum, setCategoryEnum] = useState<NullableCategoryEnum>("");
    const [clueWords, setClueWords] = useState<string[]>([""]);
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
            .post("/api/quiz-hub", data, {
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
        <h2>AddQuestionCard</h2>
    )
}