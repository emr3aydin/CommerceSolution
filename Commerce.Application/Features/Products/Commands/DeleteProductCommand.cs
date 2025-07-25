using MediatR;

namespace Commerce.Application.Features.Products.Commands
{
    public record DeleteProductCommand(int Id) : IRequest<bool>;
}
