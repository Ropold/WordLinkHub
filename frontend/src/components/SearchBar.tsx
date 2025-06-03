import type {CategoryEnum} from "./model/CategoryEnum.ts";
import type {QuestionModel} from "./model/QuestionModel.ts";
import "./styles/SeachBar.css"
import {formatEnumDisplayName} from "./utils/formatEnumDisplayName.ts";
import {categoryEnumImages} from "./utils/CategoryEnumImages.ts";
import headerLogo from "../assets/logo-word-link.jpg";

type SearchBarProps = {
    searchQuery: string;
    setSearchQuery: (value: string) => void;
    selectedCategoryEnum: CategoryEnum | "";
    setSelectedCategoryEnum: (value: CategoryEnum | "") => void;
    activeQuestions: QuestionModel[];
}

export default function SearchBar(props: Readonly<SearchBarProps>) {

    const {
        searchQuery,
        setSearchQuery,
        selectedCategoryEnum,
        setSelectedCategoryEnum,
        activeQuestions
    } = props;

    const categoryTypes: CategoryEnum[] = Array
        .from(new Set(activeQuestions.map(q => q.categoryEnum)))
        .sort((a, b) => a.localeCompare(b));


    const handleReset = () => {
        setSearchQuery("");
        setSelectedCategoryEnum("");
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search by title or other fields..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
            />
            <label>
                <select
                    value={selectedCategoryEnum}
                    onChange={(e) => setSelectedCategoryEnum(e.target.value as CategoryEnum | "")}
                >
                    <option value="">Filter by Category</option>
                    {categoryTypes.map((type) => (
                        <option key={type} value={type}>
                            {formatEnumDisplayName(type)}
                        </option>
                    ))}
                </select>
            </label>
            <img
                src={
                    selectedCategoryEnum
                            ? categoryEnumImages[selectedCategoryEnum as CategoryEnum]
                            : headerLogo
                }
                alt={selectedCategoryEnum || "logo word link hub"}
                className="word-image-searchbar"
            />
            <button
                onClick={handleReset}
                className={`${searchQuery || selectedCategoryEnum ? "button-group-button" : "button-grey"}`}
            >
                Reset Filters
            </button>
        </div>
    )
}