using Commerce.Application.Features.Products.Commands;
using Commerce.Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        /// <summary>
        /// Tüm ürünleri listeler (filtreleme ve sayfalama ile)
        /// </summary>
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
                var products = await _mediator.Send(query);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ürünler getirilirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// ID'ye göre tekil ürün getirir
        /// </summary>
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductById(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new { message = "Geçerli bir ürün ID'si giriniz." });

                var product = await _mediator.Send(new GetProductByIdQuery(id));
                
                if (product == null)
                    return NotFound(new { message = "Ürün bulunamadı." });

                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ürün getirilirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Yeni ürün oluşturur (Sadece Admin)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command)
        {
            try
            {
                var productId = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetProductById), new { id = productId }, new { id = productId });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ürün oluşturulurken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Ürün günceller (Sadece Admin)
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpdateProductCommand command)
        {
            try
            {
                if (id != command.Id)
                    return BadRequest(new { message = "URL'deki ID ile komuttaki ID eşleşmiyor." });

                var result = await _mediator.Send(command);
                if (!result)
                    return NotFound(new { message = "Ürün bulunamadı." });

                return Ok(new { message = "Ürün başarıyla güncellendi." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ürün güncellenirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Ürün siler (Sadece Admin)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new { message = "Geçerli bir ürün ID'si giriniz." });

                var result = await _mediator.Send(new DeleteProductCommand(id));
                if (!result)
                    return NotFound(new { message = "Ürün bulunamadı." });

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ürün silinirken bir hata oluştu.", error = ex.Message });
            }
        }
    }
}
