using MediatR;
using Commerce.Core.Common;
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Products.Commands
{
    public record DeleteProductCommand(int Id) : IRequest<ApiResponse<bool>>; 
}

