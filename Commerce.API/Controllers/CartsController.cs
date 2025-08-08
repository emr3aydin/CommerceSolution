using Commerce.Application.Features.Carts.Commands;
using Commerce.Application.Features.Carts.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Commerce.Domain; // Make sure to include your Domain namespace

namespace Commerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CartsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CartsController(IMediator mediator)
        {
            _mediator = mediator;
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