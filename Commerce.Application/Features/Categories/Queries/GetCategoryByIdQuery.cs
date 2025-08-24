using Commerce.Application.Features.Categories.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Commerce.Core.Common; // Make sure to include the namespace for ApiResponse
using Commerce.Domain.Entities;

namespace Commerce.Application.Features.Categories.Queries
{
    public record GetCategoryByIdQuery(int Id) : IRequest<ApiResponse<CategoryDto>>;

}

