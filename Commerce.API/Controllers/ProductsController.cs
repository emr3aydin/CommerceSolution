using Commerce.Application.Features.Products.Commands;
using Commerce.Application.Features.Products.Queries;
using MediatR;
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
        /// Tüm aktif ürünleri listeler
        /// </summary>
        /// <returns>Ürün listesi</returns>
        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            try
            {
                var products = await _mediator.Send(new GetAllProductsQuery());
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
        /// <param name="id">Ürün ID'si</param>
        /// <returns>Ürün detayı</returns>
        [HttpGet("{id}")]
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
        /// Yeni ürün oluşturur
        /// </summary>
        /// <param name="command">Ürün oluşturma komutu</param>
        /// <returns>Oluşturulan ürün</returns>
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Basit validasyonlar
                if (string.IsNullOrWhiteSpace(command.Name))
                    return BadRequest(new { message = "Ürün adı gereklidir." });

                if (command.Price <= 0)
                    return BadRequest(new { message = "Fiyat 0'dan büyük olmalıdır." });

                if (command.Stock < 0)
                    return BadRequest(new { message = "Stok 0 veya daha büyük olmalıdır." });

                if (string.IsNullOrWhiteSpace(command.SKU))
                    return BadRequest(new { message = "SKU gereklidir." });

                if (command.CategoryId <= 0)
                    return BadRequest(new { message = "Geçerli bir kategori seçilmelidir." });

                var product = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetProductById), new { id = product.ID }, product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ürün oluşturulurken bir hata oluştu.", error = ex.Message });
            }
        }
    }
}
