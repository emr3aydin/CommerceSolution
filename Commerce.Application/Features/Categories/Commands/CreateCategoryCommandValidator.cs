using FluentValidation;

namespace Commerce.Application.Features.Categories.Commands
{
    public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
    {
        public CreateCategoryCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Kategori adı zorunludur.")
                .MaximumLength(100)
                .WithMessage("Kategori adı en fazla 100 karakter olabilir.");

            RuleFor(x => x.Description)
                .MaximumLength(500)
                .WithMessage("Açıklama en fazla 500 karakter olabilir.")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.ImageUrl)
                .NotEmpty()
                .WithMessage("Resim URL'si zorunludur.")
                .MaximumLength(255)
                .WithMessage("Resim URL'si en fazla 255 karakter olabilir.");
        }
    }
}
