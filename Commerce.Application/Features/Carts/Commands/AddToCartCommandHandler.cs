using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Core.Common; 
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Carts.Commands
{
    public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, ApiResponse<bool>> // Updated return type
    {
        private readonly ApplicationDbContext _context;

        public AddToCartCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<bool>> Handle(AddToCartCommand request, CancellationToken cancellationToken) // Updated return type
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == request.ProductId && p.IsActive, cancellationToken);

            if (product == null)
                return ApiResponse<bool>.ErrorResponse("Belirtilen ürün bulunamadı veya aktif değil.");

            if (product.Stock < request.Quantity)
                return ApiResponse<bool>.ErrorResponse("Yeterli stok bulunmuyor.");

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = request.UserId
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync(cancellationToken);
            }

            var existingCartItem = cart.CartItems
                .FirstOrDefault(ci => ci.ProductId == request.ProductId && ci.CartId == cart.Id);

            if (existingCartItem != null)
            {
                var newQuantity = existingCartItem.Quantity + request.Quantity;
                if (product.Stock < newQuantity)
                    return ApiResponse<bool>.ErrorResponse("Yeterli stok bulunmuyor.");

                existingCartItem.Quantity = newQuantity;
            }
            else
            {
                var cartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity
                };
                _context.CartItems.Add(cartItem);
            }

            try
            {
                await _context.SaveChangesAsync(cancellationToken);
                return ApiResponse<bool>.SuccessResponse(true, "Ürün sepete başarıyla eklendi.");
            }
            catch (Exception ex)
            {
                return ApiResponse<bool>.ErrorResponse($"Veritabanı hatası: {ex.Message}");
            }
        }
    }
}

