using FluentValidation;

namespace Commerce.Application.Features.Products.Commands
{
    public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
    {
        public CreateProductCommandValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Ürün adı zorunludur.")
                .MaximumLength(200)
                .WithMessage("Ürün adı en fazla 200 karakter olabilir.");

            RuleFor(x => x.Description)
                .MaximumLength(1000)
                .WithMessage("Açıklama en fazla 1000 karakter olabilir.")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.Price)
                .GreaterThan(0)
                .WithMessage("Fiyat 0'dan büyük olmalıdır.");

            RuleFor(x => x.Stock)
                .GreaterThanOrEqualTo(0)
                .WithMessage("Stok miktarı 0 veya daha büyük olmalıdır.");

            RuleFor(x => x.ImageUrl)
                .NotEmpty()
                .WithMessage("Resim URL'si zorunludur.")
                .MaximumLength(500)
                .WithMessage("Resim URL'si en fazla 500 karakter olabilir.");

            RuleFor(x => x.SKU)
                .NotEmpty()
                .WithMessage("SKU zorunludur.")
                .MaximumLength(50)
                .WithMessage("SKU en fazla 50 karakter olabilir.");

            RuleFor(x => x.CategoryId)
                .GreaterThan(0)
                .WithMessage("Geçerli bir kategori seçiniz.");
        }
    }
}
