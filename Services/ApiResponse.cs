namespace MapApplication.Services
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }


        public ApiResponse(bool success, string message, T data)
        {

            Success = success;
            Message = message;
            Data = data;
        }


        //Method for response in case of success
        public static ApiResponse<T> SuccessResponse(string message, T data)
        {
            return new ApiResponse<T>(true, message, data);
        }

        //Factory method for response in case of error
        public static ApiResponse<T> ErrorResponse(string message)
        {
            return new ApiResponse<T>(false, message, default);
        }


    }
}
