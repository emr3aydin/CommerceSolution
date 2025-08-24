using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Core.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; } 
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public int StatusCode { get; set; }

        private ApiResponse(bool success, string message, T? data, int statusCode)
        {
            Success = success;
            Message = message;
            Data = data;
            StatusCode = statusCode;
        }

        public static ApiResponse<T> SuccessResponse(T data, string message = "Operation successful.")
        {
            return new ApiResponse<T>(true, message, data, 200);
        }

        public static ApiResponse<T> ErrorResponse(string message, T? data = default(T))
        {
            return new ApiResponse<T>(false, message, data, 400);
        }

        public static ApiResponse<object> SuccessNoData(string message = "Operation successful.")
        {
            return new ApiResponse<object>(true, message, null, 200);
        }
    }

    public class ApiResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int StatusCode { get; set; }

        private ApiResponse(bool success, string message, int statusCode)
        {
            Success = success;
            Message = message;
            StatusCode = statusCode;
        }

        public static ApiResponse SuccessResponse(string message = "Operation successful.")
        {
            return new ApiResponse(true, message, 200);
        }

        public static ApiResponse ErrorResponse(string message)
        {
            return new ApiResponse(false, message, 400);
        }
    }
}
