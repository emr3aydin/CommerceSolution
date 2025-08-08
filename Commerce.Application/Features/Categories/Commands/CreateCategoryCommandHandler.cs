using Commerce.Infrastructure.Persistence;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Commerce.Domain;

namespace Commerce.Application.Features.Categories.Commands
{
    public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, ApiResponse<int>>
    {
        private readonly ApplicationDbContext _context;

        public CreateCategoryCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<int>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = new Domain.Entities.Category
            {
                Name = request.Name,
                Description = request.Description,
                ImageUrl = request.ImageUrl,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync(cancellationToken);

            return ApiResponse<int>.SuccessResponse(category.Id, "Kategori başarıyla oluşturuldu.");
        }
    }
}