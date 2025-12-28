export function get_error_from_code(code) {
    if(code == 'MISMATCHED_TYPES') {
        return "This variable has a mismatched type, try changing the type to match the value"
    }
    if(code == 'NON_MUTABLE') {
        return "This variable isn't mutable, Try making it mutable"
    }
    if(code == 'NO_VALUE_FOUND') {
        return "Cannot find variable with that name"
    }
}