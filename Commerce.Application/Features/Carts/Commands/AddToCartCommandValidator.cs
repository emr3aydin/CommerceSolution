using FluentValidation;

namespace Commerce.Application.Features.Carts.Commands
{
    public class AddToCartCommandValidator : AbstractValidator<AddToCartCommand>
    {
        public AddToCartCommandValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty()
                .WithMessage("Kullanıcı ID'si zorunludur.");

            RuleFor(x => x.ProductId)
                .GreaterThan(0)
                .WithMessage("Geçerli bir ürün ID'si giriniz.");

            RuleFor(x => x.Quantity)
                .GreaterThan(0)
                .WithMessage("Miktar 0'dan büyük olmalıdır.")
                .LessThanOrEqualTo(100)
                .WithMessage("Miktar 100'den fazla olamaz.");
        }
    }
}
