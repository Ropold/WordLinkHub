import animalsPic from "../../assets/categoryEnumImages/animals.jpg";
import artPic from "../../assets/categoryEnumImages/art.jpg";
import brandsPic from "../../assets/categoryEnumImages/brands.jpg";
import fictionalCharactersPic from "../../assets/categoryEnumImages/fictional-characters.jpg";
import foodAndDrinkPic from "../../assets/categoryEnumImages/food-and-drink.jpg";
import generalPic from "../../assets/categoryEnumImages/general.jpg";
import geographyPic from "../../assets/categoryEnumImages/geography.jpg";
import historyPic from "../../assets/categoryEnumImages/history.jpg";
import literaturePic from "../../assets/categoryEnumImages/literature.jpg";
import mathematicsPic from "../../assets/categoryEnumImages/mathematics.jpg";
import moviesAndTvPic from "../../assets/categoryEnumImages/movies-and-tv.jpg";
import musicPic from "../../assets/categoryEnumImages/music.jpg";
import naturePic from "../../assets/categoryEnumImages/nature.jpg";
import objectsPic from "../../assets/categoryEnumImages/objects.jpg";
import occupationsPic from "../../assets/categoryEnumImages/occupations.jpg";
import politicsPic from "../../assets/categoryEnumImages/politics.jpg";
import sciencePic from "../../assets/categoryEnumImages/science.jpg";
import sportsPic from "../../assets/categoryEnumImages/sports.jpg";

import type { CategoryEnum } from "../model/CategoryEnum.ts";

export const categoryEnumImages: Record<CategoryEnum, string> = {
    ANIMALS: animalsPic,
    ART: artPic,
    BRANDS: brandsPic,
    FICTIONAL_CHARACTERS: fictionalCharactersPic,
    FOOD_AND_DRINK: foodAndDrinkPic,
    GENERAL: generalPic,
    GEOGRAPHY: geographyPic,
    HISTORY: historyPic,
    LITERATURE: literaturePic,
    MATHEMATICS: mathematicsPic,
    MOVIES_AND_TV: moviesAndTvPic,
    MUSIC: musicPic,
    NATURE: naturePic,
    OBJECTS: objectsPic,
    OCCUPATIONS: occupationsPic,
    POLITICS: politicsPic,
    SCIENCE: sciencePic,
    SPORTS: sportsPic,
};
