using FluentValidation;

namespace Commerce.Application.Features.Products.Commands
{
    public class DeleteProductCommandValidator : AbstractValidator<DeleteProductCommand>
    {
        public DeleteProductCommandValidator()
        {
            RuleFor(x => x.Id)
                .GreaterThan(0)
                .WithMessage("Geçerli bir ürün ID'si giriniz.");
        }
    }
}
