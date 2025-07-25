using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Commerce.Application.Features.Products.Commands
{
    public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, bool>
    {
        private readonly ApplicationDbContext _context;

        public UpdateProductCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (product == null)
                return false;

            // Kategori var mı kontrol et
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == request.CategoryId, cancellationToken);

            if (!categoryExists)
                throw new ArgumentException("Belirtilen kategori bulunamadı.");

            // SKU benzersiz mi kontrol et (mevcut ürün hariç)
            var skuExists = await _context.Products
                .AnyAsync(p => p.SKU == request.SKU && p.Id != request.Id, cancellationToken);

            if (skuExists)
                throw new ArgumentException("Bu SKU zaten kullanımda.");

            product.Name = request.Name;
            product.Description = request.Description;
            product.Price = request.Price;
            product.Stock = request.Stock;
            product.ImageUrl = request.ImageUrl;
            product.SKU = request.SKU;
            product.CategoryId = request.CategoryId;
            product.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }
    }
}
