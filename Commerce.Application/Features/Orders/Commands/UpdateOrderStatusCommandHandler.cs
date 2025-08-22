using Commerce.Infrastructure.Persistence;
using Commerce.Infrastructure.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Core.Common;
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Orders.Commands
{
    public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand, ApiResponse<bool>>
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public UpdateOrderStatusCommandHandler(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<ApiResponse<bool>> Handle(UpdateOrderStatusCommand request, CancellationToken cancellationToken)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

            if (order == null)
                return ApiResponse<bool>.ErrorResponse("Sipariş bulunamadı.");

            var validStatuses = new[] { "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled" };
            if (!validStatuses.Contains(request.Status))
                return ApiResponse<bool>.ErrorResponse("Geçersiz sipariş durumu.");

            var oldStatus = order.Status;
            order.Status = request.Status;
            order.ApprovedBy = request.ApprovedBy;
            order.ApprovedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            // Send status update email
            try
            {
                if (order.User != null && !string.IsNullOrEmpty(order.User.Email))
                {
                    var userName = order.User.FirstName + " " + order.User.LastName;

                    switch (request.Status)
                    {
                        case "Confirmed":
                            await _emailService.SendOrderStatusUpdateEmailAsync(
                                order.User.Email, userName, order.OrderNumber, oldStatus, request.Status);
                            break;
                        case "Shipped":
                            await _emailService.SendOrderShippedEmailAsync(
                                order.User.Email, userName, order.OrderNumber, order.ShippingAddress);
                            break;
                        case "Delivered":
                            await _emailService.SendOrderDeliveredEmailAsync(
                                order.User.Email, userName, order.OrderNumber);
                            break;
                        case "Cancelled":
                            await _emailService.SendOrderCancelledEmailAsync(
                                order.User.Email, userName, order.OrderNumber, "Yönetici tarafından iptal edildi");
                            break;
                        default:
                            await _emailService.SendOrderStatusUpdateEmailAsync(
                                order.User.Email, userName, order.OrderNumber, oldStatus, request.Status);
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                // Log email error but don't fail the status update
                Console.WriteLine($"Failed to send order status update email: {ex.Message}");
            }

            return ApiResponse<bool>.SuccessResponse(true, "Sipariş durumu başarıyla güncellendi.");
        }
    }
}

