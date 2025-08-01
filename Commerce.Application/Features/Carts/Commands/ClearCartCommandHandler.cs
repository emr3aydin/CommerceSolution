using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Domain;

namespace Commerce.Application.Features.Carts.Commands
{
    public class ClearCartCommandHandler : IRequestHandler<ClearCartCommand, ApiResponse<bool>>
    {
        private readonly ApplicationDbContext _context;

        public ClearCartCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<bool>> Handle(ClearCartCommand request, CancellationToken cancellationToken)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);

            if (cart == null)
            {
                return ApiResponse<bool>.ErrorResponse("Sepet bulunamadı veya zaten boş.");
            }

            _context.CartItems.RemoveRange(cart.CartItems);
            await _context.SaveChangesAsync(cancellationToken);
            return ApiResponse<bool>.SuccessResponse(true, "Sepet başarıyla temizlendi.");
        }
    }
}