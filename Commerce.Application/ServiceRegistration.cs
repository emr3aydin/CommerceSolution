using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using Commerce.Application.Features.Categories.Commands;
using Commerce.Application.Features.Products.Commands;
using Commerce.Application.Features.Orders.Commands;
using Commerce.Application.Features.Carts.Commands;

namespace Commerce.Application
{
    public static class ServiceRegistration
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            var assembly = Assembly.GetExecutingAssembly();

            // MediatR Registration
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

            // FluentValidation Registration
            services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            
            // Manuel validator kaydı
            services.AddScoped<IValidator<CreateCategoryCommand>, CreateCategoryCommandValidator>();
            services.AddScoped<IValidator<UpdateCategoryCommand>, UpdateCategoryCommandValidator>();
            services.AddScoped<IValidator<DeleteCategoryCommand>, DeleteCategoryCommandValidator>();
            
            services.AddScoped<IValidator<CreateProductCommand>, CreateProductCommandValidator>();
            services.AddScoped<IValidator<UpdateProductCommand>, UpdateProductCommandValidator>();
            services.AddScoped<IValidator<DeleteProductCommand>, DeleteProductCommandValidator>();
            
            services.AddScoped<IValidator<CreateOrderCommand>, CreateOrderCommandValidator>();
            services.AddScoped<IValidator<AddToCartCommand>, AddToCartCommandValidator>();

            return services;
        }
    }
}
