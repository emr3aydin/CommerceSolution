using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Commerce.Domain; 

namespace Commerce.Application.Features.Categories.Commands
{
    public record DeleteCategoryCommand(int Id) : IRequest<ApiResponse<Unit>>;
}