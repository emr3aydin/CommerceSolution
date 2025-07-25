using FluentValidation;

namespace Commerce.Application.Features.Orders.Commands
{
    public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
    {
        public CreateOrderCommandValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty()
                .WithMessage("Kullanıcı ID'si zorunludur.");

            RuleFor(x => x.ShippingAddress)
                .NotEmpty()
                .WithMessage("Teslimat adresi zorunludur.")
                .MaximumLength(500)
                .WithMessage("Teslimat adresi en fazla 500 karakter olabilir.");

            RuleFor(x => x.OrderItems)
                .NotEmpty()
                .WithMessage("Sipariş en az bir ürün içermelidir.");

            RuleForEach(x => x.OrderItems).SetValidator(new CreateOrderItemCommandValidator());
        }
    }

    public class CreateOrderItemCommandValidator : AbstractValidator<CreateOrderItemCommand>
    {
        public CreateOrderItemCommandValidator()
        {
            RuleFor(x => x.ProductId)
                .GreaterThan(0)
                .WithMessage("Geçerli bir ürün ID'si giriniz.");

            RuleFor(x => x.Quantity)
                .GreaterThan(0)
                .WithMessage("Miktar 0'dan büyük olmalıdır.");
        }
    }
}
