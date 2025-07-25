using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Commerce.Application.Features.Orders.Commands
{
    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, int>
    {
        private readonly ApplicationDbContext _context;

        public CreateOrderCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            // Kullanıcı var mı kontrol et
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == request.UserId, cancellationToken);

            if (!userExists)
                throw new ArgumentException("Kullanıcı bulunamadı.");

            // Sipariş numarası oluştur
            var orderNumber = GenerateOrderNumber();

            // Sipariş oluştur
            var order = new Order
            {
                OrderNumber = orderNumber,
                OrderDate = DateTime.UtcNow,
                ShippingAddress = request.ShippingAddress,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UserId = request.UserId,
                TotalAmount = 0 // Hesaplanacak
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync(cancellationToken); // Order ID'sini almak için

            decimal totalAmount = 0;

            // Sipariş öğelerini oluştur
            foreach (var item in request.OrderItems)
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.Id == item.ProductId && p.IsActive, cancellationToken);

                if (product == null)
                    throw new ArgumentException($"Ürün bulunamadı: {item.ProductId}");

                if (product.Stock < item.Quantity)
                    throw new ArgumentException($"Yeterli stok yok: {product.Name}");

                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = product.Price
                };

                _context.OrderItems.Add(orderItem);

                // Stoku düş
                product.Stock -= item.Quantity;

                totalAmount += product.Price * item.Quantity;
            }

            // Toplam tutarı güncelle
            order.TotalAmount = totalAmount;

            await _context.SaveChangesAsync(cancellationToken);
            return order.Id;
        }

        private string GenerateOrderNumber()
        {
            return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }
    }
}
