using MediatR;

namespace Commerce.Application.Features.Products.Commands
{
    public record CreateProductCommand(
        string Name,
        string? Description,
        decimal Price,
        int Stock,
        string ImageUrl,
        string SKU,
        int CategoryId,
        bool IsActive
    ) : IRequest<int>;
}
