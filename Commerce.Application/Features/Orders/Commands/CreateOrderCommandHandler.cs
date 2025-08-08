using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Domain; // Make sure to include your Domain namespace

namespace Commerce.Application.Features.Orders.Commands
{
    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, ApiResponse<int>> // Updated return type
    {
        private readonly ApplicationDbContext _context;

        public CreateOrderCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<int>> Handle(CreateOrderCommand request, CancellationToken cancellationToken) // Updated return type
        {
            var userExists = await _context.Users
                .AnyAsync(u => u.Id == request.UserId, cancellationToken);

            if (!userExists)
                return ApiResponse<int>.ErrorResponse("Kullanıcı bulunamadı.");

            var orderNumber = GenerateOrderNumber();

            var order = new Order
            {
                OrderNumber = orderNumber,
                OrderDate = DateTime.UtcNow,
                ShippingAddress = request.ShippingAddress,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UserId = request.UserId,
                TotalAmount = 0
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync(cancellationToken);

            decimal totalAmount = 0;

            foreach (var item in request.OrderItems)
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.Id == item.ProductId && p.IsActive, cancellationToken);

                if (product == null)
                    return ApiResponse<int>.ErrorResponse($"Ürün bulunamadı: {item.ProductId}");

                if (product.Stock < item.Quantity)
                    return ApiResponse<int>.ErrorResponse($"Yeterli stok yok: {product.Name}");

                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = product.Price
                };

                _context.OrderItems.Add(orderItem);

                product.Stock -= item.Quantity;

                totalAmount += product.Price * item.Quantity;
            }

            order.TotalAmount = totalAmount;

            await _context.SaveChangesAsync(cancellationToken);
            return ApiResponse<int>.SuccessResponse(order.Id, "Sipariş başarıyla oluşturuldu.");
        }

        private string GenerateOrderNumber()
        {
            return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }
    }
}