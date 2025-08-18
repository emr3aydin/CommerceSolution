using AutoMapper;
using Commerce.Application.Features.Carts.DTOs;
using Commerce.Application.Features.Categories.DTOs;
using Commerce.Application.Features.Orders.DTOs;
using Commerce.Application.Features.Products.DTOs;
using Commerce.Application.Features.Users.DTOs;
using Commerce.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Commerce.Application.Common.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile() {
            CreateMap<User, CurrentUserDto>();

            CreateMap<Category, CategoryDto>().ForMember(dest => dest.ProductCount, opt => opt.MapFrom(src => src.Products.Count)).ReverseMap();

            CreateMap<Product, ProductDto>();

            CreateMap<Order, OrderDto>();
            CreateMap<OrderItem, OrderItemDto>();

            CreateMap<Cart, CartDto>();
            CreateMap<CartItem, CartItemDto>();



        }
    }
}
