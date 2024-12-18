import {randomChoice} from "../Math/utils.ts";

export function randomName() {
    const adjectives = ["noisy", "quick", "savvy", "unnamed", "unknown", "picky", "angry", "happy"];
    const nouns = ["monkey", "banana", "forest", "car", "whale", "engineer", "project", "cat", "dog"];
    return `${randomChoice<string>(adjectives)}-${randomChoice<string>(nouns)}-${Math.round(Math.random() * 1000)}`
}