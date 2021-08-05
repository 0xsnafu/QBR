const ErrorMsg = ({ errorMsg }) => {
    return (
        <p className={`text-red-500 font-bold `}>{errorMsg}</p>
    )
}

export default ErrorMsg;