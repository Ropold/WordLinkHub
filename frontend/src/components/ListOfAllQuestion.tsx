import type {QuestionModel} from "./model/QuestionModel.ts";

type ListOfAllQuestionsProps = {
    user: string;
    favorites: string[];
    toggleFavorite: (questionId: string) => void;
    currentPage: number;
    setCurrentPage: (pageNumber: number) => void;
    allActiveQuestions: QuestionModel[];
    getAllActiveQuestions: () => void;
}
export default function ListOfAllQuestion(props: Readonly<ListOfAllQuestionsProps>){
    return (
        <>
        <h2>List Of All Question</h2>
        <p>{props.user}</p>
        </>
    )
}