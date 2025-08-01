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
            try
            {
                var userId = GetCurrentUserId();
                var cart = await _mediator.Send(new GetCartByUserIdQuery(userId));

                if (cart.Data == null)
                    return Ok(ApiResponse<object>.SuccessNoData("Sepet boş."));

                return Ok(cart);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Sepet getirilirken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var command = new AddToCartCommand(userId, request.ProductId, request.Quantity);

                var result = await _mediator.Send(command);
                if (!result.Success)
                    return BadRequest(ApiResponse.ErrorResponse(result.Message));

                return Ok(ApiResponse.SuccessResponse(result.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Ürün sepete eklenirken bir hata oluştu: {ex.Message} {ex.InnerException}"));
            }
        }

        [HttpDelete("remove/{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            try
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
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Ürün sepetten çıkarılırken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            try
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
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Sepet temizlenirken bir hata oluştu: {ex.Message}"));
            }
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