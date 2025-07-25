using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Categories.Commands
{
    public record DeleteCategoryCommand(int Id) : IRequest<Unit>;

}
