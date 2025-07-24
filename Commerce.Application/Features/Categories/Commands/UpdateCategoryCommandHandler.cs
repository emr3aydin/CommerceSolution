using Commerce.Infrastructure.Persistence;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Features.Categories.Commands
{
    public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, int>
    {
        private readonly ApplicationDbContext _context;

        public UpdateCategoryCommandHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await _context.Categories.FindAsync(new object[] { request.Id }, cancellationToken);
            if (category == null)
            {
                throw new Exception($"Category with ID {request.Id} not found.");
                
                // Veya daha iyi bir yaklaşım: ApplicationException veya NotFoundException gibi kendi özel istisnanızı tanımlayın.
            }
            category.Name = request.Name;
            category.Description = request.Description;
            category.ImageUrl = request.ImageUrl;
            category.IsActive = request.IsActive;

            await _context.SaveChangesAsync(cancellationToken);

            return category.Id;
        }
    }
}
