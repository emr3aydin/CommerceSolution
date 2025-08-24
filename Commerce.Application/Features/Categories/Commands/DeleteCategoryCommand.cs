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
    public record DeleteCategoryCommand(int Id) : IRequest<ApiResponse<Unit>>;
}

