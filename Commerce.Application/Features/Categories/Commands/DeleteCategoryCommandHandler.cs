using Commerce.Infrastructure.Persistence;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Categories.Commands
{
    public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, Unit>
    {
        private readonly ApplicationDbContext _context;

        public DeleteCategoryCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Unit> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            // Silinecek kategoriyi ID'ye göre bul
            var category = await _context.Categories.FindAsync(new object[] { request.Id }, cancellationToken);

            // Kategori bulunamazsa hata fırlat
            if (category == null)
            {
                // NotFoundException gibi kendi özel istisnanızı tanımlamak daha iyidir.
                throw new Exception($"ID'si {request.Id} olan kategori bulunamadı ve silinemedi.");
            }

            // Kategoriyi veritabanından kaldır
            _context.Categories.Remove(category);

            // Değişiklikleri kaydet
            await _context.SaveChangesAsync(cancellationToken);

            // İşlem başarılı, ancak özel bir değer dönmediği için Unit.Value dönüyoruz
            return Unit.Value;
        }
    }
}
