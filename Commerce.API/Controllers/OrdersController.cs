using Commerce.Application.Features.Orders.Commands;
using Commerce.Application.Features.Orders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Commerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Tüm order işlemleri için kimlik doğrulama gerekli
    public class OrdersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OrdersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Tüm siparişleri listeler (Admin için tümü, kullanıcı için kendi siparişleri)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllOrders(
            [FromQuery] string? status = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var userId = User.IsInRole("Admin") ? null : GetCurrentUserId();
                var query = new GetAllOrdersQuery(userId, status, pageNumber, pageSize);
                var orders = await _mediator.Send(query);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Siparişler getirilirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// ID'ye göre sipariş getirir
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new { message = "Geçerli bir sipariş ID'si giriniz." });

                var order = await _mediator.Send(new GetOrderByIdQuery(id));
                if (order == null)
                    return NotFound(new { message = "Sipariş bulunamadı." });

                // Kullanıcı sadece kendi siparişlerini görebilir (Admin hariç)
                if (!User.IsInRole("Admin") && order.UserId != GetCurrentUserId())
                    return Forbid();

                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sipariş getirilirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Yeni sipariş oluşturur
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command)
        {
            try
            {
                // Kullanıcı sadece kendi adına sipariş verebilir
                var userId = GetCurrentUserId();
                var newCommand = command with { UserId = userId };

                var orderId = await _mediator.Send(newCommand);
                return CreatedAtAction(nameof(GetOrderById), new { id = orderId }, new { id = orderId });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sipariş oluşturulurken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Sipariş durumunu günceller (Sadece Admin)
        /// </summary>
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new { message = "Geçerli bir sipariş ID'si giriniz." });

                var approvedBy = GetCurrentUserId();
                var command = new UpdateOrderStatusCommand(id, request.Status, approvedBy);

                var result = await _mediator.Send(command);
                if (!result)
                    return NotFound(new { message = "Sipariş bulunamadı." });

                return Ok(new { message = "Sipariş durumu başarıyla güncellendi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sipariş durumu güncellenirken bir hata oluştu.", error = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("Kullanıcı kimliği bulunamadı."));
        }
    }

    public class UpdateOrderStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }
}
