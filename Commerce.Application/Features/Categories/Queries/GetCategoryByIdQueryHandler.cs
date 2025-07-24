using Commerce.Application.Features.Categories.DTOs;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Categories.Queries
{
    public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, CategoryDto>
    {
        private readonly ApplicationDbContext _context;

        public GetCategoryByIdQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CategoryDto> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            var category = await _context.Categories
                                         .AsNoTracking() // Sadece okuma işlemi olduğu için takip etmeyi kapatmak performansı artırabilir
                                         .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

            if (category == null)
            {
                // Kategori bulunamazsa özel bir istisna fırlatabilirsiniz.
                // Örneğin: throw new NotFoundException($"Category with ID {request.Id} not found.");
                throw new Exception($"ID'si {request.Id} olan kategori bulunamadı.");
            }

            // Category varlığını CategoryDto'ya dönüştür
            var categoryDto = new CategoryDto(
                category.Id,
                category.Name,
                category.Description,
                category.ImageUrl,
                category.IsActive,
                category.CreatedAt
            );

            return categoryDto;
        }
    }
}
