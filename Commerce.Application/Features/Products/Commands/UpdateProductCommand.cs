using MediatR;

namespace Commerce.Application.Features.Products.Commands
{
    public record UpdateProductCommand(
        int Id,
        string Name,
        string? Description,
        decimal Price,
        int Stock,
        string ImageUrl,
        string SKU,
        int CategoryId,
        bool IsActive
    ) : IRequest<bool>;
}
