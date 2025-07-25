using Commerce.Application.Features.Products.DTOs;
using MediatR;

namespace Commerce.Application.Features.Products.Queries
{
    public class GetProductByIdQuery : IRequest<ProductDto?>
    {
        public int Id { get; set; }

        public GetProductByIdQuery(int id)
        {
            Id = id;
        }
    }
}
