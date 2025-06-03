import type {QuestionModel} from "./model/QuestionModel.ts";
import {useLocation} from "react-router-dom";
import {useEffect, useState} from "react";
import type {CategoryEnum} from "./model/CategoryEnum.ts";
import QuestionCard from "./QuestionCard.tsx";
import SearchBar from "./SearchBar.tsx";

type ListOfAllQuestionsProps = {
    user: string;
    favorites: string[];
    toggleFavorite: (questionId: string) => void;
    currentPage: number;
    setCurrentPage: (pageNumber: number) => void;
    allActiveQuestions: QuestionModel[];
    getAllActiveQuestions: () => void;
}
export default function ListOfAllQuestions(props: Readonly<ListOfAllQuestionsProps>){

    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filteredQuestions, setFilteredQuestions] = useState<QuestionModel[]>([]);
    const [selectedCategoryEnum, setSelectedCategoryEnum] = useState<CategoryEnum | "">("");
    const [questionsPerPage, setQuestionsPerPage] = useState<number>(9);

    const location = useLocation();

    useEffect(() => {
        props.getAllActiveQuestions();
    }, [props.getAllActiveQuestions]);


    useEffect(() => {
        window.scroll(0, 0);
    }, [location]);

    useEffect(() => {
        const updateQuestionsPerPage = () => {
            if (window.innerWidth < 768) {
                setQuestionsPerPage(8);
            } else if (window.innerWidth < 1200) {
                setQuestionsPerPage(9);
            } else {
                setQuestionsPerPage(12);
            }
        };
        updateQuestionsPerPage();
        window.addEventListener("resize", updateQuestionsPerPage);

        return () => {
            window.removeEventListener("resize", updateQuestionsPerPage);
        };
    }, []);

    function filterQuestions(
        questions: QuestionModel[],
        query: string,
        categoryEnum: CategoryEnum | ""
    ) {
        const queryLower = query.toLowerCase();

        return questions.filter((question) => {
            const matchesCategoryEnum = categoryEnum ? question.categoryEnum === categoryEnum : true;

            const matchesSearch =
                question.title.toLowerCase().includes(queryLower) ||
                question.clueWords.some(word => word.toLowerCase().includes(queryLower)) ||
                question.solutionWord.toLowerCase().includes(queryLower) ||
                question.answerExplanation.toLowerCase().includes(queryLower);

            return matchesCategoryEnum && matchesSearch;
        });
    }

    useEffect(() => {
        setFilteredQuestions(filterQuestions(props.allActiveQuestions, searchQuery, selectedCategoryEnum));
    }, [props.allActiveQuestions, searchQuery, selectedCategoryEnum]);

    function getPaginationData() {
        const indexOfLastQuestion = props.currentPage * questionsPerPage;
        const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
        const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
        const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
        return { currentQuestions: currentQuestions, totalPages };
    }

    const { currentQuestions, totalPages } = getPaginationData();

    return (
        <>
            <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategoryEnum={selectedCategoryEnum}
                setSelectedCategoryEnum={setSelectedCategoryEnum}
                activeQuestions={props.allActiveQuestions}
            />
            <div className="question-card-container">
                {currentQuestions.map((q) => (
                    <QuestionCard
                        key={q.id}
                        question={q}
                        user={props.user}
                        favorites={props.favorites}
                        toggleFavorite={props.toggleFavorite}
                    />
                ))}
            </div>
            <div className="space-between">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        className={"button-group-button"}
                        id={index +1 === props.currentPage ? "active-paginate" : undefined}
                        onClick={() => {
                            props.setCurrentPage(index + 1);
                        }}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </>
    )
}