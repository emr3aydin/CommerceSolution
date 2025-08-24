using Commerce.Core.Common;
using Commerce.Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Users.Commands
{
    public record CreateAdminCommand(string Email, string Username, string Password, string FirstName, string LastName, DateTime DateOfBirth, string Gender, string PhoneNumber) : IRequest<ApiResponse>;

}


