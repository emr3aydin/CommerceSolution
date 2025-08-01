using AutoMapper;
using Commerce.Application.Features.Categories.DTOs;
using Commerce.Domain.Entities;
using Commerce.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Commerce.Domain;

namespace Commerce.Application.Features.Categories.Queries
{

    public class GetAllCategoriesQueryHandler : IRequestHandler<GetAllCategoriesQuery, ApiResponse<IReadOnlyList<CategoryDto>>>
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public GetAllCategoriesQueryHandler(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ApiResponse<IReadOnlyList<CategoryDto>>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var categories = await _context.Categories
                                               .Include(c => c.Products)
                                               .ToListAsync(cancellationToken);

                var categoryDtos = _mapper.Map<IReadOnlyList<CategoryDto>>(categories);

                return ApiResponse<IReadOnlyList<CategoryDto>>.SuccessResponse(categoryDtos, "Categories retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ApiResponse<IReadOnlyList<CategoryDto>>.ErrorResponse($"An error occurred while retrieving categories: {ex.Message}");
            }
        }
    }
}