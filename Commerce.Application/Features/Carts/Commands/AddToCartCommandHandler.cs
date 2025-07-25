using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Commerce.Application.Features.Carts.Commands
{
    public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, bool>
    {
        private readonly ApplicationDbContext _context;

        public AddToCartCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(AddToCartCommand request, CancellationToken cancellationToken)
        {
            // Ürün var mı ve aktif mi kontrol et
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == request.ProductId && p.IsActive, cancellationToken);

            if (product == null)
                throw new ArgumentException("Belirtilen ürün bulunamadı veya aktif değil.");

            // Stok kontrolü
            if (product.Stock < request.Quantity)
                throw new ArgumentException("Yeterli stok bulunmuyor.");

            // Kullanıcının sepetini bul veya oluştur
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

            // Sepette aynı ürün var mı kontrol et
            var existingCartItem = cart.CartItems
                .FirstOrDefault(ci => ci.ProductId == request.ProductId);

            if (existingCartItem != null)
            {
                // Mevcut miktarı artır
                var newQuantity = existingCartItem.Quantity + request.Quantity;
                if (product.Stock < newQuantity)
                    throw new ArgumentException("Yeterli stok bulunmuyor.");

                existingCartItem.Quantity = newQuantity;
            }
            else
            {
                // Yeni cart item ekle
                var cartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
