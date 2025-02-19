class ApiError extends Error{
    constructor(statusCode, error=[], message="Something went wrong", stack){
        this.message = message
        this.error = error
        this.sucess = false
        this.data = null
        this.statusCode = statusCode
        if(stack){
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
export {ApiError}