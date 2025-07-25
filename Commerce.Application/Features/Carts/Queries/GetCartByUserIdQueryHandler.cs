using Commerce.Application.Features.Carts.DTOs;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Commerce.Application.Features.Carts.Queries
{
    public class GetCartByUserIdQueryHandler : IRequestHandler<GetCartByUserIdQuery, CartDto?>
    {
        private readonly ApplicationDbContext _context;

        public GetCartByUserIdQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CartDto?> Handle(GetCartByUserIdQuery request, CancellationToken cancellationToken)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);

            if (cart == null)
                return null;

            var cartDto = new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                CartItems = cart.CartItems.Select(ci => new CartItemDto
                {
                    Id = ci.Id,
                    ProductId = ci.ProductId,
                    ProductName = ci.Product?.Name ?? string.Empty,
                    ProductImageUrl = ci.Product?.ImageUrl ?? string.Empty,
                    UnitPrice = ci.Product?.Price ?? 0,
                    Quantity = ci.Quantity,
                    TotalPrice = (ci.Product?.Price ?? 0) * ci.Quantity
                }).ToList()
            };

            cartDto.TotalAmount = cartDto.CartItems.Sum(ci => ci.TotalPrice);
            cartDto.TotalItems = cartDto.CartItems.Sum(ci => ci.Quantity);

            return cartDto;
        }
    }
}
