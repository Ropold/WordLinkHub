import type {QuestionModel} from "./model/QuestionModel.ts";
import {useState} from "react";
import axios from "axios";
import QuestionCard from "./QuestionCard.tsx";
import {ALL_CATEGORIES, type CategoryEnum} from "./model/CategoryEnum.ts";
import {formatEnumDisplayName} from "./utils/formatEnumDisplayName.ts";

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
        <div>
            {props.isEditing ? (
                <div className="edit-form">
                    <h2>Edit Question</h2>
                    <form onSubmit={handleSaveEdit}>
                        <label>
                            Title:
                            <input
                                className="input-small"
                                type="text"
                                value={editData?.title ?? ""}
                                onChange={(e) => setEditData({ ...editData!, title: e.target.value })}
                            />
                        </label>

                        <label>
                            Clue Words (comma-separated):
                            <input
                                className="input-small"
                                type="text"
                                value={editData?.clueWords.join(", ") ?? ""}
                                onChange={(e) =>
                                    setEditData({ ...editData!, clueWords: e.target.value.split(",").map(w => w.trim()) })
                                }
                            />
                        </label>

                        <label>
                            Solution Word:
                            <input
                                className="input-small"
                                type="text"
                                value={editData?.solutionWord ?? ""}
                                onChange={(e) => setEditData({ ...editData!, solutionWord: e.target.value })}
                            />
                        </label>

                        <label>
                            Answer Explanation:
                            <textarea
                                className="textarea-large"
                                value={editData?.answerExplanation ?? ""}
                                onChange={(e) => setEditData({ ...editData!, answerExplanation: e.target.value })}
                            />
                        </label>

                        <label>
                            Category:
                            <select
                                className="input-small"
                                value={editData?.categoryEnum ?? ""}
                                onChange={(e) => setEditData({ ...editData!, categoryEnum: e.target.value as CategoryEnum })}
                            >
                                <option value="">Select Category</option>
                                {ALL_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {formatEnumDisplayName(cat)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Visibility:
                            <select
                                className="input-small"
                                value={editData?.isActive ? "true" : "false"}
                                onChange={(e) => setEditData({ ...editData!, isActive: e.target.value === "true" })}
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </label>

                        <div className="image-section">
                            <label>
                                Image:
                                <input type="file" onChange={onFileChange} />
                                {image && (
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={editData?.title ?? "Preview"}
                                        className="image-preview"
                                    />
                                )}
                            </label>
                            <button
                                className="button-group-button"
                                type="button"
                                onClick={() => {
                                    setImage(null);
                                    setImageChanged(true);
                                    setImageDeleted(true);
                                }}
                            >
                                Remove Image
                            </button>
                        </div>

                        <div className="space-between">
                            <button className="button-group-button" type="submit">Save Changes</button>
                            <button className="button-group-button" type="button" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="question-card-container">
                    {props.userQuestions.length > 0 ? (
                        props.userQuestions.map((q) => (
                            <div key={q.id}>
                                <QuestionCard
                                    question={q}
                                    user={props.user}
                                    favorites={props.favorites}
                                    toggleFavorite={props.toggleFavorite}
                                    showButtons={true}
                                    handleEditToggle={handleEditToggle}
                                    handleDeleteClick={handleDeleteClick}
                                    handleToggleActiveStatus={handleToggleActiveStatus}
                                />
                            </div>
                        ))
                    ) : (
                        <p>No Questions found for this user.</p>
                    )}
                </div>
            )}

            {showPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this question?</p>
                        <div className="popup-actions">
                            <button onClick={handleConfirmDelete} className="popup-confirm">Yes, Delete</button>
                            <button onClick={handleCancel} className="popup-cancel">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

}