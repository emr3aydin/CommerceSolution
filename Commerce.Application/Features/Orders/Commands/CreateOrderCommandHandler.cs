using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using Commerce.Infrastructure.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Core.Common;
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Orders.Commands
{
    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, ApiResponse<int>>
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public CreateOrderCommandHandler(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<ApiResponse<int>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
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

            // Send order confirmation email
            try
            {
                if (!string.IsNullOrEmpty(user.Email))
                {
                    await _emailService.SendOrderConfirmationEmailAsync(
                        user.Email, 
                        user.FirstName + " " + user.LastName, 
                        order.OrderNumber, 
                        order.TotalAmount, 
                        order.OrderDate);
                }
            }
            catch (Exception ex)
            {
                // Log email error but don't fail the order creation
                // You might want to add logging here
                Console.WriteLine($"Failed to send order confirmation email: {ex.Message}");
            }

            return ApiResponse<int>.SuccessResponse(order.Id, "Sipariş başarıyla oluşturuldu.");
        }

        private string GenerateOrderNumber()
        {
            return $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }
    }
}

