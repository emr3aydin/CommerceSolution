using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Commerce.Application.Features.Products.Commands
{
    public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, bool>
    {
        private readonly ApplicationDbContext _context;

        public DeleteProductCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (product == null)
                return false;

            // Sepette veya siparişte olan ürünler silinemez
            var hasActiveReferences = await _context.CartItems
                .AnyAsync(ci => ci.ProductId == request.Id, cancellationToken) ||
                await _context.OrderItems
                .AnyAsync(oi => oi.ProductId == request.Id, cancellationToken);

            if (hasActiveReferences)
                throw new InvalidOperationException("Bu ürün sepetlerde veya siparişlerde kullanıldığı için silinemez.");

            _context.Products.Remove(product);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
