
const ErrorMsg = ({ errorMsg }) => {
    return (
        <p className={`text-red-500 font-bold `}>{errorMsg}</p>
    )
}
// ${errorMsg.length > 0 ? 'block' : 'hidden'}
export default ErrorMsg;