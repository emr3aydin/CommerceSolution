using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Commerce.Domain;

namespace Commerce.Application.Features.Carts.Commands
{
    public class RemoveFromCartCommandHandler : IRequestHandler<RemoveFromCartCommand, ApiResponse<bool>>
    {
        private readonly ApplicationDbContext _context;

        public RemoveFromCartCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<bool>> Handle(RemoveFromCartCommand request, CancellationToken cancellationToken)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .FirstOrDefaultAsync(ci => ci.Id == request.CartItemId &&
                                            ci.Cart != null &&
                                            ci.Cart.UserId == request.UserId, cancellationToken);

            if (cartItem == null)
                return ApiResponse<bool>.ErrorResponse("Sepet öğesi bulunamadı.");

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync(cancellationToken);
            return ApiResponse<bool>.SuccessResponse(true, "Ürün sepetten başarıyla çıkarıldı.");
        }
    }
}