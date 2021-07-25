//Goes through rankings array. If myId is in array, then the user has finished the match
export function IsMatchOver(rankings, myId) {
    if (rankings.length === 0 || rankings.length === undefined) return false

    if (rankings.includes(myId)) {
        return true
    } else {
        return false
    }
}