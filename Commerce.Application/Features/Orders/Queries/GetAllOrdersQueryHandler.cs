using Commerce.Application.Features.Orders.DTOs;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Domain; // Make sure to include your Domain namespace

namespace Commerce.Application.Features.Orders.Queries
{
    public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, ApiResponse<IEnumerable<OrderDto>>> // Updated return type
    {
        private readonly ApplicationDbContext _context;

        public GetAllOrdersQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<IEnumerable<OrderDto>>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken) // Updated return type
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .AsQueryable();

            if (request.UserId.HasValue)
                query = query.Where(o => o.UserId == request.UserId.Value);

            if (!string.IsNullOrEmpty(request.Status))
                query = query.Where(o => o.Status == request.Status);

            var orders = await query
                .OrderByDescending(o => o.OrderDate)
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    OrderDate = o.OrderDate,
                    TotalAmount = o.TotalAmount,
                    ShippingAddress = o.ShippingAddress,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    ApprovedAt = o.ApprovedAt,
                    UserId = o.UserId,
                    UserName = o.User != null ? $"{o.User.FirstName} {o.User.LastName}" : string.Empty,
                    OrderItems = o.OrderItems.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        ProductId = oi.ProductId,
                        ProductName = oi.Product != null ? oi.Product.Name : string.Empty,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.Price,
                        TotalPrice = oi.Price * oi.Quantity
                    }).ToList()
                })
                .ToListAsync(cancellationToken);

            return ApiResponse<IEnumerable<OrderDto>>.SuccessResponse(orders);
        }
    }
}