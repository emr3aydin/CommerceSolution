using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Domain
{

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }

        private ApiResponse(bool success, string message, T data)
        {
            Success = success;
            Message = message;
            Data = data;
        }

        public static ApiResponse<T> SuccessResponse(T data, string message = "Operation successful.")
        {
            return new ApiResponse<T>(true, message, data);
        }

        public static ApiResponse<T> ErrorResponse(string message, T data = default(T))
        {
            return new ApiResponse<T>(false, message, data);
        }

        public static ApiResponse<object> SuccessNoData(string message = "Operation successful.")
        {
            return new ApiResponse<object>(true, message, null);
        }
    }

    public class ApiResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }

        private ApiResponse(bool success, string message)
        {
            Success = success;
            Message = message;
        }

        public static ApiResponse SuccessResponse(string message = "Operation successful.")
        {
            return new ApiResponse(true, message);
        }

        public static ApiResponse ErrorResponse(string message)
        {
            return new ApiResponse(false, message);
        }
    }
}
