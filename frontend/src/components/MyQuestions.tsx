import type {QuestionModel} from "./model/QuestionModel.ts";
import {useState} from "react";
import axios from "axios";

type MyQuestionsProps = {
    user: string;
    favorites: string[];
    toggleFavorite: (questionId: string) => void;
    isEditing: boolean;
    setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
    userQuestions: QuestionModel[];
    getUserQuestions: () => void;
    setUserQuestions: React.Dispatch<React.SetStateAction<QuestionModel[]>>;
}
export default function MyQuestions(props: Readonly<MyQuestionsProps>) {

    const [editData, setEditData] = useState<QuestionModel | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [questionToDelete, setQuestionToDelete] =  useState<string | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [imageChanged, setImageChanged] = useState(false);
    const [imageDeleted, setImageDeleted] = useState(false);

    function handleEditToggle(questionId: string) {
        const questionToEdit = props.userQuestions.find((q) => q.id === questionId);
        if (questionToEdit) {
            setEditData(questionToEdit);
            props.setIsEditing(true);

            // Nur versuchen, das Bild zu laden, wenn eine URL vorhanden ist
            if (questionToEdit.imageUrl) {
                fetch(questionToEdit.imageUrl)
                    .then((response) => response.blob())
                    .then((blob) => {
                        const file = new File([blob], "current-image.jpg", { type: blob.type });
                        setImage(file);
                    })
                    .catch((error) => console.error("Error loading current image:", error));
            }
        }
    }

    function handleToggleActiveStatus(questionId: string) {
        axios
            .put(`/api/users/${questionId}/toggle-active`)
            .then(() => {
                props.setUserQuestions((prevQuestion) =>
                    prevQuestion.map((q) =>
                        q.id === questionId ? { ...q, isActive: !q.isActive } : q
                    )
                );
            })
            .catch((error) => {
                console.error("Error during Toggle Offline/Active", error);
                alert("An Error while changing the status of Active/Offline.");
            });
    }

    function handleSaveEdit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editData) return;

        let updatedImageUrl = editData.imageUrl;
        if (imageChanged) {
            if (image) {
                updatedImageUrl = "temp-image";
            } else if (imageDeleted) {
                updatedImageUrl = ""; // oder ggf. null, je nach Backend-API
            }
        }

        const updatedQuestionData = {
            ...editData,
            imageUrl: updatedImageUrl,
        };

        const data = new FormData();
        if (imageChanged && image) {
            data.append("image", image);
        }
        data.append(
            "questionModelDto",
            new Blob([JSON.stringify(updatedQuestionData)], { type: "application/json" })
        );

        axios
            .put(`/api/word-link-hub/${editData.id}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
                props.setUserQuestions((prevQuestions) =>
                    prevQuestions.map((q) =>
                        q.id === editData.id ? { ...q, ...response.data } : q
                    )
                );
                props.setIsEditing(false);
                setImageDeleted(false); // <- wichtig: Reset nach erfolgreichem Speichern
            })
            .catch((error) => {
                console.error("Error saving question edits:", error);
                alert("An unexpected error occurred. Please try again.");
            });
    }

    function onFileChange (e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setImage(e.target.files[0]);
            setImageChanged(true);
        }
    }

    function handleDeleteClick(id: string) {
        setQuestionToDelete(id);
        setShowPopup(true);
    }

    function handleCancel(){
        setQuestionToDelete(null);
        setShowPopup(false);
    }

    function handleConfirmDelete() {
        if (questionToDelete) {
            axios
                .delete(`/api/word-link-hub/${questionToDelete}`)
                .then(() => {
                    props.setUserQuestions((prevQuestions) =>
                        prevQuestions.filter((q) => q.id !== questionToDelete)
                    );
                })
                .catch((error) => {
                    console.error("Error deleting question:", error);
                    alert("An unexpected error occurred. Please try again.");
                });
        }
        setQuestionToDelete(null);
        setShowPopup(false);
    }

    function handleCancelEdit() {
        setEditData(null);
        setImage(null);
        setImageChanged(false);
        setImageDeleted(false);
        props.setIsEditing(false);
    }

    return (
        <>
        <h2>MyQuestions</h2>
        <p>{props.user}</p>
    </>
    )
}