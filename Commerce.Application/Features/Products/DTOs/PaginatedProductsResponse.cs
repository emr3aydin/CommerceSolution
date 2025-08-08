using System.Collections.Generic;

namespace Commerce.Application.Features.Products.DTOs
{
    public class PaginatedProductsResponse
    {
        public IEnumerable<ProductDto> Data { get; set; } = new List<ProductDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }
}
