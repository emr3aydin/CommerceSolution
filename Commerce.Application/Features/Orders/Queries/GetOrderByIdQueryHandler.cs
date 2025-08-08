using Commerce.Application.Features.Orders.DTOs;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Domain; // Make sure to include your Domain namespace

namespace Commerce.Application.Features.Orders.Queries
{
    public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, ApiResponse<OrderDto?>> // Updated return type
    {
        private readonly ApplicationDbContext _context;

        public GetOrderByIdQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<OrderDto?>> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken) // Updated return type
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken);

            if (order == null)
                return ApiResponse<OrderDto?>.ErrorResponse("Sipariþ bulunamadý.");

            return ApiResponse<OrderDto?>.SuccessResponse(new OrderDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                ShippingAddress = order.ShippingAddress,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                ApprovedAt = order.ApprovedAt,
                UserId = order.UserId,
                UserName = order.User != null ? $"{order.User.FirstName} {order.User.LastName}" : string.Empty,
                OrderItems = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    ProductName = oi.Product != null ? oi.Product.Name : string.Empty,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.Price,
                    TotalPrice = oi.Price * oi.Quantity
                }).ToList()
            });
        }
    }
}