using Commerce.Infrastructure.Persistence;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using Commerce.Core.Common; 
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Categories.Commands
{
    public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, ApiResponse<int>>
    {
        private readonly ApplicationDbContext _context;

        public UpdateCategoryCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<int>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _context.Categories.FindAsync(new object[] { request.Id }, cancellationToken);

            if (category == null)
            {
                return ApiResponse<int>.ErrorResponse($"ID'si {request.Id} olan kategori bulunamadi ve güncellenemedi.");
            }

            category.Name = request.Name;
            category.Description = request.Description;
            category.ImageUrl = request.ImageUrl;
            category.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);

            return ApiResponse<int>.SuccessResponse(category.Id, $"ID'si {request.Id} olan kategori basariyla güncellendi.");
        }
    }
}

