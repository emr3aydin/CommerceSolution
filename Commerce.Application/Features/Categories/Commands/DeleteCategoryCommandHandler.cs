using Commerce.Infrastructure.Persistence;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Commerce.Core.Common; 
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Categories.Commands
{
    public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand, ApiResponse<Unit>>
    {
        private readonly ApplicationDbContext _context;

        public DeleteCategoryCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ApiResponse<Unit>> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _context.Categories.FindAsync(new object[] { request.Id }, cancellationToken);

            if (category == null)
            {
                return ApiResponse<Unit>.ErrorResponse($"ID'si {request.Id} olan kategori bulunamadi ve silinemedi.");
            }

            _context.Categories.Remove(category);

            await _context.SaveChangesAsync(cancellationToken);

            return ApiResponse<Unit>.SuccessResponse(Unit.Value, $"ID'si {request.Id} olan kategori basariyla silindi.");
        }
    }
}

