using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MediatR;

namespace Commerce.Application.Features.Categories.DTOs
{
    public record CategoryDto(int ID, string Name, string Description, string ImageUrl, bool IsActive, DateTime CreatedAt);
}
