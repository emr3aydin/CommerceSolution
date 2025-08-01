using Commerce.Application.Features.Users.DTOs;
using Commerce.Domain;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Users.Queries
{
    public record GetCurrentUserQuery(string UserId) : IRequest<ApiResponse<CurrentUserDto>>;

}
