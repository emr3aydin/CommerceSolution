using MediatR;
using Commerce.Domain;

namespace Commerce.Application.Features.Products.Commands
{
    public record DeleteProductCommand(int Id) : IRequest<ApiResponse<bool>>; 
}