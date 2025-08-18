using Commerce.Application.Features.Products.Commands;
using Commerce.Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Commerce.Domain;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Commerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ProductsController(IMediator mediator)
        {
            _mediator = mediator;
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
            
                var query = new GetAllProductsQuery(categoryId, isActive, searchTerm, pageNumber, pageSize);
                var result = await _mediator.Send(query);

                if (!result.Success)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse.ErrorResponse(result.Message));
                }
                return Ok(result);
           
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductById(int id)
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

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command)
        {
                var result = await _mediator.Send(command);
                if (!result.Success)
                {
                    return BadRequest(ApiResponse.ErrorResponse(result.Message));
                }

                return CreatedAtAction(nameof(GetProductById), new { id = result.Data }, result);
         
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductCommand command)
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

                return Ok(ApiResponse.SuccessResponse("Ürün başarıyla güncellendi."));
          
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
                if (id <= 0)
                {
                    return BadRequest(ApiResponse.ErrorResponse("Geçerli bir ürün ID'si giriniz."));
                }

                var result = await _mediator.Send(new DeleteProductCommand(id));
                if (!result.Success)
                {
                    if (result.Message == "Ürün bulunamadı.") 
                    {
                        return NotFound(ApiResponse.ErrorResponse(result.Message));
                    }
                    return Conflict(ApiResponse.ErrorResponse(result.Message));
                }

                return NoContent();
          
        }
    }
}