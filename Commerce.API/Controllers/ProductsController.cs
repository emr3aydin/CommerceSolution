using Commerce.Application.Features.Products.Commands;
using Commerce.Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Commerce.Domain;
using Microsoft.AspNetCore.Http;
using Commerce.Infrastructure.Interfaces;
using System.Security.Claims;

namespace Commerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILoggingService _loggingService;

        public ProductsController(IMediator mediator, ILoggingService loggingService)
        {
            _mediator = mediator;
            _loggingService = loggingService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllProducts(
            [FromQuery] int? categoryId = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] string? searchTerm = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = new GetAllProductsQuery(categoryId, isActive, searchTerm, pageNumber, pageSize);
                var result = await _mediator.Send(query);

                if (!result.Success)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse.ErrorResponse(result.Message));
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse.ErrorResponse($"Ürünler getirilirken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductById(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(ApiResponse.ErrorResponse("Geçerli bir ürün ID'si giriniz."));
                }

                var result = await _mediator.Send(new GetProductByIdQuery(id));

                if (!result.Success)
                {
                    return NotFound(ApiResponse.ErrorResponse(result.Message));
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse.ErrorResponse($"Ürün getirilirken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                if (!result.Success)
                {
                    return BadRequest(ApiResponse.ErrorResponse(result.Message));
                }

                // Log the create operation
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                await _loggingService.LogOperationAsync("CREATE", "Product", result.Data, userId, command);

                return CreatedAtAction(nameof(GetProductById), new { id = result.Data }, result);
            }
            catch (Exception ex)
            {
                // This catch block will handle ArgumentException from the handler
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse.ErrorResponse($"Ürün oluşturulurken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductCommand command)
        {
            try
            {
                if (id != command.Id)
                {
                    return BadRequest(ApiResponse.ErrorResponse("URL'deki ID ile komuttaki ID eşleşmiyor."));
                }

                var result = await _mediator.Send(command);
                if (!result.Success)
                {
                    if (result.Message == "Ürün bulunamadı.") // Specific check for NotFound scenario
                    {
                        return NotFound(ApiResponse.ErrorResponse(result.Message));
                    }
                    return BadRequest(ApiResponse.ErrorResponse(result.Message));
                }

                // Log the update operation
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                await _loggingService.LogOperationAsync("UPDATE", "Product", id, userId, command);

                return Ok(ApiResponse.SuccessResponse("Ürün başarıyla güncellendi."));
            }
            catch (Exception ex)
            {
                // This catch block will handle ArgumentException from the handler
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse.ErrorResponse($"Ürün güncellenirken bir hata oluştu: {ex.Message}"));
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(ApiResponse.ErrorResponse("Geçerli bir ürün ID'si giriniz."));
                }

                var result = await _mediator.Send(new DeleteProductCommand(id));
                if (!result.Success)
                {
                    if (result.Message == "Ürün bulunamadı.") // Specific check for NotFound scenario
                    {
                        return NotFound(ApiResponse.ErrorResponse(result.Message));
                    }
                    // For InvalidOperationException, it will now return a Conflict response
                    return Conflict(ApiResponse.ErrorResponse(result.Message));
                }

                // Log the delete operation
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                await _loggingService.LogOperationAsync("DELETE", "Product", id, userId);

                return NoContent(); // 204 No Content for successful deletion with no data to return
            }
            catch (Exception ex)
            {
                // This catch block will handle InvalidOperationException from the handler
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse.ErrorResponse($"Ürün silinirken bir hata oluştu: {ex.Message}"));
            }
        }
    }
}