using FluentValidation;

namespace Commerce.Application.Features.Categories.Commands
{
    public class DeleteCategoryCommandValidator : AbstractValidator<DeleteCategoryCommand>
    {
        public DeleteCategoryCommandValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Geçerli bir kategori ID'si giriniz.");
        }
    }
}
