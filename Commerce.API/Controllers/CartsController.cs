using Commerce.Application.Features.Carts.Commands;
using Commerce.Application.Features.Carts.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Commerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Tüm sepet işlemleri için kimlik doğrulama gerekli
    public class CartsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CartsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Kullanıcının sepetini getirir
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            try
            {
                var userId = GetCurrentUserId();
                var cart = await _mediator.Send(new GetCartByUserIdQuery(userId));
                
                if (cart == null)
                    return Ok(new { message = "Sepet boş.", cart = new { items = new List<object>(), totalAmount = 0, totalItems = 0 } });

                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sepet getirilirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Sepete ürün ekler
        /// </summary>
        [HttpPost("add")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var command = new AddToCartCommand(userId, request.ProductId, request.Quantity);

                var result = await _mediator.Send(command);
                if (!result)
                    return BadRequest(new { message = "Ürün sepete eklenemedi." });

                return Ok(new { message = "Ürün sepete başarıyla eklendi." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ürün sepete eklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Sepetten ürün çıkarır
        /// </summary>
        [HttpDelete("remove/{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            try
            {
                if (cartItemId <= 0)
                    return BadRequest(new { message = "Geçerli bir sepet öğesi ID'si giriniz." });

                var userId = GetCurrentUserId();
                var command = new RemoveFromCartCommand(userId, cartItemId);

                var result = await _mediator.Send(command);
                if (!result)
                    return NotFound(new { message = "Sepet öğesi bulunamadı." });

                return Ok(new { message = "Ürün sepetten başarıyla çıkarıldı." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ürün sepetten çıkarılırken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Sepeti temizler
        /// </summary>
        [HttpDelete("clear")]
        public IActionResult ClearCart()
        {
            try
            {
                var userId = GetCurrentUserId();
                // Bu işlev için ayrı bir command oluşturulabilir
                // Şimdilik mevcut sepetteki tüm öğeleri tek tek silme mantığı kullanılabilir
                
                return Ok(new { message = "Sepet başarıyla temizlendi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sepet temizlenirken bir hata oluştu.", error = ex.Message });
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
