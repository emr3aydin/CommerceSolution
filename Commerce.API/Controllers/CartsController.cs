using Commerce.Application.Features.Carts.Commands;
using Commerce.Application.Features.Carts.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Commerce.Domain; // Make sure to include your Domain namespace
using Commerce.Infrastructure.Interfaces;

namespace Commerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILoggingService _loggingService;

        public CartsController(IMediator mediator, ILoggingService loggingService)
        {
            _mediator = mediator;
            _loggingService = loggingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {

            var userId = GetCurrentUserId();
            var cart = await _mediator.Send(new GetCartByUserIdQuery(userId));

            if (cart.Data == null)
                return Ok(ApiResponse<object>.SuccessNoData("Sepet boş."));

            return Ok(cart);

        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {

            var userId = GetCurrentUserId();
            var command = new AddToCartCommand(userId, request.ProductId, request.Quantity);

            var result = await _mediator.Send(command);
            if (!result.Success)
                return BadRequest(ApiResponse.ErrorResponse(result.Message));

            // Log the add to cart operation
            await _loggingService.LogOperationAsync("ADD_TO_CART", "Cart", userId, userId.ToString(), new { ProductId = request.ProductId, Quantity = request.Quantity });

            return Ok(ApiResponse.SuccessResponse(result.Message));


        }

        [HttpDelete("remove/{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {

            if (cartItemId <= 0)
                return BadRequest(ApiResponse.ErrorResponse("Geçerli bir sepet öğesi ID'si giriniz."));

            var userId = GetCurrentUserId();
            var command = new RemoveFromCartCommand(userId, cartItemId);

            var result = await _mediator.Send(command);
            if (!result.Success)
                return NotFound(ApiResponse.ErrorResponse("Sepet öğesi bulunamadı."));

            // Log the remove from cart operation
            await _loggingService.LogOperationAsync("REMOVE_FROM_CART", "Cart", cartItemId, userId.ToString(), new { CartItemId = cartItemId });

            return Ok(ApiResponse.SuccessResponse("Ürün sepetten başarıyla çıkarıldı."));

        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {

            var userId = GetCurrentUserId();
            var command = new ClearCartCommand(userId);
            var result = await _mediator.Send(command);

            if (!result.Success)
            {
                return BadRequest(ApiResponse.ErrorResponse("Sepet temizlenirken bir sorun oluştu."));
            }

            // Log the clear cart operation
            await _loggingService.LogOperationAsync("CLEAR_CART", "Cart", userId, userId.ToString());

            return Ok(ApiResponse.SuccessResponse("Sepet başarıyla temizlendi."));

        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("Kullanıcı kimliği bulunamadı."));
        }
    }

    public class AddToCartRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }
}