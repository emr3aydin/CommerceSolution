using Commerce.Application.Features.Orders.Commands;
using Commerce.Application.Features.Orders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Commerce.Domain; // Make sure to include your Domain namespace
using Commerce.Application.Features.Orders.DTOs; // Needed for OrderDto

namespace Commerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OrdersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders(
            [FromQuery] string? status = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var userId = User.IsInRole("Admin") ? (Guid?)null : GetCurrentUserId();
                var query = new GetAllOrdersQuery(userId, status, pageNumber, pageSize);
                var result = await _mediator.Send(query);

                if (!result.Success)
                {
                    return StatusCode(500, ApiResponse.ErrorResponse(result.Message));
                }

                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Siparişler getirilirken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(ApiResponse.ErrorResponse("Geçerli bir sipariş ID'si giriniz."));

                var result = await _mediator.Send(new GetOrderByIdQuery(id));

                if (!result.Success)
                    return NotFound(ApiResponse.ErrorResponse(result.Message));

                var order = result.Data;

                if (!User.IsInRole("Admin") && order.UserId != GetCurrentUserId())
                {
                    return StatusCode(StatusCodes.Status403Forbidden, ApiResponse.ErrorResponse("Bu siparişi görüntüleme yetkiniz yok."));
                }
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Sipariş getirilirken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command)
        {
            try
            {
                var userId = GetCurrentUserId();
                var newCommand = command with { UserId = userId };

                var result = await _mediator.Send(newCommand);
                if (!result.Success)
                    return BadRequest(ApiResponse.ErrorResponse(result.Message));

                return CreatedAtAction(nameof(GetOrderById), new { id = result.Data }, ApiResponse<int>.SuccessResponse(result.Data, "Sipariş başarıyla oluşturuldu."));
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
                return StatusCode(500, ApiResponse.ErrorResponse($"Sipariş oluşturulurken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(ApiResponse.ErrorResponse("Geçerli bir sipariş ID'si giriniz."));

                var approvedBy = GetCurrentUserId();
                var command = new UpdateOrderStatusCommand(id, request.Status, approvedBy);

                var result = await _mediator.Send(command);
                if (!result.Success)
                    return NotFound(ApiResponse.ErrorResponse(result.Message));

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
                return StatusCode(500, ApiResponse.ErrorResponse($"Sipariş durumu güncellenirken bir hata oluştu: {ex.Message}"));
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