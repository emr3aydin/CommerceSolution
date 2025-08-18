using Commerce.Application.Features.Categories.Commands;
using Commerce.Application.Features.Categories.Queries;
using Commerce.Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Commerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

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

            var query = new GetCategoryByIdQuery(id);
            var category = await _mediator.Send(query);

            if (category == null)
            {
                return NotFound($"ID'si {id} olan kategori bulunamadı.");
            }

            return Ok(category);


        }

        [HttpPost]
        [Route("new")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryCommand command)
        {
            if (command == null || string.IsNullOrWhiteSpace(command.Name))
            {
                return BadRequest(ApiResponse.ErrorResponse("Invalid category data. Category name cannot be empty."));
            }

            var response = await _mediator.Send(command);

            if (response.Success)
            {
                return Ok(response);
            }
            else
            {
                return BadRequest(response);
            }
        }
        [HttpPost]
        [Route("update")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory([FromBody] UpdateCategoryCommand command)
        {
            if (string.IsNullOrWhiteSpace(command.Name))
            {
                return BadRequest(ApiResponse.ErrorResponse("Kategori adı boş olamaz."));
            }

            var response = await _mediator.Send(command);

            if (response.Success)
            {
                return Ok(response);
            }
            else
            {
                return NotFound(response);
            }
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Geçersiz kategori ID'si.");
            }

            try
            {
                var command = new DeleteCategoryCommand(id);
                var resp = await _mediator.Send(command);

                return Ok(resp);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("bulunamadı"))
                {
                    return NotFound(ex.Message);
                }
                return StatusCode(500, $"Kategori silinirken bir hata oluştu: {ex.Message}");
            }
        }



    }
}
