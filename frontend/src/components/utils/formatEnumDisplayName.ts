export function formatEnumDisplayName(value: string): string {
    switch (value) {
        case "ANIMALS": return "🐾 Animals";
        case "ART": return "🎨 Art";
        case "BRANDS": return "🏷️ Brands";
        case "FICTIONAL_CHARACTERS": return "🦸‍♂️ Fictional Characters";
        case "FOOD_AND_DRINK": return "🍔 Food & Drink";
        case "GENERAL": return "📚 General";
        case "GEOGRAPHY": return "🗺️ Geography";
        case "HISTORY": return "🏺 History";
        case "LITERATURE": return "📖 Literature";
        case "MATHEMATICS": return "➗ Mathematics";
        case "MOVIES_AND_TV": return "🎬 Movies & TV";
        case "MUSIC": return "🎵 Music";
        case "NATURE": return "🌿 Nature";
        case "OBJECTS": return "📦 Objects";
        case "OCCUPATIONS": return "💼 Occupations";
        case "POLITICS": return "🏛️ Politics";
        case "SCIENCE": return "🔬 Science";
        case "SPORTS": return "🏅 Sports";
        case "RANDOM": return "🎲 Random";

        default: return value;
    }
}
