using Commerce.Application.Features.Categories.DTOs;
using MediatR;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Categories.Queries
{
    public record GetAllCategoriesQuery() : IRequest<IEnumerable<CategoryDto>>;
}
