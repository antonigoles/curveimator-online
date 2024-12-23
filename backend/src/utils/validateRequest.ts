export default function validateRequest(conditions: boolean[]) {
    return conditions.every(condition => condition)
}