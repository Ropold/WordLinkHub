import type {QuestionModel} from "./model/QuestionModel.ts";

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
    return (
        <>
        <h2>MyQuestions</h2>
        <p>{props.user}</p>
    </>
    )
}