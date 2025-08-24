using Commerce.Application.Features.Categories.DTOs;
using Commerce.Application.Features.Products.DTOs;
using Commerce.Core.Common;
using Commerce.Domain.Entities;
using MediatR;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Categories.Queries
{
    public record GetAllCategoriesQuery() : IRequest<ApiResponse<IReadOnlyList<CategoryDto>>>;
}


