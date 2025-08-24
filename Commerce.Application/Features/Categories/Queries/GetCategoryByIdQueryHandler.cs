using Commerce.Application.Features.Categories.DTOs;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Commerce.Core.Common; 
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Categories.Queries
{
    public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, ApiResponse<CategoryDto>>
    {
        private readonly ApplicationDbContext _context;

        public GetCategoryByIdQueryHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<CategoryDto>> Handle(GetCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            var category = await _context.Categories
                .Include(c => c.Products)
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

            if (category == null)
            {
                return ApiResponse<CategoryDto>.ErrorResponse($"ID'si {request.Id} olan kategori bulunamadi.");
            }

            // Category varligini CategoryDto'ya dönüstür
            var categoryDto = new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                ProductCount = category.Products.Count
            };

            return ApiResponse<CategoryDto>.SuccessResponse(categoryDto, "Kategori basariyla getirildi.");
        }
    }
}

