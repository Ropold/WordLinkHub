import type {CategoryEnum, NullableCategoryEnum} from "./CategoryEnum.ts";

export type QuestionModel = {
    id: string;
    title: string;
    categoryEnum: CategoryEnum;
    clueWords: string[];
    solutionWord: string;
    answerExplanation: string;
    isActive: boolean;
    githubId: string;
    imageUrl: string | null;
};

export const DefaultQuestion: QuestionModel = {
    id: "",
    title: "Errate das Wort!",
    categoryEnum: "GENERAL",
    clueWords: [
        "Obst",
        "Gelb",
        "Tropisch",
        "Währung von Bud Spencer",
    ],
    solutionWord: "Banane",
    answerExplanation: "Eine gelbe tropische Frucht, die oft von Affen gegessen wird.",
    isActive: true,
    githubId: "154427648",
    imageUrl: null,
}

export type QuestionData = {
    title: string;
    categoryEnum: NullableCategoryEnum;
    clueWords: string[];
    solutionWord: string;
    answerExplanation: string;
    isActive: boolean;
    githubId: string;
    imageUrl: string | null;
};