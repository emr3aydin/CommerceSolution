using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Commerce.Application.Features.Categories.Commands;
using Commerce.Application.Features.Categories.Queries;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Commerce.API.Controllers
{
    [ApiController]
    [Route("[controller]")]

    public class CategoriesController : ControllerBase
    {

        private readonly IMediator _mediator;

        public CategoriesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("getAll")]
        public async Task<IActionResult> GetAll()
        {
            var query = new GetAllCategoriesQuery();
            var categories = await _mediator.Send(query);
            return Ok(categories);
        }

        [HttpGet("{id}")] 
        [AllowAnonymous] 

        public async Task<IActionResult> GetById(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Geçersiz kategori ID'si.");
            }

            try
            {
                var query = new GetCategoryByIdQuery(id);
                var category = await _mediator.Send(query);

                if (category == null)
                {
                    return NotFound($"ID'si {id} olan kategori bulunamadı.");
                }

                return Ok(category);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("bulunamadı"))
                {
                    return NotFound(ex.Message);
                }
                return StatusCode(500, $"Kategori alınırken bir hata oluştu: {ex.Message}");
            }
        }

        [HttpPost]
        [Route("new")]
        [Authorize(Roles = "Admin")]

        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryCommand command)
        {
            if (command == null || string.IsNullOrWhiteSpace(command.Name))
            {
                return BadRequest("Invalid category data.");
            }
            var categoryId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetAll), new { id = categoryId }, null);
        }

        [HttpPost]
        [Route("update")]
        [Authorize(Roles = "Admin")]

        public async Task<IActionResult> UpdateCategory([FromBody] UpdateCategoryCommand command)
        {
            if (string.IsNullOrWhiteSpace(command.Name))
            {
                return BadRequest("Invalid Data");
            }
            var categoryId = await _mediator.Send(command);
            return Ok();
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Sadece yöneticilerin silme yapmasına izin ver
        public async Task<IActionResult> DeleteCategory(int id)
        {
            // ID'nin geçerli olup olmadığını kontrol et
            if (id <= 0)
            {
                return BadRequest("Geçersiz kategori ID'si.");
            }

            try
            {
                // Silme komutunu ID ile oluştur
                var command = new DeleteCategoryCommand(id);
                // Komutu MediatR aracılığıyla gönder
                await _mediator.Send(command);

                // Silme başarılıysa 204 No Content döndür (silme işlemlerinde yaygındır)
                return NoContent(); // Veya 200 OK("Kategori başarıyla silindi") döndürebilirsiniz.
            }
            catch (Exception ex)
            {
                // Komut işleyicisinden (CommandHandler) fırlatılan istisnaları burada yakala
                // Örneğin, "Kategori bulunamadı" mesajını içeren bir istisna ise NotFound döndür
                if (ex.Message.Contains("bulunamadı")) // Basit bir kontrol
                {
                    return NotFound(ex.Message);
                }
                // Diğer tüm hatalar için 500 Internal Server Error döndür
                return StatusCode(500, $"Kategori silinirken bir hata oluştu: {ex.Message}");
            }
        }



    }
}
